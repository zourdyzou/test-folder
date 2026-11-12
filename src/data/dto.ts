// Raw JSON row shapes.
export interface SeriesDto {
  KY_ID: number;
  TX_DESCRIPTION: string;
}

export interface HierarchyDto {
  FK_SERIES: number;
  /** 0 for a root. */
  FK_PARENT_SERIES: number;
}

export interface ObservationDto {
  FK_SERIES: number;
  TX_PERIOD: string;
  QY_SALES?: number;
  QY_DEMAND?: number;
  QY_SUPPLY?: number;
}

export interface LockedPeriodDto {
  FK_SERIES: number;
  TX_PERIOD: string;
  /** Name of the locked quantity column. */
  TX_OPINION: 'QY_SALES' | 'QY_DEMAND' | 'QY_SUPPLY';
}
