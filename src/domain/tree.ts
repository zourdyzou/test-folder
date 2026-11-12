import type { HierarchyLink, Series, SeriesId, SeriesNode } from './models';

export const ROOT_PARENT_ID: SeriesId = 0;

function compareNodes(a: SeriesNode, b: SeriesNode): number {
  return a.label.localeCompare(b.label);
}

/**
 * Builds the nested tree from our input data
 * Input is expected to be valid.
 */
export function buildNestedSeriesTree(
  series: readonly Series[],
  links: readonly HierarchyLink[],
): SeriesNode[] {
  // One tree node per series; the links below fill in the children.
  const seriesById = new Map();
  for (const s of series) {
    seriesById.set(s.id, { id: s.id, label: s.description, children: [] });
  }

  const roots = [];
  for (const { childId, parentId } of links) {
    const child = seriesById.get(childId);
    if (!child) {
      continue; // unknown child
    }
    if (parentId === ROOT_PARENT_ID) {
      roots.push(child);
    } else {
      const parent = seriesById.get(parentId);
      if (!parent) {
        continue; // unknown parent
      }
      parent.children.push(child);
    }
  }

  // Siblings sorted by label.
  roots.sort(compareNodes);
  for (const node of seriesById.values()) {
    node.children.sort(compareNodes);
  }
  return roots;
}

export interface FlatRow {
  id: SeriesId;
  label: string;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
}

/**
 *  Flattens the visible part of the nested tree into the flat array of rows.
 *  We need flatten structure(like array) to support virtualization later to mitigate performance issues for huge datasets
 */
export function buildFlattenTree(
  roots: readonly SeriesNode[],
  expandedIds: ReadonlySet<SeriesId>,
): FlatRow[] {
  const result: FlatRow[] = [];

  const stack: { node: SeriesNode; depth: number }[] = []; // using stack instead of recursion to about stackoverflow if too deep nesting in the tree
  for (let i = roots.length - 1; i >= 0; i--) {
    // in reverse order to get them in correct order later
    stack.push({ node: roots[i], depth: 0 });
  }

  while (stack.length > 0) {
    const { node, depth } = stack.pop()!;
    const hasChildren = node.children.length > 0;
    const expanded = hasChildren && expandedIds.has(node.id);
    result.push({ id: node.id, label: node.label, depth, hasChildren, expanded });

    if (expanded) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push({ node: node.children[i], depth: depth + 1 });
      }
    }
  }
  return result;
}
