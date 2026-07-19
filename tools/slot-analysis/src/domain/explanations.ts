import type {
  CalculationExplanation,
  CoinHoldInput,
  CoinHoldValues,
  InOutValues,
  InvestmentRecoveryValues,
  KnowledgeBoundary,
  NetMedalsInput,
  NetMedalsValues,
  NormalizedInvestmentRecoveryInput,
  SegmentsValues,
} from './types';

export const NET_MEDALS_KNOWLEDGE: KnowledgeBoundary = {
  known: [
    { code: 'estimated_payout_rate', label: '3枚掛け換算の差枚ベース出玉率' },
    { code: 'net_per_1000_games', label: '1,000Gあたり差枚' },
    { code: 'calculation_games', label: '計算対象G数' },
  ],
  unknown: [
    { code: 'exact_in_out', label: '実測したIN／OUT' },
    { code: 'actual_setting', label: '実際の設定' },
    { code: 'future_output', label: '今後の出玉' },
    { code: 'exact_coin_hold', label: '正確な通常時コイン持ち' },
    { code: 'cash_recovery', label: '現金投資の回収状況' },
    { code: 'continue_or_stop', label: '続行／ヤメの正解' },
  ],
};

export const INVESTMENT_KNOWLEDGE: KnowledgeBoundary = {
  known: [
    { code: 'exchange_estimate', label: '入力した交換条件での交換見込額' },
    { code: 'cash_recovery_line', label: '現金投資回収ライン' },
    { code: 'total_recovery_line', label: '貯メダル込み回収ライン' },
    { code: 'recovery_rates', label: '入力条件に基づく回収率' },
  ],
  unknown: [
    { code: 'prize_composition', label: '特殊景品構成による最終金額' },
    { code: 'venue_rounding', label: '店舗固有の端数処理' },
    { code: 'actual_setting', label: '実際の設定' },
    { code: 'future_output', label: '今後の出玉' },
    { code: 'continue_or_stop', label: '続行／ヤメの正解' },
  ],
};

export const SEGMENTS_KNOWLEDGE: KnowledgeBoundary = {
  known: [
    { code: 'segment_net_medals', label: '各区間と合計の差枚' },
    { code: 'aggregate_estimated_rate', label: '総ゲーム数・総差枚から再計算した実績出玉率' },
  ],
  unknown: NET_MEDALS_KNOWLEDGE.unknown,
};

export const IN_OUT_KNOWLEDGE: KnowledgeBoundary = {
  known: [
    { code: 'actual_in_out_rate', label: '入力した実IN／OUTに基づく出玉率' },
    { code: 'actual_net_medals', label: 'INとOUTの差' },
  ],
  unknown: [
    { code: 'actual_setting', label: '実際の設定' },
    { code: 'future_output', label: '今後の出玉' },
    { code: 'continue_or_stop', label: '続行／ヤメの正解' },
  ],
};

export const COIN_HOLD_KNOWLEDGE: KnowledgeBoundary = {
  known: [{ code: 'coin_hold_from_interval', label: '入力した通常時区間のコイン持ち' }],
  unknown: [
    { code: 'machine_published_coin_hold', label: '機種公表値そのもの' },
    { code: 'future_coin_hold', label: '今後のコイン持ち' },
    { code: 'actual_setting', label: '実際の設定' },
  ],
};

export function explainNetMedals(
  input: NetMedalsInput,
  values: NetMedalsValues,
): CalculationExplanation[] {
  const explanations: CalculationExplanation[] = [
    {
      resultCode: 'netMedalsPer1000G',
      title: '1,000Gあたり差枚',
      inputs: [
        { label: 'ゲーム数', value: input.games, unit: 'G' },
        { label: '差枚', value: input.netMedals, unit: '枚' },
      ],
      steps: [
        { expression: `${input.netMedals} ÷ ${input.games} × 1,000` },
        { expression: '表示値', value: values.netMedalsPer1000G.display },
      ],
      assumptions: ['ゲーム数と差枚は同じ対象範囲です。'],
    },
  ];
  if (values.payoutRateEstimate) {
    explanations.unshift({
      resultCode: 'payoutRateEstimate',
      title: '差枚ベース出玉率',
      inputs: [
        { label: 'ゲーム数', value: input.games, unit: 'G' },
        { label: '差枚', value: input.netMedals, unit: '枚' },
      ],
      steps: [
        { expression: `${input.games} × 3`, value: values.assumedIn },
        { expression: `${values.assumedIn} + (${input.netMedals})`, value: values.assumedOut },
        {
          expression: `${values.assumedOut} ÷ ${values.assumedIn} × 100`,
          value: values.payoutRateEstimate.display,
        },
      ],
      assumptions: ['1Gあたり3枚掛けとして換算します。', '実IN／OUTそのものではありません。'],
    });
  }
  return explanations;
}

export function explainInvestmentRecovery(
  input: NormalizedInvestmentRecoveryInput,
  values: InvestmentRecoveryValues,
): CalculationExplanation[] {
  return [
    {
      resultCode: 'currentExchangeEstimateYen',
      title: '交換見込額',
      inputs: [
        { label: '現在枚数', value: input.currentMedals, unit: '枚' },
        { label: '交換条件', value: input.exchangeMedalsPer1000Yen ?? '-', unit: '枚/1,000円' },
      ],
      steps: [
        {
          expression: '現在枚数 × 1,000 ÷ 交換枚数',
          value: values.currentTheoreticalExchangeYen.approximate,
        },
        { expression: '交換単位を反映', value: values.currentExchangeEstimateYen },
      ],
      assumptions: [
        input.exchangeUnitYen
          ? `${input.exchangeUnitYen}円単位で切り捨てます。`
          : '交換単位未指定のため1円未満を切り捨てます。',
      ],
    },
    {
      resultCode: 'cashNetEstimateYen',
      title: '現金ベース交換見込差額',
      inputs: [
        { label: '現金投資額', value: input.cashInvestmentYen, unit: '円' },
        { label: '交換済み金額', value: input.alreadyExchangedYen, unit: '円' },
      ],
      steps: [
        { expression: '交換済み金額 + 現在交換見込', value: values.grossReturnEstimateYen },
        { expression: '総回収見込 - 現金投資', value: values.cashNetEstimateYen },
      ],
      assumptions: ['未交換の現在枚数を含むため、確定した現金収支ではありません。'],
    },
    {
      resultCode: 'storedMedalValueYen',
      title: '使用した貯メダルの価値',
      inputs: [{ label: '使用貯メダル', value: input.storedMedalsUsed, unit: '枚' }],
      steps: [
        {
          expression: '使用枚数 × 1,000 ÷ 交換枚数',
          value: values.storedMedalValueYen.approximate,
        },
      ],
      assumptions: ['交換条件で機会費用評価し、交換単位による切り捨ては適用しません。'],
    },
  ];
}

export function explainSegments(values: SegmentsValues): CalculationExplanation[] {
  return [
    {
      resultCode: 'aggregateRate',
      title: '集計差枚ベース出玉率',
      inputs: [
        { label: '合計ゲーム数', value: values.totalGames, unit: 'G' },
        { label: '合計差枚', value: values.totalNetMedals, unit: '枚' },
      ],
      steps: [
        {
          expression: '(合計G × 3 + 合計差枚) ÷ (合計G × 3) × 100',
          value: values.aggregate.payoutRateEstimate?.display,
        },
      ],
      assumptions: ['各区間率の単純平均は使用しません。', '1Gあたり3枚投入の想定に基づきます。'],
    },
  ];
}

export function explainInOut(values: InOutValues): CalculationExplanation[] {
  return [
    {
      resultCode: 'payoutRate',
      title: '実IN／OUT出玉率',
      inputs: [
        { label: '実IN', value: values.totalIn, unit: '枚' },
        { label: '実OUT', value: values.totalOut, unit: '枚' },
      ],
      steps: [
        {
          expression: `${values.totalOut} ÷ ${values.totalIn} × 100`,
          value: values.payoutRate.display,
        },
        { expression: `${values.totalOut} - ${values.totalIn}`, value: values.actualNetMedals },
      ],
      assumptions: ['入力された実IN／OUTから計算します。', '複数区間は合計IN／OUTを使用します。'],
    },
  ];
}

export function explainCoinHold(
  input: CoinHoldInput,
  values: CoinHoldValues,
): CalculationExplanation[] {
  return [
    {
      resultCode: 'coinHoldPer50',
      title: '通常時のコイン持ち',
      inputs: [
        { label: '通常時ゲーム数', value: input.normalGames, unit: 'G' },
        { label: '正味使用枚数', value: values.netUsedMedals, unit: '枚' },
      ],
      steps: [
        {
          expression: `${input.normalGames} ÷ ${values.netUsedMedals} × 50`,
          value: values.coinHoldPer50.display,
        },
      ],
      assumptions: ['通常時だけの区間です。', 'AT・ボーナスを含みません。'],
    },
  ];
}
