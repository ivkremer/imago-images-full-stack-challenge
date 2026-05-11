import { z } from 'zod';
import { DEFAULT_RESULTS_PER_PAGE } from '@/lib/search/constants';

// Schemas for core entities and API types. Types are inferred from schemas.

export const RawMediaItemSchema = z.object({
  suchtext: z.string(),
  bildnummer: z.string(),
  fotografen: z.string().optional(),
  datum: z.string().optional(),
  hoehe: z.string().optional(),
  breite: z.string().optional(),
});
export type RawMediaItem = z.infer<typeof RawMediaItemSchema>;

export const MediaItemSchema = RawMediaItemSchema.extend({
  id: z.number().int().nonnegative(),
  dateISO: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  restrictions: z.array(z.string()),
});
export type MediaItem = z.infer<typeof MediaItemSchema>;

export const SearchQuerySchema = z
  .object({
    q: z.string().trim().min(1).optional(),
    credit: z.string().trim().min(1).optional(),
    dateFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    dateTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    restrictions: z
      .union([z.array(z.string().trim().min(1)), z.string().trim().min(1)])
      .optional()
      .transform((v) => {
        if (!v) {
          return undefined;
        }
        // Accept both a single comma-separated string and an array of values.
        // If it's an array, also split any comma-separated entries inside it and flatten.
        const parts = (Array.isArray(v) ? v : [v])
          .flatMap((entry) => String(entry).split(','))
          .map((s) => s.trim())
          .filter(Boolean);
        return parts.length ? parts : undefined;
      }),
    sort: z.enum(['dateAsc', 'dateDesc']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(DEFAULT_RESULTS_PER_PAGE),
  })
  .refine(
    (obj) => {
      // If both dates present, ensure from <= to
      if (obj.dateFrom && obj.dateTo) {
        return obj.dateFrom <= obj.dateTo;
      }
      return true;
    },
    { message: 'dateFrom must be <= dateTo', path: ['dateFrom'] },
  );
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const SearchResultSchema = z.object({
  items: z.array(MediaItemSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(100),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(1),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

export const FacetsSchema = z.object({
  credits: z.array(z.string()),
  restrictions: z.array(z.string()),
});

export const SearchApiResponseSchema = SearchResultSchema.extend({
  facets: FacetsSchema,
  latencyMs: z.number().nonnegative(),
});

export type SearchApiResponse = z.infer<typeof SearchApiResponseSchema>;
