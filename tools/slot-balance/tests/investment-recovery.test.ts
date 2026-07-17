import { describe, expect, it } from 'vitest';

import { calculateInvestmentRecovery } from '../src/domain/calculators/investment-recovery';

describe('investment and recovery calculator', () => {
  it('case 1: calculates cash-only exchange and recovery line', () => {
    const result = calculateInvestmentRecovery({
      cashInvestmentYen: 20000,
      currentMedals: 1200,
      exchangeMedalsPer1000Yen: 50,
    });
    expect(result.ok).toBe(true);
    expect(result.values).toMatchObject({
      currentExchangeEstimateYen: 24000,
      grossReturnEstimateYen: 24000,
      cashNetEstimateYen: 4000,
      showTotalRecoveryLine: false,
    });
    expect(result.values?.cashRecoveryRate?.display).toBe(120);
    expect(result.values?.cashRecoveryLine).toMatchObject({
      requiredMedals: 1000,
      gapMedals: -200,
      status: 'met',
    });
    expect(result.values?.totalRecoveryLine?.requiredMedals).toBe(1000);
  });

  it('case 2: separates stored-medal value and both recovery lines', () => {
    const result = calculateInvestmentRecovery({
      cashInvestmentYen: 20000,
      storedMedalsUsed: 500,
      currentMedals: 1200,
      exchangeMedalsPer1000Yen: 50,
    });
    expect(result.ok).toBe(true);
    expect(result.values?.storedMedalValueYen.display).toBe(10000);
    expect(result.values?.totalCostValueYen.display).toBe(30000);
    expect(result.values?.currentExchangeEstimateYen).toBe(24000);
    expect(result.values?.cashNetEstimateYen).toBe(4000);
    expect(result.values?.totalValueNetEstimateYen.display).toBe(-6000);
    expect(result.values?.cashRecoveryLine).toMatchObject({
      requiredMedals: 1000,
      gapMedals: -200,
    });
    expect(result.values?.totalRecoveryLine).toMatchObject({
      requiredMedals: 1500,
      gapMedals: 300,
      status: 'short',
    });
    expect(result.values?.showTotalRecoveryLine).toBe(true);
    expect(result.warnings.map(({ code }) => code)).toContain('cash_and_stored_medals');
  });

  it('case 3: floors current exchange to the 500 yen unit', () => {
    const result = calculateInvestmentRecovery({
      cashInvestmentYen: 20000,
      currentMedals: 1000,
      exchangeMedalsPer1000Yen: 56,
      exchangeUnitYen: 500,
    });
    expect(result.ok).toBe(true);
    expect(result.values?.currentTheoreticalExchangeYen.exact).toEqual({
      numerator: '125000',
      denominator: '7',
    });
    expect(result.values?.currentTheoreticalExchangeYen.display).toBe(17857);
    expect(result.values?.currentExchangeEstimateYen).toBe(17500);
    expect(result.values?.cashNetEstimateYen).toBe(-2500);
    expect(result.values?.cashRecoveryRate?.display).toBe(87.5);
    expect(result.values?.cashRecoveryLine).toMatchObject({
      requiredMedals: 1120,
      gapMedals: 120,
      status: 'short',
    });
  });

  it('case 4: omits cash recovery rate when cash investment is zero', () => {
    const result = calculateInvestmentRecovery({
      cashInvestmentYen: 0,
      storedMedalsUsed: 500,
      currentMedals: 600,
      exchangeMedalsPer1000Yen: 50,
    });
    expect(result.ok).toBe(true);
    expect(result.values?.cashRecoveryRate).toBeUndefined();
    expect(result.values?.storedMedalValueYen.display).toBe(10000);
    expect(result.values?.currentExchangeEstimateYen).toBe(12000);
    expect(result.values?.totalValueNetEstimateYen.display).toBe(2000);
    expect(result.values?.totalRecoveryRate?.display).toBe(120);
    expect(result.info.map(({ code }) => code)).toContain('cash_investment_zero');
  });

  it('case 5: includes already-exchanged money in total return and remaining line', () => {
    const result = calculateInvestmentRecovery({
      cashInvestmentYen: 10000,
      alreadyExchangedYen: 5000,
      currentMedals: 400,
      exchangeMedalsPer1000Yen: 50,
      exchangeUnitYen: 500,
    });
    expect(result.ok).toBe(true);
    expect(result.values?.currentExchangeEstimateYen).toBe(8000);
    expect(result.values?.grossReturnEstimateYen).toBe(13000);
    expect(result.values?.cashNetEstimateYen).toBe(3000);
    expect(result.values?.cashRecoveryRate?.display).toBe(130);
    expect(result.values?.cashRecoveryLine).toMatchObject({
      requiredMedals: 250,
      gapMedals: -150,
      status: 'met',
    });
    expect(result.info.map(({ code }) => code)).toContain('already_exchanged');
  });

  it('uses exchange conditions for stored medals without exchange-unit flooring', () => {
    const result = calculateInvestmentRecovery({
      cashInvestmentYen: 0,
      storedMedalsUsed: 1,
      currentMedals: 0,
      exchangeMedalsPer1000Yen: 56,
      exchangeUnitYen: 500,
    });
    expect(result.values?.storedMedalValueYen.exact).toEqual({
      numerator: '125',
      denominator: '7',
    });
    expect(result.values?.currentExchangeEstimateYen).toBe(0);
  });

  it('does not add optional net medals to current medals', () => {
    const result = calculateInvestmentRecovery({
      cashInvestmentYen: 20000,
      currentMedals: 1200,
      exchangeMedalsPer1000Yen: 50,
      games: 4000,
      netMedals: 500,
    });
    expect(result.values?.currentExchangeEstimateYen).toBe(24000);
    expect(result.values?.netMedalsAnalysis?.payoutRateEstimate?.display).toBe(104.2);
  });

  it('warns about non-equivalent exchange and possible net/current confusion', () => {
    const result = calculateInvestmentRecovery({
      cashInvestmentYen: 10000,
      currentMedals: 500,
      lendMedalsPer1000Yen: 46,
      exchangeMedalsPer1000Yen: 56,
      games: 1000,
      netMedals: 500,
    });
    expect(result.ok).toBe(true);
    expect(result.warnings.map(({ code }) => code)).toEqual(
      expect.arrayContaining(['non_equivalent_exchange', 'net_current_same_value']),
    );
    expect(result.values?.cashBorrowedMedalsEquivalent?.display).toBe(460);
  });

  it('requires exchange conditions when medals need yen conversion', () => {
    const result = calculateInvestmentRecovery({
      cashInvestmentYen: 10000,
      currentMedals: 100,
    });
    expect(result.ok).toBe(false);
    expect(result.errors.map(({ code }) => code)).toContain('exchange_rate_required');
  });

  it('allows already-exchanged actual money without exchange conditions when lines are disabled', () => {
    const result = calculateInvestmentRecovery({
      cashInvestmentYen: 5000,
      currentMedals: 0,
      alreadyExchangedYen: 6000,
      requestRecoveryLines: false,
    });
    expect(result.ok).toBe(true);
    expect(result.values?.grossReturnEstimateYen).toBe(6000);
    expect(result.values?.cashNetEstimateYen).toBe(1000);
    expect(result.values?.cashRecoveryLine).toBeUndefined();
  });
});
