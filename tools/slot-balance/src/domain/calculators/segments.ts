import { SEGMENTS_KNOWLEDGE, explainSegments } from '../explanations';
import type { CalculationResult, SegmentsInput, SegmentsValues } from '../types';
import { validateSegments } from '../validators';
import { calculateNetMedals } from './net-medals';
import { createCalculationResult } from './shared';

export function calculateSegments(
  input: SegmentsInput,
): CalculationResult<SegmentsInput, SegmentsValues> {
  const messages = validateSegments(input);
  if (messages.some(({ severity }) => severity === 'error')) {
    return createCalculationResult({
      mode: 'segments',
      normalizedInputs: input,
      provenance: { segments: 'input' },
      explanations: [],
      knowledgeBoundary: SEGMENTS_KNOWLEDGE,
      messages,
    });
  }

  const segments = input.segments.map((segment) => {
    const result = calculateNetMedals({ games: segment.games, netMedals: segment.netMedals });
    if (!result.values) throw new Error('Validated segment did not produce values.');
    return { input: segment, values: result.values };
  });
  const totalGames = input.segments.reduce((sum, segment) => sum + segment.games, 0);
  const totalNetMedals = input.segments.reduce((sum, segment) => sum + segment.netMedals, 0);
  const aggregateResult = calculateNetMedals({ games: totalGames, netMedals: totalNetMedals });
  if (!aggregateResult.values) throw new Error('Validated aggregate did not produce values.');
  const values: SegmentsValues = {
    segments,
    totalGames,
    totalNetMedals,
    aggregate: aggregateResult.values,
  };

  return createCalculationResult({
    mode: 'segments',
    normalizedInputs: input,
    values,
    provenance: {
      segments: 'input',
      totalGames: 'calculated',
      totalNetMedals: 'calculated',
      aggregate: 'estimated',
    },
    explanations: explainSegments(values),
    knowledgeBoundary: SEGMENTS_KNOWLEDGE,
    messages,
  });
}
