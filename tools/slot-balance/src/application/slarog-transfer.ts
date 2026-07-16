import type { ValidationMessage } from '../domain/types';

export type SlotBalanceTransferMode = 'net_medals' | 'investment_recovery' | 'segments_inout';

export interface SlotBalanceTransferSegmentV1 {
  label?: string;
  games?: number;
  netMedals?: number;
  actualIn?: number;
  actualOut?: number;
}

export interface SlotBalanceTransferV1 {
  version: 1;
  source: 'nkisworks-slot-balance';
  calculationVersion: string;
  mode: SlotBalanceTransferMode;
  scope?: 'personal_session' | 'machine_day' | 'custom_segment';
  playDate?: string;
  machineName?: string;
  games?: number;
  netMedals?: number;
  segments?: SlotBalanceTransferSegmentV1[];
  memo?: string;
}

export interface CalculationFreshness {
  calculatedInputRevision: string | number;
  currentInputRevision: string | number;
}

export interface PreparedSlotBalanceTransfer {
  ok: boolean;
  value?: SlotBalanceTransferV1;
  serialized?: string;
  errors: ValidationMessage[];
}

const MODES = new Set<SlotBalanceTransferMode>([
  'net_medals',
  'investment_recovery',
  'segments_inout',
]);
const SCOPES = new Set(['personal_session', 'machine_day', 'custom_segment']);

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function safeInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isSafeInteger(value) ? value : undefined;
}

function optionalText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : undefined;
}

function sanitizeSegment(value: unknown): SlotBalanceTransferSegmentV1 | undefined {
  const input = asRecord(value);
  if (!input) return undefined;
  const segment: SlotBalanceTransferSegmentV1 = {};
  const label = optionalText(input['label'], 100);
  const games = safeInteger(input['games']);
  const netMedals = safeInteger(input['netMedals']);
  const actualIn = safeInteger(input['actualIn']);
  const actualOut = safeInteger(input['actualOut']);
  if (label !== undefined) segment.label = label;
  if (games !== undefined) segment.games = games;
  if (netMedals !== undefined) segment.netMedals = netMedals;
  if (actualIn !== undefined) segment.actualIn = actualIn;
  if (actualOut !== undefined) segment.actualOut = actualOut;
  if (
    games === undefined &&
    netMedals === undefined &&
    actualIn === undefined &&
    actualOut === undefined
  ) {
    return undefined;
  }
  return segment;
}

export function sanitizeSlotBalanceTransfer(value: unknown): SlotBalanceTransferV1 | undefined {
  const input = asRecord(value);
  if (!input) return undefined;
  const version = input['version'];
  const source = input['source'];
  const calculationVersion = input['calculationVersion'];
  const mode = input['mode'];
  if (version !== 1 || source !== 'nkisworks-slot-balance') return undefined;
  if (
    typeof calculationVersion !== 'string' ||
    calculationVersion.trim().length === 0 ||
    typeof mode !== 'string' ||
    !MODES.has(mode as SlotBalanceTransferMode)
  ) {
    return undefined;
  }

  const transfer: SlotBalanceTransferV1 = {
    version: 1,
    source: 'nkisworks-slot-balance',
    calculationVersion: calculationVersion.trim(),
    mode: mode as SlotBalanceTransferMode,
  };
  const scope = input['scope'];
  if (typeof scope === 'string' && SCOPES.has(scope)) {
    transfer.scope = scope as SlotBalanceTransferV1['scope'];
  }
  const playDate = optionalText(input['playDate'], 10);
  const machineName = optionalText(input['machineName'], 200);
  const memo = optionalText(input['memo'], 500);
  const games = safeInteger(input['games']);
  const netMedals = safeInteger(input['netMedals']);
  if (playDate !== undefined) transfer.playDate = playDate;
  if (machineName !== undefined) transfer.machineName = machineName;
  if (memo !== undefined) transfer.memo = memo;
  if (games !== undefined) transfer.games = games;
  if (netMedals !== undefined) transfer.netMedals = netMedals;

  const inputSegments = input['segments'];
  if (inputSegments !== undefined) {
    if (!Array.isArray(inputSegments)) return undefined;
    const segments = inputSegments.map(sanitizeSegment);
    if (segments.some((segment) => segment === undefined)) return undefined;
    transfer.segments = segments as SlotBalanceTransferSegmentV1[];
  }
  return transfer;
}

export function serializeSlotBalanceTransfer(value: SlotBalanceTransferV1): string {
  const sanitized = sanitizeSlotBalanceTransfer(value);
  if (!sanitized) throw new TypeError('Invalid SlotBalanceTransferV1 payload.');
  return JSON.stringify(sanitized);
}

export function prepareSlotBalanceTransfer(
  value: unknown,
  freshness: CalculationFreshness,
): PreparedSlotBalanceTransfer {
  if (freshness.calculatedInputRevision !== freshness.currentInputRevision) {
    return {
      ok: false,
      errors: [
        {
          severity: 'error',
          code: 'stale_calculation_result',
          message: '入力が変更されているため、最後の計算結果を引き継げません。',
          correction: '現在の入力で再計算してから引き継いでください。',
        },
      ],
    };
  }
  const sanitized = sanitizeSlotBalanceTransfer(value);
  if (!sanitized) {
    return {
      ok: false,
      errors: [
        {
          severity: 'error',
          code: 'invalid_transfer_payload',
          message: 'スラログ引き継ぎデータの形式が正しくありません。',
          correction: '計算結果と入力項目を確認して、引き継ぎデータを作り直してください。',
        },
      ],
    };
  }
  return {
    ok: true,
    value: sanitized,
    serialized: JSON.stringify(sanitized),
    errors: [],
  };
}
