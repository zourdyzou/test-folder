export const DATASETS = {
  jgs: { label: 'Provided data', url: '/data/jgs' },
  large: { label: 'Generated, 20k series', url: '/data/large' },
} as const;

export type DatasetId = keyof typeof DATASETS;

/** The dataset is picked with `?dataset=`; anything but `large` means the provided one. */
export function currentDataset(): DatasetId {
  const raw = new URLSearchParams(window.location.search).get('dataset');
  return raw === 'large' ? 'large' : 'jgs';
}

/** Reloads the page with the other dataset, so the data is again loaded before the first render. */
export function switchDataset(id: DatasetId): void {
  const url = new URL(window.location.href);
  if (id === 'jgs') {
    url.searchParams.delete('dataset');
  } else {
    url.searchParams.set('dataset', id);
  }
  window.location.assign(url);
}
