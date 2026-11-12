import type { SeriesId } from '../domain/models';
import type { SeriesRepository } from '../domain/SeriesRepository';
import { buildNestedSeriesTree } from '../domain/tree';
import type { HierarchyDto, LockedPeriodDto, ObservationDto, SeriesDto } from './dto';
import { mapHierarchy, mapLockedPeriod, mapObservation, mapSeries } from './mappers';

const EMPTY: never[] = [];

async function getJson<T>(url: string): Promise<T[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load ${url}: HTTP ${res.status}`);
  }
  return (await res.json()) as T[];
}

function groupBySeries<T extends { seriesId: SeriesId }>(items: readonly T[]): Map<SeriesId, T[]> {
  const groups = new Map<SeriesId, T[]>();
  for (const item of items) {
    const list = groups.get(item.seriesId);
    if (list) {
      list.push(item);
    } else {
      groups.set(item.seriesId, [item]);
    }
  }
  return groups;
}

/** Loads the four tables once and indexes them, so every later lookup is a map read with O(1) */
export async function loadJsonSeriesRepository(baseUrl: string): Promise<SeriesRepository> {
  const [series, hierarchy, observations, locks] = await Promise.all([
    getJson<SeriesDto>(`${baseUrl}/tblSeries.json`),
    getJson<HierarchyDto>(`${baseUrl}/tblHierarchy.json`),
    getJson<ObservationDto>(`${baseUrl}/tblObservations.json`),
    getJson<LockedPeriodDto>(`${baseUrl}/tblLockedPeriods.json`),
  ]);

  const seriesList = series.map(mapSeries);
  const nestedTree = buildNestedSeriesTree(seriesList, hierarchy.map(mapHierarchy));
  const labelById = new Map(seriesList.map((s) => [s.id, s.description]));
  const seriesIds = [...labelById.keys()];

  const observationsBySeries = groupBySeries(observations.map(mapObservation));
  for (const list of observationsBySeries.values()) {
    // 'YYYY-MM' sorts chronologically as plain text.
    list.sort((a, b) => a.period.localeCompare(b.period));
  }
  const locksBySeries = groupBySeries(locks.map(mapLockedPeriod));

  return {
    getSeriesTree: () => nestedTree,
    getSeriesLabel: (seriesId) => labelById.get(seriesId),
    getSeriesIds: () => seriesIds,
    getObservations: (seriesId) => observationsBySeries.get(seriesId) ?? EMPTY,
    getLockedCells: (seriesId) => locksBySeries.get(seriesId) ?? EMPTY,
  };
}
