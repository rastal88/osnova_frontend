import { describe, expect, it } from 'vitest';

import { barHeights } from './bars';

describe('barHeights', () => {
  it('scales to the tallest bar', () => {
    expect(barHeights([1, 2, 4])).toEqual([25, 50, 100]);
  });

  it('keeps empty data flat', () => {
    expect(barHeights([0, 0])).toEqual([0, 0]);
    expect(barHeights([])).toEqual([]);
  });
});
