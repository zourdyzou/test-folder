# Submission notes

<!-- by Mikalai Darynski -->

## Starting point

- kept React 18 and the starter's toolchain (Vite 5, ESLint 8, npm) though it's outdated;
- moved the code to TypeScript and function components according to the modern React best practices.
- moved the JSON files from `src/data/` to `public/data/jgs/` and load them with `fetch`, so the data is not in the
  JS bundle;
- generated huge dataset (20k series in the tree) for a scalability check, selectable in the header.

## Approach

1. Read all the data into memory from the JSON files, since there is no server here.
2. Build the tree with Maps.
   1. A Map is a hash table: getting a series by id is O(1). The trade-off is O(n) extra memory for the indexes.
   2. Huge trees need virtualization: only the visible nodes are rendered.
      A nested tree cannot be virtualized, so i flattened it into an array, and than array is virtualized.
3. Clicking a node shows its observations in the grid. Grid is MUI grid component.
   1. Large tables are paged, it's best practice for the tablesm, though sometime it also might use virtualisation.
   2. Locked cells are a Set and edited cells a Map, so checking or changing a cell is O(1).

## Architecture decisions

1. Layered architecture with clear boundaries to keep coupling low.
2. Presentation only renders; the logic is in `domain`, data access in `data`.
3. The `SeriesRepository` interface has a JSON implementation; a REST implementation can replace it in one line. Easy to maintain and extend.
4. State is kept with plain React hooks. No global store, because only one component needs the edits.

## Key decisions and trade-offs

- A custom tree with virtualization instead of a tree component, free versions of the tree don't support virtualization.
- All the data is loaded into memory from JSON, but only the visible part is rendered. Ideally only the visible data
  would be loaded too, but it will require pagination on the server.

## Scalability

Improvements depend on the requirements.
I virtualized the tree as the most demanding part, and the grid uses paging.
If the grid gets many columns, column virtualization would be the next step.

## Possible improvements

- Accessibility (ARIA attributes, focus control, keyboard navigation)
- Preserve selection on page refresh
- Responsive layout
- e2e and visual degradation tests
