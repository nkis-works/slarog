import { describe, expect, it } from 'vitest';

import { calculateNetMedals } from '../src/domain/calculators/net-medals';
import { CALCULATION_VERSION } from '../src/domain/version';

describe('net medals calculator', () => {
  it('case A: calculates 4,000G and +500 medals', () => {
    const result = calculateNetMedals({ games: 4000, netMedals: 500 });
    expect(result.ok).toBe(true);
    expect(result.calculationVersion).toBe(CALCULATION_VERSION);
    expect(result.values).toMatchObject({
      assumedIn: 12000,
      assumedOut: 12500,
    });
    expect(result.values?.payoutRateEstimate?.display).toBe(104.2);
    expect(result.values?.netMedalsPer1000G.display).toBe(125);
    expect(result.provenance['payoutRateEstimate']).toBe('estimated');
    expect(result.explanations.some(({ resultCode }) => resultCode === 'payoutRateEstimate')).toBe(
      true,
    );
  });

  it('case B: calculates 2,500G and -750 medals', () => {
    const result = calculateNetMedals({ games: 2500, netMedals: -750 });
    expect(result.values).toMatchObject({ assumedIn: 7500, assumedOut: 6750 });
    expect(result.values?.payoutRateEstimate?.display).toBe(90);
    expect(result.values?.netMedalsPer1000G.display).toBe(-300);
  });

  it('case C: rounds 3,000G and -200 medals as specified', () => {
    const result = calculateNetMedals({ games: 3000, netMedals: -200 });
    expect(result.values?.payoutRateEstimate?.display).toBe(97.8);
    expect(result.values?.netMedalsPer1000G.display).toBe(-67);
  });

  it('case D: returns 0.0% when assumed OUT is exactly zero', () => {
    const result = calculateNetMedals({ games: 1000, netMedals: -3000 });
    expect(result.values?.assumedOut).toBe(0);
    expect(result.values?.payoutRateEstimate?.display).toBe(0);
  });

  it('case E: omits payout rate and warns when assumed OUT is negative', () => {
    const result = calculateNetMedals({ games: 1000, netMedals: -3001 });
    expect(result.ok).toBe(true);
    expect(result.values?.assumedOut).toBe(-1);
    expect(result.values?.payoutRateEstimate).toBeUndefined();
    expect(result.values?.netMedalsPer1000G.display).toBe(-3001);
    expect(result.warnings.map(({ code }) => code)).toContain('assumed_out_negative');
  });

  it('case F: returns a hard error for 0G', () => {
    const result = calculateNetMedals({ games: 0, netMedals: 500 });
    expect(result.ok).toBe(false);
    expect(result.values).toBeUndefined();
    expect(result.errors[0]?.code).toBe('games_not_positive');
  });

  it('warns without blocking when scopes differ', () => {
    const result = calculateNetMedals({
      games: 1000,
      netMedals: 100,
      gamesScope: 'personal_session',
      netMedalsScope: 'machine_day',
    });
    expect(result.ok).toBe(true);
    expect(result.warnings.map(({ code }) => code)).toContain('scope_mismatch');
  });

  it('returns the required known and unknown boundaries', () => {
    const result = calculateNetMedals({ games: 1000, netMedals: 100 });
    const unknown = result.knowledgeBoundary.unknown.map(({ code }) => code);
    expect(unknown).toEqual(
      expect.arrayContaining([
        'exact_in_out',
        'actual_setting',
        'future_output',
        'exact_coin_hold',
        'cash_recovery',
        'continue_or_stop',
      ]),
    );
  });
});
