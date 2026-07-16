export type ValueProvenance = 'input' | 'calculated' | 'estimated' | 'reference';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export type CalculationMode =
  'net_medals' | 'investment_recovery' | 'segments' | 'in_out' | 'coin_hold';

export type PlayScope = 'personal_session' | 'machine_day' | 'custom_segment';

export interface ValidationMessage {
  severity: ValidationSeverity;
  code: string;
  field?: string;
  message: string;
  correction?: string;
}

export interface ExactRational {
  numerator: string;
  denominator: string;
}

export interface CalculatedNumber {
  exact: ExactRational;
  approximate: number;
  display: number;
}

export interface CalculationExplanation {
  resultCode: string;
  title: string;
  inputs: Array<{
    label: string;
    value: string | number;
    unit?: string;
  }>;
  steps: Array<{
    expression: string;
    value?: string | number;
  }>;
  assumptions: string[];
}

export interface KnowledgeBoundary {
  known: Array<{ code: string; label: string }>;
  unknown: Array<{ code: string; label: string }>;
}

export interface CalculationResult<TInputs, TValues> {
  calculationVersion: string;
  mode: CalculationMode;
  normalizedInputs: TInputs;
  values?: TValues;
  provenance: Record<string, ValueProvenance>;
  explanations: CalculationExplanation[];
  knowledgeBoundary: KnowledgeBoundary;
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
  info: ValidationMessage[];
  ok: boolean;
}

export interface NetMedalsInput {
  games: number;
  netMedals: number;
  gamesScope?: PlayScope;
  netMedalsScope?: PlayScope;
  machineName?: string;
  playDate?: string;
  memo?: string;
}

export interface NetMedalsValues {
  assumedIn: number;
  assumedOut: number;
  payoutRateEstimate?: CalculatedNumber;
  netMedalsPer1000G: CalculatedNumber;
}

export interface InvestmentRecoveryInput {
  cashInvestmentYen: number;
  storedMedalsUsed?: number;
  currentMedals: number;
  alreadyExchangedYen?: number;
  lendMedalsPer1000Yen?: number | string;
  exchangeMedalsPer1000Yen?: number | string;
  exchangeUnitYen?: number;
  requestRecoveryLines?: boolean;
  games?: number;
  netMedals?: number;
  machineName?: string;
  playDate?: string;
  memo?: string;
}

export interface NormalizedInvestmentRecoveryInput extends InvestmentRecoveryInput {
  storedMedalsUsed: number;
  alreadyExchangedYen: number;
  requestRecoveryLines: boolean;
}

export type RecoveryLineStatus = 'short' | 'met' | 'recovered_by_exchanged';

export interface RecoveryLine {
  remainingValueYen: CalculatedNumber;
  requiredPayoutYen: CalculatedNumber;
  requiredMedals: number;
  gapMedals: number;
  status: RecoveryLineStatus;
}

export interface InvestmentRecoveryValues {
  storedMedalValueYen: CalculatedNumber;
  currentTheoreticalExchangeYen: CalculatedNumber;
  currentExchangeEstimateYen: number;
  exchangeUnitDifferenceYen: CalculatedNumber;
  grossReturnEstimateYen: number;
  cashNetEstimateYen: number;
  totalCostValueYen: CalculatedNumber;
  totalValueNetEstimateYen: CalculatedNumber;
  cashRecoveryRate?: CalculatedNumber;
  totalRecoveryRate?: CalculatedNumber;
  cashRecoveryLine?: RecoveryLine;
  totalRecoveryLine?: RecoveryLine;
  showTotalRecoveryLine: boolean;
  cashBorrowedMedalsEquivalent?: CalculatedNumber;
  netMedalsAnalysis?: NetMedalsValues;
}

export interface NetMedalsSegment {
  label?: string;
  games: number;
  netMedals: number;
  memo?: string;
  startGame?: number;
  endGame?: number;
}

export interface SegmentsInput {
  segments: NetMedalsSegment[];
}

export interface SegmentCalculation {
  input: NetMedalsSegment;
  values: NetMedalsValues;
}

export interface SegmentsValues {
  segments: SegmentCalculation[];
  totalGames: number;
  totalNetMedals: number;
  aggregate: NetMedalsValues;
}

export interface ActualInOutSegment {
  label?: string;
  actualIn: number;
  actualOut: number;
  games?: number;
  memo?: string;
}

export interface InOutInput {
  actualIn?: number;
  actualOut?: number;
  games?: number;
  segments?: ActualInOutSegment[];
  machineName?: string;
  playDate?: string;
  memo?: string;
}

export interface InOutValues {
  totalIn: number;
  totalOut: number;
  actualNetMedals: number;
  payoutRate: CalculatedNumber;
  totalGames?: number;
}

interface CoinHoldCommon {
  normalGames: number;
  atBonusExcluded: boolean;
  scopeConfirmed: boolean;
}

export interface CoinHoldDirectInput extends CoinHoldCommon {
  method: 'direct';
  netUsedMedals: number;
}

export interface CoinHoldBreakdownInput extends CoinHoldCommon {
  method: 'breakdown';
  startMedals: number;
  addedMedals: number;
  endMedals: number;
  takenOutMedals: number;
}

export type CoinHoldInput = CoinHoldDirectInput | CoinHoldBreakdownInput;

export interface CoinHoldValues {
  netUsedMedals: number;
  coinHoldPer50: CalculatedNumber;
}
