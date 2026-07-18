import { describe, expect, it } from 'vitest';

import { rational, serializeRational } from '../../src/domain/rational';
import { calculateBenchmark } from '../../src/domain/slot-analysis-v2/benchmarks';
import { analyzeCumulativePoints } from '../../src/domain/slot-analysis-v2/cumulative-points';
import { analyzeSegments, sumExactContributions } from '../../src/domain/slot-analysis-v2/segments';
import { calculateTargetReverse } from '../../src/domain/slot-analysis-v2/target-reverse';

describe('slot analysis v2 invariants', () => {
  it('keeps payout rate and benchmark difference monotonic with net medals', () => {
    const netValues = [-500, -100, 0, 100, 500];
    const payoutRates = netValues.map((netMedals) => {
      const result = analyzeSegments({ segments: [{ games: 4000, netMedals }] });
      expect(result.ok).toBe(true);
      return result.ok ? result.value.aggregate.aggregatePayoutRate.approximate : Number.NaN;
    });
    const differences = netValues.map((netMedals) => {
      const result = calculateBenchmark({ games: 4000, netMedals, benchmarkRate: 103 });
      expect(result.ok).toBe(true);
      return result.ok ? result.value.differenceNetMedals.approximate : Number.NaN;
    });
    expect(payoutRates).toEqual([...payoutRates].sort((left, right) => left - right));
    expect(differences).toEqual([...differences].sort((left, right) => left - right));
  });

  it('keeps expected benchmark net medals nondecreasing with the rate', () => {
    const expected = [95, 100, 103, 105, 110].map((benchmarkRate) => {
      const result = calculateBenchmark({ games: 4000, netMedals: 0, benchmarkRate });
      expect(result.ok).toBe(true);
      return result.ok ? result.value.expectedNetMedals.approximate : Number.NaN;
    });
    expect(expected).toEqual([...expected].sort((left, right) => left - right));
  });

  it('makes the exact contribution sum equal the aggregate benchmark difference', () => {
    const result = analyzeSegments({
      segments: [
        { games: 1000, netMedals: 200 },
        { games: 2000, netMedals: -400 },
        { games: 333, netMedals: 7 },
      ],
      benchmarkRate: '103.25',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const sum = sumExactContributions(result.value.segments);
    expect(sum).toBeDefined();
    expect(serializeRational(sum ?? rational(0n))).toEqual(
      result.value.aggregate.benchmark?.differenceNetMedals.exact,
    );
  });

  it('makes cumulative totals equal final minus start', () => {
    const points = [
      { cumulativeGames: 2345, cumulativeNetMedals: -120 },
      { cumulativeGames: 3000, cumulativeNetMedals: 80 },
      { cumulativeGames: 5000, cumulativeNetMedals: -320 },
      { cumulativeGames: 6000, cumulativeNetMedals: 100 },
    ] as const;
    const result = analyzeCumulativePoints({ points });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const finalPoint = points[3];
    expect(result.value.aggregate.aggregateGames).toBe(
      finalPoint.cumulativeGames - points[0].cumulativeGames,
    );
    expect(result.value.aggregate.aggregateNetMedals).toBe(
      finalPoint.cumulativeNetMedals - points[0].cumulativeNetMedals,
    );
  });

  it('keeps aggregate rate invariant under reorder while endpoint path metrics may change', () => {
    const first = analyzeSegments({
      segments: [
        { games: 200, netMedals: -400 },
        { games: 200, netMedals: -400 },
        { games: 200, netMedals: 800 },
      ],
    });
    const reordered = analyzeSegments({
      segments: [
        { games: 200, netMedals: -400 },
        { games: 200, netMedals: 800 },
        { games: 200, netMedals: -400 },
      ],
    });
    expect(first.ok).toBe(true);
    expect(reordered.ok).toBe(true);
    if (!first.ok || !reordered.ok) return;
    expect(reordered.value.aggregate.aggregatePayoutRate.exact).toEqual(
      first.value.aggregate.aggregatePayoutRate.exact,
    );
    expect(reordered.value.drawdownRecovery.maximumDrawdown.medals).not.toBe(
      first.value.drawdownRecovery.maximumDrawdown.medals,
    );

    const recoveryFirst = analyzeSegments({
      segments: [
        { games: 200, netMedals: 200 },
        { games: 200, netMedals: -400 },
        { games: 200, netMedals: 300 },
      ],
    });
    const recoveryReordered = analyzeSegments({
      segments: [
        { games: 200, netMedals: -400 },
        { games: 200, netMedals: 200 },
        { games: 200, netMedals: 300 },
      ],
    });
    expect(recoveryFirst.ok).toBe(true);
    expect(recoveryReordered.ok).toBe(true);
    if (!recoveryFirst.ok || !recoveryReordered.ok) return;
    expect(recoveryReordered.value.drawdownRecovery.maximumRecoveryAfterDrawdown.medals).not.toBe(
      recoveryFirst.value.drawdownRecovery.maximumRecoveryAfterDrawdown.medals,
    );
  });

  it('requires nondecreasing future net medals for higher target rates', () => {
    const required = [100, 103, 105].map((targetRate) => {
      const result = calculateTargetReverse({
        currentGames: 4000,
        currentNetMedals: 500,
        targetTotalGames: 5000,
        targetPayoutRate: targetRate,
      });
      expect(result.ok).toBe(true);
      return result.ok ? result.value.minimumIntegerFutureNetMedals : Number.NaN;
    });
    expect(required).toEqual([...required].sort((left, right) => left - right));
  });

  it('does not mutate inputs and returns recursively frozen outputs', () => {
    const input = {
      segments: [
        { label: 'A', games: 1000, netMedals: 200 },
        { label: 'B', games: 2000, netMedals: -400 },
      ],
      benchmarkRate: 103,
    };
    const before = structuredClone(input);
    const result = analyzeSegments(input);
    expect(input).toEqual(before);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.value)).toBe(true);
    expect(Object.isFrozen(result.value.segments)).toBe(true);
    expect(Object.isFrozen(result.value.segments[0]?.benchmark?.contributionNetMedals.exact)).toBe(
      true,
    );
    input.segments[0]!.label = 'changed after calculation';
    expect(result.value.segments[0]?.input.label).toBe('A');
  });
});
