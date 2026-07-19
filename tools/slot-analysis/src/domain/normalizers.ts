import type { ValidationMessage } from './types';

export interface NumericNormalizationOptions {
  field: string;
  label?: string;
  allowDecimal?: boolean;
  units?: string[];
}

export interface NumericNormalizationResult {
  value?: number;
  canonical?: string;
  messages: ValidationMessage[];
}

const DEFAULT_UNITS = ['ゲーム', 'G', '枚', '円'];

function error(
  code: string,
  field: string,
  message: string,
  correction: string,
): NumericNormalizationResult {
  return {
    messages: [{ severity: 'error', code, field, message, correction }],
  };
}

function escapeForRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeNumericInput(
  raw: unknown,
  options: NumericNormalizationOptions,
): NumericNormalizationResult {
  const label = options.label ?? options.field;
  const allowDecimal = options.allowDecimal ?? false;

  if (raw === undefined || raw === null) return { messages: [] };

  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) {
      return error(
        'non_finite_number',
        options.field,
        `${label}に有限の数値を入力してください。`,
        'NaNやInfinityではなく、通常の数字へ修正してください。',
      );
    }
    if (!allowDecimal && !Number.isSafeInteger(raw)) {
      return error(
        Number.isInteger(raw) ? 'unsafe_integer' : 'integer_required',
        options.field,
        Number.isInteger(raw)
          ? `${label}が安全に扱える整数範囲を超えています。`
          : `${label}は整数で入力してください。`,
        '小数や極端に大きな値を避け、整数へ修正してください。',
      );
    }
    return { value: Object.is(raw, -0) ? 0 : raw, canonical: String(raw), messages: [] };
  }

  if (typeof raw !== 'string') {
    return error(
      'invalid_numeric_input',
      options.field,
      `${label}を数字として読み取れません。`,
      '数字、符号、カンマ、空白、対応単位だけを使用してください。',
    );
  }

  let normalized = raw.normalize('NFKC').trim();
  if (normalized === '') return { messages: [] };

  const units = (options.units ?? DEFAULT_UNITS)
    .map(escapeForRegularExpression)
    .sort((left, right) => right.length - left.length);
  if (units.length > 0) {
    normalized = normalized.replace(new RegExp(`(?:${units.join('|')})\\s*$`, 'i'), '');
  }
  normalized = normalized.replace(/[,\s]/gu, '');

  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalized)) {
    return error(
      'invalid_numeric_input',
      options.field,
      `${label}に対応していない文字が含まれています。`,
      '例のように「4,000G」「+500枚」「20000円」の形式へ修正してください。',
    );
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) {
    return error(
      'non_finite_number',
      options.field,
      `${label}が大きすぎるため計算できません。`,
      '桁数を確認し、通常の範囲の数字へ修正してください。',
    );
  }
  if (!allowDecimal && !Number.isInteger(value)) {
    return error(
      'integer_required',
      options.field,
      `${label}は整数で入力してください。`,
      '小数点以下を含めず入力してください。',
    );
  }
  if (!allowDecimal && !Number.isSafeInteger(value)) {
    return error(
      'unsafe_integer',
      options.field,
      `${label}が安全に扱える整数範囲を超えています。`,
      '桁数を確認し、より小さい整数へ修正してください。',
    );
  }

  return {
    value: Object.is(value, -0) ? 0 : value,
    canonical: String(Object.is(value, -0) ? 0 : value),
    messages: [],
  };
}

export function normalizeIntegerInput(
  raw: unknown,
  field: string,
  label?: string,
): NumericNormalizationResult {
  return normalizeNumericInput(raw, { field, label, allowDecimal: false });
}

export function normalizeDecimalInput(
  raw: unknown,
  field: string,
  label?: string,
): NumericNormalizationResult {
  return normalizeNumericInput(raw, { field, label, allowDecimal: true });
}
