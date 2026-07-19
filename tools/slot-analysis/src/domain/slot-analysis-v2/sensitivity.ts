import { divide, integer } from '../rational';
import { failure, metric, success, validateGames } from './shared';
import type { SensitivityInput, SensitivityValues, SlotAnalysisDomainResult } from './types';

export function calculatePayoutRateSensitivity(
  input: SensitivityInput,
): SlotAnalysisDomainResult<Readonly<SensitivityValues>> {
  const gamesError = validateGames(input.games, 'games', {
    notPositive: 'games_not_positive',
    notSafe: 'games_not_safe',
  });
  if (gamesError) return failure([gamesError]);

  const sensitivity = divide(integer(10_000), integer(input.games * 3));
  return success(
    {
      games: input.games,
      payoutRatePointsPer100Medals: metric(sensitivity, 1),
    },
    {
      formulaIds: ['payout_rate_sensitivity'],
      assumptionCodes: ['three_medals_per_game'],
      roundingCodes: ['half_away_from_zero_to_one_decimal'],
      warningCodes: [],
    },
  );
}
