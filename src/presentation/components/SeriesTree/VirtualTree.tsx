import { Box } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef } from 'react';
import type { SeriesId, SeriesNode } from '../../../domain/models';
import { buildFlattenTree } from '../../../domain/tree';
import { TreeNodeRow } from './TreeNodeRow';
import * as styles from './VirtualTree.styles';

interface Props {
  nodes: readonly SeriesNode[];
  expanded: ReadonlySet<SeriesId>;
  onToggle: (id: SeriesId) => void;
  selectedId: SeriesId | null;
  onSelect: (id: SeriesId) => void;
}

/** Renders only the rows in (or near) the viewport, so DOM size does not depend on tree size. */
export function VirtualTree({ nodes, expanded, onToggle, selectedId, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = useMemo(() => buildFlattenTree(nodes, expanded), [nodes, expanded]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => styles.ROW_HEIGHT,
    overscan: 10,
  });

  const items = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  // Unmounted regions above/below the rendered window, shown as skeleton during fast scroll.
  const topGap = items[0]?.start ?? 0;
  const bottomStart = items.at(-1)?.end ?? totalSize;

  return (
    <Box ref={scrollRef} sx={styles.scroller}>
      <Box sx={styles.tree(totalSize)}>
        {topGap > 0 && <Box aria-hidden sx={styles.skeletonFill(0, topGap)} />}
        {totalSize > bottomStart && (
          <Box aria-hidden sx={styles.skeletonFill(bottomStart, totalSize - bottomStart)} />
        )}
        {items.map((item) => {
          const row = rows[item.index];
          return (
            <TreeNodeRow
              key={row.id}
              row={row}
              top={item.start}
              selected={row.id === selectedId}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          );
        })}
      </Box>
    </Box>
  );
}
