import { describe, expect, it } from 'vitest';

import { decimal, rational, serializeRational } from '../src/domain/rational';
import {
  ceilToInteger,
  ceilToUnit,
  floorToInteger,
  floorToUnit,
  roundHalfAwayFromZero,
} from '../src/domain/rounding';

describe('rational arithmetic and rounding', () => {
  it('uses half away from zero for positive and negative ties', () => {
    expect(roundHalfAwayFromZero(rational(125n, 100n), 1)).toBe(1.3);
    expect(roundHalfAwayFromZero(rational(124n, 100n), 1)).toBe(1.2);
    expect(roundHalfAwayFromZero(rational(-125n, 100n), 1)).toBe(-1.3);
    expect(roundHalfAwayFromZero(rational(-124n, 100n), 1)).toBe(-1.2);
  });

  it('implements mathematical floor and ceil for negative values', () => {
    expect(floorToInteger(rational(-11n, 10n))).toBe(-2);
    expect(ceilToInteger(rational(-11n, 10n))).toBe(-1);
  });

  it('floors exchange estimates and ceils recovery amounts to a unit', () => {
    expect(floorToUnit(rational(178_571n, 10n), 500)).toBe(17500);
    expect(ceilToUnit(rational(17_501n, 1n), 500)).toBe(18000);
  });

  it('preserves decimal input as an exact rational', () => {
    expect(serializeRational(decimal('46.5'))).toEqual({
      numerator: '93',
      denominator: '2',
    });
  });
});
