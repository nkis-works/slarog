import { describe, expect, it } from 'vitest';

import {
  calculateBenchmark,
  calculateStandardBenchmarks,
} from '../../src/domain/slot-analysis-v2/benchmarks';
import {
  analyzeCumulativePoints,
  convertCumulativePoints,
} from '../../src/domain/slot-analysis-v2/cumulative-points';
import { calculateDrawdownRecovery } from '../../src/domain/slot-analysis-v2/drawdown';
import { analyzeSegments } from '../../src/domain/slot-analysis-v2/segments';
import { calculatePayoutRateSensitivity } from '../../src/domain/slot-analysis-v2/sensitivity';
import { calculateTargetReverse } from '../../src/domain/slot-analysis-v2/target-reverse';

const expectMetadata = (result: ReturnType<typeof calculateBenchmark>) => {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error('Expected a successful domain result.');
  expect(result.metadata.calculationVersion).toBe('2.0.0');
  expect(Object.isFrozen(result.metadata)).toBe(true);
  expect(Object.isFrozen(result.metadata.formulaIds)).toBe(true);
  expect(Object.isFrozen(result.metadata.assumptionCodes)).toBe(true);
  expect(Object.isFrozen(result.metadata.roundingCodes)).toBe(true);
  expect(Object.isFrozen(result.metadata.warningCodes)).toBe(true);
  expect(() => (result.metadata.formulaIds as string[]).push('quick_performance_rate')).toThrow(
    TypeError,
  );
};

describe('slot analysis v2 public result metadata', () => {
  it('returns immutable 2.0.0 metadata on every successful public calculation', () => {
    expectMetadata(calculateBenchmark({ games: 4000, netMedals: 500, benchmarkRate: 103 }));

    const results = [
      calculateStandardBenchmarks({ games: 4000, netMedals: 500 }),
      calculatePayoutRateSensitivity({ games: 4000 }),
      calculateTargetReverse({
        currentGames: 4000,
        currentNetMedals: 500,
        targetTotalGames: 5000,
        targetPayoutRate: 100,
      }),
      convertCumulativePoints({
        points: [
          { cumulativeGames: 0, cumulativeNetMedals: 0 },
          { cumulativeGames: 1000, cumulativeNetMedals: 200 },
        ],
      }),
      analyzeCumulativePoints({
        points: [
          { cumulativeGames: 0, cumulativeNetMedals: 0 },
          { cumulativeGames: 1000, cumulativeNetMedals: 200 },
        ],
      }),
      analyzeSegments({ segments: [{ games: 1000, netMedals: 200 }] }),
      calculateDrawdownRecovery([{ netMedals: 0 }, { netMedals: -100 }]),
    ];

    for (const result of results) {
      expect(result.ok).toBe(true);
      if (!result.ok) continue;
      expect(result.metadata.calculationVersion).toBe('2.0.0');
      expect(Object.isFrozen(result.metadata)).toBe(true);
      expect(Object.values(result.metadata).every(Object.isFrozen)).toBe(true);
    }
  });

  it('reports the exact formula combination for each calculation family', () => {
    const benchmark = calculateBenchmark({ games: 4000, netMedals: 500, benchmarkRate: 103 });
    const sensitivity = calculatePayoutRateSensitivity({ games: 4000 });
    const target = calculateTargetReverse({
      currentGames: 4000,
      currentNetMedals: 500,
      targetTotalGames: 5000,
      targetPayoutRate: 100,
    });
    const plainSegments = analyzeSegments({ segments: [{ games: 1000, netMedals: 200 }] });
    const benchmarkSegments = analyzeSegments({
      segments: [{ games: 1000, netMedals: 200 }],
      benchmarkRate: 103,
    });
    const cumulative = analyzeCumulativePoints({
      points: [
        { cumulativeGames: 0, cumulativeNetMedals: 0 },
        { cumulativeGames: 1000, cumulativeNetMedals: 200 },
      ],
    });

    expect(benchmark.ok && benchmark.metadata.formulaIds).toEqual([
      'benchmark_expected_net_medals',
      'benchmark_difference',
    ]);
    expect(sensitivity.ok && sensitivity.metadata.formulaIds).toEqual(['payout_rate_sensitivity']);
    expect(target.ok && target.metadata.formulaIds).toEqual([
      'target_total_net_medals',
      'target_required_future_net_medals',
      'target_required_future_payout_rate',
    ]);
    expect(plainSegments.ok && plainSegments.metadata.formulaIds).toEqual([
      'segment_performance_rate',
      'net_medals_per_1000_games',
      'aggregate_performance_rate',
      'maximum_endpoint_drawdown',
      'maximum_recovery_after_drawdown',
    ]);
    expect(benchmarkSegments.ok && benchmarkSegments.metadata.formulaIds).toEqual([
      'segment_performance_rate',
      'net_medals_per_1000_games',
      'aggregate_performance_rate',
      'benchmark_expected_net_medals',
      'benchmark_difference',
      'segment_benchmark_contribution',
      'maximum_endpoint_drawdown',
      'maximum_recovery_after_drawdown',
    ]);
    expect(cumulative.ok && cumulative.metadata.formulaIds).toEqual([
      'cumulative_point_difference',
      'segment_performance_rate',
      'net_medals_per_1000_games',
      'aggregate_performance_rate',
      'maximum_endpoint_drawdown',
      'maximum_recovery_after_drawdown',
    ]);
  });

  it('carries clamp warnings in both legacy values and common metadata', () => {
    const result = calculateTargetReverse({
      currentGames: 100,
      currentNetMedals: 300,
      targetTotalGames: 101,
      targetPayoutRate: 1,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.warnings).toEqual(['future_out_clamped_to_zero']);
    expect(result.metadata.warningCodes).toEqual(['future_out_clamped_to_zero']);
  });
});

describe('slot analysis v2 exact display classifications', () => {
  it('uses the shared sub-medal classifier for segments and the aggregate', () => {
    const below = analyzeSegments({
      segments: [{ games: 1, netMedals: 0 }],
      benchmarkRate: 103,
    });
    const above = analyzeSegments({
      segments: [{ games: 1, netMedals: 0 }],
      benchmarkRate: 99,
    });
    const equal = analyzeSegments({
      segments: [{ games: 1, netMedals: 0 }],
      benchmarkRate: 100,
    });
    expect(below.ok && below.value.segments[0]?.benchmark?.differenceDisplayCode).toBe(
      'less_than_one_below',
    );
    expect(below.ok && below.value.aggregate.benchmark?.differenceDisplayCode).toBe(
      'less_than_one_below',
    );
    expect(above.ok && above.value.segments[0]?.benchmark?.differenceDisplayCode).toBe(
      'less_than_one_above',
    );
    expect(above.ok && above.value.aggregate.benchmark?.differenceDisplayCode).toBe(
      'less_than_one_above',
    );
    expect(equal.ok && equal.value.segments[0]?.benchmark?.differenceDisplayCode).toBe(
      'exact_zero',
    );
    expect(equal.ok && equal.value.aggregate.benchmark?.differenceDisplayCode).toBe('exact_zero');
  });
});

describe('slot analysis v2 extreme input safety', () => {
  it('rejects a negative assumed OUT and accepts the exact zero-OUT boundary', () => {
    expect(calculateBenchmark({ games: 1000, netMedals: -3001, benchmarkRate: 100 })).toMatchObject(
      {
        ok: false,
        errors: [{ code: 'assumed_out_negative', field: 'netMedals' }],
      },
    );
    const boundary = calculateBenchmark({ games: 1000, netMedals: -3000, benchmarkRate: 100 });
    expect(boundary.ok).toBe(true);
  });

  it.each([
    '1e1000000',
    '1e65',
    '1e-65',
    `0.${'1'.repeat(100_000)}`,
    '1'.repeat(100_000),
    ` ${'1'.repeat(128)} `,
  ])('rejects out-of-bounds benchmark decimals before BigInt conversion', (benchmarkRate) => {
    expect(calculateBenchmark({ games: 1, netMedals: 0, benchmarkRate })).toMatchObject({
      ok: false,
      errors: [{ code: 'decimal_input_out_of_bounds', field: 'benchmarkRate' }],
    });
  });

  it.each(['1e1000000', '1e65', `0.${'1'.repeat(100_000)}`, '1'.repeat(100_000)])(
    'rejects out-of-bounds target decimals with the same stable code',
    (targetPayoutRate) => {
      expect(
        calculateTargetReverse({
          currentGames: 1,
          currentNetMedals: 0,
          targetTotalGames: 2,
          targetPayoutRate,
        }),
      ).toMatchObject({
        ok: false,
        errors: [{ code: 'decimal_input_out_of_bounds', field: 'targetPayoutRate' }],
      });
    },
  );

  it('rejects unsafe intermediate cumulative net medals even when the final sum is safe', () => {
    const maximum = Number.MAX_SAFE_INTEGER;
    const result = analyzeSegments({
      segments: [
        { games: 1, netMedals: maximum },
        { games: 1, netMedals: 1 },
        { games: Math.floor(maximum / 3), netMedals: -(maximum - 1) },
      ],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map(({ code }) => code)).toContain(
      'segment_cumulative_net_medals_not_safe',
    );
  });

  it('rejects an unsafe peak-to-trough movement before converting it to Number', () => {
    expect(
      calculateDrawdownRecovery([
        { netMedals: Number.MAX_SAFE_INTEGER },
        { netMedals: Number.MIN_SAFE_INTEGER },
      ]),
    ).toMatchObject({
      ok: false,
      errors: [{ code: 'cumulative_movement_not_safe', field: 'points' }],
    });
  });
});
