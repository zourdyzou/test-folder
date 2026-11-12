import { Box, Button, Stack } from '@mui/material';
import { memo, useCallback, useState } from 'react';
import type { SeriesId } from '../../../domain/models';
import { useSeriesIds, useSeriesTree } from '../../hooks/entityQueries';
import { VirtualTree } from './VirtualTree';

interface Props {
  selectedId: SeriesId | null;
  onSelect: (id: SeriesId) => void;
}

export const SeriesTree = memo(function SeriesTree({ selectedId, onSelect }: Props) {
  const treeNodes = useSeriesTree();
  const seriesIds = useSeriesIds();
  const [expanded, setExpanded] = useState<ReadonlySet<SeriesId>>(() => new Set());

  const onToggle = useCallback((id: SeriesId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <>
      <Box sx={{ p: 1.5, pb: 1 }}>
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => setExpanded(new Set(seriesIds))}>
            Expand all
          </Button>
          <Button size="small" onClick={() => setExpanded(new Set())}>
            Collapse all
          </Button>
        </Stack>
      </Box>
      <VirtualTree
        nodes={treeNodes}
        expanded={expanded}
        onToggle={onToggle}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </>
  );
});
