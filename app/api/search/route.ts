import { NextRequest } from 'next/server';
import { search, getFacets } from '@/lib/search';
import { recordSearch } from '@/lib/search/analytics';
import { SearchQuerySchema } from '@/lib/search/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  const raw = {
    q: url.searchParams.get('q'),
    credit: url.searchParams.get('credit'),
    dateFrom: url.searchParams.get('dateFrom'),
    dateTo: url.searchParams.get('dateTo'),
    restrictions: url.searchParams.getAll('restrictions').length
      ? url.searchParams.getAll('restrictions')
      : url.searchParams.get('restrictions'),
    sort: url.searchParams.get('sort'),
    page: url.searchParams.get('page'),
    pageSize: url.searchParams.get('pageSize'),
  };

  const parsed = SearchQuerySchema.safeParse(raw);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid query', issues: parsed.error.issues }), {
      status: 400,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }

  const query = parsed.data;

  const t0 = Date.now();
  const result = search(query);
  const latency = Date.now() - t0;
  // saving to analytics:
  recordSearch(query.q, latency);

  const facets = getFacets();

  const payload = JSON.stringify({ ...result, facets, latencyMs: latency });
  return new Response(payload, { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
