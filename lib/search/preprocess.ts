import type { MediaItem, RawMediaItem } from './types';

// Normalize whitespace and casing, remove diacritics for consistent matching
export const normalize = (str: string) =>
  str
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_/\-|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Tokenize by non-alphanumeric boundaries, keep digits and letters
export const tokenize = (str: string) =>
  normalize(str)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

// Extract country restriction codes from captions like PUBLICATIONxINxGERxSUIxAUTxONLY
// We only keep country tokens after 'IN' and before 'ONLY' and restrict to an allowlist [GER, SUI, AUT].
export const extractRestrictions = (suchtext: string) => {
  // Find runs of ALLCAPS tokens separated by 'x'
  const matches = suchtext.match(/[A-Z]+(?:x[A-Z]+){1,}/g) || [];
  const out = new Set<string>();

  for (const m of matches) {
    const tokens = m.split('x');
    // Locate the segment following 'IN'
    const inIdx = tokens.indexOf('IN');
    if (inIdx >= 0) {
      for (let i = inIdx + 1; i < tokens.length; i++) {
        const t = tokens[i];
        if (t === 'ONLY') {
          break;
        }

        if (t) {
          out.add(t.toLowerCase());
        }
      }
    }
  }
  return Array.from(out);
};

// Remove the trailing ALLCAPS x-separated restriction caption from suchtext
// Example: "... PUBLICATIONxINxGERxSUIxAUTxONLY" -> removed
export const stripRestrictionCaption = (suchtext: string) => {
  if (!suchtext) {
    return suchtext;
  }
  // Grab the last ALLCAPS x-separated run at the end
  const m = suchtext.match(/\s*([A-Z]+(?:x[A-Z]+){1,})\s*$/);
  if (!m || !m[1]) {
    return suchtext.trim();
  }
  const segment = m[1];
  const tokens = segment.split('x');
  const inIdx = tokens.indexOf('IN');
  if (inIdx === -1) {
    return suchtext.trim();
  }
  // Ensure there is at least one country-like token after IN (before ONLY)
  let hasCountry = false;
  for (let i = inIdx + 1; i < tokens.length; i++) {
    const t = tokens[i]!;
    if (t === 'ONLY') {
      break;
    }
    if (/^[A-Z]{3}$/.test(t)) {
      hasCountry = true;
      break;
    }
  }
  if (!hasCountry) {
    return suchtext.trim();
  }
  // Remove the matched tail including surrounding whitespace
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\s*${escapeRegex(segment)}\\s*$`);
  return suchtext.replace(pattern, '').trim();
};

// Parse dates in D.M.YYYY or DD.MM.YYYY to YYYY-MM-DD
export const parseDateToISO = (d?: string) => {
  if (!d) {
    return undefined;
  }
  const m = d.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m || !m[1] || !m[2] || !m[3]) {
    return undefined;
  }
  // eslint-disable-next-line no-magic-numbers
  const day = m[1].padStart(2, '0');
  // eslint-disable-next-line no-magic-numbers
  const month = m[2].padStart(2, '0');
  const year = m[3];

  return `${year}-${month}-${day}`;
};

export const preprocessItem = (raw: RawMediaItem, id: number): MediaItem => ({
  ...raw,
  suchtext: stripRestrictionCaption(raw.suchtext || ''),
  id,
  restrictions: extractRestrictions(raw.suchtext || ''),
  dateISO: parseDateToISO(raw.datum),
});
