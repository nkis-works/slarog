import { add, divide, integer, multiply } from '../rational';
import { domainError, failure, metric, success, validateGames, validateNetMedals } from './shared';
import type {
  QuickPerformanceInput,
  QuickPerformanceValues,
  SlotAnalysisDomainError,
  SlotAnalysisDomainResult,
} from './types';

export function calculateQuickPerformance(
  input: QuickPerformanceInput,
): SlotAnalysisDomainResult<Readonly<QuickPerformanceValues>> {
  const errors: SlotAnalysisDomainError[] = [];
  const gamesError = validateGames(input.games, 'games', {
    notPositive: 'games_not_positive',
    notSafe: 'games_not_safe',
  });
  const netError = validateNetMedals(input.netMedals, 'netMedals', {
    notInteger: 'net_medals_not_integer',
    notSafe: 'net_medals_not_safe',
  });
  if (gamesError) errors.push(gamesError);
  if (netError) errors.push(netError);
  if (!gamesError && !netError && BigInt(input.games) * 3n + BigInt(input.netMedals) < 0n) {
    errors.push(domainError('assumed_out_negative', 'netMedals'));
  }
  if (errors.length > 0) return failure(errors);

  const assumedIn = integer(BigInt(input.games) * 3n);
  const assumedOut = add(assumedIn, integer(input.netMedals));
  const payoutRate = divide(multiply(assumedOut, integer(100)), assumedIn);
  const netMedalsPer1000Games = divide(
    multiply(integer(input.netMedals), integer(1000)),
    integer(input.games),
  );

  return success(
    {
      games: input.games,
      netMedals: input.netMedals,
      assumedInMedals: input.games * 3,
      assumedOutMedals: input.games * 3 + input.netMedals,
      payoutRate: metric(payoutRate, 1),
      netMedalsPer1000Games: metric(netMedalsPer1000Games, 1),
    },
    {
      formulaIds: ['quick_performance_rate', 'net_medals_per_1000_games'],
      assumptionCodes: ['three_medals_per_game'],
      roundingCodes: ['half_away_from_zero_to_one_decimal'],
      warningCodes: [],
    },
  );
}
