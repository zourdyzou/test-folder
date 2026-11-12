import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { LockedCell, Observation, Period, SeriesNode } from '../../../domain/models';
import type { SeriesRepository } from '../../../domain/SeriesRepository';
import { RepositoryContext } from '../../app/repositoryStore';
import { ObservationsGrid } from './ObservationsGrid';

const P1: Period = '2010-03';
const P2: Period = '2010-04';

const observations: Observation[] = [
  { seriesId: 1, period: P1, values: { sales: 6868.71, demand: 4200, supply: null } },
  { seriesId: 1, period: P2, values: { sales: 5170.58, demand: 8400, supply: null } },
];
const locks: LockedCell[] = [{ seriesId: 1, period: P1, measure: 'sales' }];
const none: Observation[] = [];
const tree: SeriesNode[] = [{ id: 1, label: '[US] [BOSCOV] [S1237]', children: [] }];

const repository: SeriesRepository = {
  getSeriesTree: () => tree,
  getSeriesLabel: (id) => (id === 1 ? '[US] [BOSCOV] [S1237]' : undefined),
  getSeriesIds: () => [1],
  getObservations: (id) => (id === 1 ? observations : none),
  getLockedCells: (id) => (id === 1 ? locks : []),
};

function renderGrid(seriesId: number | null) {
  return render(
    <RepositoryContext.Provider value={repository}>
      <ObservationsGrid seriesId={seriesId} disableVirtualization />
    </RepositoryContext.Provider>,
  );
}

// Rows are found by their id (the source period), which stays the same when the period cell is edited.
async function cell(period: Period, field: string) {
  const row = await waitFor(() => {
    const found = document.querySelector<HTMLElement>(`[role="row"][data-id="${period}"]`);
    expect(found).not.toBeNull();
    return found!;
  });
  return row.querySelector<HTMLElement>(`[data-field="${field}"]`)!;
}

// The grid's edit input debounces its value, so Enter right after typing would commit the old one.
async function typeAndCommit(
  user: ReturnType<typeof userEvent.setup>,
  input: HTMLElement,
  text: string,
) {
  await user.type(input, text);
  await new Promise((r) => setTimeout(r, 300));
  await user.keyboard('{Enter}');
}

describe('ObservationsGrid', () => {
  it('asks to select a series when nothing is selected', () => {
    renderGrid(null);
    expect(screen.getByText('Select a series in the tree')).toBeInTheDocument();
  });

  it('shows the label, periods as stored and empty cells for null', async () => {
    renderGrid(1);
    expect(await screen.findByText('[US] [BOSCOV] [S1237]')).toBeInTheDocument();
    expect(await screen.findByText('2010-03')).toBeInTheDocument();
    expect((await cell(P1, 'supply')).textContent).toBe('');
  });

  it('shows the empty state for a series without observations', async () => {
    renderGrid(2);
    expect(await screen.findByText('No observations for this series')).toBeInTheDocument();
  });

  it('marks only the locked cell and does not let it be edited', async () => {
    const user = userEvent.setup();
    renderGrid(1);
    const locked = await cell(P1, 'sales');
    expect(within(locked).getByTitle('locked')).toBeInTheDocument();
    expect(locked).toHaveClass('cell--locked');
    expect(await cell(P1, 'demand')).not.toHaveClass('cell--locked');

    await user.dblClick(locked);
    expect(within(locked).queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('highlights an edit and clears it when the original value is typed back', async () => {
    const user = userEvent.setup();
    renderGrid(1);
    const demand = await cell(P2, 'demand');

    await user.dblClick(demand);
    const input = within(demand).getByRole('spinbutton');
    await user.clear(input);
    await typeAndCommit(user, input, '6868.512345');
    await waitFor(async () => expect(await cell(P2, 'demand')).toHaveClass('cell--dirty'));
    // All decimals are shown, not rounded to 3 like the grid's default number formatter.
    expect((await cell(P2, 'demand')).textContent).toMatch(/6.868.512345/);

    // Typing the original value back clears the highlight.
    const edited = await cell(P2, 'demand');
    await user.dblClick(edited);
    const again = within(edited).getByRole('spinbutton');
    await user.clear(again);
    await typeAndCommit(user, again, '8400');
    await waitFor(async () => expect(await cell(P2, 'demand')).not.toHaveClass('cell--dirty'));
  });

  it('lets the period be edited as any text', async () => {
    const user = userEvent.setup();
    renderGrid(1);
    const period = await cell(P2, 'period');

    await user.dblClick(period);
    const input = within(period).getByRole('textbox');
    await user.clear(input);
    await typeAndCommit(user, input, 'next month');
    await waitFor(async () => expect(await cell(P2, 'period')).toHaveClass('cell--dirty'));
    expect((await cell(P2, 'period')).textContent).toBe('next month');
  });
});
