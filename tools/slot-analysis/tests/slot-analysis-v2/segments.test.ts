import { describe, expect, it } from 'vitest';

import {
  SLOT_ANALYSIS_MAX_SEGMENTS,
  analyzeSegments,
} from '../../src/domain/slot-analysis-v2/segments';

describe('slot analysis v2 segment analysis', () => {
  const sampleSegments = [
    { label: 'A', games: 1000, netMedals: 200 },
    { label: 'B', games: 2000, netMedals: -400 },
  ] as const;

  it('calculates per-segment metrics, weighted aggregate, and 103% contributions', () => {
    const result = analyzeSegments({ segments: sampleSegments, benchmarkRate: 103 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.segments[0]?.payoutRate.display).toBe(106.7);
    expect(result.value.segments[0]?.benchmark?.contributionNetMedals.display).toBe(110);
    expect(result.value.segments[1]?.payoutRate.display).toBe(93.3);
    expect(result.value.segments[1]?.benchmark?.contributionNetMedals.display).toBe(-580);
    expect(result.value.aggregate).toMatchObject({
      aggregateGames: 3000,
      aggregateNetMedals: -200,
    });
    expect(result.value.aggregate.aggregatePayoutRate.display).toBe(97.8);
    expect(result.value.aggregate.benchmark?.differenceNetMedals.display).toBe(-470);
    expect(result.value.cumulativeEndpoints).toEqual([
      { pointIndex: 0, sourceIndex: 0, cumulativeGames: 0, cumulativeNetMedals: 0 },
      { pointIndex: 1, sourceIndex: 1, cumulativeGames: 1000, cumulativeNetMedals: 200 },
      { pointIndex: 2, sourceIndex: 2, cumulativeGames: 3000, cumulativeNetMedals: -200 },
    ]);
  });

  it('omits relation, condition, and contribution when no benchmark is selected', () => {
    const result = analyzeSegments({ segments: sampleSegments });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.aggregate.benchmark).toBeUndefined();
    expect(result.value.segments.every((segment) => segment.benchmark === undefined)).toBe(true);
  });

  it('accepts 100 segments and rejects 101', () => {
    const maximum = Array.from({ length: SLOT_ANALYSIS_MAX_SEGMENTS }, () => ({
      games: 1,
      netMedals: 0,
    }));
    expect(analyzeSegments({ segments: maximum }).ok).toBe(true);
    const exceeded = analyzeSegments({ segments: [...maximum, { games: 1, netMedals: 0 }] });
    expect(exceeded).toMatchObject({
      ok: false,
      errors: [{ code: 'segments_limit_exceeded' }],
    });
  });
});
