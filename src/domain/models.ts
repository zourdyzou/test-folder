export type SeriesId = number;
export type Period = string; // 'YYYY-MM', e.g. '2011-01'
export const MEASURES = ['sales', 'demand', 'supply'] as const;
export type Measure = (typeof MEASURES)[number];

export interface Series {
  id: SeriesId;
  description: string;
}
export interface HierarchyLink {
  childId: SeriesId;
  /** `ROOT_PARENT_ID` (0) when the child is a root. */
  parentId: SeriesId;
}
export interface Observation {
  seriesId: SeriesId;
  period: Period;
  values: Record<Measure, number | null>;
}
export interface LockedCell {
  seriesId: SeriesId;
  period: Period;
  measure: Measure;
}
export interface SeriesNode {
  id: SeriesId;
  label: string;
  children: SeriesNode[];
}

export const MEASURE_LABELS: Record<Measure, string> = {
  sales: 'Sales',
  demand: 'Demand',
  supply: 'Supply',
};
