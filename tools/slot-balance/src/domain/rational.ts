import type { ExactRational } from './types';

export interface Rational {
  numerator: bigint;
  denominator: bigint;
}

function absolute(value: bigint): bigint {
  return value < 0n ? -value : value;
}

function greatestCommonDivisor(left: bigint, right: bigint): bigint {
  let a = absolute(left);
  let b = absolute(right);
  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a === 0n ? 1n : a;
}

export function rational(numerator: bigint, denominator: bigint = 1n): Rational {
  if (denominator === 0n) throw new RangeError('Rational denominator must not be zero.');
  const sign = denominator < 0n ? -1n : 1n;
  const divisor = greatestCommonDivisor(numerator, denominator);
  return {
    numerator: (numerator / divisor) * sign,
    denominator: absolute(denominator / divisor),
  };
}

export function integer(value: number | bigint): Rational {
  return rational(typeof value === 'bigint' ? value : BigInt(value));
}

export function decimal(value: number | string): Rational {
  const text = typeof value === 'number' ? value.toString() : value.trim();
  const match = /^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(text);
  if (!match) throw new RangeError(`Invalid decimal value: ${text}`);

  const sign = match[1] === '-' ? -1n : 1n;
  const integerDigits = match[2] ?? '0';
  const fractionDigits = match[3] ?? '';
  const exponent = Number(match[4] ?? '0');
  const digits = BigInt(`${integerDigits}${fractionDigits}` || '0') * sign;
  const scale = fractionDigits.length - exponent;

  if (scale <= 0) return rational(digits * 10n ** BigInt(-scale));
  return rational(digits, 10n ** BigInt(scale));
}

export function add(left: Rational, right: Rational): Rational {
  return rational(
    left.numerator * right.denominator + right.numerator * left.denominator,
    left.denominator * right.denominator,
  );
}

export function subtract(left: Rational, right: Rational): Rational {
  return rational(
    left.numerator * right.denominator - right.numerator * left.denominator,
    left.denominator * right.denominator,
  );
}

export function multiply(left: Rational, right: Rational): Rational {
  return rational(left.numerator * right.numerator, left.denominator * right.denominator);
}

export function divide(left: Rational, right: Rational): Rational {
  if (right.numerator === 0n) throw new RangeError('Cannot divide by zero.');
  return rational(left.numerator * right.denominator, left.denominator * right.numerator);
}

export function compare(left: Rational, right: Rational): -1 | 0 | 1 {
  const difference = left.numerator * right.denominator - right.numerator * left.denominator;
  return difference < 0n ? -1 : difference > 0n ? 1 : 0;
}

export function maxZero(value: Rational): Rational {
  return value.numerator < 0n ? integer(0) : value;
}

export function floor(value: Rational): bigint {
  const quotient = value.numerator / value.denominator;
  const remainder = value.numerator % value.denominator;
  return value.numerator < 0n && remainder !== 0n ? quotient - 1n : quotient;
}

export function ceil(value: Rational): bigint {
  const quotient = value.numerator / value.denominator;
  const remainder = value.numerator % value.denominator;
  return value.numerator > 0n && remainder !== 0n ? quotient + 1n : quotient;
}

export function toNumber(value: Rational): number {
  return Number(value.numerator) / Number(value.denominator);
}

export function serializeRational(value: Rational): ExactRational {
  return {
    numerator: value.numerator.toString(),
    denominator: value.denominator.toString(),
  };
}
