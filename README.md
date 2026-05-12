# IMAGO Full-stack Challenge

This repo implements a lightweight search layer in a Next.js app using TypeScript and Tailwind + Shadcn/UI.

See the original task: https://imago-images.notion.site/Coding-Challenge-2-C4-2ee88a8564ed80f0b3e6c7159cdf6b1b

Hosted [on Vercel](https://imago-images-full-stack-challenge.vercel.app/).

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

### Relevance and Preprocessing

Preprocessing is done once lazily during runtime at the first API request.

- Fields and weights indexed:
  - suchtext: weight 3
  - fotografen: weight 2
  - bildnummer: weight 1
- Exact token matches are boosted (x2). Prefix matches for tokens longer than 3 chars contribute base weight.
- Normalization: NFKD Unicode fold + diacritics removal, lowercasing, delimiter normalization ("\_-/|" -> space), whitespace collapse.
- Tokenization: split on non-alphanumeric, keep [a-z0-9].
- Date parsing: DD.MM.YYYY -> ISO YYYY-MM-DD for easier handling/sorting.
- Restrictions: we extract only country restriction codes after the token IN and before ONLY from uppercase x-separated sequences (e.g., PUBLICATIONxINxGERxSUIxAUTxONLY -> `['ger', 'sui', 'aut']`).
  We normalize to lowercase for filtering and display them as uppercase in the UI. The code is deleted from the description (suchtext).

### API: GET /api/search

Query params:

- q: keyword(s); tokenized and normalized. Prefix matching enabled for tokens longer than 3 chars.
- credit: exact match on normalized photographer credit (`fotografen`).
- dateFrom, dateTo: YYYY-MM-DD boundaries. Items without a date are excluded if a range is provided.
- restrictions: comma-separated tokens derived from `suchtext` (e.g., `restrictions=ger,aut`).
- sort: dateAsc | dateDesc. Default is relevance score desc with date desc tiebreaker.
- page, pageSize: pagination (pageSize is capped).

Response:

- items, page, pageSize, total, totalPages, facets (credits, restrictions), latencyMs

Zod is used to make typization consistent and allow easy and safe API params processing.

Updating the index: expose an append path (not wired to an endpoint in this demo) to preprocess and add new items, update inverted index and facets incrementally.

### Performance

- It takes ~250 ms on a 2018 i7-based laptop to perform the first /api/search call in production mode.
- Further queries are taking ~30 ms.
- For millions of items: move to an external search service or embed index persistence:
  - Use Elastic or similar tools; or build a sharded on-disk inverted index with compressed postings and field-level BM25.
  - Precompute facets, keep hot shards in memory, use prefix-tries for autocomplete, and incremental background indexing for new items.
  - Cache popular queries and facet counts; paginate using search_after to avoid deep offsets.

### New Items Every Minute (Ingestion Strategy)

- Ingest/append: buffer new items, preprocess (normalize, parse date, extract restrictions), then append to in-memory index + a persisted log.
- Update index: do incremental updates per item; periodically rebuild in the background to defragment.
- Keep latency low: debounce rebuilds, use RW locks to avoid blocking readers; apply copy-on-write or versioned index snapshots.
- UI non-blocking: frontend uses debounced queries and displays loading states; server responds fast with in-memory search.

### Frontend UI

- Shadcn/UI is used to build the UI faster (Comboboxes, Datepickers, Chips).
- The app is highly responsive and optimized for mobile.
- It’s fully accessible.
- Loading state is displayed with a small delay to avoid blinking.

### Analytics

- In-memory metrics recorded per request: total searches, average latency, and top keywords (case-insensitive).

### Assumptions

- Credits are filtered by exact normalized string; advanced partial credit matching can be added easily.
- If a date filter is provided, items lacking a parseable date are excluded to avoid misleading ranges.
- Restrictions are best-effort extracted via regex and may include generic words like "in"; in production, a stricter allowlist would be used.

### Other Dependencies

Besides Shadcn/UI and Zod the following dependencies are used:

- `clsx` to run \*.ts scripts
- `lint-staged`, `eslint` and `husky` — for improving maintainability
- `date-fns` — for the datepicker

### What I Would Do Next

- Save search to the URL (easily implemented with [`nuqs`](http://nuqs.dev/))
- Add image size as a search option (e.g., just by megapixel), as well as image orientation
- Improve ranking with fuzzy matching and typo tolerance
- Add E2E tests
- Implement analytics properly (e.g., with MongoDB)
- Implement techniques mentioned in the Performance section above
