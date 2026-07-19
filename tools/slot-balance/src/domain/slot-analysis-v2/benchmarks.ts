import { divide, integer, multiply, subtract } from '../rational';
import {
  classifyBenchmarkDifference,
  domainError,
  exact,
  failure,
  hasFiniteApproximation,
  metric,
  parsePositiveDecimal,
  success,
  validateGames,
  validateNetMedals,
} from './shared';
import type {
  BenchmarkBatchInput,
  BenchmarkInput,
  BenchmarkValues,
  SlotAnalysisDomainError,
  SlotAnalysisDomainResult,
} from './types';

export const STANDARD_BENCHMARK_RATES = Object.freeze(['100', '103', '105'] as const);

export function calculateBenchmark(
  input: BenchmarkInput,
): SlotAnalysisDomainResult<Readonly<BenchmarkValues>> {
  const errors: SlotAnalysisDomainError[] = [];
  const gamesError = validateGames(input.games, 'games', {
    notPositive: 'games_not_positive',
    notSafe: 'games_not_safe',
  });
  const netError = validateNetMedals(input.netMedals, 'netMedals', {
    notInteger: 'net_medals_not_integer',
    notSafe: 'net_medals_not_safe',
  });
  const benchmarkRate = parsePositiveDecimal(input.benchmarkRate, 'benchmarkRate', {
    notPositive: 'benchmark_rate_not_positive',
    notFinite: 'benchmark_rate_not_finite_decimal',
  });
  if (gamesError) errors.push(gamesError);
  if (netError) errors.push(netError);
  if (benchmarkRate.error) errors.push(benchmarkRate.error);
  if (!gamesError && !netError && BigInt(input.games) * 3n + BigInt(input.netMedals) < 0n) {
    errors.push(domainError('assumed_out_negative', 'netMedals'));
  }
  if (errors.length > 0 || !benchmarkRate.value) return failure(errors);

  const assumedIn = multiply(integer(input.games), integer(3));
  const expectedNetMedals = divide(
    multiply(assumedIn, subtract(benchmarkRate.value, integer(100))),
    integer(100),
  );
  const differenceNetMedals = subtract(integer(input.netMedals), expectedNetMedals);
  if (!hasFiniteApproximation(expectedNetMedals, differenceNetMedals)) {
    return failure([domainError('result_not_finite', 'benchmarkRate')]);
  }

  const { relation, differenceDisplayCode } = classifyBenchmarkDifference(differenceNetMedals);

  return success(
    {
      games: input.games,
      netMedals: input.netMedals,
      benchmarkRate: exact(benchmarkRate.value),
      expectedNetMedals: metric(expectedNetMedals, 0),
      differenceNetMedals: metric(differenceNetMedals, 0),
      relation,
      differenceDisplayCode,
    },
    {
      formulaIds: ['benchmark_expected_net_medals', 'benchmark_difference'],
      assumptionCodes: ['three_medals_per_game', 'benchmark_is_comparison_not_prediction'],
      roundingCodes: ['half_away_from_zero_to_integer_medal'],
      warningCodes: [],
    },
  );
}

export function calculateStandardBenchmarks(
  input: BenchmarkBatchInput,
): SlotAnalysisDomainResult<readonly Readonly<BenchmarkValues>[]> {
  const values: Readonly<BenchmarkValues>[] = [];
  for (const benchmarkRate of STANDARD_BENCHMARK_RATES) {
    const result = calculateBenchmark({ ...input, benchmarkRate });
    if (!result.ok) return result;
    values.push(result.value);
  }
  return success(values, {
    formulaIds: ['benchmark_expected_net_medals', 'benchmark_difference'],
    assumptionCodes: ['three_medals_per_game', 'benchmark_is_comparison_not_prediction'],
    roundingCodes: ['half_away_from_zero_to_integer_medal'],
    warningCodes: [],
  });
}
