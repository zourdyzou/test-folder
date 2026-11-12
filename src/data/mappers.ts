import type { HierarchyLink, LockedCell, Measure, Observation, Series } from '../domain/models';
import type { HierarchyDto, LockedPeriodDto, ObservationDto, SeriesDto } from './dto';

export function mapSeries(row: SeriesDto): Series {
  return { id: row.KY_ID, description: row.TX_DESCRIPTION };
}

export function mapHierarchy(row: HierarchyDto): HierarchyLink {
  return { childId: row.FK_SERIES, parentId: row.FK_PARENT_SERIES };
}

export function mapObservation(row: ObservationDto): Observation {
  return {
    seriesId: row.FK_SERIES,
    period: row.TX_PERIOD,
    // A quantity column can be missing from a row; it is shown as an empty cell.
    values: {
      sales: row.QY_SALES ?? null,
      demand: row.QY_DEMAND ?? null,
      supply: row.QY_SUPPLY ?? null,
    },
  };
}

const OPINION_TO_MEASURE: Record<LockedPeriodDto['TX_OPINION'], Measure> = {
  QY_SALES: 'sales',
  QY_DEMAND: 'demand',
  QY_SUPPLY: 'supply',
};

export function mapLockedPeriod(row: LockedPeriodDto): LockedCell {
  return {
    seriesId: row.FK_SERIES,
    period: row.TX_PERIOD,
    measure: OPINION_TO_MEASURE[row.TX_OPINION],
  };
}
