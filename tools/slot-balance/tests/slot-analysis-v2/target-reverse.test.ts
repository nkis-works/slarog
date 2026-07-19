import { describe, expect, it } from 'vitest';

import { calculateTargetReverse } from '../../src/domain/slot-analysis-v2/target-reverse';

describe('slot analysis v2 target reverse', () => {
  it('case A allows a 500-medal loss while maintaining 100%', () => {
    const result = calculateTargetReverse({
      currentGames: 4000,
      currentNetMedals: 500,
      targetTotalGames: 5000,
      targetPayoutRate: 100,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toMatchObject({
      remainingGames: 1000,
      minimumIntegerFutureNetMedals: -500,
      minimumFutureOutMedals: 2500,
      allowedLossMedals: 500,
      status: 'can_lose_up_to',
      clampedToNonnegativeOut: false,
    });
    expect(result.value.requiredFuturePayoutRate.display).toBe(83.3);
    expect(result.value.assumptions).toEqual([
      'three_medals_per_game',
      'mathematical_boundary_not_prediction',
    ]);
    expect(result.value.warnings).toEqual([]);
  });

  it('case B requires +300 medals and a 110.0% boundary', () => {
    const result = calculateTargetReverse({
      currentGames: 4000,
      currentNetMedals: -300,
      targetTotalGames: 5000,
      targetPayoutRate: 100,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.minimumIntegerFutureNetMedals).toBe(300);
    expect(result.value.status).toBe('must_gain');
    expect(result.value.requiredFuturePayoutRate.display).toBe(110);
    expect(result.value.allowedLossMedals).toBeUndefined();
  });

  it('clamps a mathematically negative future OUT to the executable 0% boundary', () => {
    const result = calculateTargetReverse({
      currentGames: 100,
      currentNetMedals: 300,
      targetTotalGames: 101,
      targetPayoutRate: '1',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toMatchObject({
      minimumIntegerFutureNetMedals: -3,
      minimumFutureOutMedals: 0,
      status: 'any_nonnegative_out_suffices',
      clampedToNonnegativeOut: true,
    });
    expect(result.value.requiredFuturePayoutRate.display).toBe(0);
    expect(result.value.warnings).toEqual(['future_out_clamped_to_zero']);
  });

  it.each([
    [
      {
        currentGames: 0,
        currentNetMedals: 0,
        targetTotalGames: 1,
        targetPayoutRate: 100,
      },
      'games_not_positive',
    ],
    [
      {
        currentGames: 10,
        currentNetMedals: 0,
        targetTotalGames: 10,
        targetPayoutRate: 100,
      },
      'target_games_not_after_current',
    ],
    [
      {
        currentGames: 10,
        currentNetMedals: 0,
        targetTotalGames: 11,
        targetPayoutRate: 0,
      },
      'target_rate_not_positive',
    ],
  ])('rejects invalid target input with %s', (input, code) => {
    const result = calculateTargetReverse(input);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((error) => error.code)).toContain(code);
  });
});
