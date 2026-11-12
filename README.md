# Series Explorer

A two-panel React app: a tree of series on the left, an editable grid of the selected series' observations
(Period / Sales / Demand / Supply) on the right. Cells are editable but nothing is saved; cells listed in
`tblLockedPeriods` are read-only.

Built on the provided starter (Vite + React 18): the React version and the Vite / ESLint toolchain are kept,
the code is moved to TypeScript and function components.

## Run

Requires Node 20.11+ and npm.

```
npm i
npm run dev              # http://localhost:5173
npm run build            # type check + production build
npm test                 # Vitest: domain rules, mapping and grid behaviour
npm run lint
npm run typecheck
npm run format
npm run generate-data    # regenerate public/data/large/
```

The dataset is switched with the selector in the header (it reloads the page);

### Test data

Both datasets have the same four files: `tblSeries`, `tblHierarchy`, `tblObservations` and `tblLockedPeriods`.

**Provided data** (default): `public/data/jgs/`.
598 series in three levels (2 countries → 6 customers → SKUs), 36 months each (2010-03 to 2013-02), locks on the Sales column only.
Roots are marked with `FK_PARENT_SERIES = 0`, parent nodes carry their own observations, and `QY_SUPPLY` is missing
in some rows (shown as an empty cell).

**Generated large dataset** ("Generated, 20k series" in the header): `public/data/large/` (about 14 MB), produced by
`scripts/generate-mock-data.mjs`. The generator is deterministic (seeded PRNG), so rerunning it gives the same files:

- **Tree:** 20 countries × 40 customers × 24 SKUs = 20,020 series in three levels, labelled like the mockup:
  `[COUNTRY] [CUSTOMER] [SKU]`. Roots use `FK_PARENT_SERIES = 0`, as in the provided data. This is what stresses
  the tree.
- **Observations:** about 82k rows. Most SKUs have 1–7 months starting between 2000 and 2022. The 20 SKUs at the
  top of the tree (the first 4 SKUs of the first 5 customers of `C01`) are marked `LARGE` in their label and have
  150–300 months, so the grid's paging can be seen. Values are random, with some seasonality and trend.
- **Locks:** every SKU has at least one locked cell, plus about 5% of cells at random.

## Architecture

```
src/
  domain/        plain TypeScript: models, the repository port, tree building and flattening
                 (no React, no fetch)
  data/          implements the port: DTOs, mappers, JSON loading and indexes
  presentation/  React: app shell, data hooks, components (layout, tree, grid)
  main.tsx       composition root: the only file that imports data/
```

Dependencies point inward: `presentation → domain ← data`. The domain is testable without React, and components
read data only through the `SeriesRepository` interface, so they do not know it comes from JSON files.

## Key decisions

- **Virtualized tree.** The tree is a custom list on `@tanstack/react-virtual`, not a tree component.
  `buildFlattenTree` (domain) turns the expanded part of the tree into a flat list of rows with their depth, and only the
  rows in or near the viewport are in the DOM. The DOM size stays constant, so "Expand all" on 20k series is cheap.
- **Locks are per cell.** `TX_OPINION` names the locked column, so a lock is (series, period, measure), never a
  whole row. The grid puts the locks of the selected series in a `Set` of `period|measure` keys, so a lookup is O(1).
- **Edits are an overlay.** The grid keeps a `Map<series|period, changed fields>` in `useState` over the untouched
  source data; setting a value back to the original removes the entry. The grid is not remounted when the selected
  series changes, so edits survive switching series.
- **The period is editable too**, as plain text, and shown as stored (`2010-03`, as in the mockup). The row id
  stays the source period, so edits and locks remain attached to the right month after the period cell changes.
- **Input is trusted.** Mappers only rename columns into domain models; the JSON is not validated.
- **Number input:** the measure columns are DataGrid `number` columns, so the grid parses (`''` → `null`) and
  formats (`toLocaleString`) the values, and the browser's numeric editor does not accept letters.
- **MUI X DataGrid (MIT)**, client-side pages of up to 100 rows (the MIT maximum).

## Assumptions

- Roots are rows with `FK_PARENT_SERIES = 0`. A series that cannot be reached from a root (no hierarchy row, or a
  parent that does not exist) is not shown. The provided data has none.
- The hierarchy is valid: every series has at most one parent and there are no cycles. The tree is built without
  checks for them (a series with two parents would appear twice; a cycle through a root would loop forever).
- Clicking a parent shows its own observations, not aggregates of its children.
- Missing months are not filled in; `null` is shown as an empty cell.
