import { IN_OUT_KNOWLEDGE, explainInOut } from '../explanations';
import { divide, integer, multiply } from '../rational';
import { calculatedNumber } from '../rounding';
import type { CalculationResult, InOutInput, InOutValues } from '../types';
import { validateInOut } from '../validators';
import { createCalculationResult } from './shared';

export function calculateInOut(input: InOutInput): CalculationResult<InOutInput, InOutValues> {
  const messages = validateInOut(input);
  if (messages.some(({ severity }) => severity === 'error')) {
    return createCalculationResult({
      mode: 'in_out',
      normalizedInputs: input,
      provenance: { actualIn: 'input', actualOut: 'input' },
      explanations: [],
      knowledgeBoundary: IN_OUT_KNOWLEDGE,
      messages,
    });
  }

  const useSegments = (input.segments?.length ?? 0) > 0;
  const totalIn = useSegments
    ? (input.segments ?? []).reduce((sum, segment) => sum + segment.actualIn, 0)
    : (input.actualIn ?? 0);
  const totalOut = useSegments
    ? (input.segments ?? []).reduce((sum, segment) => sum + segment.actualOut, 0)
    : (input.actualOut ?? 0);
  const totalGames = useSegments
    ? (input.segments ?? []).every((segment) => segment.games !== undefined)
      ? (input.segments ?? []).reduce((sum, segment) => sum + (segment.games ?? 0), 0)
      : undefined
    : input.games;
  const payoutRate = divide(multiply(integer(totalOut), integer(100)), integer(totalIn));
  const values: InOutValues = {
    totalIn,
    totalOut,
    actualNetMedals: totalOut - totalIn,
    payoutRate: calculatedNumber(payoutRate, 1),
    totalGames,
  };

  return createCalculationResult({
    mode: 'in_out',
    normalizedInputs: input,
    values,
    provenance: {
      actualIn: 'input',
      actualOut: 'input',
      totalIn: 'calculated',
      totalOut: 'calculated',
      actualNetMedals: 'calculated',
      payoutRate: 'calculated',
    },
    explanations: explainInOut(values),
    knowledgeBoundary: IN_OUT_KNOWLEDGE,
    messages,
  });
}
