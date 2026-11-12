import type { SxProps, Theme } from '@mui/material';

export const TREE_WIDTH = 420;

export const root = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
} satisfies SxProps<Theme>;

export const toolbar = { gap: 1 } satisfies SxProps<Theme>;

export const title = { flexGrow: 1 } satisfies SxProps<Theme>;

// Sits on the coloured app bar, so text, arrow and outline follow the bar's text colour.
export const datasetSelect = {
  color: 'inherit',
  '& .MuiSelect-icon': { color: 'inherit' },
  '& .MuiOutlinedInput-notchedOutline, &:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline':
    { borderColor: 'currentColor' },
} satisfies SxProps<Theme>;

export const body = { flex: 1, minHeight: 0, display: 'flex' } satisfies SxProps<Theme>;

export const sidebar = {
  width: TREE_WIDTH,
  flexShrink: 0,
  borderRight: 1,
  borderColor: 'divider',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
} satisfies SxProps<Theme>;

export const main = {
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  display: 'flex',
} satisfies SxProps<Theme>;
