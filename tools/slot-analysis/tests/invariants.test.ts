import { describe, expect, it } from 'vitest';

import { prepareSlotBalanceTransfer } from '../src/application/slarog-transfer';
import { calculateInvestmentRecovery } from '../src/domain/calculators/investment-recovery';
import { calculateNetMedals } from '../src/domain/calculators/net-medals';
import { calculateSegments } from '../src/domain/calculators/segments';
import { normalizeIntegerInput } from '../src/domain/normalizers';
import { CALCULATION_VERSION } from '../src/domain/version';

describe('deterministic invariants', () => {
  it('always returns 100.0% for zero net medals and positive games', () => {
    for (let games = 1; games <= 100_000; games += 997) {
      const result = calculateNetMedals({ games, netMedals: 0 });
      expect(result.values?.payoutRateEstimate?.display).toBe(100);
    }
  });

  it('never decreases payout rate when net medals increase for fixed games', () => {
    const games = 4000;
    let previous = Number.NEGATIVE_INFINITY;
    for (let netMedals = -games * 3; netMedals <= 20_000; netMedals += 137) {
      const current = calculateNetMedals({ games, netMedals }).values?.payoutRateEstimate;
      expect(current).toBeDefined();
      expect(current?.approximate).toBeGreaterThanOrEqual(previous);
      previous = current?.approximate ?? previous;
    }
  });

  it('matches segment aggregation with a direct total calculation', () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      const segments = [
        { games: seed * 37 + 1, netMedals: seed * 11 - 200 },
        { games: seed * 53 + 2, netMedals: 300 - seed * 7 },
        { games: seed * 29 + 3, netMedals: seed * 3 - 100 },
      ];
      const aggregate = calculateSegments({ segments });
      const totalGames = segments.reduce((sum, segment) => sum + segment.games, 0);
      const totalNetMedals = segments.reduce((sum, segment) => sum + segment.netMedals, 0);
      const direct = calculateNetMedals({ games: totalGames, netMedals: totalNetMedals });
      expect(aggregate.values?.aggregate.payoutRateEstimate?.exact).toEqual(
        direct.values?.payoutRateEstimate?.exact,
      );
    }
  });

  it('never lowers exchange estimate when current medals increase', () => {
    let previous = -1;
    for (let currentMedals = 0; currentMedals <= 3000; currentMedals += 17) {
      const result = calculateInvestmentRecovery({
        cashInvestmentYen: 20000,
        currentMedals,
        exchangeMedalsPer1000Yen: 56,
        exchangeUnitYen: 500,
      });
      const current = result.values?.currentExchangeEstimateYen ?? -1;
      expect(current).toBeGreaterThanOrEqual(previous);
      previous = current;
    }
  });

  it('never increases the remaining cash recovery line when exchanged money increases', () => {
    let previous = Number.POSITIVE_INFINITY;
    for (let alreadyExchangedYen = 0; alreadyExchangedYen <= 25_000; alreadyExchangedYen += 250) {
      const result = calculateInvestmentRecovery({
        cashInvestmentYen: 20000,
        alreadyExchangedYen,
        currentMedals: 0,
        exchangeMedalsPer1000Yen: 50,
        exchangeUnitYen: 500,
      });
      const current = result.values?.cashRecoveryLine?.requiredMedals ?? Number.POSITIVE_INFINITY;
      expect(current).toBeLessThanOrEqual(previous);
      previous = current;
    }
  });

  it('keeps both recovery lines equal when no stored medals are used', () => {
    for (let cashInvestmentYen = 0; cashInvestmentYen <= 30_000; cashInvestmentYen += 1000) {
      const result = calculateInvestmentRecovery({
        cashInvestmentYen,
        storedMedalsUsed: 0,
        currentMedals: 500,
        exchangeMedalsPer1000Yen: 50,
      });
      expect(result.values?.cashRecoveryLine).toEqual(result.values?.totalRecoveryLine);
      expect(result.values?.showTotalRecoveryLine).toBe(false);
    }
  });

  it('never exceeds theoretical exchange value after unit flooring', () => {
    for (let currentMedals = 0; currentMedals <= 2000; currentMedals += 13) {
      const result = calculateInvestmentRecovery({
        cashInvestmentYen: 10000,
        currentMedals,
        exchangeMedalsPer1000Yen: 56,
        exchangeUnitYen: 500,
      });
      const values = result.values;
      expect(values).toBeDefined();
      expect(values?.currentExchangeEstimateYen).toBeLessThanOrEqual(
        values?.currentTheoreticalExchangeYen.approximate ?? -1,
      );
      expect(values?.exchangeUnitDifferenceYen.approximate).toBeGreaterThanOrEqual(0);
      expect(values?.exchangeUnitDifferenceYen.approximate).toBeLessThan(500);
    }
  });

  it('normalizes equivalent inputs to the same value', () => {
    const variants = ['4000', '４０００', '4,000G', '４,０００Ｇ', '4 000 ゲーム'];
    expect(variants.map((value) => normalizeIntegerInput(value, 'games').value)).toEqual([
      4000, 4000, 4000, 4000, 4000,
    ]);
  });

  it('blocks stale results from transfer serialization', () => {
    const transfer = {
      version: 1,
      source: 'nkisworks-slot-balance',
      calculationVersion: CALCULATION_VERSION,
      mode: 'net_medals',
      games: 4000,
      netMedals: 500,
    };
    const stale = prepareSlotBalanceTransfer(transfer, {
      calculatedInputRevision: 1,
      currentInputRevision: 2,
    });
    expect(stale.ok).toBe(false);
    expect(stale.serialized).toBeUndefined();
    expect(stale.errors[0]?.code).toBe('stale_calculation_result');
  });
});
