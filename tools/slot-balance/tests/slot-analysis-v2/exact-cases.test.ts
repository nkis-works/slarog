import { describe, expect, it } from 'vitest';

import { compare, divide, integer, multiply } from '../../src/domain/rational';
import { CALCULATION_VERSION } from '../../src/domain/version';
import { calculateStandardBenchmarks } from '../../src/domain/slot-analysis-v2/benchmarks';
import { analyzeCumulativePoints } from '../../src/domain/slot-analysis-v2/cumulative-points';
import { analyzeSegments } from '../../src/domain/slot-analysis-v2/segments';
import { calculateTargetReverse } from '../../src/domain/slot-analysis-v2/target-reverse';
import { SLOT_ANALYSIS_CALCULATION_VERSION } from '../../src/domain/slot-analysis-v2/version';

describe('slot analysis v2 exact release cases', () => {
  it('keeps the v1 version unchanged and exposes v2 as 2.0.0', () => {
    expect(CALCULATION_VERSION).toBe('1.0.0');
    expect(SLOT_ANALYSIS_CALCULATION_VERSION).toBe('2.0.0');
  });

  it('preserves exact benchmark fractions before display rounding', () => {
    const result = calculateStandardBenchmarks({ games: 4000, netMedals: 500 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((value) => value.expectedNetMedals.exact)).toEqual([
      { numerator: '0', denominator: '1' },
      { numerator: '360', denominator: '1' },
      { numerator: '600', denominator: '1' },
    ]);
    expect(result.value.map((value) => value.differenceNetMedals.exact)).toEqual([
      { numerator: '500', denominator: '1' },
      { numerator: '140', denominator: '1' },
      { numerator: '-100', denominator: '1' },
    ]);
  });

  it('reproduces direct and arbitrary-start cumulative segment cases exactly', () => {
    const direct = analyzeSegments({
      segments: [
        { games: 1000, netMedals: 200 },
        { games: 2000, netMedals: -400 },
      ],
      benchmarkRate: 103,
    });
    const cumulative = analyzeCumulativePoints({
      points: [
        { games: 2000, netMedals: 300 },
        { games: 3000, netMedals: 500 },
        { games: 5000, netMedals: 100 },
      ],
      benchmarkRate: 103,
    });
    expect(direct.ok).toBe(true);
    expect(cumulative.ok).toBe(true);
    if (!direct.ok || !cumulative.ok) return;
    expect(cumulative.value.aggregate).toEqual(direct.value.aggregate);
    expect(cumulative.value.segments.map(({ input }) => [input.games, input.netMedals])).toEqual([
      [1000, 200],
      [2000, -400],
    ]);
    expect(cumulative.value.segments.map(({ provenance }) => provenance)).toEqual([
      {
        source: 'cumulative_points',
        sourceStartPointIndex: 0,
        sourceEndPointIndex: 1,
      },
      {
        source: 'cumulative_points',
        sourceStartPointIndex: 1,
        sourceEndPointIndex: 2,
      },
    ]);
  });

  it('uses an integer future-net boundary that succeeds while one medal less fails', () => {
    const input = {
      currentGames: 1,
      currentNetMedals: 0,
      targetGames: 2,
      targetRate: 103,
    } as const;
    const result = calculateTargetReverse(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.exactRequiredFutureNetMedals.exact).toEqual({
      numerator: '9',
      denominator: '50',
    });
    expect(result.value.minimumFutureNetMedals).toBe(1);

    const aggregateIn = integer(input.targetGames * 3);
    const achievedRate = divide(
      multiply(
        integer(
          input.targetGames * 3 + input.currentNetMedals + result.value.minimumFutureNetMedals,
        ),
        integer(100),
      ),
      aggregateIn,
    );
    const failedRate = divide(
      multiply(
        integer(
          input.targetGames * 3 + input.currentNetMedals + result.value.minimumFutureNetMedals - 1,
        ),
        integer(100),
      ),
      aggregateIn,
    );
    const target = integer(input.targetRate);
    expect(compare(achievedRate, target)).toBeGreaterThanOrEqual(0);
    expect(compare(failedRate, target)).toBeLessThan(0);
  });
});
