export type AnalyticsEventName =
  | 'slot_balance_open'
  | 'mode_selected'
  | 'calculation_started'
  | 'calculation_completed'
  | 'calculation_failed'
  | 'result_details_opened'
  | 'history_saved'
  | 'share_card_created'
  | 'share_started'
  | 'slarog_cta_viewed'
  | 'slarog_cta_clicked'
  | 'ad_slot_viewed'
  | 'faq_opened';

export type AnalyticsMode = 'net_medals' | 'investment_recovery' | 'segments_inout';
export type AnalyticsOutcome = 'success' | 'failure';
export type AnalyticsCalculationKind = 'estimated' | 'actual_in_out';
export type ViewportCategory = 'small_mobile' | 'mobile' | 'tablet' | 'desktop';

export interface AnalyticsMetadata {
  mode?: AnalyticsMode;
  outcome?: AnalyticsOutcome;
  errorCode?: string;
  calculationKind?: AnalyticsCalculationKind;
  viewportCategory?: ViewportCategory;
}

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  metadata: AnalyticsMetadata;
}

const MODES = new Set<AnalyticsMode>(['net_medals', 'investment_recovery', 'segments_inout']);
const OUTCOMES = new Set<AnalyticsOutcome>(['success', 'failure']);
const CALCULATION_KINDS = new Set<AnalyticsCalculationKind>(['estimated', 'actual_in_out']);
const VIEWPORTS = new Set<ViewportCategory>(['small_mobile', 'mobile', 'tablet', 'desktop']);

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

export function sanitizeAnalyticsMetadata(value: unknown): AnalyticsMetadata {
  const input = asRecord(value);
  const metadata: AnalyticsMetadata = {};
  const mode = input['mode'];
  const outcome = input['outcome'];
  const errorCode = input['errorCode'];
  const calculationKind = input['calculationKind'];
  const viewportCategory = input['viewportCategory'];
  if (typeof mode === 'string' && MODES.has(mode as AnalyticsMode)) {
    metadata.mode = mode as AnalyticsMode;
  }
  if (typeof outcome === 'string' && OUTCOMES.has(outcome as AnalyticsOutcome)) {
    metadata.outcome = outcome as AnalyticsOutcome;
  }
  if (typeof errorCode === 'string' && errorCode.length > 0 && errorCode.length <= 100) {
    metadata.errorCode = errorCode;
  }
  if (
    typeof calculationKind === 'string' &&
    CALCULATION_KINDS.has(calculationKind as AnalyticsCalculationKind)
  ) {
    metadata.calculationKind = calculationKind as AnalyticsCalculationKind;
  }
  if (typeof viewportCategory === 'string' && VIEWPORTS.has(viewportCategory as ViewportCategory)) {
    metadata.viewportCategory = viewportCategory as ViewportCategory;
  }
  return metadata;
}

export function createAnalyticsEvent(
  name: AnalyticsEventName,
  metadata: AnalyticsMetadata = {},
): AnalyticsEvent {
  return {
    name,
    metadata: sanitizeAnalyticsMetadata(metadata),
  };
}
