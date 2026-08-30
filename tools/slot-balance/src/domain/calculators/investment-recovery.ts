import { INVESTMENT_KNOWLEDGE, explainInvestmentRecovery } from '../explanations';
import { add, compare, decimal, divide, integer, maxZero, multiply, subtract } from '../rational';
import type { Rational } from '../rational';
import {
  calculatedNumber,
  ceilToInteger,
  ceilToUnit,
  floorToInteger,
  floorToUnit,
} from '../rounding';
import type {
  CalculationResult,
  InvestmentRecoveryInput,
  InvestmentRecoveryValues,
  NormalizedInvestmentRecoveryInput,
  RecoveryLine,
  ValidationMessage,
} from '../types';
import { validateInvestmentRecovery } from '../validators';
import { calculateNetMedals } from './net-medals';
import { createCalculationResult } from './shared';

function recoveryLine(
  costValue: Rational,
  alreadyExchangedYen: number,
  currentMedals: number,
  exchangeRate: Rational,
  exchangeUnitYen?: number,
): RecoveryLine {
  const remainingValue = maxZero(subtract(costValue, integer(alreadyExchangedYen)));
  const requiredPayout = exchangeUnitYen
    ? integer(ceilToUnit(remainingValue, exchangeUnitYen))
    : remainingValue;
  const requiredMedalsExact = divide(multiply(requiredPayout, exchangeRate), integer(1000));
  const requiredMedals = ceilToInteger(requiredMedalsExact);
  const gapMedals = requiredMedals - currentMedals;
  return {
    remainingValueYen: calculatedNumber(remainingValue, 0),
    requiredPayoutYen: calculatedNumber(requiredPayout, 0),
    requiredMedals,
    gapMedals,
    status:
      remainingValue.numerator === 0n ? 'recovered_by_exchanged' : gapMedals > 0 ? 'short' : 'met',
  };
}

export function calculateInvestmentRecovery(
  input: InvestmentRecoveryInput,
): CalculationResult<NormalizedInvestmentRecoveryInput, InvestmentRecoveryValues> {
  const normalizedInputs: NormalizedInvestmentRecoveryInput = {
    ...input,
    storedMedalsUsed: input.storedMedalsUsed ?? 0,
    alreadyExchangedYen: input.alreadyExchangedYen ?? 0,
    requestRecoveryLines: input.requestRecoveryLines ?? true,
  };
  const messages: ValidationMessage[] = validateInvestmentRecovery(normalizedInputs);
  const hasErrors = messages.some(({ severity }) => severity === 'error');
  if (hasErrors) {
    return createCalculationResult({
      mode: 'investment_recovery',
      normalizedInputs,
      provenance: {
        cashInvestmentYen: 'input',
        storedMedalsUsed: 'input',
        currentMedals: 'input',
        alreadyExchangedYen: 'input',
      },
      explanations: [],
      knowledgeBoundary: INVESTMENT_KNOWLEDGE,
      messages,
    });
  }

  const exchangeRate =
    normalizedInputs.exchangeMedalsPer1000Yen === undefined
      ? undefined
      : decimal(normalizedInputs.exchangeMedalsPer1000Yen);
  const storedMedalValue = exchangeRate
    ? divide(multiply(integer(normalizedInputs.storedMedalsUsed), integer(1000)), exchangeRate)
    : integer(0);
  const currentTheoreticalExchange = exchangeRate
    ? divide(multiply(integer(normalizedInputs.currentMedals), integer(1000)), exchangeRate)
    : integer(0);
  const currentExchangeEstimateYen = normalizedInputs.exchangeUnitYen
    ? floorToUnit(currentTheoreticalExchange, normalizedInputs.exchangeUnitYen)
    : floorToInteger(currentTheoreticalExchange);
  const grossReturnEstimateYen = normalizedInputs.alreadyExchangedYen + currentExchangeEstimateYen;
  const cashNetEstimateYen = grossReturnEstimateYen - normalizedInputs.cashInvestmentYen;
  const totalCostValue = add(integer(normalizedInputs.cashInvestmentYen), storedMedalValue);
  const totalValueNetEstimate = subtract(integer(grossReturnEstimateYen), totalCostValue);
  const exchangeUnitDifference = subtract(
    currentTheoreticalExchange,
    integer(currentExchangeEstimateYen),
  );

  const values: InvestmentRecoveryValues = {
    storedMedalValueYen: calculatedNumber(storedMedalValue, 0),
    currentTheoreticalExchangeYen: {
      ...calculatedNumber(currentTheoreticalExchange, 0),
      display: floorToInteger(currentTheoreticalExchange),
    },
    currentExchangeEstimateYen,
    exchangeUnitDifferenceYen: calculatedNumber(exchangeUnitDifference, 0),
    grossReturnEstimateYen,
    cashNetEstimateYen,
    totalCostValueYen: calculatedNumber(totalCostValue, 0),
    totalValueNetEstimateYen: calculatedNumber(totalValueNetEstimate, 0),
    showTotalRecoveryLine: normalizedInputs.storedMedalsUsed > 0,
  };

  if (normalizedInputs.cashInvestmentYen > 0) {
    values.cashRecoveryRate = calculatedNumber(
      divide(
        multiply(integer(grossReturnEstimateYen), integer(100)),
        integer(normalizedInputs.cashInvestmentYen),
      ),
      1,
    );
  }
  if (compare(totalCostValue, integer(0)) > 0) {
    values.totalRecoveryRate = calculatedNumber(
      divide(multiply(integer(grossReturnEstimateYen), integer(100)), totalCostValue),
      1,
    );
  }
  if (normalizedInputs.requestRecoveryLines && exchangeRate) {
    values.cashRecoveryLine = recoveryLine(
      integer(normalizedInputs.cashInvestmentYen),
      normalizedInputs.alreadyExchangedYen,
      normalizedInputs.currentMedals,
      exchangeRate,
      normalizedInputs.exchangeUnitYen,
    );
    values.totalRecoveryLine = recoveryLine(
      totalCostValue,
      normalizedInputs.alreadyExchangedYen,
      normalizedInputs.currentMedals,
      exchangeRate,
      normalizedInputs.exchangeUnitYen,
    );
  }
  if (normalizedInputs.lendMedalsPer1000Yen !== undefined) {
    const lendRate = decimal(normalizedInputs.lendMedalsPer1000Yen);
    values.cashBorrowedMedalsEquivalent = calculatedNumber(
      divide(multiply(integer(normalizedInputs.cashInvestmentYen), lendRate), integer(1000)),
      2,
    );
  }
  if (normalizedInputs.games !== undefined && normalizedInputs.netMedals !== undefined) {
    const netResult = calculateNetMedals({
      games: normalizedInputs.games,
      netMedals: normalizedInputs.netMedals,
    });
    values.netMedalsAnalysis = netResult.values;
    messages.push(...netResult.errors, ...netResult.warnings, ...netResult.info);
  }
  if (grossReturnEstimateYen === 0) {
    messages.push({
      severity: 'info',
      code: 'gross_return_zero',
      field: 'currentMedals',
      message: '合計回収見込額0円として計算します。',
    });
  }

  return createCalculationResult({
    mode: 'investment_recovery',
    normalizedInputs,
    values,
    provenance: {
      cashInvestmentYen: 'input',
      storedMedalsUsed: 'input',
      currentMedals: 'input',
      alreadyExchangedYen: 'input',
      lendMedalsPer1000Yen: 'input',
      exchangeMedalsPer1000Yen: 'input',
      exchangeUnitYen: 'input',
      storedMedalValueYen: 'estimated',
      currentTheoreticalExchangeYen: 'estimated',
      currentExchangeEstimateYen: 'estimated',
      grossReturnEstimateYen: 'estimated',
      cashNetEstimateYen: 'estimated',
      totalCostValueYen: 'estimated',
      totalValueNetEstimateYen: 'estimated',
      cashRecoveryRate: 'estimated',
      totalRecoveryRate: 'estimated',
      cashRecoveryLine: 'estimated',
      totalRecoveryLine: 'estimated',
      cashBorrowedMedalsEquivalent: 'reference',
      netMedalsAnalysis: 'estimated',
    },
    explanations: explainInvestmentRecovery(normalizedInputs, values),
    knowledgeBoundary: INVESTMENT_KNOWLEDGE,
    messages,
  });
}
