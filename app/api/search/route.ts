import { NextRequest } from 'next/server';
import { search, getFacets } from '@/lib/search';
import { recordSearch } from '@/lib/search/analytics';
import { SearchQuerySchema } from '@/lib/search/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  const raw = {
    q: url.searchParams.get('q') ?? undefined,
    credit: url.searchParams.get('credit') ?? undefined,
    dateFrom: url.searchParams.get('dateFrom') ?? undefined,
    dateTo: url.searchParams.get('dateTo') ?? undefined,
    restrictions: url.searchParams.getAll('restrictions').length
      ? url.searchParams.getAll('restrictions')
      : (url.searchParams.get('restrictions') ?? undefined),
    sort: url.searchParams.get('sort') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    pageSize: url.searchParams.get('pageSize') ?? undefined,
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
  recordSearch(query.q, latency);

  const facets = getFacets();

  const payload = JSON.stringify({ ...result, facets, latencyMs: latency });
  return new Response(payload, { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
