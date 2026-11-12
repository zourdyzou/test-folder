import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import type { GridCellParams, GridColDef } from '@mui/x-data-grid';
import { MEASURES, MEASURE_LABELS } from '../../../domain/models';
import { isCellEdited, isCellLocked, type GridRow } from './ObservationsGrid.model';
import * as styles from './ObservationsGrid.styles';

// DataGrid configuration. Each row carries everything its cells need (values, originals, lock
// flags), so the columns and the callbacks below are static and never rebuilt.

export const COLUMNS: GridColDef<GridRow>[] = [
  // Shown as stored ('2010-03', as in the mockup) and editable as plain text.
  { field: 'period', headerName: 'Period', width: 130, editable: true },
  ...MEASURES.map((measure): GridColDef<GridRow> => ({
    field: measure,
    headerName: MEASURE_LABELS[measure],
    flex: 1,
    minWidth: 120,
    editable: true,
    // DataGrid number column: numeric editor, '' → null, right-aligned.
    type: 'number',
    // The default formatter rounds to 3 decimals; show the full value, the same as the editor does.
    valueFormatter: (value: number | null) =>
      value?.toLocaleString(undefined, { maximumFractionDigits: 20 }) ?? '',
    renderCell: (params) => (
      <>
        {params.formattedValue}
        {params.row.lockedMeasures[measure] && (
          <LockOutlinedIcon fontSize="small" titleAccess="locked" sx={styles.lockIcon} />
        )}
      </>
    ),
  })),
];

export const isCellEditable = (params: GridCellParams<GridRow>) =>
  !isCellLocked(params.row, params.field);

/** Orange background for locked cells, green for edited ones (see ObservationsGrid.styles). */
export const getCellClassName = (params: GridCellParams<GridRow>) => {
  if (isCellLocked(params.row, params.field)) {
    return 'cell--locked';
  }
  return isCellEdited(params.row, params.field) ? 'cell--dirty' : '';
};
