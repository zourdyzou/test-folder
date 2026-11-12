import { afterEach, describe, expect, it } from 'vitest';
import { currentDataset } from './dataset-switcher';

describe('currentDataset', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it.each([
    ['/', 'jgs'],
    ['/?dataset=large', 'large'],
    ['/?dataset=unknown', 'jgs'],
  ])('reads %j as %j', (url, expected) => {
    window.history.replaceState(null, '', url);
    expect(currentDataset()).toBe(expected);
  });
});
