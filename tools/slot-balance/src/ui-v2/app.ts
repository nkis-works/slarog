import { calculateCoinHold } from '../domain/calculators/coin-hold';
import { calculateInOut } from '../domain/calculators/in-out';
import { calculateInvestmentRecovery } from '../domain/calculators/investment-recovery';
import { calculateStandardBenchmarks } from '../domain/slot-analysis-v2/benchmarks';
import { calculateQuickPerformance } from '../domain/slot-analysis-v2/quick-performance';
import { calculatePayoutRateSensitivity } from '../domain/slot-analysis-v2/sensitivity';
import { calculateTargetReverse } from '../domain/slot-analysis-v2/target-reverse';
import type { BenchmarkValues, QuickPerformanceValues } from '../domain/slot-analysis-v2/types';
import type { CalculationResult, ValidationMessage } from '../domain/types';
import { setupSegmentsUi } from './segments';
import {
  announce,
  byId,
  clearErrors,
  create,
  domainErrors,
  formatInteger,
  formatOneDecimal,
  formatSigned,
  optionalDecimal,
  optionalInteger,
  renderMetadata,
  requiredDecimal,
  requiredInteger,
  showErrors,
  validationErrors,
  type UiError,
} from './shared';

interface QuickSnapshot {
  readonly games: number;
  readonly netMedals: number;
  readonly quick: QuickPerformanceValues;
  readonly benchmarks: readonly Readonly<BenchmarkValues>[];
}

let quickSnapshot: QuickSnapshot | undefined;
let quickStale = false;
let activePanel: string | undefined;

const quickForm = byId<HTMLFormElement>('quick-form');
const quickGames = byId<HTMLInputElement>('quick-games');
const quickNet = byId<HTMLInputElement>('quick-net');
const quickResult = byId<HTMLElement>('quick-result');
const launchers = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-launcher]'));
const analysisPanels = Array.from(document.querySelectorAll<HTMLElement>('[data-analysis-panel]'));
const segmentsUi = setupSegmentsUi();

function resultMetric(label: string, value: string): HTMLElement {
  const item = create('div');
  item.append(create('span', { text: label }), create('strong', { text: value }));
  return item;
}

function focusResult(container: HTMLElement): void {
  const heading = container.querySelector<HTMLElement>('h2, h3');
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  heading.scrollIntoView({ block: 'center' });
}

function benchmarkDifference(value: Readonly<BenchmarkValues>): {
  readonly text: string;
  readonly relation: string;
  readonly className: string;
} {
  if (value.differenceDisplayCode === 'exact_zero') {
    return { text: '差0枚', relation: '基準通り', className: 'relation-neutral' };
  }
  if (value.differenceDisplayCode === 'less_than_one_above') {
    return { text: '差は1枚未満', relation: '上回る', className: 'relation-positive' };
  }
  if (value.differenceDisplayCode === 'less_than_one_below') {
    return { text: '差は1枚未満', relation: '下回る', className: 'relation-negative' };
  }
  const above = value.relation === 'above';
  return {
    text: `${formatSigned(value.differenceNetMedals.display)}枚`,
    relation: above ? '上回る' : '下回る',
    className: above ? 'relation-positive' : 'relation-negative',
  };
}

function renderQuickBenchmarks(values: readonly Readonly<BenchmarkValues>[]): void {
  const list = byId<HTMLElement>('quick-benchmark-list');
  const summary = byId<HTMLElement>('quick-benchmark-summary');
  summary.hidden = true;
  const rows = values.map((value) => {
    const rate = Number(value.benchmarkRate.numerator) / Number(value.benchmarkRate.denominator);
    const difference = benchmarkDifference(value);
    const row = create('button', { className: 'benchmark-row' });
    row.type = 'button';
    row.dataset['quickBenchmark'] = String(rate);
    row.setAttribute('aria-pressed', 'false');
    row.append(
      create('strong', { text: `${formatInteger(rate)}%` }),
      create('span', {
        text: `基準差枚 ${formatSigned(value.expectedNetMedals.display)}枚`,
      }),
      create('span', {
        className: difference.className,
        text:
          value.differenceDisplayCode === 'exact_zero'
            ? '実績は基準差枚と一致'
            : value.differenceDisplayCode === 'less_than_one_above' ||
                value.differenceDisplayCode === 'less_than_one_below'
              ? `実績は1枚未満${difference.relation}`
              : `実績は ${difference.text}${difference.relation}`,
      }),
    );
    row.addEventListener('click', () => {
      rows.forEach((button) => button.setAttribute('aria-pressed', String(button === row)));
      summary.textContent =
        value.differenceDisplayCode === 'exact_zero'
          ? `この入力は${formatInteger(rate)}%基準の差枚と一致します。`
          : value.differenceDisplayCode === 'less_than_one_above'
            ? `この入力は${formatInteger(rate)}%基準の差枚を1枚未満上回ります。`
            : value.differenceDisplayCode === 'less_than_one_below'
              ? `この入力は${formatInteger(rate)}%基準の差枚を1枚未満下回ります。`
              : `この入力は${formatInteger(rate)}%基準の差枚を${formatInteger(Math.abs(value.differenceNetMedals.display))}枚${value.relation === 'above' ? '上回ります' : '下回ります'}。`;
      summary.hidden = false;
      announce(`${formatInteger(rate)}%基準を選択しました。`);
    });
    return row;
  });
  list.replaceChildren(...rows);
}

function quickField(errorField: string): string | undefined {
  if (errorField === 'games') return 'quick.games';
  if (errorField === 'netMedals') return 'quick.netMedals';
  return undefined;
}

function renderQuick(): void {
  const games = requiredInteger(quickGames, 'quick.games', '総ゲーム数');
  const net = requiredInteger(quickNet, 'quick.netMedals', '差枚');
  const errors = [...games.errors, ...net.errors];
  if (errors.length > 0 || games.value === undefined || net.value === undefined) {
    showErrors(errors);
    return;
  }
  const quick = calculateQuickPerformance({ games: games.value, netMedals: net.value });
  if (!quick.ok) {
    showErrors(domainErrors(quick.errors, ({ field }) => quickField(field)));
    return;
  }
  const benchmarks = calculateStandardBenchmarks({ games: games.value, netMedals: net.value });
  const sensitivity = calculatePayoutRateSensitivity({ games: games.value });
  if (!benchmarks.ok || !sensitivity.ok) {
    const failures = [
      ...(benchmarks.ok ? [] : benchmarks.errors),
      ...(sensitivity.ok ? [] : sensitivity.errors),
    ];
    showErrors(domainErrors(failures, ({ field }) => quickField(field)));
    return;
  }

  clearErrors();
  closePanels();
  quickSnapshot = {
    games: games.value,
    netMedals: net.value,
    quick: quick.value,
    benchmarks: benchmarks.value,
  };
  quickStale = false;
  setStale(false);
  byId('quick-rate').textContent = `${formatOneDecimal(quick.value.payoutRate.display)}%`;
  byId('quick-input-summary').textContent =
    `${formatInteger(games.value)}G / ${formatSigned(net.value)}枚`;
  byId('quick-per-1000').textContent =
    `${formatSigned(quick.value.netMedalsPer1000Games.display)}枚 / 1,000G`;
  renderQuickBenchmarks(benchmarks.value);
  renderMetadata(
    byId('quick-condition-content'),
    [quick.metadata, benchmarks.metadata, sensitivity.metadata],
    [
      `想定IN ${formatInteger(quick.value.assumedInMedals)}枚`,
      `想定OUT ${formatInteger(quick.value.assumedOutMedals)}枚`,
      `100枚で出玉率が約${formatOneDecimal(sensitivity.value.payoutRatePointsPer100Medals.display)}ポイント動く`,
    ],
  );
  quickResult.hidden = false;
  quickResult.classList.remove('is-stale');
  const resultTitle = byId<HTMLElement>('quick-result-title');
  resultTitle.focus({ preventScroll: true });
  resultTitle.scrollIntoView({ block: 'center' });
  announce('計算結果を表示しました。');
}

function setStale(stale: boolean): void {
  quickStale = stale;
  byId('quick-stale').hidden = !stale;
  byId('stale-transfer-note').hidden = !stale;
  quickResult.classList.toggle('is-stale', stale);
  launchers.forEach((button) => {
    if (button.dataset['launcher'] === 'target' || button.dataset['launcher'] === 'segments') {
      button.disabled = stale;
    }
  });
  if (stale && (activePanel === 'target' || activePanel === 'segments')) closePanels();
}

quickForm.addEventListener('submit', (event) => {
  event.preventDefault();
  renderQuick();
});

quickForm.addEventListener('input', () => {
  if (quickSnapshot && !quickStale) setStale(true);
});

byId<HTMLButtonElement>('quick-reset').addEventListener('click', () => {
  quickForm.reset();
  quickSnapshot = undefined;
  quickStale = false;
  quickResult.hidden = true;
  closePanels();
  clearErrors();
  quickGames.focus();
  announce('入力とクイック結果をリセットしました。');
});

byId<HTMLButtonElement>('edit-quick').addEventListener('click', () => quickGames.focus());

function closePanels(): void {
  activePanel = undefined;
  analysisPanels.forEach((panel) => {
    panel.hidden = true;
  });
  launchers.forEach((button) => button.setAttribute('aria-expanded', 'false'));
}

function openPanel(name: string): void {
  if (!quickSnapshot) return;
  if (quickStale && (name === 'target' || name === 'segments')) {
    announce('クイック結果を再計算してから開いてください。');
    return;
  }
  activePanel = name;
  analysisPanels.forEach((panel) => {
    panel.hidden = panel.dataset['analysisPanel'] !== name;
  });
  launchers.forEach((button) => {
    button.setAttribute('aria-expanded', String(button.dataset['launcher'] === name));
  });
  if (name === 'target') {
    byId('target-current-summary').textContent =
      `現在 ${formatInteger(quickSnapshot.games)}G / ${formatSigned(quickSnapshot.netMedals)}枚`;
  }
  if (name === 'segments') {
    segmentsUi.open({ games: quickSnapshot.games, netMedals: quickSnapshot.netMedals });
  }
  const panel = analysisPanels.find(({ dataset }) => dataset['analysisPanel'] === name);
  panel?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  panel?.scrollIntoView({ block: 'start' });
  announce(
    `${launchers.find(({ dataset }) => dataset['launcher'] === name)?.textContent?.trim() ?? '詳細'}を開きました。`,
  );
}

launchers.forEach((button) => {
  button.addEventListener('click', () => {
    const name = button.dataset['launcher'];
    if (name) openPanel(name);
  });
});

document.querySelectorAll<HTMLButtonElement>('.close-panel').forEach((button) => {
  button.addEventListener('click', () => {
    const previous = activePanel;
    closePanels();
    launchers.find(({ dataset }) => dataset['launcher'] === previous)?.focus();
    announce('詳細機能を閉じました。');
  });
});

function setPreset(button: HTMLButtonElement, group: string): void {
  document.querySelectorAll<HTMLButtonElement>(group).forEach((item) => {
    item.setAttribute('aria-pressed', String(item === button));
  });
}

document.querySelectorAll<HTMLButtonElement>('[data-target-games]').forEach((button) => {
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    if (!quickSnapshot) return;
    byId<HTMLInputElement>('target-games').value = String(
      quickSnapshot.games + Number(button.dataset['targetGames']),
    );
    setPreset(button, '[data-target-games]');
  });
});

document.querySelectorAll<HTMLButtonElement>('[data-target-rate]').forEach((button) => {
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    byId<HTMLInputElement>('target-rate').value = button.dataset['targetRate'] ?? '';
    setPreset(button, '[data-target-rate]');
  });
});

byId<HTMLFormElement>('target-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!quickSnapshot || quickStale) return;
  const targetGames = requiredInteger(
    byId<HTMLInputElement>('target-games'),
    'target.games',
    '目標総ゲーム数',
  );
  const targetRate = requiredDecimal(
    byId<HTMLInputElement>('target-rate'),
    'target.rate',
    '目標出玉率',
  );
  const errors = [...targetGames.errors, ...targetRate.errors];
  if (errors.length > 0 || targetGames.value === undefined || targetRate.value === undefined) {
    showErrors(errors);
    return;
  }
  const result = calculateTargetReverse({
    currentGames: quickSnapshot.games,
    currentNetMedals: quickSnapshot.netMedals,
    targetTotalGames: targetGames.value,
    targetPayoutRate: targetRate.value,
  });
  if (!result.ok) {
    showErrors(
      domainErrors(result.errors, ({ field }) =>
        field === 'targetTotalGames'
          ? 'target.games'
          : field === 'targetPayoutRate'
            ? 'target.rate'
            : undefined,
      ),
    );
    return;
  }
  clearErrors();
  const values = result.value;
  const lead =
    values.status === 'must_gain'
      ? `あと+${formatInteger(values.minimumIntegerFutureNetMedals)}枚必要`
      : values.status === 'no_net_change_required'
        ? '差枚0枚以上で目標に到達'
        : values.status === 'can_lose_up_to'
          ? `−${formatInteger(values.allowedLossMedals ?? 0)}枚までなら目標を維持`
          : '残り区間のOUTが0枚以上なら目標を維持';
  const container = byId<HTMLElement>('target-result');
  const heading = create('h3', { text: '必要条件' });
  const metrics = create('div', { className: 'result-metrics' });
  metrics.append(
    resultMetric('残りゲーム数', `${formatInteger(values.remainingGames)}G`),
    resultMetric(
      '境界となる出玉率',
      `${formatOneDecimal(values.requiredFuturePayoutRate.display)}%以上`,
    ),
    resultMetric('目標総差枚', `${formatSigned(values.exactTargetTotalNetMedals.display)}枚`),
  );
  const conditions = create('details', { className: 'conditions' });
  conditions.append(create('summary', { text: '計算条件を見る' }));
  const conditionContent = create('div');
  renderMetadata(conditionContent, [result.metadata]);
  conditions.append(conditionContent);
  container.replaceChildren(
    heading,
    create('p', { className: 'result-lead', text: lead }),
    metrics,
    create('p', { text: '数学上の境界であり、予測・期待値・続行判断ではありません。' }),
    conditions,
  );
  container.hidden = false;
  focusResult(container);
  announce('目標の必要条件を表示しました。');
});

function mapCalculationErrors(
  result: CalculationResult<unknown, unknown>,
  fields: Readonly<Record<string, string>>,
): UiError[] {
  return validationErrors(result.errors).map((error, index) => {
    const original = result.errors[index];
    const field = original?.field ? fields[original.field] : undefined;
    return { ...error, ...(field ? { field } : {}) };
  });
}

function messagesList(messages: readonly ValidationMessage[]): HTMLElement | undefined {
  const visible = messages.filter(({ severity }) => severity !== 'error');
  if (visible.length === 0) return undefined;
  const wrapper = create('div', { className: 'conditions' });
  const heading = create('h4', { text: '補足' });
  const list = create('ul');
  for (const item of visible) list.append(create('li', { text: item.message }));
  wrapper.append(heading, list);
  return wrapper;
}

byId<HTMLFormElement>('investment-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const cash = requiredInteger(byId('investment-cash'), 'investment.cash', '現金投資額');
  const current = requiredInteger(
    byId('investment-current'),
    'investment.current',
    '現在手元にある枚数',
  );
  const exchange = requiredDecimal(
    byId('investment-exchange'),
    'investment.exchange',
    '1,000円分への交換に必要な枚数',
  );
  const unit = optionalInteger(byId('investment-unit'), 'investment.unit', '交換単位');
  const stored = optionalInteger(byId('investment-stored'), 'investment.stored', '使用貯メダル');
  const exchanged = optionalInteger(
    byId('investment-exchanged'),
    'investment.exchanged',
    '交換済み金額',
  );
  const lend = optionalDecimal(byId('investment-lend'), 'investment.lend', '貸出枚数');
  const games = optionalInteger(byId('investment-games'), 'investment.games', '今回のゲーム数');
  const net = optionalInteger(byId('investment-net'), 'investment.net', '今回の差枚');
  const errors = [cash, current, exchange, unit, stored, exchanged, lend, games, net].flatMap(
    ({ errors: parsedErrors }) => parsedErrors,
  );
  if ((games.value === undefined) !== (net.value === undefined)) {
    errors.push({
      field: games.value === undefined ? 'investment.games' : 'investment.net',
      message: '今回のゲーム数と差枚は両方入力するか、両方空欄にしてください。',
    });
  }
  if (
    errors.length > 0 ||
    cash.value === undefined ||
    current.value === undefined ||
    exchange.value === undefined
  ) {
    showErrors(errors);
    return;
  }
  const result = calculateInvestmentRecovery({
    cashInvestmentYen: cash.value,
    currentMedals: current.value,
    exchangeMedalsPer1000Yen: exchange.value,
    storedMedalsUsed: stored.value,
    alreadyExchangedYen: exchanged.value,
    lendMedalsPer1000Yen: lend.value,
    exchangeUnitYen: unit.value,
    requestRecoveryLines: true,
    games: games.value,
    netMedals: net.value,
  });
  if (!result.ok || !result.values) {
    showErrors(
      mapCalculationErrors(result, {
        cashInvestmentYen: 'investment.cash',
        currentMedals: 'investment.current',
        exchangeMedalsPer1000Yen: 'investment.exchange',
        exchangeUnitYen: 'investment.unit',
        storedMedalsUsed: 'investment.stored',
        alreadyExchangedYen: 'investment.exchanged',
        lendMedalsPer1000Yen: 'investment.lend',
        games: 'investment.games',
        netMedals: 'investment.net',
      }),
    );
    return;
  }
  clearErrors();
  const values = result.values;
  const container = byId<HTMLElement>('investment-result');
  const metrics = create('div', { className: 'result-metrics' });
  metrics.append(
    resultMetric('交換額見込み', `${formatInteger(values.currentExchangeEstimateYen)}円`),
    resultMetric('現金収支', `${formatSigned(values.cashNetEstimateYen)}円`),
    resultMetric(
      '現金回収率',
      values.cashRecoveryRate ? `${formatOneDecimal(values.cashRecoveryRate.display)}%` : '—',
    ),
  );
  const details = create('details', { className: 'conditions' });
  details.append(create('summary', { text: '内訳を見る' }));
  const list = create('dl', { className: 'summary-facts' });
  const detailRows: Array<[string, string]> = [
    ['理論交換額', `${formatInteger(values.currentTheoreticalExchangeYen.display)}円`],
    ['総回収見込み', `${formatInteger(values.grossReturnEstimateYen)}円`],
    ['貯メダル込み価値差額', `${formatSigned(values.totalValueNetEstimateYen.display)}円`],
    ['交換単位との差', `${formatInteger(values.exchangeUnitDifferenceYen.display)}円`],
  ];
  if (values.totalRecoveryRate) {
    detailRows.push([
      '貯メダル込み回収率',
      `${formatOneDecimal(values.totalRecoveryRate.display)}%`,
    ]);
  }
  if (values.cashRecoveryLine) {
    detailRows.push([
      '現金回収ライン',
      `${formatInteger(values.cashRecoveryLine.requiredMedals)}枚`,
    ]);
  }
  if (values.totalRecoveryLine && values.showTotalRecoveryLine) {
    detailRows.push([
      '貯メダル込み回収ライン',
      `${formatInteger(values.totalRecoveryLine.requiredMedals)}枚`,
    ]);
  }
  if (values.cashBorrowedMedalsEquivalent) {
    detailRows.push([
      '現金投資の貸出枚数相当',
      `${formatInteger(values.cashBorrowedMedalsEquivalent.display)}枚`,
    ]);
  }
  for (const [label, value] of detailRows) {
    const row = create('div');
    row.append(create('dt', { text: label }), create('dd', { text: value }));
    list.append(row);
  }
  details.append(list);
  const supplementary = messagesList([...result.warnings, ...result.info]);
  container.replaceChildren(
    create('h3', { text: '投資・回収結果' }),
    metrics,
    details,
    ...(supplementary ? [supplementary] : []),
  );
  container.hidden = false;
  focusResult(container);
  announce('投資・回収結果を表示しました。');
});

byId<HTMLFormElement>('inout-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const actualIn = requiredInteger(byId('actual-in'), 'inout.in', '実IN');
  const actualOut = requiredInteger(byId('actual-out'), 'inout.out', '実OUT');
  const errors = [...actualIn.errors, ...actualOut.errors];
  if (errors.length > 0 || actualIn.value === undefined || actualOut.value === undefined) {
    showErrors(errors);
    return;
  }
  const result = calculateInOut({ actualIn: actualIn.value, actualOut: actualOut.value });
  if (!result.ok || !result.values) {
    showErrors(mapCalculationErrors(result, { actualIn: 'inout.in', actualOut: 'inout.out' }));
    return;
  }
  clearErrors();
  const container = byId<HTMLElement>('inout-result');
  const metrics = create('div', { className: 'result-metrics' });
  metrics.append(
    resultMetric('実IN / OUT出玉率', `${formatOneDecimal(result.values.payoutRate.display)}%`),
    resultMetric('実差枚', `${formatSigned(result.values.actualNetMedals)}枚`),
    resultMetric(
      '実IN → 実OUT',
      `${formatInteger(result.values.totalIn)}枚 → ${formatInteger(result.values.totalOut)}枚`,
    ),
  );
  container.replaceChildren(
    create('h3', { text: '実測結果' }),
    metrics,
    create('p', { text: '差枚ベース実績出玉率とは分けて確認してください。' }),
  );
  container.hidden = false;
  focusResult(container);
  announce('実IN・OUT結果を表示しました。');
});

byId<HTMLFormElement>('coin-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const games = requiredInteger(byId('coin-games'), 'coin.games', '通常時ゲーム数');
  const medals = requiredInteger(byId('coin-medals'), 'coin.medals', '正味使用枚数');
  const atBonus =
    document.querySelector<HTMLInputElement>('[name="coin.atBonus"]')?.checked ?? false;
  const scope = document.querySelector<HTMLInputElement>('[name="coin.scope"]')?.checked ?? false;
  const errors = [...games.errors, ...medals.errors];
  if (!atBonus)
    errors.push({
      field: 'coin.atBonus',
      message: 'AT・ボーナス区間を除外したことの確認が必要です。',
    });
  if (!scope)
    errors.push({
      field: 'coin.scope',
      message: 'G数と枚数が同じ対象区間であることの確認が必要です。',
    });
  if (errors.length > 0 || games.value === undefined || medals.value === undefined) {
    showErrors(errors);
    return;
  }
  const result = calculateCoinHold({
    method: 'direct',
    normalGames: games.value,
    netUsedMedals: medals.value,
    atBonusExcluded: atBonus,
    scopeConfirmed: scope,
  });
  if (!result.ok || !result.values) {
    showErrors(
      mapCalculationErrors(result, {
        normalGames: 'coin.games',
        netUsedMedals: 'coin.medals',
        atBonusExcluded: 'coin.atBonus',
        scopeConfirmed: 'coin.scope',
      }),
    );
    return;
  }
  clearErrors();
  const container = byId<HTMLElement>('coin-result');
  const metrics = create('div', { className: 'result-metrics' });
  metrics.append(
    resultMetric(
      '50枚あたり通常時ゲーム数',
      `${formatOneDecimal(result.values.coinHoldPer50.display)}G / 50枚`,
    ),
    resultMetric('正味使用枚数', `${formatInteger(result.values.netUsedMedals)}枚`),
    resultMetric('対象区間', 'AT・ボーナス除外済み'),
  );
  container.replaceChildren(create('h3', { text: '通常コイン持ち結果' }), metrics);
  container.hidden = false;
  focusResult(container);
  announce('通常コイン持ち結果を表示しました。');
});

clearErrors();
