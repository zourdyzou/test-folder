import type { LockedCell, Observation, SeriesId, SeriesNode } from './models';

/** Repository interface, we have json repository later we could add RestRepository which will read data from the rest api */
export interface SeriesRepository {
  getSeriesTree(): SeriesNode[];
  getSeriesLabel(seriesId: SeriesId): string | undefined;
  /** Every series id, e.g. for "Expand all" (expanding a leaf is a no-op). */
  getSeriesIds(): SeriesId[];
  /** Sorted by period. */
  getObservations(seriesId: SeriesId): Observation[];
  getLockedCells(seriesId: SeriesId): LockedCell[];
}
