'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_RESULTS_PER_PAGE } from '@/lib/search/constants';
import type { SearchApiResponse } from '@/lib/search/types';
import { Pagination } from './Pagination';
import { SearchControls } from './SearchControls/SearchControls';
import { SearchResults } from './SearchResults';
import type { SortOrder } from './types';

export const Main = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query);

  const [credit, setCredit] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOrder>('');
  const [page, setPage] = useState(1);
  const pageSize = DEFAULT_RESULTS_PER_PAGE;

  const [data, setData] = useState<SearchApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) {
        params.set('q', debouncedQuery);
      }
      if (credit) {
        params.set('credit', credit);
      }
      if (dateFrom) {
        params.set('dateFrom', dateFrom);
      }
      if (dateTo) {
        params.set('dateTo', dateTo);
      }
      if (restrictions.length) {
        params.set('restrictions', restrictions.join(','));
      }
      if (sort) {
        params.set('sort', sort);
      }
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json: SearchApiResponse = await res.json();
      setData(json);
    } catch (e) {
      setError((e as Error)?.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, credit, dateFrom, dateTo, restrictions, sort, page, pageSize]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [debouncedQuery, credit, dateFrom, dateTo, restrictions, sort]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const highlight = useCallback(
    (text: string) => {
      if (!debouncedQuery) {
        return text;
      }
      const ql = debouncedQuery.trim().toLowerCase();
      if (!ql) {
        return text;
      }
      const idx = text.toLowerCase().indexOf(ql);
      if (idx === -1) {
        return text;
      }
      const before = text.slice(0, idx);
      const match = text.slice(idx, idx + ql.length);
      const after = text.slice(idx + ql.length);

      return (
        <>
          {before}
          <mark className="text-accent-foreground bg-accent">{match}</mark>
          {after}
        </>
      );
    },
    [debouncedQuery],
  );

  const facets = data?.facets;

  return (
    <div className="flex flex-col gap-4 flex-grow-1">
      <section>
        <SearchControls
          sort={sort}
          credit={credit}
          dateFrom={dateFrom}
          dateTo={dateTo}
          facets={facets}
          setQuery={setQuery}
          query={query}
          setCredit={setCredit}
          setDateFrom={setDateFrom}
          setDateTo={setDateTo}
          restrictions={restrictions}
          setRestrictions={setRestrictions}
          setSort={setSort}
        />
      </section>

      <section>
        {loading && <div className="text-muted-foreground text-center fade-in-delayed">Loading…</div>}

        {error && <div className="text-destructive text-center">Error: {error}</div>}

        {!loading && !error && data && data.items.length === 0 && (
          <div className="text-muted-foreground">No results.</div>
        )}

        {!loading && !error && data && data.items.length > 0 && <SearchResults data={data} highlight={highlight} />}
      </section>

      <section className="flex flex-grow-1 items-end mt-3">
        <Pagination loading={loading} data={data} page={page} onPageSet={setPage} />
      </section>
    </div>
  );
};
