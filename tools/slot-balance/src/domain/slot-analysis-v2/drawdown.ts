import { failure, success, validateNetMedals } from './shared';
import type {
  DrawdownPointInput,
  DrawdownRecoveryValues,
  SlotAnalysisDomainError,
  SlotAnalysisDomainResult,
} from './types';

export function calculateDrawdownRecovery(
  points: readonly DrawdownPointInput[],
): SlotAnalysisDomainResult<Readonly<DrawdownRecoveryValues>> {
  if (points.length < 2) {
    return failure([{ code: 'cumulative_points_required', field: 'points' }]);
  }

  const errors: SlotAnalysisDomainError[] = [];
  points.forEach((point, index) => {
    const error = validateNetMedals(point.netMedals, `points[${index}].netMedals`, {
      notInteger: 'cumulative_net_medals_not_integer',
      notSafe: 'cumulative_net_medals_not_safe',
    });
    if (error) errors.push({ ...error, index });
  });
  if (errors.length > 0) return failure(errors);

  let peakValue = points[0]?.netMedals ?? 0;
  let peakIndex = 0;
  let maxDrawdown = 0;
  let drawdownPeakIndex: number | undefined;
  let drawdownTroughIndex: number | undefined;

  let recoveryEligible = false;
  let recoveryTroughValue = 0;
  let recoveryTroughIndex = 0;
  let maxRecovery = 0;
  let maxRecoveryTroughIndex: number | undefined;
  let maxRecoveryEndIndex: number | undefined;

  for (let index = 1; index < points.length; index += 1) {
    const value = points[index]?.netMedals ?? 0;
    const drawdown = peakValue - value;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      drawdownPeakIndex = peakIndex;
      drawdownTroughIndex = index;
    }

    if (value < peakValue) {
      if (!recoveryEligible || value < recoveryTroughValue) {
        recoveryTroughValue = value;
        recoveryTroughIndex = index;
      }
      recoveryEligible = true;
    }
    if (recoveryEligible) {
      const recovery = value - recoveryTroughValue;
      if (recovery > maxRecovery) {
        maxRecovery = recovery;
        maxRecoveryTroughIndex = recoveryTroughIndex;
        maxRecoveryEndIndex = index;
      }
    }
    if (value > peakValue) {
      peakValue = value;
      peakIndex = index;
    }
  }

  return success({
    maxDrawdown: {
      medals: maxDrawdown,
      ...(drawdownPeakIndex === undefined
        ? {}
        : { startIndex: drawdownPeakIndex, endIndex: drawdownTroughIndex }),
    },
    maxRecoveryAfterDecline: {
      medals: maxRecovery,
      ...(maxRecoveryTroughIndex === undefined
        ? {}
        : { startIndex: maxRecoveryTroughIndex, endIndex: maxRecoveryEndIndex }),
    },
  });
}
