import {
  MEASURES,
  type Measure,
  type Observation,
  type Period,
  type SeriesId,
} from '../../../domain/models';

export const EDITABLE_FIELDS = ['period', ...MEASURES] as const;
export type EditableField = (typeof EDITABLE_FIELDS)[number];
export type EditableValues = { period: string } & Record<Measure, number | null>;

/** The edited fields of one row; fields the user did not change are absent. */
export type RowEdits = Partial<EditableValues>;

export interface GridRow extends EditableValues {
  id: Period;
  originalValues: EditableValues;
  lockedMeasures: Record<Measure, boolean>;
}

/** Key of one row's edits: rows of different series never share edits. */
export const rowKey = (seriesId: SeriesId, period: Period) => `${seriesId}|${period}`;

/** Key of one locked cell within the selected series. */
export const lockKey = (period: Period, measure: Measure) => `${period}|${measure}`;

/** Builds the grid row of one month: source values, this row's adds edits on top and lock flags. */
export function toGridRow(
  observation: Observation,
  rowEdits: RowEdits | undefined,
  lockedCellKeys: ReadonlySet<string>,
): GridRow {
  const { period, values } = observation;
  const originalValues: EditableValues = { period, ...values };
  const isMeasureLocked = (measure: Measure) => lockedCellKeys.has(lockKey(period, measure));
  return {
    id: period,
    ...originalValues,
    ...rowEdits, // edited fields replace the source ones
    originalValues,
    lockedMeasures: {
      sales: isMeasureLocked('sales'),
      demand: isMeasureLocked('demand'),
      supply: isMeasureLocked('supply'),
    },
  };
}

/** The fields of an edited row that differ from the source, or `null` if none do. */
export function changedFields(row: GridRow): RowEdits | null {
  const changed = EDITABLE_FIELDS.filter((field) => row[field] !== row.originalValues[field]);
  if (changed.length === 0) {
    return null;
  }
  return Object.fromEntries(changed.map((field) => [field, row[field]])) as RowEdits;
}

const isMeasure = (field: string): field is Measure =>
  (MEASURES as readonly string[]).includes(field);
const isEditableField = (field: string): field is EditableField =>
  (EDITABLE_FIELDS as readonly string[]).includes(field);

export const isCellLocked = (row: GridRow, field: string) =>
  isMeasure(field) && row.lockedMeasures[field];
export const isCellEdited = (row: GridRow, field: string) =>
  isEditableField(field) && row[field] !== row.originalValues[field];
