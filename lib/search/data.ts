import fs from 'fs';
import raw from './rawData.json';
import type { RawMediaItem } from '@/lib/search/types';

/**
 * Get the mocked data for the search — either from the committed `./rawData.json`,
 * or from the generated /data/generated.json.
 */
export const getData = (): RawMediaItem[] => {
  if (process.env.USE_GENERATED === 'true') {
    return JSON.parse(fs.readFileSync('data/generated.json', 'utf-8'));
  }

  return raw;
};
