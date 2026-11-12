import type { LockedCell, Observation, SeriesId, SeriesNode } from '../../domain/models';
import { useRepository } from '../app/repositoryStore';

const NO_OBSERVATIONS: Observation[] = [];
const NO_LOCKS: LockedCell[] = [];

export function useSeriesTree(): SeriesNode[] {
  return useRepository().getSeriesTree();
}

export function useSeriesIds(): SeriesId[] {
  return useRepository().getSeriesIds();
}

export function useObservations(seriesId: SeriesId | null): Observation[] {
  const repo = useRepository();
  return seriesId === null ? NO_OBSERVATIONS : repo.getObservations(seriesId);
}

export function useLockedCells(seriesId: SeriesId | null): LockedCell[] {
  const repo = useRepository();
  return seriesId === null ? NO_LOCKS : repo.getLockedCells(seriesId);
}

export function useSeriesLabel(seriesId: SeriesId | null): string | null {
  const repo = useRepository();
  return seriesId === null ? null : (repo.getSeriesLabel(seriesId) ?? null);
}
