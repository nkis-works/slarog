import { describe, expect, it } from 'vitest';

import { calculateDrawdownRecovery } from '../../src/domain/slot-analysis-v2/drawdown';

describe('slot analysis v2 drawdown and recovery', () => {
  it('finds the maximum endpoint drawdown and recovery after a decline in O(n)', () => {
    const result = calculateDrawdownRecovery([
      { netMedals: 0 },
      { netMedals: 200 },
      { netMedals: -200 },
      { netMedals: 100 },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.maximumDrawdown).toEqual({ medals: 400, startIndex: 1, endIndex: 2 });
    expect(result.value.maximumRecoveryAfterDrawdown).toEqual({
      medals: 300,
      startIndex: 2,
      endIndex: 3,
    });
  });

  it('returns zero with undefined indices when no decline occurs', () => {
    const result = calculateDrawdownRecovery([
      { netMedals: 0 },
      { netMedals: 100 },
      { netMedals: 200 },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({
      maximumDrawdown: { medals: 0 },
      maximumRecoveryAfterDrawdown: { medals: 0 },
    });
  });

  it('keeps the earliest source indices on equal maxima', () => {
    const result = calculateDrawdownRecovery([
      { netMedals: 100 },
      { netMedals: 0 },
      { netMedals: 100 },
      { netMedals: 0 },
      { netMedals: 100 },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.maximumDrawdown).toEqual({ medals: 100, startIndex: 0, endIndex: 1 });
    expect(result.value.maximumRecoveryAfterDrawdown).toEqual({
      medals: 100,
      startIndex: 1,
      endIndex: 2,
    });
  });
});
