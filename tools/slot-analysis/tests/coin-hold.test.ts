import { describe, expect, it } from 'vitest';

import { calculateCoinHold } from '../src/domain/calculators/coin-hold';

describe('normal-game coin hold calculator', () => {
  it('calculates 34.0G per 50 medals from direct net usage', () => {
    const result = calculateCoinHold({
      method: 'direct',
      normalGames: 680,
      netUsedMedals: 1000,
      atBonusExcluded: true,
      scopeConfirmed: true,
    });
    expect(result.ok).toBe(true);
    expect(result.values?.netUsedMedals).toBe(1000);
    expect(result.values?.coinHoldPer50.display).toBe(34);
  });

  it('calculates the same result from start/add/end/taken-out details', () => {
    const result = calculateCoinHold({
      method: 'breakdown',
      normalGames: 680,
      startMedals: 500,
      addedMedals: 500,
      endMedals: 0,
      takenOutMedals: 0,
      atBonusExcluded: true,
      scopeConfirmed: true,
    });
    expect(result.values?.netUsedMedals).toBe(1000);
    expect(result.values?.coinHoldPer50.display).toBe(34);
    expect(result.provenance['netUsedMedals']).toBe('calculated');
  });

  it('does not return a value when net usage is zero or negative', () => {
    const result = calculateCoinHold({
      method: 'breakdown',
      normalGames: 680,
      startMedals: 500,
      addedMedals: 0,
      endMedals: 500,
      takenOutMedals: 0,
      atBonusExcluded: true,
      scopeConfirmed: true,
    });
    expect(result.values).toBeUndefined();
    expect(result.errors.map(({ code }) => code)).toContain('net_used_medals_not_positive');
  });

  it('does not estimate when AT/bonus exclusion is not confirmed', () => {
    const result = calculateCoinHold({
      method: 'direct',
      normalGames: 680,
      netUsedMedals: 1000,
      atBonusExcluded: false,
      scopeConfirmed: true,
    });
    expect(result.values).toBeUndefined();
    expect(result.info.map(({ code }) => code)).toContain('at_bonus_not_excluded');
  });

  it('does not estimate when the normal-game scope is not confirmed', () => {
    const result = calculateCoinHold({
      method: 'direct',
      normalGames: 680,
      netUsedMedals: 1000,
      atBonusExcluded: true,
      scopeConfirmed: false,
    });
    expect(result.values).toBeUndefined();
    expect(result.info.map(({ code }) => code)).toContain('normal_scope_not_confirmed');
  });
});
