import { describe, expect, it } from 'vitest';

import {
  calculateBenchmark,
  calculateStandardBenchmarks,
} from '../../src/domain/slot-analysis-v2/benchmarks';

describe('slot analysis v2 benchmarks', () => {
  it('calculates the exact 100/103/105 benchmark cases', () => {
    const result = calculateStandardBenchmarks({ games: 4000, netMedals: 500 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(
      result.value.map(({ expectedNetMedals, differenceNetMedals, relation }) => ({
        expected: expectedNetMedals.display,
        difference: differenceNetMedals.display,
        relation,
      })),
    ).toEqual([
      { expected: 0, difference: 500, relation: 'above' },
      { expected: 360, difference: 140, relation: 'above' },
      { expected: 600, difference: -100, relation: 'below' },
    ]);
  });

  it('uses the exact relation when the rounded difference is zero', () => {
    const result = calculateBenchmark({ games: 1, netMedals: 0, benchmarkRate: '103' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.differenceNetMedals.exact).toEqual({ numerator: '-9', denominator: '100' });
    expect(result.value.differenceNetMedals.display).toBe(0);
    expect(result.value.relation).toBe('below');
    expect(result.value.differenceDisplayCode).toBe('less_than_one_below');
  });

  it('accepts an arbitrary positive finite decimal benchmark', () => {
    const result = calculateBenchmark({ games: 800, netMedals: -60, benchmarkRate: '97.5' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.expectedNetMedals.exact).toEqual({ numerator: '-60', denominator: '1' });
    expect(result.value.relation).toBe('equal');
    expect(result.value.differenceDisplayCode).toBe('exact_zero');
  });

  it('returns stable validation codes without UI copy', () => {
    expect(calculateBenchmark({ games: 0, netMedals: 0, benchmarkRate: 100 })).toMatchObject({
      ok: false,
      errors: [{ code: 'games_not_positive', field: 'games' }],
    });
    expect(calculateBenchmark({ games: 1, netMedals: 0, benchmarkRate: Infinity })).toMatchObject({
      ok: false,
      errors: [{ code: 'benchmark_rate_not_finite_decimal', field: 'benchmarkRate' }],
    });
  });
});
