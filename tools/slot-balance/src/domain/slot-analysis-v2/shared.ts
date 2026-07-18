import { compare, decimal, integer, serializeRational, toNumber } from '../rational';
import type { Rational } from '../rational';
import { calculatedNumber } from '../rounding';
import { SLOT_ANALYSIS_CALCULATION_VERSION } from './version';
import type {
  BenchmarkDifferenceDisplayCode,
  SlotAnalysisCalculatedNumber,
  SlotAnalysisDomainError,
  SlotAnalysisDomainErrorCode,
  SlotAnalysisDomainResult,
  SlotAnalysisMetadataInput,
  SlotAnalysisRelation,
  SlotAnalysisResultMetadata,
} from './types';

export const MAX_THREE_MEDAL_GAMES = Math.floor(Number.MAX_SAFE_INTEGER / 3);

export function deepFreeze<T>(value: T): Readonly<T> {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nestedValue of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nestedValue);
    }
    Object.freeze(value);
  }
  return value as Readonly<T>;
}

function unique<T extends string>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
}

export function createMetadata(input: SlotAnalysisMetadataInput): SlotAnalysisResultMetadata {
  return deepFreeze({
    calculationVersion: SLOT_ANALYSIS_CALCULATION_VERSION,
    formulaIds: unique(input.formulaIds),
    assumptionCodes: unique(input.assumptionCodes),
    roundingCodes: unique(input.roundingCodes),
    warningCodes: unique(input.warningCodes),
  });
}

export function mergeMetadata(
  ...items: readonly SlotAnalysisResultMetadata[]
): SlotAnalysisMetadataInput {
  return {
    formulaIds: items.flatMap(({ formulaIds }) => formulaIds),
    assumptionCodes: items.flatMap(({ assumptionCodes }) => assumptionCodes),
    roundingCodes: items.flatMap(({ roundingCodes }) => roundingCodes),
    warningCodes: items.flatMap(({ warningCodes }) => warningCodes),
  };
}

export function success<T>(
  value: T,
  metadata: SlotAnalysisMetadataInput,
): SlotAnalysisDomainResult<Readonly<T>> {
  return deepFreeze({
    ok: true as const,
    value: deepFreeze(value),
    metadata: createMetadata(metadata),
    errors: [] as const,
  });
}

export function failure<T>(
  errors: readonly SlotAnalysisDomainError[],
): SlotAnalysisDomainResult<T> {
  return deepFreeze({ ok: false as const, errors: [...errors] });
}

export function domainError(
  code: SlotAnalysisDomainErrorCode,
  field: string,
  index?: number,
): SlotAnalysisDomainError {
  return index === undefined ? { code, field } : { code, field, index };
}

export function validateGames(
  value: number,
  field: string,
  codes: {
    readonly notPositive: SlotAnalysisDomainErrorCode;
    readonly notSafe: SlotAnalysisDomainErrorCode;
  },
): SlotAnalysisDomainError | undefined {
  if (!Number.isSafeInteger(value) || value <= 0) {
    return domainError(value <= 0 ? codes.notPositive : codes.notSafe, field);
  }
  if (value > MAX_THREE_MEDAL_GAMES) return domainError(codes.notSafe, field);
  return undefined;
}

export function validateNetMedals(
  value: number,
  field: string,
  codes: {
    readonly notInteger: SlotAnalysisDomainErrorCode;
    readonly notSafe: SlotAnalysisDomainErrorCode;
  },
): SlotAnalysisDomainError | undefined {
  if (!Number.isInteger(value)) return domainError(codes.notInteger, field);
  if (!Number.isSafeInteger(value)) return domainError(codes.notSafe, field);
  return undefined;
}

export function parsePositiveDecimal(
  value: number | string,
  field: string,
  codes: {
    readonly notPositive: SlotAnalysisDomainErrorCode;
    readonly notFinite: SlotAnalysisDomainErrorCode;
  },
): { readonly value?: Rational; readonly error?: SlotAnalysisDomainError } {
  if (typeof value === 'number' && !Number.isFinite(value)) {
    return { error: domainError(codes.notFinite, field) };
  }
  try {
    const parsed = decimal(value);
    if (compare(parsed, integer(0)) <= 0) {
      return { error: domainError(codes.notPositive, field) };
    }
    return { value: parsed };
  } catch {
    return { error: domainError(codes.notFinite, field) };
  }
}

export function exact(value: Rational): Readonly<ReturnType<typeof serializeRational>> {
  return deepFreeze(serializeRational(value));
}

export function metric(value: Rational, decimalPlaces: number): SlotAnalysisCalculatedNumber {
  const calculated = calculatedNumber(value, decimalPlaces);
  return deepFreeze({
    exact: deepFreeze(calculated.exact),
    approximate: calculated.approximate,
    display: calculated.display,
  });
}

export function hasFiniteApproximation(...values: readonly Rational[]): boolean {
  return values.every((value) => Number.isFinite(toNumber(value)));
}

export function classifyBenchmarkDifference(value: Rational): {
  readonly relation: SlotAnalysisRelation;
  readonly differenceDisplayCode: BenchmarkDifferenceDisplayCode;
} {
  const comparison = compare(value, integer(0));
  const relation: SlotAnalysisRelation =
    comparison > 0 ? 'above' : comparison < 0 ? 'below' : 'equal';
  const roundedDifference = calculatedNumber(value, 0).display;
  const differenceDisplayCode: BenchmarkDifferenceDisplayCode =
    comparison === 0
      ? 'exact_zero'
      : roundedDifference === 0
        ? comparison > 0
          ? 'less_than_one_above'
          : 'less_than_one_below'
        : 'rounded_value';
  return { relation, differenceDisplayCode };
}
