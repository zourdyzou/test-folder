import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import { useState } from 'react';
import type { SeriesId } from '../../../domain/models';
import { ObservationsGrid } from '../ObservationsGrid/ObservationsGrid';
import { SeriesTree } from '../SeriesTree/SeriesTree';
import { DatasetSelect } from './DatasetSelect';
import * as styles from './MainLayout.styles';

export function MainLayout() {
  const [selectedId, setSelectedId] = useState<SeriesId | null>(null);

  return (
    <Box sx={styles.root}>
      <AppBar position="static" enableColorOnDark>
        <Toolbar variant="dense" sx={styles.toolbar}>
          <Typography variant="h6" component="h1" sx={styles.title} noWrap>
            Series Explorer
          </Typography>
          <DatasetSelect />
        </Toolbar>
      </AppBar>

      <Box sx={styles.body}>
        <Box component="nav" sx={styles.sidebar}>
          <SeriesTree selectedId={selectedId} onSelect={setSelectedId} />
        </Box>
        <Box component="main" sx={styles.main}>
          <ObservationsGrid seriesId={selectedId} />
        </Box>
      </Box>
    </Box>
  );
}
