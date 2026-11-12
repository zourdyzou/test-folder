// Generates the large mock dataset in public/data/large/ (open the app with ?dataset=large).
// 20 countries × 40 customers × 24 SKUs = 20,020 tree nodes.
// Most SKUs have a short observation window starting between 2000 and 2022 (1–7 months). The first
// 4 SKUs of the first 5 customers of C01 (20 series, at the top of the tree) are "LARGE": 150–300
// months, so the grid shows several pages. Their label says so: [C01] [CUSTOMER 1-01] [LARGE S010101].
// Every SKU has at least one locked cell. Values are random but deterministic (seeded PRNG), so the output is reproducible.
// Usage: npm run generate-data  (or: node scripts/generate-mock-data.mjs)
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(import.meta.dirname, '..', 'public', 'data', 'large');
const COUNTRIES = 20;
const CUSTOMERS = 40;
const SKUS = 24;
const CATEGORIES = ['Apparel', 'Footwear', 'Accessories', 'Electronics', 'Home', 'Sports'];
const OPINIONS = ['QY_SALES', 'QY_DEMAND', 'QY_SUPPLY'];
const LOCK_RATE = 0.05;
// Large series: country 1, customers 1..5, SKUs 1..4.
const isLarge = (c, k, s) => c === 1 && k <= 5 && s <= 4;

// Deterministic PRNG (mulberry32) so regenerating gives the same data.
let seed = 20261108;
function rand() {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const randInt = (min, max) => min + Math.floor(rand() * (max - min + 1));
const round2 = (n) => Math.round(n * 100) / 100;
const pad = (n, w = 2) => String(n).padStart(w, '0');

const series = [];
const hierarchy = [];
const observations = [];
const locks = [];
let id = 0;

for (let c = 1; c <= COUNTRIES; c++) {
  const country = `C${pad(c)}`;
  const countryId = ++id;
  series.push({ KY_ID: countryId, TX_DESCRIPTION: `[${country}]`, TX_COUNTRY: country });
  // Roots are marked with parent 0, as in the provided data.
  hierarchy.push({ FK_SERIES: countryId, FK_PARENT_SERIES: 0 });

  for (let k = 1; k <= CUSTOMERS; k++) {
    // Zero-padded so the tree (sorted by label) lists 1-01, 1-02, … instead of 1-1, 1-10, 1-11.
    const customer = `CUSTOMER ${c}-${pad(k)}`;
    const customerId = ++id;
    series.push({
      KY_ID: customerId,
      TX_DESCRIPTION: `[${country}] [${customer}]`,
      TX_COUNTRY: country,
      TX_CUSTOMER: customer,
    });
    hierarchy.push({ FK_SERIES: customerId, FK_PARENT_SERIES: countryId });

    for (let s = 1; s <= SKUS; s++) {
      const sku = `S${pad(c)}${pad(k)}${pad(s)}`;
      const large = isLarge(c, k, s);
      const skuId = ++id;
      series.push({
        KY_ID: skuId,
        TX_DESCRIPTION: `[${country}] [${customer}] [${large ? `LARGE ${sku}` : sku}]`,
        TX_SKU: sku,
        TX_COUNTRY: country,
        TX_CUSTOMER: customer,
        TX_CATEGORY: CATEGORIES[randInt(0, CATEGORIES.length - 1)],
      });
      hierarchy.push({ FK_SERIES: skuId, FK_PARENT_SERIES: customerId });

      const startYear = large ? randInt(2000, 2004) : randInt(2000, 2022);
      const startMonth = randInt(1, 12);
      const months = large ? randInt(150, 300) : randInt(1, 7);
      const base = randInt(2000, 40000);
      const trend = (rand() - 0.4) * 0.01;
      // Every series gets at least one locked cell, placed on the grid's first page (100 rows).
      const forcedMonth = randInt(0, Math.min(months, 100) - 1);
      const forcedOpinion = OPINIONS[randInt(0, OPINIONS.length - 1)];
      for (let m = 0; m < months; m++) {
        const abs = startMonth - 1 + m;
        const period = `${startYear + Math.floor(abs / 12)}-${pad((abs % 12) + 1)}`;
        const season = 1 + 0.15 * Math.sin(((abs % 12) / 12) * 2 * Math.PI);
        const level = base * season * (1 + trend * m);
        observations.push({
          FK_SERIES: skuId,
          TX_PERIOD: period,
          QY_SALES: round2(level * (0.85 + rand() * 0.3)),
          QY_DEMAND: Math.round(level * (0.9 + rand() * 0.2)),
          QY_SUPPLY: round2(level * (0.95 + rand() * 0.2)),
        });
        for (const op of OPINIONS) {
          const forced = m === forcedMonth && op === forcedOpinion;
          if (rand() < LOCK_RATE / OPINIONS.length || forced) {
            locks.push({ FK_SERIES: skuId, TX_PERIOD: period, TX_OPINION: op });
          }
        }
      }
    }
  }
}

// One row per line keeps files diffable without pretty-print bloat.
const write = (name, rows) => {
  // Delete first: overwriting in place fails on Windows while another process holds the file.
  rmSync(join(OUT, name), { force: true });
  writeFileSync(join(OUT, name), `[\n${rows.map((r) => JSON.stringify(r)).join(',\n')}\n]\n`);
};

mkdirSync(OUT, { recursive: true });
write('tblSeries.json', series);
write('tblHierarchy.json', hierarchy);
write('tblObservations.json', observations);
write('tblLockedPeriods.json', locks);
console.log(
  `series=${series.length} hierarchy=${hierarchy.length} observations=${observations.length} locks=${locks.length}`,
);
