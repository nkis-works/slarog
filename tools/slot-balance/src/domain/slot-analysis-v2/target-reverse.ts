import { add, ceil, compare, divide, integer, multiply, subtract } from '../rational';
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
  SlotAnalysisDomainError,
  SlotAnalysisDomainResult,
  TargetReverseInput,
  TargetReverseStatus,
  TargetReverseValues,
} from './types';

export function calculateTargetReverse(
  input: TargetReverseInput,
): SlotAnalysisDomainResult<Readonly<TargetReverseValues>> {
  const errors: SlotAnalysisDomainError[] = [];
  const currentGamesError = validateGames(input.currentGames, 'currentGames', {
    notPositive: 'games_not_positive',
    notSafe: 'games_not_safe',
  });
  const currentNetError = validateNetMedals(input.currentNetMedals, 'currentNetMedals', {
    notInteger: 'net_medals_not_integer',
    notSafe: 'net_medals_not_safe',
  });
  const targetGamesError = validateGames(input.targetGames, 'targetGames', {
    notPositive: 'target_games_not_positive',
    notSafe: 'target_games_not_safe',
  });
  const targetRate = parsePositiveDecimal(input.targetRate, 'targetRate', {
    notPositive: 'target_rate_not_positive',
    notFinite: 'target_rate_not_finite_decimal',
  });
  if (currentGamesError) errors.push(currentGamesError);
  if (currentNetError) errors.push(currentNetError);
  if (targetGamesError) errors.push(targetGamesError);
  if (targetRate.error) errors.push(targetRate.error);
  if (
    !currentGamesError &&
    !currentNetError &&
    input.currentGames * 3 + input.currentNetMedals < 0
  ) {
    errors.push(domainError('assumed_out_negative', 'currentNetMedals'));
  }
  if (!currentGamesError && !targetGamesError && input.targetGames <= input.currentGames) {
    errors.push(domainError('target_games_not_after_current', 'targetGames'));
  }
  if (errors.length > 0 || !targetRate.value) return failure(errors);

  const remainingGames = input.targetGames - input.currentGames;
  const targetIn = integer(input.targetGames * 3);
  const exactTargetTotalNetMedals = divide(
    multiply(targetIn, subtract(targetRate.value, integer(100))),
    integer(100),
  );
  const exactRequiredFutureNetMedals = subtract(
    exactTargetTotalNetMedals,
    integer(input.currentNetMedals),
  );
  const remainingIn = integer(remainingGames * 3);
  const exactRequiredFutureOut = add(remainingIn, exactRequiredFutureNetMedals);
  const clampedToNonnegativeOut = compare(exactRequiredFutureOut, integer(0)) < 0;
  const exactIntegerMinimum = ceil(exactRequiredFutureNetMedals);
  const lowestExecutableNet = -BigInt(remainingGames * 3);
  const executableIntegerMinimum =
    exactIntegerMinimum < lowestExecutableNet ? lowestExecutableNet : exactIntegerMinimum;
  const minimumFutureNetMedals = Number(executableIntegerMinimum);
  const minimumFutureOutMedals = remainingGames * 3 + minimumFutureNetMedals;
  const boundaryFuturePayoutRate = divide(
    multiply(integer(minimumFutureOutMedals), integer(100)),
    remainingIn,
  );
  if (
    !hasFiniteApproximation(
      exactTargetTotalNetMedals,
      exactRequiredFutureNetMedals,
      boundaryFuturePayoutRate,
    )
  ) {
    return failure([domainError('result_not_finite', 'targetRate')]);
  }

  let status: TargetReverseStatus;
  if (clampedToNonnegativeOut) status = 'any_nonnegative_out_suffices';
  else if (minimumFutureNetMedals > 0) status = 'must_gain';
  else if (minimumFutureNetMedals === 0) status = 'no_net_change_required';
  else status = 'can_lose_up_to';

  return success({
    currentGames: input.currentGames,
    currentNetMedals: input.currentNetMedals,
    targetGames: input.targetGames,
    targetRate: exact(targetRate.value),
    remainingGames,
    exactTargetTotalNetMedals: metric(exactTargetTotalNetMedals, 0),
    exactRequiredFutureNetMedals: metric(exactRequiredFutureNetMedals, 0),
    minimumFutureNetMedals,
    minimumFutureOutMedals,
    boundaryFuturePayoutRate: metric(boundaryFuturePayoutRate, 1),
    status,
    ...(status === 'can_lose_up_to' ? { allowedLossMedals: Math.abs(minimumFutureNetMedals) } : {}),
    clampedToNonnegativeOut,
  });
}
