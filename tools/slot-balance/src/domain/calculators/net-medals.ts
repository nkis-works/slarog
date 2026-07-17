import { NET_MEDALS_KNOWLEDGE, explainNetMedals } from '../explanations';
import { divide, integer, multiply } from '../rational';
import { calculatedNumber } from '../rounding';
import type { CalculationResult, NetMedalsInput, NetMedalsValues } from '../types';
import { validateNetMedals } from '../validators';
import { createCalculationResult } from './shared';

export function calculateNetMedals(
  input: NetMedalsInput,
): CalculationResult<NetMedalsInput, NetMedalsValues> {
  const messages = validateNetMedals(input);
  const hasErrors = messages.some(({ severity }) => severity === 'error');
  if (hasErrors) {
    return createCalculationResult({
      mode: 'net_medals',
      normalizedInputs: input,
      provenance: { games: 'input', netMedals: 'input' },
      explanations: [],
      knowledgeBoundary: NET_MEDALS_KNOWLEDGE,
      messages,
    });
  }

  const assumedIn = input.games * 3;
  const assumedOut = assumedIn + input.netMedals;
  const netPer1000 = divide(
    multiply(integer(input.netMedals), integer(1000)),
    integer(input.games),
  );
  const values: NetMedalsValues = {
    assumedIn,
    assumedOut,
    netMedalsPer1000G: calculatedNumber(netPer1000, 0),
  };
  if (assumedOut >= 0) {
    const payoutRate = divide(multiply(integer(assumedOut), integer(100)), integer(assumedIn));
    values.payoutRateEstimate = calculatedNumber(payoutRate, 1);
  }

  return createCalculationResult({
    mode: 'net_medals',
    normalizedInputs: input,
    values,
    provenance: {
      games: 'input',
      netMedals: 'input',
      assumedIn: 'estimated',
      assumedOut: 'estimated',
      payoutRateEstimate: 'estimated',
      netMedalsPer1000G: 'calculated',
    },
    explanations: explainNetMedals(input, values),
    knowledgeBoundary: NET_MEDALS_KNOWLEDGE,
    messages,
  });
}
