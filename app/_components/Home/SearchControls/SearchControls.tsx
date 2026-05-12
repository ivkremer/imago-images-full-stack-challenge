import type { Dispatch, SetStateAction } from 'react';
import { ArrowDownWideNarrowIcon, ArrowUpWideNarrowIcon, Trash2Icon } from 'lucide-react';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/custom/DatePicker/DatePicker';
import type { SearchApiResponse } from '@/lib/search/types';
import { CreditCombobox } from './CreditSelector';
import { Restrictions } from './Restrictions';
import type { SortOrder } from '../types';

type Props = {
  query: string;
  credit: string;
  dateFrom: string;
  dateTo: string;
  setQuery: Dispatch<SetStateAction<string>>;
  setCredit: Dispatch<SetStateAction<string>>;
  setDateFrom: Dispatch<SetStateAction<string>>;
  setDateTo: Dispatch<SetStateAction<string>>;
  restrictions: string[];
  setRestrictions: Dispatch<SetStateAction<string[]>>;
  facets?: SearchApiResponse['facets'];
  sort: string;
  setSort: Dispatch<SetStateAction<SortOrder>>;
};

export const SearchControls = ({
  query,
  setQuery,
  setCredit,
  sort,
  setDateTo,
  setDateFrom,
  restrictions,
  credit,
  facets,
  setRestrictions,
  setSort,
  dateTo,
  dateFrom,
}: Props) => {
  const handleClear = () => {
    setQuery('');
    setCredit('');
    setDateFrom('');
    setDateTo('');
    setRestrictions([]);
    setSort('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-center">
        <Field orientation="horizontal" className="w-full">
          <FieldLabel asChild>
            <Label htmlFor="query" className="sr-only">
              Search
            </Label>
          </FieldLabel>
          <FieldContent>
            <Input
              id="query"
              placeholder="Search by description or publisher..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </FieldContent>
        </Field>
        <div className="flex items-center gap-3">
          <Button
            variant={sort ? 'default' : 'ghost'}
            size="icon"
            aria-label={`Sort (${sort === 'dateAsc' ? 'older first' : 'newer first'})`}
            onClick={() => setSort(sort === 'dateDesc' ? 'dateAsc' : 'dateDesc')}
          >
            {sort === 'dateDesc' ? (
              <ArrowDownWideNarrowIcon />
            ) : sort === 'dateAsc' ? (
              <ArrowUpWideNarrowIcon />
            ) : (
              <ArrowDownWideNarrowIcon />
            )}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Clear all" onClick={handleClear}>
            <Trash2Icon className="text-destructive" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Field>
          <FieldLabel asChild>
            <Label htmlFor="credit">Credit</Label>
          </FieldLabel>
          <FieldContent>
            <div id="credit">
              <CreditCombobox value={credit} options={facets?.credits || []} onChange={(v) => setCredit(v)} />
            </div>
          </FieldContent>
        </Field>
        <DatePicker id="from" label="From" value={dateFrom} onChange={setDateFrom} max={dateTo} />
        <DatePicker id="to" label="To" value={dateTo} onChange={setDateTo} min={dateFrom} />
        <Field>
          <FieldLabel asChild>
            <Label>Restrictions</Label>
          </FieldLabel>
          <FieldContent>
            <Restrictions restrictions={restrictions} onSetRestriction={setRestrictions} facets={facets} />
          </FieldContent>
        </Field>
      </div>
    </div>
  );
};
