import { add, divide, integer, multiply } from '../rational';
import type { Rational } from '../rational';
import { calculateBenchmark } from './benchmarks';
import { calculateDrawdownRecovery } from './drawdown';
import {
  MAX_THREE_MEDAL_GAMES,
  domainError,
  failure,
  metric,
  success,
  validateGames,
  validateNetMedals,
} from './shared';
import type {
  DrawdownRecoveryValues,
  SegmentAnalysisInput,
  SegmentAnalysisValues,
  SegmentBenchmarkValues,
  SegmentCumulativeEndpoint,
  SegmentInput,
  SegmentProvenance,
  SegmentValues,
  SlotAnalysisDomainError,
  SlotAnalysisDomainResult,
} from './types';

export const SLOT_ANALYSIS_MAX_SEGMENTS = 100;

function segmentProvenance(segment: SegmentInput, index: number): SegmentProvenance {
  return segment.provenance ?? { source: 'direct', sourceSegmentIndex: index };
}

function endpointSourceIndices(segments: readonly SegmentInput[]): readonly number[] {
  const first = segments[0]?.provenance;
  const startIndex = first?.source === 'cumulative_points' ? (first.sourceStartPointIndex ?? 0) : 0;
  return [
    startIndex,
    ...segments.map((segment, index) =>
      segment.provenance?.source === 'cumulative_points'
        ? (segment.provenance.sourceEndPointIndex ?? index + 1)
        : index + 1,
    ),
  ];
}

function mapMovementIndices(
  values: DrawdownRecoveryValues,
  sourceIndices: readonly number[],
): DrawdownRecoveryValues {
  const mapMovement = (movement: DrawdownRecoveryValues['maximumDrawdown']) => ({
    medals: movement.medals,
    ...(movement.startIndex === undefined
      ? {}
      : {
          startIndex: sourceIndices[movement.startIndex],
          endIndex: sourceIndices[movement.endIndex ?? movement.startIndex],
        }),
  });
  return {
    maximumDrawdown: mapMovement(values.maximumDrawdown),
    maximumRecoveryAfterDrawdown: mapMovement(values.maximumRecoveryAfterDrawdown),
  };
}

function segmentMetrics(
  games: number,
  netMedals: number,
): {
  readonly payoutRate: ReturnType<typeof metric>;
  readonly netMedalsPer1000Games: ReturnType<typeof metric>;
} {
  const assumedIn = integer(games * 3);
  return {
    payoutRate: metric(
      divide(multiply(add(assumedIn, integer(netMedals)), integer(100)), assumedIn),
      1,
    ),
    netMedalsPer1000Games: metric(
      divide(multiply(integer(netMedals), integer(1000)), integer(games)),
      1,
    ),
  };
}

function benchmarkValues(
  games: number,
  netMedals: number,
  benchmarkRate: number | string,
): SlotAnalysisDomainResult<Readonly<SegmentBenchmarkValues>> {
  const result = calculateBenchmark({ games, netMedals, benchmarkRate });
  if (!result.ok) return result;
  const condition =
    result.value.relation === 'above'
      ? 'above_benchmark_segment'
      : result.value.relation === 'below'
        ? 'below_benchmark_segment'
        : 'on_benchmark';
  return success({
    benchmarkRate: result.value.benchmarkRate,
    expectedNetMedals: result.value.expectedNetMedals,
    differenceNetMedals: result.value.differenceNetMedals,
    contributionNetMedals: result.value.differenceNetMedals,
    relation: result.value.relation,
    condition,
  });
}

export function analyzeSegments(
  input: SegmentAnalysisInput,
): SlotAnalysisDomainResult<Readonly<SegmentAnalysisValues>> {
  if (input.segments.length === 0) {
    return failure([domainError('segments_required', 'segments')]);
  }
  if (input.segments.length > SLOT_ANALYSIS_MAX_SEGMENTS) {
    return failure([domainError('segments_limit_exceeded', 'segments')]);
  }

  const errors: SlotAnalysisDomainError[] = [];
  let totalGamesBigInt = 0n;
  let totalNetMedalsBigInt = 0n;
  input.segments.forEach((segment, index) => {
    const gamesError = validateGames(segment.games, `segments[${index}].games`, {
      notPositive: 'segment_games_not_positive',
      notSafe: 'segment_games_not_safe',
    });
    const netError = validateNetMedals(segment.netMedals, `segments[${index}].netMedals`, {
      notInteger: 'segment_net_medals_not_integer',
      notSafe: 'segment_net_medals_not_safe',
    });
    if (gamesError) errors.push({ ...gamesError, index });
    if (netError) errors.push({ ...netError, index });
    if (!gamesError && !netError) {
      if (segment.games * 3 + segment.netMedals < 0) {
        errors.push(
          domainError('segment_assumed_out_negative', `segments[${index}].netMedals`, index),
        );
      }
      totalGamesBigInt += BigInt(segment.games);
      totalNetMedalsBigInt += BigInt(segment.netMedals);
    }
  });
  if (
    totalGamesBigInt > BigInt(MAX_THREE_MEDAL_GAMES) ||
    totalNetMedalsBigInt > BigInt(Number.MAX_SAFE_INTEGER) ||
    totalNetMedalsBigInt < BigInt(Number.MIN_SAFE_INTEGER)
  ) {
    errors.push(domainError('segment_totals_not_safe', 'segments'));
  }
  if (errors.length > 0) return failure(errors);

  const totalGames = Number(totalGamesBigInt);
  const totalNetMedals = Number(totalNetMedalsBigInt);
  const segments: SegmentValues[] = [];
  for (const [index, inputSegment] of input.segments.entries()) {
    const clonedInput: SegmentInput = {
      ...(inputSegment.label === undefined ? {} : { label: inputSegment.label }),
      games: inputSegment.games,
      netMedals: inputSegment.netMedals,
      provenance: segmentProvenance(inputSegment, index),
    };
    let segmentBenchmark: Readonly<SegmentBenchmarkValues> | undefined;
    if (input.benchmarkRate !== undefined) {
      const benchmark = benchmarkValues(
        inputSegment.games,
        inputSegment.netMedals,
        input.benchmarkRate,
      );
      if (!benchmark.ok) return benchmark;
      segmentBenchmark = benchmark.value;
    }
    segments.push({
      input: clonedInput,
      provenance: clonedInput.provenance ?? segmentProvenance(inputSegment, index),
      ...segmentMetrics(inputSegment.games, inputSegment.netMedals),
      ...(segmentBenchmark === undefined ? {} : { benchmark: segmentBenchmark }),
    });
  }

  const aggregateMetrics = segmentMetrics(totalGames, totalNetMedals);
  let aggregateBenchmark: SegmentAnalysisValues['aggregate']['benchmark'];
  if (input.benchmarkRate !== undefined) {
    const benchmark = benchmarkValues(totalGames, totalNetMedals, input.benchmarkRate);
    if (!benchmark.ok) return benchmark;
    const { condition: _condition, ...benchmarkWithoutCondition } = benchmark.value;
    aggregateBenchmark = benchmarkWithoutCondition;
  }
  const aggregate: SegmentAnalysisValues['aggregate'] = {
    aggregateGames: totalGames,
    aggregateNetMedals: totalNetMedals,
    aggregatePayoutRate: aggregateMetrics.payoutRate,
    aggregateNetMedalsPer1000Games: aggregateMetrics.netMedalsPer1000Games,
    ...(aggregateBenchmark === undefined ? {} : { benchmark: aggregateBenchmark }),
  };

  const sourceIndices = endpointSourceIndices(input.segments);
  const cumulativePoints: Array<{ netMedals: number }> = [{ netMedals: 0 }];
  const cumulativeEndpoints: SegmentCumulativeEndpoint[] = [
    {
      pointIndex: 0,
      sourceIndex: sourceIndices[0] ?? 0,
      cumulativeGames: 0,
      cumulativeNetMedals: 0,
    },
  ];
  let cumulativeGames = 0;
  let cumulativeNetMedals = 0;
  for (const [index, segment] of input.segments.entries()) {
    cumulativeGames += segment.games;
    cumulativeNetMedals += segment.netMedals;
    cumulativePoints.push({ netMedals: cumulativeNetMedals });
    cumulativeEndpoints.push({
      pointIndex: index + 1,
      sourceIndex: sourceIndices[index + 1] ?? index + 1,
      cumulativeGames,
      cumulativeNetMedals,
    });
  }
  const drawdownRecovery = calculateDrawdownRecovery(cumulativePoints);
  if (!drawdownRecovery.ok) return drawdownRecovery;

  return success({
    segments,
    aggregate,
    cumulativeEndpoints,
    drawdownRecovery: mapMovementIndices(drawdownRecovery.value, sourceIndices),
  });
}

export function sumExactContributions(segments: readonly SegmentValues[]): Rational | undefined {
  if (segments.some((segment) => segment.benchmark === undefined)) return undefined;
  return segments.reduce(
    (sum, segment) =>
      add(
        sum,
        divide(
          integer(BigInt(segment.benchmark?.contributionNetMedals.exact.numerator ?? '0')),
          integer(BigInt(segment.benchmark?.contributionNetMedals.exact.denominator ?? '1')),
        ),
      ),
    integer(0),
  );
}
