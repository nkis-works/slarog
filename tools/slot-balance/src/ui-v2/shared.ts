import { normalizeDecimalInput, normalizeIntegerInput } from '../domain/normalizers';
import type {
  SlotAnalysisDomainError,
  SlotAnalysisResultMetadata,
} from '../domain/slot-analysis-v2/types';
import type { ValidationMessage } from '../domain/types';

export interface UiError {
  readonly field?: string;
  readonly message: string;
}

const integerFormatter = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 });
const oneDecimalFormatter = new Intl.NumberFormat('ja-JP', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function byId<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!(node instanceof HTMLElement)) throw new Error(`Missing UI element: ${id}`);
  return node as T;
}

export function create<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: { readonly className?: string; readonly text?: string } = {},
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  return node;
}

export function formatInteger(value: number): string {
  return integerFormatter.format(value);
}

export function formatOneDecimal(value: number): string {
  return oneDecimalFormatter.format(value);
}

export function formatSigned(value: number, fractionDigits = 0): string {
  const formatted =
    fractionDigits === 1 ? formatOneDecimal(Math.abs(value)) : formatInteger(Math.abs(value));
  if (value === 0) return fractionDigits === 1 ? formatOneDecimal(0) : '0';
  return `${value > 0 ? '+' : '−'}${formatted}`;
}

export function requiredInteger(
  input: HTMLInputElement,
  field: string,
  label: string,
): { readonly value?: number; readonly errors: readonly UiError[] } {
  if (input.value.trim() === '')
    return { errors: [{ field, message: `${label}を入力してください。` }] };
  const normalized = normalizeIntegerInput(input.value, field, label);
  return {
    value: normalized.value,
    errors: validationErrors(normalized.messages),
  };
}

export function requiredDecimal(
  input: HTMLInputElement,
  field: string,
  label: string,
): { readonly value?: number; readonly errors: readonly UiError[] } {
  if (input.value.trim() === '')
    return { errors: [{ field, message: `${label}を入力してください。` }] };
  const normalized = normalizeDecimalInput(input.value, field, label);
  return {
    value: normalized.value,
    errors: validationErrors(normalized.messages),
  };
}

export function optionalInteger(
  input: HTMLInputElement,
  field: string,
  label: string,
): { readonly value?: number; readonly errors: readonly UiError[] } {
  if (input.value.trim() === '') return { errors: [] };
  const normalized = normalizeIntegerInput(input.value, field, label);
  return { value: normalized.value, errors: validationErrors(normalized.messages) };
}

export function optionalDecimal(
  input: HTMLInputElement,
  field: string,
  label: string,
): { readonly value?: number; readonly errors: readonly UiError[] } {
  if (input.value.trim() === '') return { errors: [] };
  const normalized = normalizeDecimalInput(input.value, field, label);
  return { value: normalized.value, errors: validationErrors(normalized.messages) };
}

export function validationErrors(messages: readonly ValidationMessage[]): UiError[] {
  return messages
    .filter(({ severity }) => severity === 'error')
    .map(({ field, correction, message }) => ({
      ...(field === undefined ? {} : { field }),
      message: correction ?? message,
    }));
}

const domainMessages: Readonly<Record<string, string>> = {
  games_not_positive: '総ゲーム数は1以上の整数で入力してください。',
  games_not_safe: '総ゲーム数の桁数を確認してください。',
  net_medals_not_integer: '差枚は整数で入力してください。',
  net_medals_not_safe: '差枚の桁数を確認してください。',
  assumed_out_negative: '差枚が小さすぎるため、想定OUTが0枚未満になります。',
  benchmark_rate_not_positive: '比較基準率は0より大きい数値で入力してください。',
  benchmark_rate_not_finite_decimal: '比較基準率を通常の数字で入力してください。',
  decimal_input_out_of_bounds: '入力した率の桁数が大きすぎます。',
  target_games_not_positive: '目標総ゲーム数は1以上で入力してください。',
  target_games_not_safe: '目標総ゲーム数の桁数を確認してください。',
  target_games_not_after_current: '目標総ゲーム数は現在の総ゲーム数より大きくしてください。',
  target_rate_not_positive: '目標出玉率は0より大きい数値で入力してください。',
  target_rate_not_finite_decimal: '目標出玉率を通常の数字で入力してください。',
  segment_games_not_positive: '区間ゲーム数は1以上で入力してください。',
  segment_games_not_safe: '区間ゲーム数の桁数を確認してください。',
  segment_net_medals_not_integer: '区間差枚は整数で入力してください。',
  segment_net_medals_not_safe: '区間差枚の桁数を確認してください。',
  segment_assumed_out_negative: 'この区間は想定OUTが0枚未満になります。',
  segment_totals_not_safe: '区間の合計が安全に計算できる範囲を超えています。',
  segment_cumulative_net_medals_not_safe: '途中の累積差枚が安全に計算できる範囲を超えています。',
  cumulative_games_not_increasing: '累積ゲーム数は前の地点より大きくしてください。',
  cumulative_games_negative: '累積ゲーム数は0以上で入力してください。',
  cumulative_games_not_integer: '累積ゲーム数は整数で入力してください。',
  cumulative_games_not_safe: '累積ゲーム数の桁数を確認してください。',
  cumulative_net_medals_not_integer: '累積差枚は整数で入力してください。',
  cumulative_net_medals_not_safe: '累積差枚の桁数を確認してください。',
  cumulative_movement_not_safe: '地点間の差枚変化が安全に計算できる範囲を超えています。',
};

export function domainErrors(
  errors: readonly SlotAnalysisDomainError[],
  mapField: (error: SlotAnalysisDomainError) => string | undefined = ({ field }) => field,
): UiError[] {
  return errors.map((error) => ({
    ...(mapField(error) === undefined ? {} : { field: mapField(error) }),
    message: domainMessages[error.code] ?? '入力条件を確認してください。',
  }));
}

export function clearErrors(): void {
  document.querySelectorAll<HTMLElement>('[data-error-for]').forEach((output) => {
    output.textContent = '';
  });
  document.querySelectorAll<HTMLElement>('[aria-invalid="true"]').forEach((control) => {
    control.removeAttribute('aria-invalid');
  });
  const summary = byId<HTMLElement>('error-summary');
  summary.hidden = true;
  byId<HTMLUListElement>('error-summary-list').replaceChildren();
}

export function showErrors(errors: readonly UiError[]): void {
  clearErrors();
  if (errors.length === 0) return;
  const unique = errors.filter(
    (error, index) =>
      errors.findIndex(
        (candidate) => candidate.message === error.message && candidate.field === error.field,
      ) === index,
  );
  const list = byId<HTMLUListElement>('error-summary-list');
  for (const error of unique) {
    const item = create('li');
    if (!error.field) {
      item.textContent = error.message;
      list.append(item);
      continue;
    }
    const input = document.querySelector<HTMLElement>(`[name="${CSS.escape(error.field)}"]`);
    const output = document.querySelector<HTMLElement>(
      `[data-error-for="${CSS.escape(error.field)}"]`,
    );
    input?.setAttribute('aria-invalid', 'true');
    if (output) output.textContent = error.message;
    if (input) {
      const link = create('button', { className: 'error-summary-link', text: error.message });
      link.type = 'button';
      link.addEventListener('click', () => {
        let ancestor = input.parentElement;
        while (ancestor) {
          if (ancestor instanceof HTMLDetailsElement) ancestor.open = true;
          ancestor = ancestor.parentElement;
        }
        input.focus({ preventScroll: true });
        input.scrollIntoView({ block: 'center' });
      });
      item.append(link);
    } else {
      item.textContent = error.message;
    }
    list.append(item);
  }
  const summary = byId<HTMLElement>('error-summary');
  summary.hidden = false;
  summary.focus({ preventScroll: true });
  summary.scrollIntoView({ block: 'center' });
}

const formulaLabels: Readonly<Record<string, string>> = {
  quick_performance_rate: '1Gあたり3枚として実績出玉率を計算',
  net_medals_per_1000_games: '差枚を1,000Gあたりへ換算',
  benchmark_expected_net_medals: '基準率に相当する差枚を計算',
  benchmark_difference: '実績と基準差枚の差を計算',
  payout_rate_sensitivity: '100枚変化時の出玉率ポイントを計算',
  target_total_net_medals: '目標総差枚を計算',
  target_required_future_net_medals: '残り区間の必要差枚を計算',
  target_required_future_payout_rate: '残り区間の境界出玉率を計算',
  cumulative_point_difference: '隣接する累積地点を区間へ変換',
  segment_performance_rate: '各区間の実績出玉率を計算',
  segment_benchmark_contribution: '各区間の基準に対する寄与を計算',
  aggregate_performance_rate: '全区間の合計から実績出玉率を再計算',
  maximum_endpoint_drawdown: '入力地点間の最大下落を計算',
  maximum_recovery_after_drawdown: '下落後の最大回復を計算',
};

const assumptionLabels: Readonly<Record<string, string>> = {
  three_medals_per_game: '1Gあたり3枚投入の想定値です。',
  benchmark_is_comparison_not_prediction: '比較基準は設定や未来の予測ではありません。',
  mathematical_boundary_not_prediction: '数学上の境界で、到達や将来結果を保証しません。',
  cumulative_points_are_observations: '入力した累積地点の差分だけを区間として扱います。',
  endpoint_movements_only: '最大下落・回復は入力地点の終点間だけで計算します。',
};

const roundingLabels: Readonly<Record<string, string>> = {
  half_away_from_zero_to_one_decimal: '出玉率は小数第2位を四捨五入し、小数1桁で表示します。',
  half_away_from_zero_to_integer_medal: '差枚は四捨五入して整数枚で表示します。',
  ceil_to_integer_medal_boundary: '必要差枚は不足しない整数境界へ切り上げます。',
};

const warningLabels: Readonly<Record<string, string>> = {
  future_out_clamped_to_zero: '必要OUTが負になるため、実行可能な0枚へ境界を調整しました。',
};

function uniqueCodes(
  metadata: readonly SlotAnalysisResultMetadata[],
  key: 'formulaIds' | 'assumptionCodes' | 'roundingCodes' | 'warningCodes',
): string[] {
  return [...new Set(metadata.flatMap((item) => item[key]))];
}

export function renderMetadata(
  container: HTMLElement,
  metadata: readonly SlotAnalysisResultMetadata[],
  facts: readonly string[] = [],
): void {
  const fragment = document.createDocumentFragment();
  const groups = [
    ['使用した計算', uniqueCodes(metadata, 'formulaIds'), formulaLabels],
    ['前提', uniqueCodes(metadata, 'assumptionCodes'), assumptionLabels],
    ['丸め', uniqueCodes(metadata, 'roundingCodes'), roundingLabels],
    ['注意', uniqueCodes(metadata, 'warningCodes'), warningLabels],
  ] as const;
  if (facts.length > 0) {
    const heading = create('h4', { text: '算出した条件' });
    const list = create('ul');
    for (const fact of facts) list.append(create('li', { text: fact }));
    fragment.append(heading, list);
  }
  for (const [title, codes, labels] of groups) {
    const visibleLabels = codes.flatMap((code) => (labels[code] ? [labels[code]] : []));
    if (visibleLabels.length === 0) continue;
    const heading = create('h4', { text: title });
    const list = create('ul');
    for (const label of visibleLabels) list.append(create('li', { text: label }));
    fragment.append(heading, list);
  }
  container.replaceChildren(fragment);
}

export function announce(message: string): void {
  byId<HTMLElement>('live-region').textContent = message;
}
