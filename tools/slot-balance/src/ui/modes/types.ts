import type { CalculationResult, ValidationMessage } from '../../domain/types';
import type { ResultGroup } from '../renderers';
import type { CalculationKey } from '../state';

export interface UiCalculationOutcome {
  key: CalculationKey;
  result?: CalculationResult<unknown, unknown>;
  groups?: ResultGroup[];
  messages: ValidationMessage[];
}

export interface UiModeController {
  calculate(): UiCalculationOutcome;
}

export interface DynamicModeOptions {
  markDirty: (key: CalculationKey) => void;
  announce: (message: string) => void;
}
