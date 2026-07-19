import { analyzeCumulativePoints } from '../domain/slot-analysis-v2/cumulative-points';
import { analyzeSegments } from '../domain/slot-analysis-v2/segments';
import { calculatePayoutRateSensitivity } from '../domain/slot-analysis-v2/sensitivity';
import type {
  CumulativePointInput,
  SegmentAnalysisValues,
  SegmentBenchmarkValues,
  SegmentInput,
  SlotAnalysisDomainResult,
} from '../domain/slot-analysis-v2/types';
import {
  announce,
  byId,
  clearErrors,
  create,
  domainErrors,
  formatInteger,
  formatOneDecimal,
  formatSigned,
  renderMetadata,
  requiredDecimal,
  requiredInteger,
  showErrors,
  type UiError,
} from './shared';

export interface QuickTransfer {
  readonly games: number;
  readonly netMedals: number;
}

interface RemovedRow {
  readonly row: HTMLElement;
  readonly index: number;
}

interface AnalysisSnapshot {
  readonly method: 'direct' | 'cumulative';
  readonly direct?: readonly SegmentInput[];
  readonly points?: readonly CumulativePointInput[];
}

const MAX_DIRECT_ROWS = 10;
const MAX_CUMULATIVE_POINTS = 11;

let transfer: QuickTransfer | undefined;
let directInitialized = false;
let cumulativeInitialized = false;
let directRemoved: RemovedRow | undefined;
let cumulativeRemoved: RemovedRow | undefined;
let lastAnalysis: AnalysisSnapshot | undefined;

const directList = byId<HTMLElement>('direct-segment-list');
const cumulativeList = byId<HTMLElement>('cumulative-point-list');
const form = byId<HTMLFormElement>('segments-form');
const facts = byId<HTMLElement>('segment-facts');
const benchmarkResult = byId<HTMLElement>('segment-benchmark-result');
const resultContainer = byId<HTMLElement>('segments-result');

function inputField(
  labelText: string,
  name: string,
  value: string,
  unit: string,
  inputMode: 'numeric' | 'text' = 'numeric',
): HTMLElement {
  const field = create('div', { className: 'field' });
  const label = create('label', { text: labelText });
  const input = create('input');
  input.type = 'text';
  input.inputMode = inputMode;
  input.autocomplete = 'off';
  input.name = name;
  input.value = value;
  input.id = name.replaceAll('.', '-');
  label.htmlFor = input.id;
  const control = create('div', { className: 'control-with-unit' });
  control.append(input);
  if (unit) control.append(create('span', { text: unit }));
  const error = create('div', { className: 'field-error' });
  error.dataset['errorFor'] = name;
  error.id = `${input.id}-error`;
  input.setAttribute('aria-describedby', error.id);
  field.append(label, control, error);
  return field;
}

function directRow(index: number, values?: QuickTransfer): HTMLElement {
  const row = create('fieldset', { className: 'editable-row' });
  row.dataset['directRow'] = '';
  row.append(create('legend', { text: `区間 ${index + 1}` }));
  row.append(
    inputField('区間名', `segments.direct.${index}.label`, `区間${index + 1}`, '', 'text'),
    inputField(
      'ゲーム数',
      `segments.direct.${index}.games`,
      values ? String(values.games) : '',
      'G',
    ),
    inputField(
      '差枚',
      `segments.direct.${index}.netMedals`,
      values ? String(values.netMedals) : '',
      '枚',
    ),
  );
  const remove = create('button', { className: 'remove-row', text: 'この区間を削除' });
  remove.type = 'button';
  remove.dataset['removeDirect'] = '';
  row.append(remove);
  return row;
}

function cumulativeRow(
  index: number,
  values?: { readonly games: number; readonly net: number },
): HTMLElement {
  const row = create('fieldset', { className: 'editable-row' });
  row.dataset['cumulativeRow'] = '';
  row.append(create('legend', { text: index === 0 ? '開始地点' : `地点 ${index}` }));
  row.append(
    inputField(
      '地点名',
      `segments.points.${index}.label`,
      index === 0 ? '開始' : `地点${index}`,
      '',
      'text',
    ),
    inputField(
      '累積ゲーム数',
      `segments.points.${index}.games`,
      values ? String(values.games) : '',
      'G',
    ),
    inputField(
      '累積差枚',
      `segments.points.${index}.netMedals`,
      values ? String(values.net) : '',
      '枚',
    ),
  );
  const remove = create('button', { className: 'remove-row', text: 'この地点を削除' });
  remove.type = 'button';
  remove.dataset['removeCumulative'] = '';
  row.append(remove);
  return row;
}

function reindexRows(kind: 'direct' | 'cumulative'): void {
  const list = kind === 'direct' ? directList : cumulativeList;
  const selector = kind === 'direct' ? '[data-direct-row]' : '[data-cumulative-row]';
  const prefix = kind === 'direct' ? 'segments.direct' : 'segments.points';
  const rows = Array.from(list.querySelectorAll<HTMLElement>(selector));
  rows.forEach((row, index) => {
    const legend = row.querySelector('legend');
    if (legend)
      legend.textContent =
        kind === 'direct' ? `区間 ${index + 1}` : index === 0 ? '開始地点' : `地点 ${index}`;
    row.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
      const key = input.name.split('.').at(-1) ?? '';
      input.name = `${prefix}.${index}.${key}`;
      input.id = input.name.replaceAll('.', '-');
      const field = input.closest<HTMLElement>('.field');
      const label = field?.querySelector<HTMLLabelElement>('label');
      const error = field?.querySelector<HTMLElement>('[data-error-for]');
      if (label) label.htmlFor = input.id;
      if (error) {
        error.dataset['errorFor'] = input.name;
        error.id = `${input.id}-error`;
        input.setAttribute('aria-describedby', error.id);
      }
    });
  });
  const minimum = kind === 'direct' ? 1 : 2;
  rows.forEach((row) => {
    const remove = row.querySelector<HTMLButtonElement>('.remove-row');
    if (remove) remove.disabled = rows.length <= minimum;
  });
  byId<HTMLButtonElement>(
    kind === 'direct' ? 'add-direct-segment' : 'add-cumulative-point',
  ).disabled = rows.length >= (kind === 'direct' ? MAX_DIRECT_ROWS : MAX_CUMULATIVE_POINTS);
  byId(kind === 'direct' ? 'direct-limit-note' : 'cumulative-limit-note').textContent =
    `${rows.length}件（最大${kind === 'direct' ? MAX_DIRECT_ROWS : MAX_CUMULATIVE_POINTS}件）`;
  updateTransferControls();
}

function initializeDirect(): void {
  if (directInitialized) return;
  directList.append(directRow(0), directRow(1));
  directInitialized = true;
  reindexRows('direct');
}

function initializeCumulative(): void {
  if (cumulativeInitialized) return;
  cumulativeList.append(cumulativeRow(0, { games: 0, net: 0 }), cumulativeRow(1), cumulativeRow(2));
  cumulativeInitialized = true;
  reindexRows('cumulative');
}

function transferTarget(
  kind: 'direct' | 'cumulative',
): { readonly games: HTMLInputElement; readonly net: HTMLInputElement } | undefined {
  const row =
    kind === 'direct'
      ? directList.querySelector<HTMLElement>('[data-direct-row]')
      : cumulativeList.querySelectorAll<HTMLElement>('[data-cumulative-row]').item(1);
  if (!row) return undefined;
  return {
    games: rowValue(row, 'games'),
    net: rowValue(row, 'netMedals'),
  };
}

function updateTransferControls(): void {
  const summary = transfer
    ? `現在の計算結果 ${formatInteger(transfer.games)}G／${formatSigned(transfer.netMedals)}枚`
    : '現在の計算結果 —';
  byId('direct-transfer-summary').textContent = summary;
  byId('cumulative-transfer-summary').textContent = summary;
  for (const kind of ['direct', 'cumulative'] as const) {
    const target = transferTarget(kind);
    const occupied = Boolean(target?.games.value.trim() || target?.net.value.trim());
    byId<HTMLButtonElement>(
      kind === 'direct' ? 'transfer-to-direct' : 'transfer-to-cumulative',
    ).disabled = !transfer || !target || occupied;
  }
}

function setupTransfers(): void {
  for (const kind of ['direct', 'cumulative'] as const) {
    const button = byId<HTMLButtonElement>(
      kind === 'direct' ? 'transfer-to-direct' : 'transfer-to-cumulative',
    );
    button.addEventListener('click', () => {
      const target = transferTarget(kind);
      if (!transfer || !target || target.games.value.trim() || target.net.value.trim()) return;
      target.games.value = String(transfer.games);
      target.net.value = String(transfer.netMedals);
      updateTransferControls();
      announce(
        kind === 'direct'
          ? '現在の結果を区間1へ入力しました。'
          : '現在の結果を地点1へ入力しました。',
      );
    });
  }
  directList.addEventListener('input', updateTransferControls);
  cumulativeList.addEventListener('input', updateTransferControls);
}

function setupMethodChoice(): void {
  document.querySelectorAll<HTMLInputElement>('[name="segment.method"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const direct = radio.value === 'direct' && radio.checked;
      byId('direct-segment-editor').hidden = !direct;
      byId('cumulative-segment-editor').hidden = direct;
      form.hidden = false;
      if (direct) initializeDirect();
      else initializeCumulative();
      resultContainer.hidden = true;
      announce(direct ? '区間ごとの入力を開きました。' : 'グラフの地点からの入力を開きました。');
    });
  });
}

function setupListActions(): void {
  byId<HTMLButtonElement>('add-direct-segment').addEventListener('click', () => {
    const count = directList.querySelectorAll('[data-direct-row]').length;
    if (count >= MAX_DIRECT_ROWS) return;
    const row = directRow(count);
    directList.append(row);
    directRemoved = undefined;
    byId('direct-undo').hidden = true;
    reindexRows('direct');
    row.querySelector<HTMLInputElement>('input')?.focus();
    announce(`区間 ${count + 1} を追加しました。`);
  });
  byId<HTMLButtonElement>('add-cumulative-point').addEventListener('click', () => {
    const count = cumulativeList.querySelectorAll('[data-cumulative-row]').length;
    if (count >= MAX_CUMULATIVE_POINTS) return;
    const row = cumulativeRow(count);
    cumulativeList.append(row);
    cumulativeRemoved = undefined;
    byId('cumulative-undo').hidden = true;
    reindexRows('cumulative');
    row.querySelector<HTMLInputElement>('input')?.focus();
    announce(`地点 ${count} を追加しました。`);
  });

  directList.addEventListener('click', (event) => {
    const button =
      event.target instanceof Element ? event.target.closest('[data-remove-direct]') : null;
    const row = button?.closest<HTMLElement>('[data-direct-row]');
    if (!row) return;
    const rows = Array.from(directList.querySelectorAll<HTMLElement>('[data-direct-row]'));
    if (rows.length <= 1) return;
    directRemoved = { row, index: rows.indexOf(row) };
    row.remove();
    byId('direct-undo').hidden = false;
    reindexRows('direct');
    (
      directList.querySelector<HTMLButtonElement>('.remove-row') ??
      byId<HTMLButtonElement>('add-direct-segment')
    ).focus();
  });
  cumulativeList.addEventListener('click', (event) => {
    const button =
      event.target instanceof Element ? event.target.closest('[data-remove-cumulative]') : null;
    const row = button?.closest<HTMLElement>('[data-cumulative-row]');
    if (!row) return;
    const rows = Array.from(cumulativeList.querySelectorAll<HTMLElement>('[data-cumulative-row]'));
    if (rows.length <= 2) return;
    cumulativeRemoved = { row, index: rows.indexOf(row) };
    row.remove();
    byId('cumulative-undo').hidden = false;
    reindexRows('cumulative');
  });

  byId<HTMLElement>('direct-undo')
    .querySelector('button')
    ?.addEventListener('click', () => {
      if (!directRemoved) return;
      directList.insertBefore(directRemoved.row, directList.children.item(directRemoved.index));
      directRemoved.row.querySelector<HTMLInputElement>('input')?.focus();
      directRemoved = undefined;
      byId('direct-undo').hidden = true;
      reindexRows('direct');
    });
  byId<HTMLElement>('cumulative-undo')
    .querySelector('button')
    ?.addEventListener('click', () => {
      if (!cumulativeRemoved) return;
      cumulativeList.insertBefore(
        cumulativeRemoved.row,
        cumulativeList.children.item(cumulativeRemoved.index),
      );
      cumulativeRemoved.row.querySelector<HTMLInputElement>('input')?.focus();
      cumulativeRemoved = undefined;
      byId('cumulative-undo').hidden = true;
      reindexRows('cumulative');
    });
}

function rowValue(row: HTMLElement, key: string): HTMLInputElement {
  const input = Array.from(row.querySelectorAll<HTMLInputElement>('input')).find(({ name }) =>
    name.endsWith(`.${key}`),
  );
  if (!input) throw new Error(`Missing row field: ${key}`);
  return input;
}

function collectDirect(): {
  readonly values?: readonly SegmentInput[];
  readonly errors: UiError[];
} {
  const errors: UiError[] = [];
  const values: SegmentInput[] = [];
  Array.from(directList.querySelectorAll<HTMLElement>('[data-direct-row]')).forEach(
    (row, index) => {
      const games = requiredInteger(
        rowValue(row, 'games'),
        `segments.direct.${index}.games`,
        `区間${index + 1}のゲーム数`,
      );
      const net = requiredInteger(
        rowValue(row, 'netMedals'),
        `segments.direct.${index}.netMedals`,
        `区間${index + 1}の差枚`,
      );
      errors.push(...games.errors, ...net.errors);
      if (games.value !== undefined && net.value !== undefined) {
        const label = rowValue(row, 'label').value.trim();
        values.push({ games: games.value, netMedals: net.value, ...(label ? { label } : {}) });
      }
    },
  );
  return errors.length > 0 ? { errors } : { values, errors };
}

function collectCumulative(): {
  readonly values?: readonly CumulativePointInput[];
  readonly errors: UiError[];
} {
  const errors: UiError[] = [];
  const values: CumulativePointInput[] = [];
  Array.from(cumulativeList.querySelectorAll<HTMLElement>('[data-cumulative-row]')).forEach(
    (row, index) => {
      const games = requiredInteger(
        rowValue(row, 'games'),
        `segments.points.${index}.games`,
        `地点${index}の累積ゲーム数`,
      );
      const net = requiredInteger(
        rowValue(row, 'netMedals'),
        `segments.points.${index}.netMedals`,
        `地点${index}の累積差枚`,
      );
      errors.push(...games.errors, ...net.errors);
      if (games.value !== undefined && net.value !== undefined) {
        const label = rowValue(row, 'label').value.trim();
        values.push({
          cumulativeGames: games.value,
          cumulativeNetMedals: net.value,
          ...(label ? { label } : {}),
        });
      }
    },
  );
  return errors.length > 0 ? { errors } : { values, errors };
}

function differenceText(value: SegmentBenchmarkValues): string {
  if (value.differenceDisplayCode === 'exact_zero') return '差0枚・基準通り';
  if (value.differenceDisplayCode === 'less_than_one_above') return '差は1枚未満・上回る';
  if (value.differenceDisplayCode === 'less_than_one_below') return '差は1枚未満・下回る';
  return `${formatSigned(value.differenceNetMedals.display)}枚・${value.relation === 'above' ? '上回る' : '下回る'}`;
}

function renderFacts(
  result: SlotAnalysisDomainResult<Readonly<SegmentAnalysisValues>>,
  sourceLabel: string,
): void {
  if (!result.ok) return;
  const fragment = document.createDocumentFragment();
  fragment.append(
    create('h3', { text: '合計実績' }),
    create('p', {
      className: 'result-lead',
      text: `${formatOneDecimal(result.value.aggregate.aggregatePayoutRate.display)}%`,
    }),
  );
  const metrics = create('div', { className: 'result-metrics' });
  for (const [label, value] of [
    ['合計G', `${formatInteger(result.value.aggregate.aggregateGames)}G`],
    ['合計差枚', `${formatSigned(result.value.aggregate.aggregateNetMedals)}枚`],
    ['入力方式', sourceLabel],
  ]) {
    const item = create('div');
    item.append(create('span', { text: label }), create('strong', { text: value }));
    metrics.append(item);
  }
  fragment.append(metrics, create('h3', { text: '区間ごとの実績' }));
  result.value.segments.forEach((segment, index) => {
    const row = create('article', { className: 'segment-row-result' });
    row.append(
      create('strong', { text: segment.input.label || `区間${index + 1}` }),
      create('p', { text: `${formatInteger(segment.input.games)}G` }),
      create('p', { text: `${formatSigned(segment.input.netMedals)}枚` }),
      create('p', { text: `${formatOneDecimal(segment.payoutRate.display)}%` }),
    );
    const sensitivity = calculatePayoutRateSensitivity({ games: segment.input.games });
    if (sensitivity.ok) {
      row.append(
        create('small', {
          text: `100枚で出玉率が約${formatOneDecimal(sensitivity.value.payoutRatePointsPer100Medals.display)}ポイント動く`,
        }),
      );
    }
    fragment.append(row);
  });
  const movement = create('div', { className: 'result-metrics' });
  for (const [label, value] of [
    [
      '入力した地点間の最大下落',
      `${formatInteger(result.value.drawdownRecovery.maximumDrawdown.medals)}枚`,
    ],
    [
      '下落後の最大回復',
      `${formatInteger(result.value.drawdownRecovery.maximumRecoveryAfterDrawdown.medals)}枚`,
    ],
  ]) {
    const item = create('div');
    item.append(create('span', { text: label }), create('strong', { text: value }));
    movement.append(item);
  }
  fragment.append(movement);
  facts.replaceChildren(fragment);
  renderMetadata(byId('segment-condition-content'), [result.metadata]);
  resultContainer.hidden = false;
  benchmarkResult.hidden = true;
  document.querySelectorAll<HTMLInputElement>('[name="segment.benchmark"]').forEach((radio) => {
    radio.checked = false;
  });
}

function analyze(
  rate?: number,
): SlotAnalysisDomainResult<Readonly<SegmentAnalysisValues>> | undefined {
  if (!lastAnalysis) return undefined;
  return lastAnalysis.method === 'direct'
    ? analyzeSegments({
        segments: lastAnalysis.direct ?? [],
        ...(rate === undefined ? {} : { benchmarkRate: rate }),
      })
    : analyzeCumulativePoints({
        points: lastAnalysis.points ?? [],
        ...(rate === undefined ? {} : { benchmarkRate: rate }),
      });
}

function renderBenchmark(rate: number): void {
  const result = analyze(rate);
  if (!result) return;
  if (!result.ok) {
    showErrors(domainErrors(result.errors));
    return;
  }
  clearErrors();
  const aggregate = result.value.aggregate.benchmark;
  if (!aggregate) return;
  const fragment = document.createDocumentFragment();
  fragment.append(
    create('h3', { text: `${formatOneDecimal(rate)}%基準` }),
    create('p', {
      className: 'result-lead',
      text: `合計 ${differenceText({ ...aggregate, condition: 'on_benchmark' })}`,
    }),
  );
  const metrics = create('div', { className: 'result-metrics' });
  const expected = create('div');
  expected.append(
    create('span', { text: '基準差枚' }),
    create('strong', { text: `${formatSigned(aggregate.expectedNetMedals.display)}枚` }),
  );
  const difference = create('div');
  difference.append(
    create('span', { text: '基準との差' }),
    create('strong', { text: differenceText({ ...aggregate, condition: 'on_benchmark' }) }),
  );
  metrics.append(expected, difference);
  fragment.append(metrics, create('h4', { text: '区間の押し上げ・押し下げ' }));

  const withBenchmark = result.value.segments.filter(
    (segment): segment is typeof segment & { benchmark: SegmentBenchmarkValues } =>
      segment.benchmark !== undefined,
  );
  for (const [index, segment] of withBenchmark.entries()) {
    const positive = segment.benchmark.relation === 'above';
    const neutral = segment.benchmark.relation === 'equal';
    const row = create('article', {
      className: `segment-row-result ${neutral ? '' : positive ? 'contribution-high' : 'contribution-low'}`,
    });
    row.append(
      create('strong', { text: segment.input.label || `区間${index + 1}` }),
      create('p', {
        text: neutral ? '基準通り' : positive ? '基準を上回る区間' : '基準を下回る区間',
        className: neutral
          ? 'relation-neutral'
          : positive
            ? 'relation-positive'
            : 'relation-negative',
      }),
      create('p', { text: differenceText(segment.benchmark) }),
      create('p', { text: positive ? '押し上げ' : neutral ? '変化なし' : '押し下げ' }),
    );
    fragment.append(row);
  }

  const positive = withBenchmark
    .filter(({ benchmark }) => benchmark.differenceNetMedals.approximate > 0)
    .sort(
      (left, right) =>
        right.benchmark.differenceNetMedals.approximate -
        left.benchmark.differenceNetMedals.approximate,
    )[0];
  const negative = withBenchmark
    .filter(({ benchmark }) => benchmark.differenceNetMedals.approximate < 0)
    .sort(
      (left, right) =>
        left.benchmark.differenceNetMedals.approximate -
        right.benchmark.differenceNetMedals.approximate,
    )[0];
  const extremes = create('div', { className: 'result-metrics segment-benchmark-detail' });
  for (const [label, segment] of [
    ['最大の押し上げ', positive],
    ['最大の押し下げ', negative],
  ] as const) {
    const item = create('div');
    item.append(
      create('span', { text: label }),
      create('strong', {
        text: segment
          ? `${segment.input.label ?? '名称なし'} ${formatSigned(segment.benchmark.differenceNetMedals.display)}枚`
          : '該当なし',
      }),
    );
    extremes.append(item);
  }
  fragment.append(extremes);
  benchmarkResult.replaceChildren(fragment);
  benchmarkResult.hidden = false;
  renderMetadata(byId('segment-condition-content'), [result.metadata]);
  announce(`${formatOneDecimal(rate)}%基準で各区間の押し上げ・押し下げを表示しました。`);
}

function setupBenchmarkChoice(): void {
  const custom = byId<HTMLElement>('custom-benchmark');
  document.querySelectorAll<HTMLInputElement>('[name="segment.benchmark"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      custom.hidden = radio.value !== 'custom';
      if (radio.value !== 'custom') renderBenchmark(Number(radio.value));
      else byId<HTMLInputElement>('custom-benchmark-rate').focus();
    });
  });
  byId<HTMLButtonElement>('apply-custom-benchmark').addEventListener('click', () => {
    const parsed = requiredDecimal(
      byId<HTMLInputElement>('custom-benchmark-rate'),
      'segment.customBenchmark',
      '任意基準率',
    );
    if (parsed.errors.length > 0 || parsed.value === undefined) {
      showErrors(parsed.errors);
      return;
    }
    renderBenchmark(parsed.value);
  });
}

function submitAnalysis(): void {
  clearErrors();
  const method = document.querySelector<HTMLInputElement>('[name="segment.method"]:checked')?.value;
  if (method === 'direct') {
    const collected = collectDirect();
    if (collected.errors.length > 0 || !collected.values) {
      showErrors(collected.errors);
      return;
    }
    const result = analyzeSegments({ segments: collected.values });
    if (!result.ok) {
      showErrors(
        domainErrors(result.errors, ({ field }) =>
          field.replace(/^segments\[(\d+)]/, 'segments.direct.$1'),
        ),
      );
      return;
    }
    lastAnalysis = { method: 'direct', direct: collected.values };
    renderFacts(result, '区間ごと');
  } else if (method === 'cumulative') {
    const collected = collectCumulative();
    if (collected.errors.length > 0 || !collected.values) {
      showErrors(collected.errors);
      return;
    }
    const result = analyzeCumulativePoints({ points: collected.values });
    if (!result.ok) {
      showErrors(
        domainErrors(result.errors, ({ field }) =>
          field
            .replace(/^points\[(\d+)]\.cumulativeGames$/, 'segments.points.$1.games')
            .replace(/^points\[(\d+)]\.cumulativeNetMedals$/, 'segments.points.$1.netMedals'),
        ),
      );
      return;
    }
    lastAnalysis = { method: 'cumulative', points: collected.values };
    renderFacts(result, 'グラフの累積地点');
  } else {
    showErrors([{ message: '「グラフの地点から入力」または「区間ごとに入力」を選んでください。' }]);
    return;
  }
  byId<HTMLElement>('segments-result').scrollIntoView({ block: 'start' });
  announce('区間分析を更新しました。');
}

export function setupSegmentsUi(): { readonly open: (value: QuickTransfer) => void } {
  setupMethodChoice();
  setupListActions();
  setupTransfers();
  setupBenchmarkChoice();
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitAnalysis();
  });
  return {
    open(value: QuickTransfer): void {
      transfer = value;
      updateTransferControls();
    },
  };
}
