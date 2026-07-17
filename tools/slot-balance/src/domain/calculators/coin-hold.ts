import { COIN_HOLD_KNOWLEDGE, explainCoinHold } from '../explanations';
import { divide, integer, multiply } from '../rational';
import { calculatedNumber } from '../rounding';
import type { CalculationResult, CoinHoldInput, CoinHoldValues } from '../types';
import { validateCoinHold } from '../validators';
import { createCalculationResult } from './shared';

export function calculateCoinHold(
  input: CoinHoldInput,
): CalculationResult<CoinHoldInput, CoinHoldValues> {
  const netUsedMedals =
    input.method === 'direct'
      ? input.netUsedMedals
      : input.startMedals + input.addedMedals - input.endMedals - input.takenOutMedals;
  const messages = validateCoinHold(input, netUsedMedals);
  const prerequisitesMissing = messages.some(
    ({ code }) => code === 'at_bonus_not_excluded' || code === 'normal_scope_not_confirmed',
  );
  if (messages.some(({ severity }) => severity === 'error') || prerequisitesMissing) {
    return createCalculationResult({
      mode: 'coin_hold',
      normalizedInputs: input,
      provenance: {
        normalGames: 'input',
        netUsedMedals: input.method === 'direct' ? 'input' : 'calculated',
      },
      explanations: [],
      knowledgeBoundary: COIN_HOLD_KNOWLEDGE,
      messages,
    });
  }

  const coinHold = divide(
    multiply(integer(input.normalGames), integer(50)),
    integer(netUsedMedals),
  );
  const values: CoinHoldValues = {
    netUsedMedals,
    coinHoldPer50: calculatedNumber(coinHold, 1),
  };
  return createCalculationResult({
    mode: 'coin_hold',
    normalizedInputs: input,
    values,
    provenance: {
      normalGames: 'input',
      netUsedMedals: input.method === 'direct' ? 'input' : 'calculated',
      coinHoldPer50: 'calculated',
    },
    explanations: explainCoinHold(input, values),
    knowledgeBoundary: COIN_HOLD_KNOWLEDGE,
    messages,
  });
}
