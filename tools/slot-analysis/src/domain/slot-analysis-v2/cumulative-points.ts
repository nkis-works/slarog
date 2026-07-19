import { analyzeSegments } from './segments';
import {
  MAX_THREE_MEDAL_GAMES,
  domainError,
  failure,
  mergeMetadata,
  segmentAssumedOutNegativeDetails,
  success,
  validateNetMedals,
} from './shared';
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
    cumulativeGames: point.cumulativeGames,
    cumulativeNetMedals: point.cumulativeNetMedals,
  }));
  points.forEach((point, index) => {
    if (!Number.isInteger(point.cumulativeGames)) {
      errors.push(
        domainError('cumulative_games_not_integer', `points[${index}].cumulativeGames`, index),
      );
    } else if (
      !Number.isSafeInteger(point.cumulativeGames) ||
      point.cumulativeGames > MAX_THREE_MEDAL_GAMES
    ) {
      errors.push(
        domainError('cumulative_games_not_safe', `points[${index}].cumulativeGames`, index),
      );
    } else if (point.cumulativeGames < 0) {
      errors.push(
        domainError('cumulative_games_negative', `points[${index}].cumulativeGames`, index),
      );
    }
    const netError = validateNetMedals(
      point.cumulativeNetMedals,
      `points[${index}].cumulativeNetMedals`,
      {
        notInteger: 'cumulative_net_medals_not_integer',
        notSafe: 'cumulative_net_medals_not_safe',
      },
    );
    if (netError) errors.push({ ...netError, index });
    if (index > 0 && Number.isSafeInteger(point.cumulativeGames)) {
      const previousGames = points[index - 1]?.cumulativeGames;
      if (previousGames !== undefined && point.cumulativeGames <= previousGames) {
        errors.push(
          domainError('cumulative_games_not_increasing', `points[${index}].cumulativeGames`, index),
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
    const games = end.cumulativeGames - start.cumulativeGames;
    const netMedalsBigInt = BigInt(end.cumulativeNetMedals) - BigInt(start.cumulativeNetMedals);
    if (
      netMedalsBigInt > BigInt(Number.MAX_SAFE_INTEGER) ||
      netMedalsBigInt < BigInt(Number.MIN_SAFE_INTEGER)
    ) {
      return failure([
        domainError('segment_net_medals_not_safe', `points[${index}].cumulativeNetMedals`, index),
      ]);
    }
    const netMedals = Number(netMedalsBigInt);
    if (BigInt(games) * 3n + netMedalsBigInt < 0n) {
      return failure([
        domainError(
          'segment_assumed_out_negative',
          `points[${index}].cumulativeNetMedals`,
          index,
          segmentAssumedOutNegativeDetails({
            startPointIndex: index - 1,
            endPointIndex: index,
            segmentGames: games,
            segmentNetMedals: netMedals,
            startCumulativeNetMedals: BigInt(start.cumulativeNetMedals),
          }),
        ),
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

  return success(
    { points, segments },
    {
      formulaIds: ['cumulative_point_difference'],
      assumptionCodes: ['cumulative_points_are_observations'],
      roundingCodes: [],
      warningCodes: [],
    },
  );
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
  const cumulativeEndpoints = conversion.value.points.map((point, index) => ({
    pointIndex: index,
    sourceIndex: index,
    cumulativeGames: point.cumulativeGames,
    cumulativeNetMedals: point.cumulativeNetMedals,
  }));
  return success(
    { ...analysis.value, points: conversion.value.points, cumulativeEndpoints },
    mergeMetadata(conversion.metadata, analysis.metadata),
  );
}
