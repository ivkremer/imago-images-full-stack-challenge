import fs from 'fs';
import path from 'path';
import type { RawMediaItem } from '@/lib/search/types';

const DEFAULT_COUNT = 10000;

const seed: RawMediaItem[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'lib/search/rawData.json'), 'utf-8'));

const publishers = [
  'IMAGO / Channel 4',
  'IMAGO / United Archives International',
  'IMAGO / teutopress',
  'IMAGO / MediaPunch',
  'IMAGO / Pond5 Images',
  'IMAGO / ZUMA Press',
];

function rand<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function varyText(text: string, i: number) {
  const extras = [
    'archival footage',
    'press coverage',
    'international event',
    'exclusive capture',
    'studio session',
    'live broadcast moment',
  ];
  return `${text} ${rand(extras)} ${i}`;
}

function shiftDate(dateStr: string) {
  const [d, m, y] = dateStr.split('.').map(Number);
  const date = new Date(y!, m! - 1, d);
  // eslint-disable-next-line no-magic-numbers
  date.setDate(date.getDate() + Math.floor(Math.random() * 4000 - 2000));

  // eslint-disable-next-line no-magic-numbers
  const dd = String(date.getDate()).padStart(2, '0');
  // eslint-disable-next-line no-magic-numbers
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  return `${dd}.${mm}.${yyyy}`;
}

const amountOfRecords = process.argv[2] ? Number(Number(process.argv[2])) : DEFAULT_COUNT;

const result: RawMediaItem[] = [];

let id = 1000000000;

for (let i = 0; i < amountOfRecords; i++) {
  const base = seed[i % seed.length];

  result.push({
    ...base,
    suchtext: varyText(base!.suchtext, i),
    bildnummer: String(id++),
    fotografen: rand(publishers),
    datum: shiftDate(base!.datum!),
    // eslint-disable-next-line no-magic-numbers
    hoehe: String(Number(base!.hoehe) + Math.floor(Math.random() * 200 - 100)),
    // eslint-disable-next-line no-magic-numbers
    breite: String(Number(base!.breite) + Math.floor(Math.random() * 200 - 100)),
  });
}

const outDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

fs.writeFileSync(path.join(outDir, 'generated.json'), JSON.stringify(result));

// eslint-disable-next-line no-console
console.log(`Generated ${amountOfRecords} items → ./data/generated.json`);
