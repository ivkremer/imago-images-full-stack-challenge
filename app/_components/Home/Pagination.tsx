import type { Dispatch, SetStateAction } from 'react';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { SearchApiResponse } from '@/lib/search/types';

type Props = {
  page: number;
  onPageSet: Dispatch<SetStateAction<number>>;
  loading: boolean;
  data: SearchApiResponse | null;
};

export const Pagination = ({ page, data, loading, onPageSet }: Props) => {
  if (!data?.totalPages || data.totalPages === 1) {
    return null;
  }

  return (
    <ShadcnPagination className="w-auto mx-auto">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page <= 1 || loading}
            onClick={(e) => {
              e.preventDefault();
              if (page > 1 && !loading) {
                onPageSet((p) => Math.max(1, p - 1));
              }
            }}
          />
        </PaginationItem>
        {(() => {
          const tp = data?.totalPages || 1;
          const current = page;
          const siblingCount = 1;
          // first, last, current, 2*siblings, 2*ellipses:
          // eslint-disable-next-line no-magic-numbers
          const totalNumbers = siblingCount * 2 + 5;
          const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [];

          if (tp <= totalNumbers) {
            for (let i = 1; i <= tp; i++) {
              pages.push(i);
            }
          } else {
            // Clamp siblings to avoid duplicating first/last and extend range at edges
            // eslint-disable-next-line no-magic-numbers
            let leftSibling = Math.max(current - siblingCount, 2);
            let rightSibling = Math.min(current + siblingCount, tp - 1);

            // When at the start/end, show one extra page number for better UX (e.g., 1 2 3 … last)
            if (current === 1) {
              rightSibling = Math.min(rightSibling + 1, tp - 1);
            } else if (current === tp) {
              // eslint-disable-next-line no-magic-numbers
              leftSibling = Math.max(leftSibling - 1, 2);
            }

            // eslint-disable-next-line no-magic-numbers
            const showLeftEllipsis = leftSibling > 2;
            const showRightEllipsis = rightSibling < tp - 1;

            pages.push(1);
            if (showLeftEllipsis) {
              pages.push('ellipsis-left');
            } else {
              for (let i = 2; i < leftSibling; i++) {
                pages.push(i);
              }
            }

            for (let i = leftSibling; i <= rightSibling; i++) {
              pages.push(i);
            }

            if (showRightEllipsis) {
              pages.push('ellipsis-right');
            } else {
              for (let i = rightSibling + 1; i < tp; i++) {
                pages.push(i);
              }
            }
            pages.push(tp);
          }

          return pages.map((p, idx) => (
            <PaginationItem key={`${p}-${idx}`}>
              {typeof p === 'number' ? (
                <PaginationLink
                  href="#"
                  isActive={p === current}
                  aria-current={p === current ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!loading) {
                      onPageSet(p);
                    }
                  }}
                >
                  {p}
                </PaginationLink>
              ) : (
                <PaginationEllipsis />
              )}
            </PaginationItem>
          ));
        })()}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={(Boolean(data) && page >= (data?.totalPages || 1)) || loading}
            onClick={(e) => {
              e.preventDefault();
              const tp = data?.totalPages || 1;
              if (page < tp && !loading) {
                onPageSet((p) => p + 1);
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  );
};
