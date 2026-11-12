import type { SxProps, Theme } from '@mui/material';

export const LOCKED_COLOR = '#ffcc80'; // light orange
export const EDITED_COLOR = '#c8e6c9'; // light green

export const grid = {
  '& .cell--locked': { bgcolor: LOCKED_COLOR, cursor: 'not-allowed' },
  '& .cell--dirty': { bgcolor: EDITED_COLOR },
  '& .MuiDataGrid-cell--editing.MuiDataGrid-cell': { bgcolor: 'background.paper' },
} satisfies SxProps<Theme>;

export const lockIcon = { ml: 0.5 } satisfies SxProps<Theme>;

export const emptyHint = { p: 3 } satisfies SxProps<Theme>;

export const root = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  p: 2,
  gap: 1,
} satisfies SxProps<Theme>;

export const gridWrapper = { flex: 1, minHeight: 0 } satisfies SxProps<Theme>;

export const legend = { color: 'text.secondary', fontSize: 14 } satisfies SxProps<Theme>;
export const legendItem = { alignItems: 'center' } satisfies SxProps<Theme>;
export const legendSwatch = {
  width: 14,
  height: 14,
  bgcolor: EDITED_COLOR,
  borderRadius: 0.5,
} satisfies SxProps<Theme>;
