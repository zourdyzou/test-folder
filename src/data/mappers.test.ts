import { describe, expect, it } from 'vitest';
import { mapLockedPeriod, mapObservation } from './mappers';

describe('mapObservation', () => {
  it('maps the quantity columns and keeps a missing one as null', () => {
    expect(
      mapObservation({ FK_SERIES: 1, TX_PERIOD: '2011-01', QY_SALES: 10.5, QY_DEMAND: 20 }),
    ).toEqual({
      seriesId: 1,
      period: '2011-01',
      values: { sales: 10.5, demand: 20, supply: null },
    });
  });
});

describe('mapLockedPeriod', () => {
  it('maps TX_OPINION to the locked column', () => {
    expect(
      mapLockedPeriod({ FK_SERIES: 1, TX_PERIOD: '2011-01', TX_OPINION: 'QY_DEMAND' }),
    ).toEqual({ seriesId: 1, period: '2011-01', measure: 'demand' });
  });
});
