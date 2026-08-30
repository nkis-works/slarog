import { calculateCoinHold } from '../../domain/calculators/coin-hold';
import { calculateInOut } from '../../domain/calculators/in-out';
import { calculateSegments } from '../../domain/calculators/segments';
import type {
  ActualInOutSegment,
  CoinHoldInput,
  NetMedalsSegment,
  ValidationMessage,
} from '../../domain/types';
import {
  combineMessages,
  optionalInteger,
  optionalIntegerFromRaw,
  requiredInteger,
  requiredIntegerFromRaw,
} from '../adapters';
import { byId, namedControl, textElement } from '../dom';
import {
  formatGames,
  formatMedals,
  formatNumber,
  formatPercent,
  formatSignedMedals,
} from '../formatters';
import type { ResultGroup } from '../renderers';
import type { DynamicModeOptions, UiCalculationOutcome, UiModeController } from './types';

const MAX_SEGMENTS = 100;

interface DynamicList {
  container: HTMLElement;
  addButton: HTMLButtonElement;
  undoRegion: HTMLElement;
  undoButton: HTMLButtonElement;
  prefix: 'segments' | 'inoutSegments';
  makeRow: () => HTMLElement;
  removed?: { row: HTMLElement; index: number };
}

function field(
  label: string,
  dataName: string,
  options: {
    unit?: string;
    placeholder?: string;
    inputMode?: 'numeric' | 'decimal' | 'text';
    maxLength?: number;
  } = {},
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'field';
  const labelElement = textElement('label', label);
  const controlRow = document.createElement('div');
  controlRow.className = 'field-control';
  const input = document.createElement('input');
  input.type = 'text';
  input.autocomplete = 'off';
  input.inputMode = options.inputMode ?? 'numeric';
  input.dataset['dynamicField'] = dataName;
  if (options.placeholder) input.placeholder = options.placeholder;
  if (options.maxLength) input.maxLength = options.maxLength;
  controlRow.append(input);
  if (options.unit) controlRow.append(textElement('span', options.unit, 'field-unit'));
  const hint = textElement('p', '', 'field-error');
  hint.dataset['fieldErrorFor'] = '';
  wrapper.append(labelElement, controlRow, hint);
  return wrapper;
}

function createNetSegmentRow(): HTMLElement {
  const row = document.createElement('fieldset');
  row.className = 'dynamic-row';
  row.dataset['segmentRow'] = 'net';
  const legend = textElement('legend', '区間');
  legend.dataset['rowLegend'] = '';
  const header = document.createElement('div');
  header.className = 'dynamic-row__header';
  const remove = textElement('button', 'この区間を削除', 'text-button danger-button');
  remove.type = 'button';
  remove.dataset['removeRow'] = '';
  header.append(remove);
  const grid = document.createElement('div');
  grid.className = 'field-grid field-grid--dynamic';
  grid.append(
    field('区間名（任意）', 'label', {
      placeholder: '例：午前',
      inputMode: 'text',
      maxLength: 100,
    }),
    field('G数', 'games', { unit: 'G', placeholder: '例：1000' }),
    field('差枚', 'netMedals', { unit: '枚', placeholder: '例：+200' }),
    field('開始G（任意）', 'startGame', { unit: 'G' }),
    field('終了G（任意）', 'endGame', { unit: 'G' }),
    field('メモ（任意）', 'memo', { inputMode: 'text', maxLength: 500 }),
  );
  row.append(legend, header, grid);
  return row;
}

function createInOutSegmentRow(): HTMLElement {
  const row = document.createElement('fieldset');
  row.className = 'dynamic-row';
  row.dataset['segmentRow'] = 'inout';
  const legend = textElement('legend', '実測区間');
  legend.dataset['rowLegend'] = '';
  const header = document.createElement('div');
  header.className = 'dynamic-row__header';
  const remove = textElement('button', 'この区間を削除', 'text-button danger-button');
  remove.type = 'button';
  remove.dataset['removeRow'] = '';
  header.append(remove);
  const grid = document.createElement('div');
  grid.className = 'field-grid field-grid--dynamic';
  grid.append(
    field('区間名（任意）', 'label', { inputMode: 'text', maxLength: 100 }),
    field('実IN（総投入枚数）', 'actualIn', { unit: '枚' }),
    field('実OUT（総払出枚数）', 'actualOut', { unit: '枚' }),
    field('G数（任意）', 'games', { unit: 'G' }),
  );
  row.append(legend, header, grid);
  return row;
}

function dynamicValue(row: HTMLElement, fieldName: string): string {
  return row.querySelector<HTMLInputElement>(`[data-dynamic-field="${fieldName}"]`)?.value ?? '';
}

function reindex(list: DynamicList): void {
  const rows = Array.from(list.container.querySelectorAll<HTMLElement>('[data-segment-row]'));
  rows.forEach((row, index) => {
    const legend = row.querySelector<HTMLElement>('[data-row-legend]');
    if (legend) legend.textContent = `区間 ${index + 1}`;
    row.querySelectorAll<HTMLInputElement>('[data-dynamic-field]').forEach((input) => {
      const suffix = input.dataset['dynamicField'] ?? '';
      const name = `${list.prefix}.${index}.${suffix}`;
      input.name = name;
      input.id = name.replaceAll('.', '-');
      const wrapper = input.closest<HTMLElement>('.field');
      const label = wrapper?.querySelector<HTMLLabelElement>('label');
      const error = wrapper?.querySelector<HTMLElement>('[data-field-error-for]');
      if (label) label.htmlFor = input.id;
      if (error) {
        error.dataset['fieldErrorFor'] = name;
        error.id = `${input.id}-error`;
        input.setAttribute('aria-describedby', error.id);
      }
    });
    const remove = row.querySelector<HTMLButtonElement>('[data-remove-row]');
    if (remove) remove.disabled = rows.length === 1;
  });
  list.addButton.disabled = rows.length >= MAX_SEGMENTS;
}

function setupDynamicList(
  list: DynamicList,
  key: 'segments' | 'inout',
  options: DynamicModeOptions,
): void {
  list.container.append(list.makeRow());
  reindex(list);
  list.addButton.addEventListener('click', () => {
    const count = list.container.querySelectorAll('[data-segment-row]').length;
    if (count >= MAX_SEGMENTS) {
      options.announce('区間は100件までです。');
      return;
    }
    list.container.append(list.makeRow());
    list.removed = undefined;
    list.undoRegion.hidden = true;
    reindex(list);
    options.markDirty(key);
    options.announce(`区間 ${count + 1} を追加しました。`);
  });
  list.container.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.closest('[data-remove-row]')) return;
    const row = target.closest<HTMLElement>('[data-segment-row]');
    if (!row) return;
    const rows = Array.from(list.container.querySelectorAll<HTMLElement>('[data-segment-row]'));
    if (rows.length <= 1) return;
    const index = rows.indexOf(row);
    list.removed = { row, index };
    row.remove();
    list.undoRegion.hidden = false;
    reindex(list);
    options.markDirty(key);
    options.announce(`区間 ${index + 1} を削除しました。元に戻せます。`);
  });
  list.undoButton.addEventListener('click', () => {
    if (!list.removed) return;
    const before = list.container.children.item(list.removed.index);
    list.container.insertBefore(list.removed.row, before);
    const restoredIndex = list.removed.index;
    list.removed = undefined;
    list.undoRegion.hidden = true;
    reindex(list);
    options.markDirty(key);
    options.announce(`区間 ${restoredIndex + 1} を元に戻しました。`);
  });
}

function errorsFromResult(result: {
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
  info: ValidationMessage[];
}): ValidationMessage[] {
  return [...result.errors, ...result.warnings, ...result.info];
}

function setupSegmentsCalculator(options: DynamicModeOptions): UiModeController {
  const list: DynamicList = {
    container: byId('net-segment-list'),
    addButton: byId<HTMLButtonElement>('add-net-segment'),
    undoRegion: byId('net-segment-undo'),
    undoButton: byId<HTMLButtonElement>('undo-net-segment'),
    prefix: 'segments',
    makeRow: createNetSegmentRow,
  };
  setupDynamicList(list, 'segments', options);
  return {
    calculate(): UiCalculationOutcome {
      const segments: NetMedalsSegment[] = [];
      const messages: ValidationMessage[] = [];
      const rows = Array.from(list.container.querySelectorAll<HTMLElement>('[data-segment-row]'));
      rows.forEach((row, index) => {
        const games = requiredIntegerFromRaw(
          dynamicValue(row, 'games'),
          `segments.${index}.games`,
          `区間${index + 1}のG数`,
        );
        const netMedals = requiredIntegerFromRaw(
          dynamicValue(row, 'netMedals'),
          `segments.${index}.netMedals`,
          `区間${index + 1}の差枚`,
        );
        const start = optionalIntegerFromRaw(
          dynamicValue(row, 'startGame'),
          `segments.${index}.startGame`,
          `区間${index + 1}の開始G`,
        );
        const end = optionalIntegerFromRaw(
          dynamicValue(row, 'endGame'),
          `segments.${index}.endGame`,
          `区間${index + 1}の終了G`,
        );
        messages.push(...combineMessages(games, netMedals, start, end));
        if (games.value !== undefined && netMedals.value !== undefined) {
          const label = dynamicValue(row, 'label').trim();
          const memo = dynamicValue(row, 'memo').trim();
          segments.push({
            games: games.value,
            netMedals: netMedals.value,
            ...(label ? { label } : {}),
            ...(memo ? { memo } : {}),
            ...(start.value !== undefined ? { startGame: start.value } : {}),
            ...(end.value !== undefined ? { endGame: end.value } : {}),
          });
        }
      });
      if (messages.length > 0 || segments.length !== rows.length) {
        return { key: 'segments', messages };
      }
      const result = calculateSegments({ segments });
      if (!result.ok || !result.values) {
        return { key: 'segments', result, messages: result.errors };
      }
      const groups: ResultGroup[] = [
        {
          items: [
            {
              label: '全区間の概算出玉率',
              value: result.values.aggregate.payoutRateEstimate
                ? formatPercent(result.values.aggregate.payoutRateEstimate.display)
                : '算出不可',
              provenance: 'estimated',
              primary: true,
              note: '各区間率の単純平均ではなく、合計G数・合計差枚から再計算します。',
            },
            {
              label: '合計G数',
              value: formatGames(result.values.totalGames),
              provenance: result.provenance['totalGames'] ?? 'calculated',
              primary: true,
            },
            {
              label: '合計差枚',
              value: formatSignedMedals(result.values.totalNetMedals),
              provenance: result.provenance['totalNetMedals'] ?? 'calculated',
              primary: true,
            },
          ],
        },
      ];
      result.values.segments.forEach((segment, index) => {
        const label = segment.input.label || `区間 ${index + 1}`;
        const items: ResultGroup['items'] = [
          {
            label: 'G数',
            value: formatGames(segment.input.games),
            provenance: 'input',
          },
          {
            label: '差枚',
            value: formatSignedMedals(segment.input.netMedals),
            provenance: 'input',
          },
          {
            label: '1,000Gあたり差枚',
            value: `${formatSignedMedals(segment.values.netMedalsPer1000G.display)}／1,000G`,
            provenance: 'calculated',
          },
        ];
        if (segment.values.payoutRateEstimate) {
          items.push({
            label: '差枚から概算した出玉率',
            value: formatPercent(segment.values.payoutRateEstimate.display),
            provenance: 'estimated',
          });
        }
        groups.push({ title: label, items });
      });
      return { key: 'segments', result, groups, messages: [] };
    },
  };
}

function setupInOutCalculator(options: DynamicModeOptions): UiModeController {
  const form = byId<HTMLFormElement>('inout-form');
  const list: DynamicList = {
    container: byId('inout-segment-list'),
    addButton: byId<HTMLButtonElement>('add-inout-segment'),
    undoRegion: byId('inout-segment-undo'),
    undoButton: byId<HTMLButtonElement>('undo-inout-segment'),
    prefix: 'inoutSegments',
    makeRow: createInOutSegmentRow,
  };
  setupDynamicList(list, 'inout', options);
  const sourceInputs = Array.from(form.querySelectorAll<HTMLInputElement>('[name="inout.source"]'));
  const updateSource = (): void => {
    const source = sourceInputs.find(({ checked }) => checked)?.value ?? 'total';
    byId('inout-total-fields').hidden = source !== 'total';
    byId('inout-segment-fields').hidden = source !== 'segments';
  };
  sourceInputs.forEach((input) => input.addEventListener('change', updateSource));
  updateSource();

  return {
    calculate(): UiCalculationOutcome {
      const source = sourceInputs.find(({ checked }) => checked)?.value ?? 'total';
      const messages: ValidationMessage[] = [];
      let result;
      if (source === 'total') {
        const actualIn = requiredInteger(form, 'inout.actualIn', '実IN（総投入枚数）');
        const actualOut = requiredInteger(form, 'inout.actualOut', '実OUT（総払出枚数）');
        const games = optionalInteger(form, 'inout.games', 'G数');
        messages.push(...combineMessages(actualIn, actualOut, games));
        if (messages.length > 0 || actualIn.value === undefined || actualOut.value === undefined) {
          return { key: 'inout', messages };
        }
        result = calculateInOut({
          actualIn: actualIn.value,
          actualOut: actualOut.value,
          games: games.value,
        });
      } else {
        const segments: ActualInOutSegment[] = [];
        const rows = Array.from(list.container.querySelectorAll<HTMLElement>('[data-segment-row]'));
        rows.forEach((row, index) => {
          const actualIn = requiredIntegerFromRaw(
            dynamicValue(row, 'actualIn'),
            `inoutSegments.${index}.actualIn`,
            `区間${index + 1}の実IN（総投入枚数）`,
          );
          const actualOut = requiredIntegerFromRaw(
            dynamicValue(row, 'actualOut'),
            `inoutSegments.${index}.actualOut`,
            `区間${index + 1}の実OUT（総払出枚数）`,
          );
          const games = optionalIntegerFromRaw(
            dynamicValue(row, 'games'),
            `inoutSegments.${index}.games`,
            `区間${index + 1}のG数`,
          );
          messages.push(...combineMessages(actualIn, actualOut, games));
          if (actualIn.value !== undefined && actualOut.value !== undefined) {
            const label = dynamicValue(row, 'label').trim();
            segments.push({
              actualIn: actualIn.value,
              actualOut: actualOut.value,
              ...(games.value !== undefined ? { games: games.value } : {}),
              ...(label ? { label } : {}),
            });
          }
        });
        if (messages.length > 0 || segments.length !== rows.length) {
          return { key: 'inout', messages };
        }
        result = calculateInOut({ segments });
      }
      if (!result.ok || !result.values) {
        return {
          key: 'inout',
          result,
          messages: result.errors.map((message) => ({
            ...message,
            field: message.field
              ? message.field
                  .replace(/^actualIn$/, 'inout.actualIn')
                  .replace(/^actualOut$/, 'inout.actualOut')
                  .replace(/^segments\./, 'inoutSegments.')
              : undefined,
          })),
        };
      }
      const groups: ResultGroup[] = [
        {
          items: [
            {
              label: '実測出玉率',
              value: formatPercent(result.values.payoutRate.display),
              provenance: result.provenance['payoutRate'] ?? 'actual',
              primary: true,
            },
            {
              label: '実測差枚',
              value: formatSignedMedals(result.values.actualNetMedals),
              provenance: result.provenance['actualNetMedals'] ?? 'actual',
              primary: true,
            },
          ],
        },
        {
          title: '実測合計',
          items: [
            {
              label: '合計IN（投入枚数）',
              value: formatMedals(result.values.totalIn),
              provenance: result.provenance['totalIn'] ?? 'actual',
            },
            {
              label: '合計OUT（払出枚数）',
              value: formatMedals(result.values.totalOut),
              provenance: result.provenance['totalOut'] ?? 'actual',
            },
            ...(result.values.totalGames === undefined
              ? []
              : [
                  {
                    label: '合計G数',
                    value: formatGames(result.values.totalGames),
                    provenance: 'calculated' as const,
                  },
                ]),
          ],
        },
      ];
      return { key: 'inout', result, groups, messages: [] };
    },
  };
}

function confirmationMessage(fieldName: string, message: string): ValidationMessage {
  return {
    severity: 'error',
    code: 'confirmation_required',
    field: fieldName,
    message,
    correction: '内容を確認し、自分でチェックを入れてください。',
  };
}

function isChecked(form: HTMLFormElement, fieldName: string): boolean {
  const control = namedControl(form, fieldName);
  return control instanceof HTMLInputElement && control.checked;
}

function setupCoinHoldCalculator(): UiModeController {
  const form = byId<HTMLFormElement>('coin-form');
  const sourceInputs = Array.from(form.querySelectorAll<HTMLInputElement>('[name="coin.method"]'));
  const updateSource = (): void => {
    const source = sourceInputs.find(({ checked }) => checked)?.value ?? 'direct';
    byId('coin-direct-fields').hidden = source !== 'direct';
    byId('coin-breakdown-fields').hidden = source !== 'breakdown';
  };
  sourceInputs.forEach((input) => input.addEventListener('change', updateSource));
  updateSource();
  return {
    calculate(): UiCalculationOutcome {
      const method = sourceInputs.find(({ checked }) => checked)?.value ?? 'direct';
      const normalGames = requiredInteger(form, 'coin.normalGames', '通常時G数');
      const messages: ValidationMessage[] = [...normalGames.messages];
      const atBonusExcluded = isChecked(form, 'coin.atBonusExcluded');
      const scopeConfirmed = isChecked(form, 'coin.scopeConfirmed');
      if (!atBonusExcluded) {
        messages.push(
          confirmationMessage(
            'coin.atBonusExcluded',
            'AT・ボーナス区間を含まないことの確認が必要です。',
          ),
        );
      }
      if (!scopeConfirmed) {
        messages.push(
          confirmationMessage(
            'coin.scopeConfirmed',
            'G数と枚数が同じ対象区間であることの確認が必要です。',
          ),
        );
      }
      let input: CoinHoldInput | undefined;
      if (method === 'direct') {
        const netUsed = requiredInteger(form, 'coin.netUsedMedals', '通常時の消費枚数');
        messages.push(...netUsed.messages);
        if (normalGames.value !== undefined && netUsed.value !== undefined) {
          input = {
            method: 'direct',
            normalGames: normalGames.value,
            netUsedMedals: netUsed.value,
            atBonusExcluded,
            scopeConfirmed,
          };
        }
      } else {
        const start = requiredInteger(form, 'coin.startMedals', '開始時枚数');
        const added = requiredInteger(form, 'coin.addedMedals', '追加枚数');
        const end = requiredInteger(form, 'coin.endMedals', '終了時枚数');
        const taken = requiredInteger(form, 'coin.takenOutMedals', '途中で取り分けた枚数');
        messages.push(...combineMessages(start, added, end, taken));
        if (
          normalGames.value !== undefined &&
          start.value !== undefined &&
          added.value !== undefined &&
          end.value !== undefined &&
          taken.value !== undefined
        ) {
          input = {
            method: 'breakdown',
            normalGames: normalGames.value,
            startMedals: start.value,
            addedMedals: added.value,
            endMedals: end.value,
            takenOutMedals: taken.value,
            atBonusExcluded,
            scopeConfirmed,
          };
        }
      }
      if (messages.length > 0 || !input) return { key: 'coin', messages };
      const result = calculateCoinHold(input);
      if (!result.ok || !result.values) {
        const fieldNames: Record<string, string> = {
          normalGames: 'coin.normalGames',
          netUsedMedals: 'coin.netUsedMedals',
          atBonusExcluded: 'coin.atBonusExcluded',
          scopeConfirmed: 'coin.scopeConfirmed',
          breakdown: 'coin.startMedals',
        };
        return {
          key: 'coin',
          result,
          messages: errorsFromResult(result).map((message) => ({
            ...message,
            field: message.field ? (fieldNames[message.field] ?? message.field) : undefined,
          })),
        };
      }
      const groups: ResultGroup[] = [
        {
          items: [
            {
              label: '50枚あたり通常時G数',
              value: `${formatNumber(result.values.coinHoldPer50.display, 1)}G／50枚`,
              provenance: result.provenance['coinHoldPer50'] ?? 'calculated',
              primary: true,
            },
            {
              label: '通常時の消費枚数',
              value: formatMedals(result.values.netUsedMedals),
              provenance: result.provenance['netUsedMedals'] ?? 'calculated',
              primary: true,
            },
          ],
        },
        {
          title: '算出条件',
          items: [
            {
              label: '通常時G数',
              value: formatGames(input.normalGames),
              provenance: 'input',
            },
            {
              label: '対象区間',
              value: 'AT・ボーナスを除外した同一区間',
              provenance: 'input',
            },
          ],
        },
      ];
      return { key: 'coin', result, groups, messages: [] };
    },
  };
}

export function setupSegmentsInOutUi(
  options: DynamicModeOptions,
): Record<'segments' | 'inout' | 'coin', UiModeController> {
  return {
    segments: setupSegmentsCalculator(options),
    inout: setupInOutCalculator(options),
    coin: setupCoinHoldCalculator(),
  };
}
