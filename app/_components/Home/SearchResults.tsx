import { type JSX } from 'react';
import { HashIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SearchApiResponse } from '@/lib/search/types';

type Props = {
  data: SearchApiResponse;
  highlight: (text: string) => string | JSX.Element;
};

export const SearchResults = ({ data, highlight }: Props) => (
  <div className="space-y-4">
    <div className="text-sm text-muted-foreground">
      {data.total} results · {Math.round(data.latencyMs)} ms
    </div>
    <ul className="divide-y divide-border rounded-xl border">
      {data.items.map(({ id, bildnummer, datum, dateISO, fotografen, suchtext, restrictions }) => (
        <li key={id} className="p-4 flex flex-col gap-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-mono text-sm flex items-center gap-1">
              <HashIcon className="size-3 shrink-0" /> {bildnummer}
            </div>
            <div className="text-sm text-muted-foreground">{dateISO || datum || 'Date N/A'}</div>
          </div>
          <div className="text-sm text-accent">{fotografen}</div>
          <div className="leading-relaxed">{highlight(suchtext)}</div>
          {restrictions.length > 0 && (
            <div className="flex items-center gap-2">
              Restricted usage:
              <div className="flex flex-wrap gap-1 pt-1">
                {restrictions.map((r) => (
                  <Badge key={r}>{r.toUpperCase()}</Badge>
                ))}
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  </div>
);
