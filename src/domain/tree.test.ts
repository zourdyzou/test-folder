import { describe, expect, it } from 'vitest';
import type { HierarchyLink, Series, SeriesNode } from './models';
import { buildNestedSeriesTree, buildFlattenTree } from './tree';

/** "Expand all" as the app does it: every series id; buildFlattenTree only expands nodes with children. */
const expandAll = (series: readonly Series[]) => new Set(series.map((x) => x.id));

const s = (id: number, description = `S${id}`): Series => ({ id, description });
const link = (childId: number, parentId: number): HierarchyLink => ({ childId, parentId });

/** "label(child,child)" shape, handy for asserting the whole tree at once. */
function shape(nodes: readonly SeriesNode[]): string {
  return nodes
    .map((n) => (n.children.length ? `${n.label}(${shape(n.children)})` : n.label))
    .join(',');
}

describe('buildNestedSeriesTree', () => {
  it('takes roots from links with parent 0 and sorts siblings by label', () => {
    const roots = buildNestedSeriesTree(
      [s(1, 'B'), s(2, 'A'), s(3, 'b2'), s(4, 'a2')],
      [link(1, 0), link(2, 0), link(3, 1), link(4, 1)],
    );
    expect(shape(roots)).toBe('A,B(a2,b2)');
  });

  it('leaves out a series with no hierarchy row or an unknown parent', () => {
    const roots = buildNestedSeriesTree(
      [s(1, 'A'), s(2, 'no link'), s(3, 'unknown parent')],
      [link(1, 0), link(3, 99)],
    );
    expect(shape(roots)).toBe('A');
  });

  it('handles deep chains without recursion', () => {
    const n = 50_000;
    const series = Array.from({ length: n }, (_, i) => s(i + 1));
    const links = [link(1, 0), ...Array.from({ length: n - 1 }, (_, i) => link(i + 2, i + 1))];
    const roots = buildNestedSeriesTree(series, links);
    const rows = buildFlattenTree(roots, expandAll(series));
    expect(rows).toHaveLength(n);
    expect(rows[n - 1].depth).toBe(n - 1);
  });
});

describe('buildFlattenTree', () => {
  const series = [s(1, 'A'), s(2, 'A1'), s(3, 'A2'), s(4, 'B'), s(5, 'A1x')];
  const roots = buildNestedSeriesTree(series, [
    link(1, 0),
    link(4, 0),
    link(2, 1),
    link(3, 1),
    link(5, 2),
  ]);

  it('returns only roots when nothing is expanded', () => {
    expect(buildFlattenTree(roots, new Set()).map((r) => r.label)).toEqual(['A', 'B']);
  });

  it('emits expanded branches in pre-order with depth', () => {
    const rows = buildFlattenTree(roots, expandAll(series));
    expect(rows.map((r) => `${'-'.repeat(r.depth)}${r.label}`)).toEqual([
      'A',
      '-A1',
      '--A1x',
      '-A2',
      'B',
    ]);
  });

  it('never marks a leaf as expanded', () => {
    const rows = buildFlattenTree(roots, expandAll(series));
    expect(rows.find((r) => r.label === 'B')).toMatchObject({
      hasChildren: false,
      expanded: false,
    });
  });
});
