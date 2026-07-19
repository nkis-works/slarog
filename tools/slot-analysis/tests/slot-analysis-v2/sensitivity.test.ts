import { describe, expect, it } from 'vitest';

import { calculatePayoutRateSensitivity } from '../../src/domain/slot-analysis-v2/sensitivity';

describe('slot analysis v2 sensitivity', () => {
  it('returns 5/6 points and displays 0.8 for 4,000G', () => {
    const result = calculatePayoutRateSensitivity({ games: 4000 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.payoutRatePointsPer100Medals.exact).toEqual({
      numerator: '5',
      denominator: '6',
    });
    expect(result.value.payoutRatePointsPer100Medals.display).toBe(0.8);
  });

  it('returns 100/3 points and displays 33.3 for 100G', () => {
    const result = calculatePayoutRateSensitivity({ games: 100 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.payoutRatePointsPer100Medals.exact).toEqual({
      numerator: '100',
      denominator: '3',
    });
    expect(result.value.payoutRatePointsPer100Medals.display).toBe(33.3);
  });

  it('rejects non-positive games', () => {
    expect(calculatePayoutRateSensitivity({ games: 0 })).toMatchObject({
      ok: false,
      errors: [{ code: 'games_not_positive' }],
    });
  });
});
