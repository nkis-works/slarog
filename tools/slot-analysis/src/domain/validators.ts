import { compare, decimal, integer } from './rational';
import { VALIDATION_THRESHOLDS } from './thresholds';
import type {
  CoinHoldInput,
  InOutInput,
  InvestmentRecoveryInput,
  NetMedalsInput,
  SegmentsInput,
  ValidationMessage,
  ValidationSeverity,
} from './types';

function message(
  severity: ValidationSeverity,
  code: string,
  field: string | undefined,
  text: string,
  correction?: string,
): ValidationMessage {
  return { severity, code, field, message: text, correction };
}

function isPositiveDecimal(value: number | string): boolean {
  try {
    return compare(decimal(value), integer(0)) > 0;
  } catch {
    return false;
  }
}

function validateSafeInteger(value: number, field: string, label: string): ValidationMessage[] {
  if (Number.isSafeInteger(value)) return [];
  return [
    message(
      'error',
      'integer_required',
      field,
      `${label}は安全に扱える整数で入力してください。`,
      '小数や極端に大きな値を避け、整数へ修正してください。',
    ),
  ];
}

export function partitionValidationMessages(messages: ValidationMessage[]): {
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
  info: ValidationMessage[];
} {
  return {
    errors: messages.filter(({ severity }) => severity === 'error'),
    warnings: messages.filter(({ severity }) => severity === 'warning'),
    info: messages.filter(({ severity }) => severity === 'info'),
  };
}

export function validateNetMedals(input: NetMedalsInput): ValidationMessage[] {
  const messages = [
    ...validateSafeInteger(input.games, 'games', 'ゲーム数'),
    ...validateSafeInteger(input.netMedals, 'netMedals', '差枚'),
  ];
  if (!Number.isSafeInteger(input.games) || !Number.isSafeInteger(input.netMedals)) {
    return messages;
  }
  if (input.games <= 0) {
    messages.push(
      message(
        'error',
        'games_not_positive',
        'games',
        'ゲーム数は1G以上で入力してください。',
        '計算対象のゲーム数を確認して、1以上へ修正してください。',
      ),
    );
  }
  if (input.netMedals === 0) {
    messages.push(message('info', 'net_medals_zero', 'netMedals', '差枚0枚として計算します。'));
  } else if (input.netMedals < 0) {
    messages.push(
      message('info', 'net_medals_negative', 'netMedals', 'マイナス差枚として計算します。'),
    );
  }
  if (
    input.gamesScope !== undefined &&
    input.netMedalsScope !== undefined &&
    input.gamesScope !== input.netMedalsScope
  ) {
    messages.push(
      message(
        'warning',
        'scope_mismatch',
        undefined,
        'ゲーム数と差枚の対象範囲が異なる可能性があります。',
        'どちらも自分の実戦、台の当日、同じ任意区間のいずれかへ揃えてください。',
      ),
    );
  }
  if (input.games > VALIDATION_THRESHOLDS.extremeGames) {
    messages.push(
      message(
        'warning',
        'extreme_games',
        'games',
        'ゲーム数が通常より大きい値です。',
        '桁数と対象期間を確認してください。',
      ),
    );
  }
  if (Math.abs(input.netMedals) > VALIDATION_THRESHOLDS.extremeNetMedals) {
    messages.push(
      message(
        'warning',
        'extreme_net_medals',
        'netMedals',
        '差枚が通常より大きい値です。',
        '桁数と対象範囲を確認してください。',
      ),
    );
  }
  if (input.games > 0 && input.games * 3 + input.netMedals < 0) {
    messages.push(
      message(
        'warning',
        'assumed_out_negative',
        undefined,
        'このゲーム数と差枚では、3枚掛け換算OUTが0枚未満になります。',
        'ゲーム数と差枚の対象範囲が同じか確認してください。',
      ),
    );
  }
  return messages;
}

export function validateInvestmentRecovery(input: InvestmentRecoveryInput): ValidationMessage[] {
  const storedMedalsUsed = input.storedMedalsUsed ?? 0;
  const alreadyExchangedYen = input.alreadyExchangedYen ?? 0;
  const requestRecoveryLines = input.requestRecoveryLines ?? true;
  const integerFields: Array<[number, string, string]> = [
    [input.cashInvestmentYen, 'cashInvestmentYen', '現金投資額'],
    [storedMedalsUsed, 'storedMedalsUsed', '使用した貯メダル'],
    [input.currentMedals, 'currentMedals', '現在枚数'],
    [alreadyExchangedYen, 'alreadyExchangedYen', '交換済み金額'],
  ];
  const messages = integerFields.flatMap(([value, field, label]) =>
    validateSafeInteger(value, field, label),
  );
  if (messages.some(({ severity }) => severity === 'error')) return messages;

  const nonNegativeFields: Array<[number, string, string, string]> = [
    [input.cashInvestmentYen, 'cashInvestmentYen', 'negative_cash_investment', '現金投資額'],
    [storedMedalsUsed, 'storedMedalsUsed', 'negative_stored_medals', '使用した貯メダル'],
    [input.currentMedals, 'currentMedals', 'negative_current_medals', '現在枚数'],
    [alreadyExchangedYen, 'alreadyExchangedYen', 'negative_exchanged_yen', '交換済み金額'],
  ];
  for (const [value, field, code, label] of nonNegativeFields) {
    if (value < 0) {
      messages.push(
        message(
          'error',
          code,
          field,
          `${label}は0以上で入力してください。`,
          '符号と入力欄を確認してください。',
        ),
      );
    }
  }

  if (
    input.exchangeMedalsPer1000Yen !== undefined &&
    !isPositiveDecimal(input.exchangeMedalsPer1000Yen)
  ) {
    messages.push(
      message(
        'error',
        'invalid_exchange_rate',
        'exchangeMedalsPer1000Yen',
        '交換条件は0より大きい枚数で入力してください。',
        '1,000円分への交換に必要な枚数を確認してください。',
      ),
    );
  }
  if (input.lendMedalsPer1000Yen !== undefined && !isPositiveDecimal(input.lendMedalsPer1000Yen)) {
    messages.push(
      message(
        'error',
        'invalid_lend_rate',
        'lendMedalsPer1000Yen',
        '貸出条件は0より大きい枚数で入力してください。',
        '1,000円で貸し出される枚数を確認してください。',
      ),
    );
  }
  if (
    input.exchangeUnitYen !== undefined &&
    (!Number.isSafeInteger(input.exchangeUnitYen) || input.exchangeUnitYen <= 0)
  ) {
    messages.push(
      message(
        'error',
        'invalid_exchange_unit',
        'exchangeUnitYen',
        '交換単位は1円以上の整数で入力してください。',
        '500円、1,000円など実際の交換単位へ修正してください。',
      ),
    );
  }

  const needsExchangeRate = storedMedalsUsed > 0 || input.currentMedals > 0;
  if (needsExchangeRate && input.exchangeMedalsPer1000Yen === undefined) {
    messages.push(
      message(
        'error',
        'exchange_rate_required',
        'exchangeMedalsPer1000Yen',
        '枚数を円換算するには交換条件が必要です。',
        '1,000円分への交換に必要な枚数を入力してください。',
      ),
    );
  } else if (requestRecoveryLines && input.exchangeMedalsPer1000Yen === undefined) {
    messages.push(
      message(
        'error',
        'recovery_exchange_rate_required',
        'exchangeMedalsPer1000Yen',
        '回収ラインを枚数で求めるには交換条件が必要です。',
        '交換条件を入力するか、回収ライン計算を無効にしてください。',
      ),
    );
  }

  if (input.cashInvestmentYen === 0) {
    messages.push(
      message(
        'info',
        'cash_investment_zero',
        'cashInvestmentYen',
        '現金投資0円のため、現金回収率は表示しません。',
      ),
    );
  }
  if (input.currentMedals === 0) {
    messages.push(
      message('info', 'current_medals_zero', 'currentMedals', '現在枚数0枚として計算します。'),
    );
  }
  if (input.cashInvestmentYen > 0 && storedMedalsUsed > 0) {
    messages.push(
      message(
        'warning',
        'cash_and_stored_medals',
        undefined,
        '現金と貯メダルを併用しています。2種類の回収ラインを分けて表示します。',
      ),
    );
  }
  if (
    input.lendMedalsPer1000Yen !== undefined &&
    input.exchangeMedalsPer1000Yen !== undefined &&
    isPositiveDecimal(input.lendMedalsPer1000Yen) &&
    isPositiveDecimal(input.exchangeMedalsPer1000Yen) &&
    compare(decimal(input.lendMedalsPer1000Yen), decimal(input.exchangeMedalsPer1000Yen)) !== 0
  ) {
    messages.push(
      message(
        'warning',
        'non_equivalent_exchange',
        undefined,
        '貸出条件と交換条件が異なる非等価交換です。',
        'それぞれの入力欄が正しいか確認してください。',
      ),
    );
  }
  if (alreadyExchangedYen > 0) {
    messages.push(
      message(
        'info',
        'already_exchanged',
        'alreadyExchangedYen',
        '交換済み金額を総回収見込と残り回収ラインへ反映します。',
      ),
    );
  }
  if (
    input.netMedals !== undefined &&
    input.currentMedals > 0 &&
    input.netMedals === input.currentMedals
  ) {
    messages.push(
      message(
        'warning',
        'net_current_same_value',
        undefined,
        '差枚と現在枚数が同じ値です。入力欄を混同していないか確認してください。',
        '差枚は出玉率、現在枚数は交換見込の計算に使用します。',
      ),
    );
  }
  if (
    Math.max(input.cashInvestmentYen, alreadyExchangedYen) > VALIDATION_THRESHOLDS.extremeMoneyYen
  ) {
    messages.push(
      message(
        'warning',
        'extreme_money',
        undefined,
        '金額が通常より大きい値です。',
        '桁数を確認してください。',
      ),
    );
  }
  if (Math.max(storedMedalsUsed, input.currentMedals) > VALIDATION_THRESHOLDS.extremeMedals) {
    messages.push(
      message(
        'warning',
        'extreme_medals',
        undefined,
        '枚数が通常より大きい値です。',
        '桁数を確認してください。',
      ),
    );
  }
  return messages;
}

export function validateSegments(input: SegmentsInput): ValidationMessage[] {
  const messages: ValidationMessage[] = [];
  if (input.segments.length === 0) {
    return [
      message(
        'error',
        'segments_required',
        'segments',
        '区間を1件以上入力してください。',
        '区間名、ゲーム数、差枚を追加してください。',
      ),
    ];
  }
  if (input.segments.length > 100) {
    return [
      message(
        'error',
        'segments_limit_exceeded',
        'segments',
        '区間は100件まで入力できます。',
        '対象を分けるか、不要な区間を削除してください。',
      ),
    ];
  }
  input.segments.forEach((segment, index) => {
    for (const item of validateNetMedals({ games: segment.games, netMedals: segment.netMedals })) {
      messages.push({ ...item, field: `segments.${index}.${item.field ?? 'range'}` });
    }
    if (
      segment.startGame !== undefined &&
      segment.endGame !== undefined &&
      segment.endGame < segment.startGame
    ) {
      messages.push(
        message(
          'error',
          'segment_range_reversed',
          `segments.${index}.endGame`,
          '終了Gが開始Gより小さくなっています。',
          '開始Gと終了Gを入れ替えるか、対象区間を確認してください。',
        ),
      );
    }
  });

  const ranges = input.segments
    .map((segment, index) => ({ index, start: segment.startGame, end: segment.endGame }))
    .filter(
      (range): range is { index: number; start: number; end: number } =>
        range.start !== undefined && range.end !== undefined && range.end >= range.start,
    )
    .sort((left, right) => left.start - right.start);
  for (let index = 1; index < ranges.length; index += 1) {
    const previous = ranges[index - 1];
    const current = ranges[index];
    if (previous && current && current.start < previous.end) {
      messages.push(
        message(
          'error',
          'segment_range_overlap',
          `segments.${current.index}.startGame`,
          '入力した区間が重複しています。',
          '各区間が重ならないように開始Gと終了Gを修正してください。',
        ),
      );
    }
  }
  return messages;
}

export function validateInOut(input: InOutInput): ValidationMessage[] {
  const messages: ValidationMessage[] = [];
  if ((input.segments?.length ?? 0) > 100) {
    return [
      message(
        'error',
        'segments_limit_exceeded',
        'segments',
        'IN／OUT区間は100件まで入力できます。',
        '対象を分けるか、不要な区間を削除してください。',
      ),
    ];
  }
  const hasSegments = (input.segments?.length ?? 0) > 0;
  const hasDirect = input.actualIn !== undefined || input.actualOut !== undefined;
  if (!hasSegments && !hasDirect) {
    return [
      message(
        'error',
        'in_out_values_required',
        undefined,
        '実INと実OUT、またはIN／OUT区間を入力してください。',
        '同じ対象範囲のINとOUTを揃えてください。',
      ),
    ];
  }
  if (hasSegments && hasDirect) {
    messages.push(
      message(
        'warning',
        'in_out_source_conflict',
        undefined,
        '直接入力と区間入力の両方があります。区間入力を使用します。',
        '使用しない入力をクリアしてください。',
      ),
    );
  }
  const values = hasSegments
    ? (input.segments ?? []).map((segment, index) => ({
        actualIn: segment.actualIn,
        actualOut: segment.actualOut,
        prefix: `segments.${index}`,
      }))
    : [{ actualIn: input.actualIn, actualOut: input.actualOut, prefix: '' }];
  for (const value of values) {
    if (
      value.actualIn === undefined ||
      !Number.isSafeInteger(value.actualIn) ||
      value.actualIn <= 0
    ) {
      messages.push(
        message(
          'error',
          'actual_in_not_positive',
          value.prefix ? `${value.prefix}.actualIn` : 'actualIn',
          '実INは1枚以上の整数で入力してください。',
          '同じ対象範囲の実INを確認してください。',
        ),
      );
    }
    if (
      value.actualOut === undefined ||
      !Number.isSafeInteger(value.actualOut) ||
      value.actualOut < 0
    ) {
      messages.push(
        message(
          'error',
          'actual_out_negative',
          value.prefix ? `${value.prefix}.actualOut` : 'actualOut',
          '実OUTは0枚以上の整数で入力してください。',
          '同じ対象範囲の実OUTを確認してください。',
        ),
      );
    }
  }
  return messages;
}

export function validateCoinHold(input: CoinHoldInput, netUsedMedals: number): ValidationMessage[] {
  const messages: ValidationMessage[] = [];
  if (!Number.isSafeInteger(input.normalGames) || input.normalGames <= 0) {
    messages.push(
      message(
        'error',
        'normal_games_not_positive',
        'normalGames',
        '通常時ゲーム数は1G以上の整数で入力してください。',
        'AT・ボーナスを除いた通常時区間のG数を確認してください。',
      ),
    );
  }
  if (!Number.isSafeInteger(netUsedMedals) || netUsedMedals <= 0) {
    messages.push(
      message(
        'error',
        'net_used_medals_not_positive',
        input.method === 'direct' ? 'netUsedMedals' : 'breakdown',
        '通常時区間の正味使用枚数は1枚以上にしてください。',
        '開始、追加、終了、持ち出し枚数の入力を確認してください。',
      ),
    );
  }
  if (!input.atBonusExcluded) {
    messages.push(
      message(
        'info',
        'at_bonus_not_excluded',
        'atBonusExcluded',
        'AT・ボーナスを含む区間では通常時コイン持ちを計算しません。',
        '通常時だけの区間であることを確認してください。',
      ),
    );
  }
  if (!input.scopeConfirmed) {
    messages.push(
      message(
        'info',
        'normal_scope_not_confirmed',
        'scopeConfirmed',
        '通常時だけの対象範囲が確認されていません。',
        'G数と使用枚数が同じ通常時区間であることを確認してください。',
      ),
    );
  }
  return messages;
}
