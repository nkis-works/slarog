import { describe, expect, it } from 'vitest';

import {
  analyzeCumulativePoints,
  convertCumulativePoints,
} from '../../src/domain/slot-analysis-v2/cumulative-points';

describe('slot analysis v2 cumulative points', () => {
  it('converts 0/0 cumulative points into the expected adjacent segments', () => {
    const result = convertCumulativePoints({
      points: [
        { games: 0, netMedals: 0 },
        { games: 1000, netMedals: 200 },
        { games: 3000, netMedals: -200 },
      ],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.segments).toEqual([
      {
        games: 1000,
        netMedals: 200,
        provenance: {
          source: 'cumulative_points',
          sourceStartPointIndex: 0,
          sourceEndPointIndex: 1,
        },
      },
      {
        games: 2000,
        netMedals: -400,
        provenance: {
          source: 'cumulative_points',
          sourceStartPointIndex: 1,
          sourceEndPointIndex: 2,
        },
      },
    ]);
  });

  it('supports an arbitrary non-zero starting point', () => {
    const result = analyzeCumulativePoints({
      points: [
        { games: 2000, netMedals: 300 },
        { games: 3000, netMedals: 500 },
        { games: 5000, netMedals: 100 },
      ],
      benchmarkRate: 103,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.aggregate).toMatchObject({ totalGames: 3000, totalNetMedals: -200 });
    expect(result.value.aggregate.payoutRate.display).toBe(97.8);
    expect(result.value.drawdownRecovery.maxDrawdown).toEqual({
      medals: 400,
      startIndex: 1,
      endIndex: 2,
    });
  });

  it('requires strictly increasing cumulative games', () => {
    const result = convertCumulativePoints({
      points: [
        { games: 100, netMedals: 0 },
        { games: 100, netMedals: 1 },
      ],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((error) => error.code)).toContain('cumulative_games_not_increasing');
  });
});
