import { describe, expect, it } from 'vitest';

import { calculateSegments } from '../src/domain/calculators/segments';

describe('segment calculator', () => {
  it('recalculates the aggregate from total games and medals instead of averaging rates', () => {
    const result = calculateSegments({
      segments: [
        { label: 'A', games: 1000, netMedals: 200 },
        { label: 'B', games: 2000, netMedals: -400 },
      ],
    });
    expect(result.ok).toBe(true);
    expect(result.values?.segments[0]?.values.payoutRateEstimate?.display).toBe(106.7);
    expect(result.values?.segments[1]?.values.payoutRateEstimate?.display).toBe(93.3);
    expect(result.values?.totalGames).toBe(3000);
    expect(result.values?.totalNetMedals).toBe(-200);
    expect(result.values?.aggregate.payoutRateEstimate?.display).toBe(97.8);
    expect(result.values?.aggregate.payoutRateEstimate?.display).not.toBe(100);
  });

  it('rejects reversed explicit ranges', () => {
    const result = calculateSegments({
      segments: [{ games: 1000, netMedals: 0, startGame: 2000, endGame: 1000 }],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.map(({ code }) => code)).toContain('segment_range_reversed');
  });

  it('rejects overlapping explicit ranges to prevent double counting', () => {
    const result = calculateSegments({
      segments: [
        { games: 1000, netMedals: 0, startGame: 0, endGame: 1000 },
        { games: 500, netMedals: 100, startGame: 900, endGame: 1400 },
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.map(({ code }) => code)).toContain('segment_range_overlap');
  });

  it('requires at least one segment', () => {
    const result = calculateSegments({ segments: [] });
    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe('segments_required');
  });
});
