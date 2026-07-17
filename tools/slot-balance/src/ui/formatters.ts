import type { ValueProvenance } from '../domain/types';

const INTEGER_FORMATTER = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 });
const DECIMAL_FORMATTER = new Intl.NumberFormat('ja-JP', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatNumber(value: number, fractionDigits = 0): string {
  return fractionDigits === 0 ? INTEGER_FORMATTER.format(value) : DECIMAL_FORMATTER.format(value);
}

export function formatSignedNumber(value: number, fractionDigits = 0): string {
  if (value === 0) return formatNumber(0, fractionDigits);
  return `${value > 0 ? '+' : '-'}${formatNumber(Math.abs(value), fractionDigits)}`;
}

export function formatYen(value: number, signed = false): string {
  return `${signed ? formatSignedNumber(value) : formatNumber(value)}円`;
}

export function formatMedals(value: number, signed = false): string {
  return `${signed ? formatSignedNumber(value) : formatNumber(value)}枚`;
}

export function formatSignedMedals(value: number): string {
  return formatMedals(value, true);
}

export function formatGames(value: number): string {
  return `${formatNumber(value)}G`;
}

export function formatPercent(value: number): string {
  return `${formatNumber(value, 1)}%`;
}

export function provenanceLabel(provenance: ValueProvenance): string {
  const labels: Record<ValueProvenance, string> = {
    input: '入力',
    calculated: '計算',
    estimated: '概算',
    reference: '参考',
    actual: '実測',
  };
  return labels[provenance];
}
