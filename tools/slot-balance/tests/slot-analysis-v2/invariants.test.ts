import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { compare, rational, serializeRational } from '../../src/domain/rational';
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
      return result.ok ? result.value.aggregate.payoutRate.approximate : Number.NaN;
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
      { games: 2345, netMedals: -120 },
      { games: 3000, netMedals: 80 },
      { games: 5000, netMedals: -320 },
      { games: 6000, netMedals: 100 },
    ] as const;
    const result = analyzeCumulativePoints({ points });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const finalPoint = points[3];
    expect(result.value.aggregate.totalGames).toBe(finalPoint.games - points[0].games);
    expect(result.value.aggregate.totalNetMedals).toBe(finalPoint.netMedals - points[0].netMedals);
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
    expect(reordered.value.aggregate.payoutRate.exact).toEqual(
      first.value.aggregate.payoutRate.exact,
    );
    expect(reordered.value.drawdownRecovery.maxDrawdown.medals).not.toBe(
      first.value.drawdownRecovery.maxDrawdown.medals,
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
    expect(recoveryReordered.value.drawdownRecovery.maxRecoveryAfterDecline.medals).not.toBe(
      recoveryFirst.value.drawdownRecovery.maxRecoveryAfterDecline.medals,
    );
  });

  it('requires nondecreasing future net medals for higher target rates', () => {
    const required = [100, 103, 105].map((targetRate) => {
      const result = calculateTargetReverse({
        currentGames: 4000,
        currentNetMedals: 500,
        targetGames: 5000,
        targetRate,
      });
      expect(result.ok).toBe(true);
      return result.ok ? result.value.minimumFutureNetMedals : Number.NaN;
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

  it('contains no DOM, network, storage, clock, or random dependency', () => {
    const directory = resolve('tools/slot-balance/src/domain/slot-analysis-v2');
    const files = [
      'benchmarks.ts',
      'cumulative-points.ts',
      'drawdown.ts',
      'segments.ts',
      'sensitivity.ts',
      'shared.ts',
      'target-reverse.ts',
    ];
    const source = files.map((file) => readFileSync(resolve(directory, file), 'utf8')).join('\n');
    expect(source).not.toMatch(
      /\b(?:document|window|fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|Date\.now|Math\.random)\b/,
    );

    const first = calculateTargetReverse({
      currentGames: 4000,
      currentNetMedals: 500,
      targetGames: 5000,
      targetRate: 100,
    });
    const second = calculateTargetReverse({
      currentGames: 4000,
      currentNetMedals: 500,
      targetGames: 5000,
      targetRate: 100,
    });
    expect(second).toEqual(first);
    if (first.ok && second.ok) {
      expect(
        compare(
          rational(
            BigInt(first.value.boundaryFuturePayoutRate.exact.numerator),
            BigInt(first.value.boundaryFuturePayoutRate.exact.denominator),
          ),
          rational(
            BigInt(second.value.boundaryFuturePayoutRate.exact.numerator),
            BigInt(second.value.boundaryFuturePayoutRate.exact.denominator),
          ),
        ),
      ).toBe(0);
    }
  });
});
