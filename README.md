# IMAGO Full-stack Challenge

This repo implements a lightweight search layer in a Next.js app using TypeScript and Tailwind + Shadcn/UI.

See the original task: https://imago-images.notion.site/Coding-Challenge-2-C4-2ee88a8564ed80f0b3e6c7159cdf6b1b

Hosted [on Vercel](https://imago-images-full-stack-challenge-57qbx7kk1.vercel.app/).

## Installation & Running

### Prerequisites

- `node` v20+
- `npm` v10+

### Optional: Generate More Mocked Data

- Copy [./env.example](./.env.example) to `./.env`.
- Run `npm run generate -- [amount]` to generate bigger amount of mocked data (10K by default) e.g.,

```shell
npm run generate -- 500
```

### Development Mode

```shell
npm i
npm run dev
open http://localhost:3000
```

### Production Mode

```shell
npm i
npm run build
npm run start
```

### Additional Scripts

- `lint:fix`: fixes all possible ESLint errors.
- `prettier:verbose`: provides the full prettier output.

## Comments

### API: GET /api/search

Query params:

- q: keyword(s); tokenized and normalized. Prefix matching enabled for tokens >= 3 chars.
- credit: exact match on normalized photographer credit (fotografen).
- dateFrom, dateTo: YYYY-MM-DD boundaries. Items without a date are excluded if a range is provided.
- restrictions: comma-separated tokens derived from suchtext (e.g., PUBLICATIONxINxGERxSUIxAUTxONLY -> [publication,in,ger,sui,aut,only]).
- sort: dateAsc | dateDesc. Default is relevance score desc with date desc tiebreaker.
- page, pageSize: pagination (pageSize capped at 100).

Response:

- items, page, pageSize, total, totalPages, facets (credits, restrictions), latencyMs

## Relevance and preprocessing

- Fields and weights indexed:
  - suchtext: weight 3
  - fotografen: weight 2
  - bildnummer: weight 1
- Exact token matches are boosted (x2). Prefix matches for tokens >= 3 chars contribute base weight.
- Normalization: NFKD Unicode fold + diacritics removal, lowercasing, delimiter normalization ("\_-/|" -> space), whitespace collapse.
- Tokenization: split on non-alphanumeric, keep [a-z0-9].
- Date parsing: DD.MM.YYYY -> ISO YYYY-MM-DD.
- Restrictions: we extract only country restriction codes after the token IN and before ONLY from uppercase x-separated sequences (e.g., PUBLICATIONxINxGERxSUIxAUTxONLY -> [ger, sui, aut]). We normalize to lowercase for filtering and display them as uppercase in the UI.

Where it happens: at index-build time (lazy, first request) in-memory.

Updating the index: expose an append path (not wired to an endpoint in this demo) to preprocess and add new items, update inverted index and facets incrementally.

Preprocessing and index creation happen lazily during application startup/runtime initialization.

## Performance

- Designed to handle at least 10,000 items in-memory quickly: token -> postings map with weights; scoring over only matched tokens; filters applied on the candidate set.
- For millions of items: move to an external search service or embed index persistence:
  - Use Elastic/Lucene/Meilisearch/Typesense; or build a sharded on-disk inverted index with compressed postings and field-level BM25.
  - Precompute facets, keep hot shards in memory, use prefix-tries for autocomplete, and incremental background indexing for new items.
  - Cache popular queries and facet counts; paginate using search_after to avoid deep offsets.

## New items every minute (ingestion strategy)

- Ingest/append: buffer new items, preprocess (normalize, parse date, extract restrictions), then append to in-memory index + a persisted log.
- Update index: do incremental updates per item; periodically rebuild in the background to defragment.
- Keep latency low: debounce rebuilds, use RW locks to avoid blocking readers; apply copy-on-write or versioned index snapshots.
- UI non-blocking: frontend uses debounced queries and displays loading states; server responds fast with in-memory search.

## Frontend UI

- Search input with debounce; filters: credit dropdown (from facets), date range (native input[type=date]), restrictions as toggle chips; sort toggle for date.
- Results show bildnummer, fotografen, date, and a highlighted snippet of suchtext.
- Pagination controls and clear states (loading, empty, error). Keyboard/focus friendly controls use semantic inputs and buttons.

## Analytics

- In-memory metrics recorded per request: total searches, average latency, and top keywords (case-insensitive). See lib/search/analytics.ts.

## Assumptions

- Credits are filtered by exact normalized string; advanced partial credit matching can be added easily.
- If a date filter is provided, items lacking a parseable date are excluded to avoid misleading ranges.
- Restrictions are best-effort extracted via regex and may include generic words like "in"; in production, a stricter allowlist would be used.
