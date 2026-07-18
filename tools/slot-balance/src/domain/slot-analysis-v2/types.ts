import type { ExactRational } from '../types';

export type SlotAnalysisRelation = 'above' | 'equal' | 'below';

export type BenchmarkDifferenceDisplayCode =
  'rounded_value' | 'exact_zero' | 'less_than_one_above' | 'less_than_one_below';

export type SlotAnalysisFormulaId =
  | 'quick_performance_rate'
  | 'net_medals_per_1000_games'
  | 'benchmark_expected_net_medals'
  | 'benchmark_difference'
  | 'payout_rate_sensitivity'
  | 'target_total_net_medals'
  | 'target_required_future_net_medals'
  | 'target_required_future_payout_rate'
  | 'cumulative_point_difference'
  | 'segment_performance_rate'
  | 'segment_benchmark_contribution'
  | 'aggregate_performance_rate'
  | 'maximum_endpoint_drawdown'
  | 'maximum_recovery_after_drawdown';

export type SlotAnalysisAssumptionCode =
  | 'three_medals_per_game'
  | 'benchmark_is_comparison_not_prediction'
  | 'mathematical_boundary_not_prediction'
  | 'cumulative_points_are_observations'
  | 'endpoint_movements_only';

export type SlotAnalysisRoundingCode =
  | 'half_away_from_zero_to_one_decimal'
  | 'half_away_from_zero_to_integer_medal'
  | 'ceil_to_integer_medal_boundary';

export type SlotAnalysisWarningCode = 'future_out_clamped_to_zero';

export interface SlotAnalysisResultMetadata {
  readonly calculationVersion: '2.0.0';
  readonly formulaIds: readonly SlotAnalysisFormulaId[];
  readonly assumptionCodes: readonly SlotAnalysisAssumptionCode[];
  readonly roundingCodes: readonly SlotAnalysisRoundingCode[];
  readonly warningCodes: readonly SlotAnalysisWarningCode[];
}

export type SlotAnalysisMetadataInput = Omit<SlotAnalysisResultMetadata, 'calculationVersion'>;

export type TargetReverseStatus =
  'must_gain' | 'no_net_change_required' | 'can_lose_up_to' | 'any_nonnegative_out_suffices';

export type SlotAnalysisDomainErrorCode =
  | 'games_not_positive'
  | 'games_not_safe'
  | 'net_medals_not_integer'
  | 'net_medals_not_safe'
  | 'assumed_out_negative'
  | 'benchmark_rate_not_positive'
  | 'benchmark_rate_not_finite_decimal'
  | 'target_games_not_positive'
  | 'target_games_not_safe'
  | 'target_games_not_after_current'
  | 'target_rate_not_positive'
  | 'target_rate_not_finite_decimal'
  | 'result_not_finite'
  | 'segments_required'
  | 'segments_limit_exceeded'
  | 'segment_games_not_positive'
  | 'segment_games_not_safe'
  | 'segment_net_medals_not_integer'
  | 'segment_net_medals_not_safe'
  | 'segment_assumed_out_negative'
  | 'segment_totals_not_safe'
  | 'cumulative_points_required'
  | 'cumulative_points_limit_exceeded'
  | 'cumulative_games_not_integer'
  | 'cumulative_games_not_safe'
  | 'cumulative_games_negative'
  | 'cumulative_games_not_increasing'
  | 'cumulative_net_medals_not_integer'
  | 'cumulative_net_medals_not_safe';

export interface SlotAnalysisDomainError {
  readonly code: SlotAnalysisDomainErrorCode;
  readonly field: string;
  readonly index?: number;
}

export type SlotAnalysisDomainResult<T> =
  | {
      readonly ok: true;
      readonly value: T;
      readonly metadata: SlotAnalysisResultMetadata;
      readonly errors: readonly [];
    }
  | {
      readonly ok: false;
      readonly errors: readonly SlotAnalysisDomainError[];
    };

export interface SlotAnalysisCalculatedNumber {
  readonly exact: Readonly<ExactRational>;
  readonly approximate: number;
  readonly display: number;
}

export interface BenchmarkInput {
  readonly games: number;
  readonly netMedals: number;
  readonly benchmarkRate: number | string;
}

export interface BenchmarkValues {
  readonly games: number;
  readonly netMedals: number;
  readonly benchmarkRate: Readonly<ExactRational>;
  readonly expectedNetMedals: SlotAnalysisCalculatedNumber;
  readonly differenceNetMedals: SlotAnalysisCalculatedNumber;
  readonly relation: SlotAnalysisRelation;
  readonly differenceDisplayCode: BenchmarkDifferenceDisplayCode;
}

export interface BenchmarkBatchInput {
  readonly games: number;
  readonly netMedals: number;
}

export interface SensitivityInput {
  readonly games: number;
}

export interface SensitivityValues {
  readonly games: number;
  readonly payoutRatePointsPer100Medals: SlotAnalysisCalculatedNumber;
}

export interface TargetReverseInput {
  readonly currentGames: number;
  readonly currentNetMedals: number;
  readonly targetTotalGames: number;
  readonly targetPayoutRate: number | string;
}

export interface TargetReverseValues {
  readonly currentGames: number;
  readonly currentNetMedals: number;
  readonly targetTotalGames: number;
  readonly targetPayoutRate: Readonly<ExactRational>;
  readonly remainingGames: number;
  readonly exactTargetTotalNetMedals: SlotAnalysisCalculatedNumber;
  readonly exactRequiredFutureNetMedals: SlotAnalysisCalculatedNumber;
  readonly minimumIntegerFutureNetMedals: number;
  readonly minimumFutureOutMedals: number;
  readonly requiredFuturePayoutRate: SlotAnalysisCalculatedNumber;
  readonly status: TargetReverseStatus;
  readonly allowedLossMedals?: number;
  readonly clampedToNonnegativeOut: boolean;
  readonly assumptions: readonly (
    'three_medals_per_game' | 'mathematical_boundary_not_prediction'
  )[];
  readonly warnings: readonly 'future_out_clamped_to_zero'[];
}

export type SegmentCondition =
  'above_benchmark_segment' | 'below_benchmark_segment' | 'on_benchmark';

export interface SegmentProvenance {
  readonly source: 'direct' | 'cumulative_points';
  readonly sourceSegmentIndex?: number;
  readonly sourceStartPointIndex?: number;
  readonly sourceEndPointIndex?: number;
}

export interface SegmentInput {
  readonly label?: string;
  readonly games: number;
  readonly netMedals: number;
  readonly provenance?: SegmentProvenance;
}

export interface SegmentBenchmarkValues {
  readonly benchmarkRate: Readonly<ExactRational>;
  readonly expectedNetMedals: SlotAnalysisCalculatedNumber;
  readonly differenceNetMedals: SlotAnalysisCalculatedNumber;
  readonly contributionNetMedals: SlotAnalysisCalculatedNumber;
  readonly relation: SlotAnalysisRelation;
  readonly differenceDisplayCode: BenchmarkDifferenceDisplayCode;
  readonly condition: SegmentCondition;
}

export interface SegmentValues {
  readonly input: Readonly<SegmentInput>;
  readonly provenance: SegmentProvenance;
  readonly payoutRate: SlotAnalysisCalculatedNumber;
  readonly netMedalsPer1000Games: SlotAnalysisCalculatedNumber;
  readonly benchmark?: SegmentBenchmarkValues;
}

export interface SegmentAggregateValues {
  readonly aggregateGames: number;
  readonly aggregateNetMedals: number;
  readonly aggregatePayoutRate: SlotAnalysisCalculatedNumber;
  readonly aggregateNetMedalsPer1000Games: SlotAnalysisCalculatedNumber;
  readonly benchmark?: Omit<SegmentBenchmarkValues, 'condition'>;
}

export interface IndexedMedalMovement {
  readonly medals: number;
  readonly startIndex?: number;
  readonly endIndex?: number;
}

export interface DrawdownRecoveryValues {
  readonly maximumDrawdown: IndexedMedalMovement;
  readonly maximumRecoveryAfterDrawdown: IndexedMedalMovement;
}

export interface SegmentCumulativeEndpoint {
  readonly pointIndex: number;
  readonly sourceIndex: number;
  readonly cumulativeGames: number;
  readonly cumulativeNetMedals: number;
}

export interface SegmentAnalysisInput {
  readonly segments: readonly SegmentInput[];
  readonly benchmarkRate?: number | string;
}

export interface SegmentAnalysisValues {
  readonly segments: readonly SegmentValues[];
  readonly aggregate: SegmentAggregateValues;
  readonly cumulativeEndpoints: readonly SegmentCumulativeEndpoint[];
  readonly drawdownRecovery: DrawdownRecoveryValues;
}

export interface CumulativePointInput {
  readonly label?: string;
  readonly cumulativeGames: number;
  readonly cumulativeNetMedals: number;
}

export interface CumulativePointConversionInput {
  readonly points: readonly CumulativePointInput[];
}

export interface CumulativePointConversionValues {
  readonly points: readonly Readonly<CumulativePointInput>[];
  readonly segments: readonly Readonly<SegmentInput>[];
}

export interface CumulativePointAnalysisInput extends CumulativePointConversionInput {
  readonly benchmarkRate?: number | string;
}

export interface CumulativePointAnalysisValues extends SegmentAnalysisValues {
  readonly points: readonly Readonly<CumulativePointInput>[];
}

export interface DrawdownPointInput {
  readonly netMedals: number;
}
