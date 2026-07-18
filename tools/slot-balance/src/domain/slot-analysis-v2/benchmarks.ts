import { compare, divide, integer, multiply, subtract } from '../rational';
import { roundHalfAwayFromZeroInteger } from '../rounding';
import {
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
  BenchmarkDifferenceDisplayCode,
  BenchmarkInput,
  BenchmarkValues,
  SlotAnalysisDomainError,
  SlotAnalysisDomainResult,
  SlotAnalysisRelation,
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

  const comparison = compare(differenceNetMedals, integer(0));
  const relation: SlotAnalysisRelation =
    comparison > 0 ? 'above' : comparison < 0 ? 'below' : 'equal';
  const roundedDifference = roundHalfAwayFromZeroInteger(differenceNetMedals);
  const differenceDisplayCode: BenchmarkDifferenceDisplayCode =
    comparison === 0
      ? 'exact_zero'
      : roundedDifference === 0n
        ? comparison > 0
          ? 'less_than_one_above'
          : 'less_than_one_below'
        : 'rounded_value';

  return success({
    games: input.games,
    netMedals: input.netMedals,
    benchmarkRate: exact(benchmarkRate.value),
    expectedNetMedals: metric(expectedNetMedals, 0),
    differenceNetMedals: metric(differenceNetMedals, 0),
    relation,
    differenceDisplayCode,
  });
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
  return success(values);
}
