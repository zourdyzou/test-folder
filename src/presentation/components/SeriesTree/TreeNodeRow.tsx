import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, IconButton } from '@mui/material';
import type { SeriesId } from '../../../domain/models';
import type { FlatRow } from '../../../domain/tree';
import * as styles from './VirtualTree.styles';

interface Props {
  row: FlatRow;
  /** Offset from the top of the tree in px, given by the virtualizer. */
  top: number;
  selected: boolean;
  onSelect: (id: SeriesId) => void;
  onToggle: (id: SeriesId) => void;
}

/** One tree node: indented by depth, an expand/collapse chevron for parents, then the label. */
export function TreeNodeRow({ row, top, selected, onSelect, onToggle }: Props) {
  return (
    <Box
      onClick={() => onSelect(row.id)}
      sx={styles.row({ depth: row.depth, start: top, selected })}
    >
      {row.hasChildren ? (
        <IconButton
          size="small"
          aria-label={row.expanded ? 'Collapse' : 'Expand'}
          aria-expanded={row.expanded}
          onClick={(e) => {
            e.stopPropagation(); // toggling must not also select the node
            onToggle(row.id);
          }}
        >
          {row.expanded ? (
            <ExpandMoreIcon fontSize="small" />
          ) : (
            <ChevronRightIcon fontSize="small" />
          )}
        </IconButton>
      ) : (
        <Box sx={styles.togglePlaceholder} />
      )}
      <span title={row.label}>{row.label}</span>
    </Box>
  );
}
