import { MenuItem, Select } from '@mui/material';
import {
  DATASETS,
  currentDataset,
  switchDataset,
  type DatasetId,
} from '../../app/dataset-switcher';
import * as styles from './MainLayout.styles';

const DATASET_IDS = Object.keys(DATASETS) as DatasetId[];

export function DatasetSelect() {
  return (
    <Select
      size="small"
      value={currentDataset()}
      onChange={(e) => switchDataset(e.target.value)}
      inputProps={{ 'aria-label': 'Dataset' }}
      sx={styles.datasetSelect}
    >
      {DATASET_IDS.map((id) => (
        <MenuItem key={id} value={id}>
          {DATASETS[id].label}
        </MenuItem>
      ))}
    </Select>
  );
}
