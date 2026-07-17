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
const MAX_SEGMENTS = 100;

function hasControlCharacters(value: string): boolean {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f);
  });
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function safeInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isSafeInteger(value) ? value : undefined;
}

function optionalText(
  value: unknown,
  maxLength: number,
): { ok: true; value?: string } | { ok: false } {
  if (value === undefined) return { ok: true };
  if (typeof value !== 'string' || hasControlCharacters(value)) return { ok: false };
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return { ok: false };
  return { ok: true, value: trimmed };
}

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

type SegmentKind = 'net_medals' | 'actual_in_out';

function sanitizeSegment(
  value: unknown,
): { segment: SlotBalanceTransferSegmentV1; kind: SegmentKind } | undefined {
  const input = asRecord(value);
  if (!input) return undefined;
  const label = optionalText(input['label'], 100);
  if (!label.ok) return undefined;
  const games = safeInteger(input['games']);
  const netMedals = safeInteger(input['netMedals']);
  const actualIn = safeInteger(input['actualIn']);
  const actualOut = safeInteger(input['actualOut']);
  const hasGames = input['games'] !== undefined;
  const hasNetMedals = input['netMedals'] !== undefined;
  const hasActualIn = input['actualIn'] !== undefined;
  const hasActualOut = input['actualOut'] !== undefined;
  const hasNetPair = hasGames || hasNetMedals;
  const hasActualPair = hasActualIn || hasActualOut;

  if (hasNetPair === hasActualPair) return undefined;
  if (hasNetPair) {
    if (!hasGames || !hasNetMedals || games === undefined || games < 1 || netMedals === undefined) {
      return undefined;
    }
    return {
      segment: { ...(label.value ? { label: label.value } : {}), games, netMedals },
      kind: 'net_medals',
    };
  }
  if (
    !hasActualIn ||
    !hasActualOut ||
    actualIn === undefined ||
    actualIn < 1 ||
    actualOut === undefined ||
    actualOut < 0
  ) {
    return undefined;
  }
  return {
    segment: { ...(label.value ? { label: label.value } : {}), actualIn, actualOut },
    kind: 'actual_in_out',
  };
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
    !/^\d+\.\d+\.\d+$/.test(calculationVersion) ||
    calculationVersion.length > 32 ||
    typeof mode !== 'string' ||
    !MODES.has(mode as SlotBalanceTransferMode)
  ) {
    return undefined;
  }

  const transfer: SlotBalanceTransferV1 = {
    version: 1,
    source: 'nkisworks-slot-balance',
    calculationVersion,
    mode: mode as SlotBalanceTransferMode,
  };
  const scope = input['scope'];
  if (scope !== undefined && (typeof scope !== 'string' || !SCOPES.has(scope))) return undefined;
  if (typeof scope === 'string') {
    transfer.scope = scope as SlotBalanceTransferV1['scope'];
  }
  const machineName = optionalText(input['machineName'], 200);
  const memo = optionalText(input['memo'], 500);
  if (!machineName.ok || !memo.ok) return undefined;
  if (input['playDate'] !== undefined && !validDate(input['playDate'])) return undefined;
  const games = safeInteger(input['games']);
  const netMedals = safeInteger(input['netMedals']);
  if (input['playDate'] !== undefined) transfer.playDate = input['playDate'] as string;
  if (machineName.value !== undefined) transfer.machineName = machineName.value;
  if (memo.value !== undefined) transfer.memo = memo.value;

  const inputSegments = input['segments'];
  if (mode === 'net_medals') {
    if (input['games'] === undefined || games === undefined || games < 1) return undefined;
    if (input['netMedals'] === undefined || netMedals === undefined) return undefined;
    if (inputSegments !== undefined) return undefined;
    transfer.games = games;
    transfer.netMedals = netMedals;
  } else if (mode === 'investment_recovery') {
    if (inputSegments !== undefined) return undefined;
    const hasGames = input['games'] !== undefined;
    const hasNetMedals = input['netMedals'] !== undefined;
    if (hasGames !== hasNetMedals) return undefined;
    if (hasGames) {
      if (games === undefined || games < 1 || netMedals === undefined) return undefined;
      transfer.games = games;
      transfer.netMedals = netMedals;
    }
  } else {
    if (input['games'] !== undefined || input['netMedals'] !== undefined) return undefined;
    if (
      !Array.isArray(inputSegments) ||
      inputSegments.length < 1 ||
      inputSegments.length > MAX_SEGMENTS
    ) {
      return undefined;
    }
    const sanitizedSegments = inputSegments.map(sanitizeSegment);
    if (sanitizedSegments.some((segment) => segment === undefined)) return undefined;
    const segments = sanitizedSegments as Array<{
      segment: SlotBalanceTransferSegmentV1;
      kind: SegmentKind;
    }>;
    if (segments.some(({ kind }) => kind !== segments[0]?.kind)) return undefined;
    transfer.segments = segments.map(({ segment }) => segment);
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
