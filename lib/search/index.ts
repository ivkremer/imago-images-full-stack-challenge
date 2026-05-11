import type { MediaItem, SearchQuery, SearchResult } from './types';
import { normalize, tokenize, preprocessItem } from './preprocess';
import {
  CREDIT_TOKEN_WEIGHT,
  DEFAULT_RESULTS_PER_PAGE,
  ID_TOKEN_WEIGHT,
  MAX_RESULTS_PER_PAGE,
  MINIMUM_PREFIX_MATCH_LENGTH,
  TEXT_TOKEN_WEIGHT,
} from '@/lib/search/constants';
import { seedData } from './seedData';

// In-memory dataset and inverted index. Built lazily on first use.

// itemId -> weight contribution
type Posting = Map<number, number>;

type IndexData = {
  items: MediaItem[];
  byId: Map<number, MediaItem>;
  // inverted index per token
  tokenIndex: Map<string, Posting>;
  // For facets; normalized credit -> {display,count}
  credits: Map<string, { display: string; count: number }>;
  // restriction -> count
  restrictions: Map<string, number>;
};

const state: { index?: IndexData } = {};

const buildIndex = () => {
  const items: MediaItem[] = seedData.map((x, i) => preprocessItem(x, i));

  const byId = new Map<number, MediaItem>();
  const tokenIndex = new Map<string, Posting>();
  const credits = new Map<string, { display: string; count: number }>();
  const restrictions = new Map<string, number>();

  for (const item of items) {
    byId.set(item.id, item);

    const creditNorm = normalize(item.fotografen || '');
    if (creditNorm) {
      const prev = credits.get(creditNorm);
      const display = item.fotografen || prev?.display || '';
      const count = (prev?.count || 0) + 1;
      credits.set(creditNorm, { display, count });
    }
    for (const r of item.restrictions) {
      restrictions.set(r, (restrictions.get(r) || 0) + 1);
    }

    // Index tokens with weights
    const textTokens = new Set(tokenize(item.suchtext || ''));
    const creditTokens = new Set(tokenize(item.fotografen || ''));
    const idTokens = new Set(tokenize(item.bildnummer || ''));

    for (const t of textTokens) {
      // primary weight
      addPosting(tokenIndex, t, item.id, TEXT_TOKEN_WEIGHT);
    }
    for (const t of creditTokens) {
      // secondary
      addPosting(tokenIndex, t, item.id, CREDIT_TOKEN_WEIGHT);
    }
    for (const t of idTokens) {
      // optional
      addPosting(tokenIndex, t, item.id, ID_TOKEN_WEIGHT);
    }
  }

  return { items, byId, tokenIndex, credits, restrictions };
};

const addPosting = (index: Map<string, Posting>, token: string, id: number, weight: number) => {
  let posting = index.get(token);
  if (!posting) {
    posting = new Map();
    index.set(token, posting);
  }
  posting.set(id, (posting.get(id) || 0) + weight);
};

export const getIndex = () => {
  if (!state.index) {
    state.index = buildIndex();
  }

  return state.index;
};

const applyFilters = (ids: Set<number>, q: SearchQuery) => {
  const { byId } = getIndex();
  const res: number[] = [];
  const creditNorm = q.credit ? normalize(q.credit) : undefined;
  const rset = q.restrictions && q.restrictions.length ? new Set(q.restrictions.map((r) => normalize(r))) : undefined;
  const from = q.dateFrom ? q.dateFrom : undefined;
  const to = q.dateTo ? q.dateTo : undefined;

  for (const id of ids) {
    const item = byId.get(id)!;
    if (creditNorm) {
      const itemCredit = normalize(item.fotografen || '');
      if (itemCredit !== creditNorm) {
        continue;
      }
    }
    // Restrictions: require ALL selected restrictions to be present on the item (AND semantics)
    if (rset) {
      const required = Array.from(rset);
      const hasAll = required.every((r) => item.restrictions.includes(r));
      if (!hasAll) {
        continue;
      }
    }
    if (from || to) {
      const iso = item.dateISO;
      // if date filter requested, items without date are excluded
      if (!iso) {
        continue;
      }
      if (from && iso < from) {
        continue;
      }
      if (to && iso > to) {
        continue;
      }
    }
    res.push(id);
  }
  return res;
};

export const search = (query: SearchQuery): SearchResult => {
  const idx = getIndex();
  const qTokens = query.q ? tokenize(query.q) : [];

  // Score accumulation
  const scores = new Map<number, number>();

  if (qTokens.length > 0) {
    for (const qt of qTokens) {
      // Exact token matches
      const posting = idx.tokenIndex.get(qt);
      if (posting) {
        for (const [id, w] of posting) {
          // exact boost
          // eslint-disable-next-line no-magic-numbers
          scores.set(id, (scores.get(id) || 0) + w * 2);
        }
      }
      // Prefix matches (for tokens >= 3 chars)
      if (qt.length >= MINIMUM_PREFIX_MATCH_LENGTH) {
        for (const [token, post] of idx.tokenIndex) {
          if (token.startsWith(qt) && token !== qt) {
            for (const [id, w] of post) {
              scores.set(id, (scores.get(id) || 0) + w);
            }
          }
        }
      }
    }
  } else {
    // no query => start with all items (score 0)
    for (const item of idx.items) {
      scores.set(item.id, 0);
    }
  }

  // Filter stage
  const candidateIds = new Set(scores.keys());
  const filteredIds = applyFilters(candidateIds, query);

  // Sorting: by score desc, then date (if requested)
  const results = filteredIds.map((id) => idx.byId.get(id)!).filter(Boolean);

  if (query.sort === 'dateAsc' || query.sort === 'dateDesc') {
    results.sort((a, b) => {
      const da = a.dateISO || '';
      const db = b.dateISO || '';
      return query.sort === 'dateAsc' ? da.localeCompare(db) : db.localeCompare(da);
    });
  } else {
    // default: score by id, then by date:
    results.sort((a, b) => {
      const sa = scores.get(a.id) || 0;
      const sb = scores.get(b.id) || 0;
      if (sb !== sa) {
        return sb - sa;
      }
      const da = a.dateISO || '';
      const db = b.dateISO || '';
      return db.localeCompare(da);
    });
  }

  // Pagination:
  const pageSize = Math.min(Math.max(query.pageSize || DEFAULT_RESULTS_PER_PAGE, 1), MAX_RESULTS_PER_PAGE);
  const page = Math.max(query.page || 1, 1);
  const total = results.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const start = (page - 1) * pageSize;
  const items = results.slice(start, start + pageSize);

  return { items, page, pageSize, total, totalPages };
};

export const getFacets = () => {
  const { credits, restrictions } = getIndex();
  const creditList = Array.from(credits.entries())
    .map(([_, v]) => v)
    .sort((a, b) => b.count - a.count || a.display.localeCompare(b.display))
    .map((v) => v.display);
  return {
    credits: creditList,
    restrictions: Array.from(restrictions.keys()),
  };
};
