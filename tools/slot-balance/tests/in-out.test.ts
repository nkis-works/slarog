import { describe, expect, it } from 'vitest';

import { calculateInOut } from '../src/domain/calculators/in-out';

describe('actual IN/OUT calculator', () => {
  it('calculates 12,000 IN and 12,500 OUT', () => {
    const result = calculateInOut({ actualIn: 12000, actualOut: 12500 });
    expect(result.ok).toBe(true);
    expect(result.values).toMatchObject({
      totalIn: 12000,
      totalOut: 12500,
      actualNetMedals: 500,
    });
    expect(result.values?.payoutRate.display).toBe(104.2);
    expect(result.provenance['payoutRate']).toBe('actual');
  });

  it('returns a hard error when actual IN is zero', () => {
    const result = calculateInOut({ actualIn: 0, actualOut: 100 });
    expect(result.ok).toBe(false);
    expect(result.errors.map(({ code }) => code)).toContain('actual_in_not_positive');
  });

  it('returns a hard error when actual OUT is negative', () => {
    const result = calculateInOut({ actualIn: 100, actualOut: -1 });
    expect(result.ok).toBe(false);
    expect(result.errors.map(({ code }) => code)).toContain('actual_out_negative');
  });

  it('uses total IN and OUT for multiple segments instead of averaging rates', () => {
    const result = calculateInOut({
      segments: [
        { label: 'A', actualIn: 100, actualOut: 200, games: 100 },
        { label: 'B', actualIn: 900, actualOut: 900, games: 900 },
      ],
    });
    expect(result.values).toMatchObject({
      totalIn: 1000,
      totalOut: 1100,
      actualNetMedals: 100,
      totalGames: 1000,
    });
    expect(result.values?.payoutRate.display).toBe(110);
  });

  it('warns and prefers segments when both direct and segment values are supplied', () => {
    const result = calculateInOut({
      actualIn: 1,
      actualOut: 1,
      segments: [{ actualIn: 100, actualOut: 120 }],
    });
    expect(result.ok).toBe(true);
    expect(result.values?.totalIn).toBe(100);
    expect(result.warnings.map(({ code }) => code)).toContain('in_out_source_conflict');
  });

  it('rejects more than 100 IN/OUT segments', () => {
    const result = calculateInOut({
      segments: Array.from({ length: 101 }, () => ({ actualIn: 1, actualOut: 1 })),
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe('segments_limit_exceeded');
  });
});
