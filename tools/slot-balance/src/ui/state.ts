export type CalculationKey = 'net' | 'investment' | 'segments' | 'inout' | 'coin';

export type MainMode = 'net' | 'investment' | 'segments-inout';

export interface CalculationUiState {
  currentInputRevision: number;
  calculatedInputRevision?: number;
  hasResult: boolean;
  stale: boolean;
}

export type SlotBalanceUiState = Record<CalculationKey, CalculationUiState>;

function createCalculationState(): CalculationUiState {
  return { currentInputRevision: 0, hasResult: false, stale: false };
}

export function createUiState(): SlotBalanceUiState {
  return {
    net: createCalculationState(),
    investment: createCalculationState(),
    segments: createCalculationState(),
    inout: createCalculationState(),
    coin: createCalculationState(),
  };
}

export function markInputChanged(state: SlotBalanceUiState, key: CalculationKey): boolean {
  const target = state[key];
  target.currentInputRevision += 1;
  target.stale = target.hasResult && target.calculatedInputRevision !== target.currentInputRevision;
  return target.stale;
}

export function markCalculationSucceeded(state: SlotBalanceUiState, key: CalculationKey): void {
  const target = state[key];
  target.calculatedInputRevision = target.currentInputRevision;
  target.hasResult = true;
  target.stale = false;
}
