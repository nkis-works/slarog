import { analyzeSegments } from './segments';
import { MAX_THREE_MEDAL_GAMES, domainError, failure, success, validateNetMedals } from './shared';
import type {
  CumulativePointAnalysisInput,
  CumulativePointAnalysisValues,
  CumulativePointConversionInput,
  CumulativePointConversionValues,
  CumulativePointInput,
  SegmentInput,
  SlotAnalysisDomainError,
  SlotAnalysisDomainResult,
} from './types';

export function convertCumulativePoints(
  input: CumulativePointConversionInput,
): SlotAnalysisDomainResult<Readonly<CumulativePointConversionValues>> {
  if (input.points.length < 2) {
    return failure([domainError('cumulative_points_required', 'points')]);
  }
  if (input.points.length > 101) {
    return failure([domainError('cumulative_points_limit_exceeded', 'points')]);
  }

  const errors: SlotAnalysisDomainError[] = [];
  const points: CumulativePointInput[] = input.points.map((point) => ({
    ...(point.label === undefined ? {} : { label: point.label }),
    games: point.games,
    netMedals: point.netMedals,
  }));
  points.forEach((point, index) => {
    if (!Number.isInteger(point.games)) {
      errors.push(domainError('cumulative_games_not_integer', `points[${index}].games`, index));
    } else if (!Number.isSafeInteger(point.games) || point.games > MAX_THREE_MEDAL_GAMES) {
      errors.push(domainError('cumulative_games_not_safe', `points[${index}].games`, index));
    } else if (point.games < 0) {
      errors.push(domainError('cumulative_games_negative', `points[${index}].games`, index));
    }
    const netError = validateNetMedals(point.netMedals, `points[${index}].netMedals`, {
      notInteger: 'cumulative_net_medals_not_integer',
      notSafe: 'cumulative_net_medals_not_safe',
    });
    if (netError) errors.push({ ...netError, index });
    if (index > 0 && Number.isSafeInteger(point.games)) {
      const previousGames = points[index - 1]?.games;
      if (previousGames !== undefined && point.games <= previousGames) {
        errors.push(
          domainError('cumulative_games_not_increasing', `points[${index}].games`, index),
        );
      }
    }
  });
  if (errors.length > 0) return failure(errors);

  const segments: SegmentInput[] = [];
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    if (!start || !end) continue;
    const games = end.games - start.games;
    const netMedalsBigInt = BigInt(end.netMedals) - BigInt(start.netMedals);
    if (
      netMedalsBigInt > BigInt(Number.MAX_SAFE_INTEGER) ||
      netMedalsBigInt < BigInt(Number.MIN_SAFE_INTEGER)
    ) {
      return failure([
        domainError('segment_net_medals_not_safe', `points[${index}].netMedals`, index),
      ]);
    }
    const netMedals = Number(netMedalsBigInt);
    if (games * 3 + netMedals < 0) {
      return failure([
        domainError('segment_assumed_out_negative', `points[${index}].netMedals`, index),
      ]);
    }
    segments.push({
      ...(start.label !== undefined && end.label !== undefined
        ? { label: `${start.label} → ${end.label}` }
        : {}),
      games,
      netMedals,
      provenance: {
        source: 'cumulative_points',
        sourceStartPointIndex: index - 1,
        sourceEndPointIndex: index,
      },
    });
  }

  return success({ points, segments });
}

export function analyzeCumulativePoints(
  input: CumulativePointAnalysisInput,
): SlotAnalysisDomainResult<Readonly<CumulativePointAnalysisValues>> {
  const conversion = convertCumulativePoints(input);
  if (!conversion.ok) return conversion;
  const analysis = analyzeSegments({
    segments: conversion.value.segments,
    ...(input.benchmarkRate === undefined ? {} : { benchmarkRate: input.benchmarkRate }),
  });
  if (!analysis.ok) return analysis;
  return success({ points: conversion.value.points, ...analysis.value });
}
