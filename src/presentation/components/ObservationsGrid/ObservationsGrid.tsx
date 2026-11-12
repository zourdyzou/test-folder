import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Box, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';
import type { SeriesId } from '../../../domain/models';
import { useLockedCells, useObservations, useSeriesLabel } from '../../hooks/entityQueries';
import { COLUMNS, getCellClassName, isCellEditable } from './ObservationsGrid.columns';
import {
  changedFields,
  lockKey,
  rowKey,
  toGridRow,
  type GridRow,
  type RowEdits,
} from './ObservationsGrid.model';
import * as styles from './ObservationsGrid.styles';

export function ObservationsGrid({
  seriesId,
  disableVirtualization,
}: {
  seriesId: SeriesId | null;
  disableVirtualization?: boolean;
}) {
  const label = useSeriesLabel(seriesId);
  const observations = useObservations(seriesId);
  const lockedCells = useLockedCells(seriesId);

  // EDITS: `${seriesId}|${period}` → the changed fields of that row. An overlay: the source data
  // is never modified. Kept here, so edits survive switching series: this component is not
  // remounted when `seriesId` changes (do not give it key={seriesId}).
  const [editedRows, setEditedRows] = useState<ReadonlyMap<string, RowEdits>>(() => new Map());

  // LOCKS: `${period}|${measure}` keys of the selected series, so checking a cell is O(1).
  const lockedCellKeys = useMemo(
    () => new Set(lockedCells.map((cell) => lockKey(cell.period, cell.measure))),
    [lockedCells],
  );

  // ROWS: one per month = source values + that row's edits + lock flags.
  const rows = useMemo<GridRow[]>(
    () =>
      seriesId === null
        ? []
        : observations.map((observation) =>
            toGridRow(
              observation,
              editedRows.get(rowKey(seriesId, observation.period)),
              lockedCellKeys,
            ),
          ),
    [seriesId, observations, editedRows, lockedCellKeys],
  );

  // Called by the grid when a cell edit is committed: store the row's changed fields.
  const processRowUpdate = useCallback(
    (newRow: GridRow) => {
      if (seriesId !== null) {
        const key = rowKey(seriesId, newRow.id);
        const changes = changedFields(newRow);
        setEditedRows((prev) => {
          const next = new Map(prev); // a new Map, so React sees the state change
          if (changes) {
            next.set(key, changes);
          } else {
            next.delete(key); // every field is back to its source value
          }
          return next;
        });
      }
      return newRow;
    },
    [seriesId],
  );

  if (seriesId === null) {
    return (
      <Typography color="text.secondary" sx={styles.emptyHint}>
        Select a series in the tree
      </Typography>
    );
  }

  return (
    <Box sx={styles.root}>
      <Typography variant="h6" component="h2" noWrap title={label ?? undefined}>
        {label ?? `Series #${seriesId}`}
      </Typography>

      {rows.length === 0 ? (
        <Typography color="text.secondary">No observations for this series</Typography>
      ) : (
        <Box sx={styles.gridWrapper}>
          <DataGrid
            rows={rows}
            columns={COLUMNS}
            density="compact"
            disableRowSelectionOnClick
            disableColumnMenu
            disableVirtualization={disableVirtualization}
            isCellEditable={isCellEditable}
            processRowUpdate={processRowUpdate}
            getCellClassName={getCellClassName}
            pageSizeOptions={[25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 100 } } }}
            sx={styles.grid}
          />
        </Box>
      )}

      <Stack direction="row" spacing={3} sx={styles.legend}>
        <Stack direction="row" spacing={0.5} sx={styles.legendItem}>
          <LockOutlinedIcon fontSize="small" />
          <span>locked</span>
        </Stack>
        <Stack direction="row" spacing={0.5} sx={styles.legendItem}>
          <Box sx={styles.legendSwatch} />
          <span>edited (not saved)</span>
        </Stack>
      </Stack>
    </Box>
  );
}
