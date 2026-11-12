import type { SxProps, Theme } from '@mui/material';
import { keyframes } from '@mui/material/styles';

export const ROW_HEIGHT = 32;
export const INDENT = 16;

export const scroller = {
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  px: 1,
  pb: 1,
} satisfies SxProps<Theme>;

export const tree = (totalSize: number): SxProps<Theme> => ({
  height: totalSize,
  position: 'relative',
  minWidth: 'max-content',
});

export const row = (opts: { depth: number; start: number; selected: boolean }): SxProps<Theme> => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: ROW_HEIGHT,
  transform: `translateY(${opts.start}px)`,
  display: 'flex',
  alignItems: 'center',
  pl: `${opts.depth * INDENT}px`,
  pr: 1,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  borderRadius: 1,
  bgcolor: opts.selected ? 'action.selected' : undefined,
  '&:hover': { bgcolor: 'action.hover' },
});

const TOGGLE_WIDTH = 30;
const SKELETON_BAR = 16;

export const togglePlaceholder = { width: TOGGLE_WIDTH, flexShrink: 0 } satisfies SxProps<Theme>;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

/**
 * Placeholder bars painted where no rows are mounted. On fast scroll the viewport can outrun
 * React; this is already in the DOM, so the user sees skeleton rows instead of blank space.
 * Pure CSS, one element regardless of height; bars align with rows since row height is fixed.
 */
export const skeletonFill =
  (top: number, height: number): SxProps<Theme> =>
  (theme) => {
    const gap = (ROW_HEIGHT - SKELETON_BAR) / 2;
    const color = theme.palette.action.hover;
    return {
      position: 'absolute',
      top,
      left: 0,
      width: '100%',
      height,
      pointerEvents: 'none',
      backgroundImage: `linear-gradient(to bottom, transparent ${gap}px, ${color} ${gap}px, ${color} ${gap + SKELETON_BAR}px, transparent ${gap + SKELETON_BAR}px)`,
      backgroundSize: `60% ${ROW_HEIGHT}px`,
      backgroundPosition: `${TOGGLE_WIDTH}px 0`,
      backgroundRepeat: 'repeat-y',
      animation: `${pulse} 1.5s ease-in-out infinite`,
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    };
  };
