import { CALCULATION_VERSION } from '../version';
import { partitionValidationMessages } from '../validators';
import type {
  CalculationMode,
  CalculationResult,
  CalculationExplanation,
  KnowledgeBoundary,
  ValidationMessage,
  ValueProvenance,
} from '../types';

export function createCalculationResult<TInputs, TValues>(options: {
  mode: CalculationMode;
  normalizedInputs: TInputs;
  values?: TValues;
  provenance: Record<string, ValueProvenance>;
  explanations: CalculationExplanation[];
  knowledgeBoundary: KnowledgeBoundary;
  messages: ValidationMessage[];
}): CalculationResult<TInputs, TValues> {
  const { errors, warnings, info } = partitionValidationMessages(options.messages);
  return {
    calculationVersion: CALCULATION_VERSION,
    mode: options.mode,
    normalizedInputs: options.normalizedInputs,
    values: options.values,
    provenance: options.provenance,
    explanations: options.explanations,
    knowledgeBoundary: options.knowledgeBoundary,
    errors,
    warnings,
    info,
    ok: errors.length === 0,
  };
}
