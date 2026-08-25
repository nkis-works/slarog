import { ceil, divide, floor, integer, multiply, serializeRational, toNumber } from './rational';
import type { Rational } from './rational';
import type { CalculatedNumber } from './types';

function powerOfTen(decimalPlaces: number): bigint {
  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0) {
    throw new RangeError('decimalPlaces must be a non-negative integer.');
  }
  return 10n ** BigInt(decimalPlaces);
}

export function roundHalfAwayFromZeroInteger(value: Rational): bigint {
  const negative = value.numerator < 0n;
  const absoluteNumerator = negative ? -value.numerator : value.numerator;
  let rounded = absoluteNumerator / value.denominator;
  const remainder = absoluteNumerator % value.denominator;
  if (remainder * 2n >= value.denominator) rounded += 1n;
  return negative ? -rounded : rounded;
}

export function roundHalfAwayFromZero(value: Rational, decimalPlaces = 0): number {
  const scale = powerOfTen(decimalPlaces);
  const scaled = multiply(value, integer(scale));
  const rounded = roundHalfAwayFromZeroInteger(scaled);
  return Number(rounded) / Number(scale);
}

export function floorToInteger(value: Rational): number {
  return Number(floor(value));
}

export function ceilToInteger(value: Rational): number {
  return Number(ceil(value));
}

export function floorToUnit(value: Rational, unit: number): number {
  if (!Number.isSafeInteger(unit) || unit <= 0) throw new RangeError('unit must be positive.');
  return Number(floor(divide(value, integer(unit)))) * unit;
}

export function ceilToUnit(value: Rational, unit: number): number {
  if (!Number.isSafeInteger(unit) || unit <= 0) throw new RangeError('unit must be positive.');
  return Number(ceil(divide(value, integer(unit)))) * unit;
}

export function calculatedNumber(value: Rational, decimalPlaces: number): CalculatedNumber {
  return {
    exact: serializeRational(value),
    approximate: toNumber(value),
    display: roundHalfAwayFromZero(value, decimalPlaces),
  };
}
