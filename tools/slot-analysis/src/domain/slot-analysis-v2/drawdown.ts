import { domainError, failure, success, validateNetMedals } from './shared';
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

  let peakValue = BigInt(points[0]?.netMedals ?? 0);
  let peakIndex = 0;
  let maxDrawdown = 0n;
  let drawdownPeakIndex: number | undefined;
  let drawdownTroughIndex: number | undefined;

  let recoveryEligible = false;
  let recoveryTroughValue = 0n;
  let recoveryTroughIndex = 0;
  let maxRecovery = 0n;
  let maxRecoveryTroughIndex: number | undefined;
  let maxRecoveryEndIndex: number | undefined;

  for (let index = 1; index < points.length; index += 1) {
    const value = BigInt(points[index]?.netMedals ?? 0);
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

  if (
    maxDrawdown > BigInt(Number.MAX_SAFE_INTEGER) ||
    maxRecovery > BigInt(Number.MAX_SAFE_INTEGER)
  ) {
    return failure([domainError('cumulative_movement_not_safe', 'points')]);
  }

  return success(
    {
      maximumDrawdown: {
        medals: Number(maxDrawdown),
        ...(drawdownPeakIndex === undefined
          ? {}
          : { startIndex: drawdownPeakIndex, endIndex: drawdownTroughIndex }),
      },
      maximumRecoveryAfterDrawdown: {
        medals: Number(maxRecovery),
        ...(maxRecoveryTroughIndex === undefined
          ? {}
          : { startIndex: maxRecoveryTroughIndex, endIndex: maxRecoveryEndIndex }),
      },
    },
    {
      formulaIds: ['maximum_endpoint_drawdown', 'maximum_recovery_after_drawdown'],
      assumptionCodes: ['endpoint_movements_only'],
      roundingCodes: [],
      warningCodes: [],
    },
  );
}
