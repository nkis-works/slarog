import type {
  CalculationExplanation,
  CalculationResult,
  KnowledgeBoundary,
  ValidationMessage,
  ValueProvenance,
} from '../domain/types';
import { byId, replaceChildren, textElement } from './dom';
import { provenanceLabel } from './formatters';
import type { CalculationKey } from './state';

export interface ResultItem {
  label: string;
  value: string;
  provenance: ValueProvenance;
  primary?: boolean;
  note?: string;
}

export interface ResultGroup {
  title?: string;
  items: ResultItem[];
}

type OutputKind = 'result' | 'messages' | 'boundary' | 'explanations';

function output(kind: OutputKind, key: CalculationKey): HTMLElement {
  return byId<HTMLElement>(`${kind}-${key}`);
}

function deduplicate(messages: ValidationMessage[]): ValidationMessage[] {
  const seen = new Set<string>();
  return messages.filter(({ code }) => {
    if (seen.has(code)) return false;
    seen.add(code);
    return true;
  });
}

function allMessages(result: CalculationResult<unknown, unknown>): ValidationMessage[] {
  return [...result.errors, ...result.warnings, ...result.info];
}

export function setActiveCalculationKey(key: CalculationKey): void {
  document.querySelectorAll<HTMLElement>('[data-output-key]').forEach((element) => {
    element.hidden = element.dataset['outputKey'] !== key;
  });
}

export function renderResultGroups(key: CalculationKey, groups: ResultGroup[]): void {
  const container = output('result', key);
  const fragment = document.createDocumentFragment();
  for (const group of groups) {
    const section = document.createElement('section');
    section.className = 'result-group';
    if (group.title) section.append(textElement('h3', group.title, 'result-group__title'));
    const grid = document.createElement('div');
    grid.className = 'metric-grid';
    for (const item of group.items) {
      const metric = document.createElement('article');
      metric.className = `metric${item.primary ? ' metric--primary' : ''}`;
      const meta = document.createElement('div');
      meta.className = 'metric__meta';
      meta.append(
        textElement('span', provenanceLabel(item.provenance), 'provenance'),
        textElement('span', item.label, 'metric__label'),
      );
      metric.append(meta, textElement('p', item.value, 'metric__value'));
      if (item.note) metric.append(textElement('p', item.note, 'metric__note'));
      grid.append(metric);
    }
    section.append(grid);
    fragment.append(section);
  }
  replaceChildren(container, fragment);
}

export function renderMessages(key: CalculationKey, messages: ValidationMessage[]): void {
  const container = output('messages', key);
  const unique = deduplicate(messages);
  if (unique.length === 0) {
    replaceChildren(container, textElement('p', '追加の確認事項はありません。', 'empty-note'));
    return;
  }
  const fragment = document.createDocumentFragment();
  const severityLabels = { error: 'エラー', warning: '確認', info: '補足' } as const;
  for (const item of unique) {
    const article = document.createElement('article');
    article.className = `validation-message validation-message--${item.severity}`;
    if (item.severity === 'error') article.setAttribute('role', 'alert');
    article.append(
      textElement('strong', severityLabels[item.severity], 'validation-message__label'),
      textElement('p', item.message),
    );
    if (item.correction) article.append(textElement('p', item.correction, 'validation-correction'));
    fragment.append(article);
  }
  replaceChildren(container, fragment);
}

export function renderKnowledgeBoundary(key: CalculationKey, boundary: KnowledgeBoundary): void {
  const container = output('boundary', key);
  const wrapper = document.createElement('div');
  wrapper.className = 'boundary-grid';
  for (const [title, items, className] of [
    ['算出できる項目', boundary.known, 'known'],
    ['算出対象外', boundary.unknown, 'unknown'],
  ] as const) {
    const section = document.createElement('section');
    section.className = `boundary-panel boundary-panel--${className}`;
    section.append(textElement('h3', title));
    const list = document.createElement('ul');
    for (const item of items) list.append(textElement('li', item.label));
    section.append(list);
    wrapper.append(section);
  }
  replaceChildren(container, wrapper);
}

function explanationDetails(explanation: CalculationExplanation): HTMLDetailsElement {
  const details = document.createElement('details');
  details.className = 'explanation';
  details.append(textElement('summary', explanation.title));

  const inputTitle = textElement('h4', '使用した入力');
  const inputs = document.createElement('dl');
  inputs.className = 'explanation-list';
  for (const input of explanation.inputs) {
    inputs.append(
      textElement('dt', input.label),
      textElement('dd', `${String(input.value)}${input.unit ?? ''}`),
    );
  }

  const stepTitle = textElement('h4', '計算手順');
  const steps = document.createElement('ol');
  steps.className = 'formula-list';
  for (const step of explanation.steps) {
    steps.append(
      textElement(
        'li',
        step.value === undefined ? step.expression : `${step.expression} → ${String(step.value)}`,
      ),
    );
  }

  const assumptionTitle = textElement('h4', '仮定・端数処理');
  const assumptions = document.createElement('ul');
  assumptions.className = 'assumption-list';
  for (const assumption of explanation.assumptions)
    assumptions.append(textElement('li', assumption));
  details.append(inputTitle, inputs, stepTitle, steps, assumptionTitle, assumptions);
  return details;
}

export function renderExplanations(
  key: CalculationKey,
  explanations: CalculationExplanation[],
): void {
  const container = output('explanations', key);
  if (explanations.length === 0) {
    replaceChildren(
      container,
      textElement('p', '入力を修正すると計算根拠を表示できます。', 'empty-note'),
    );
    return;
  }
  replaceChildren(container, ...explanations.map(explanationDetails));
}

export function renderSuccessfulCalculation(
  key: CalculationKey,
  result: CalculationResult<unknown, unknown>,
  groups: ResultGroup[],
): void {
  renderResultGroups(key, groups);
  renderMessages(key, allMessages(result));
  renderKnowledgeBoundary(key, result.knowledgeBoundary);
  renderExplanations(key, result.explanations);
}

export function renderFailureMessages(key: CalculationKey, messages: ValidationMessage[]): void {
  renderMessages(key, messages);
  renderFieldErrors(messages);
  renderErrorSummary(messages);
}

export function clearValidationDisplay(): void {
  document.querySelectorAll<HTMLElement>('[data-field-error-for]').forEach((element) => {
    element.textContent = '';
  });
  document
    .querySelectorAll<HTMLInputElement | HTMLSelectElement>('[aria-invalid="true"]')
    .forEach((element) => element.removeAttribute('aria-invalid'));
  const summary = byId<HTMLElement>('error-summary');
  summary.hidden = true;
  replaceChildren(summary);
}

function renderFieldErrors(messages: ValidationMessage[]): void {
  const errors = messages.filter(({ severity }) => severity === 'error');
  const fieldOutputs = Array.from(document.querySelectorAll<HTMLElement>('[data-field-error-for]'));
  const controls = Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[name]'),
  );
  for (const error of errors) {
    if (!error.field) continue;
    const fieldOutput = fieldOutputs.find(
      (element) => element.dataset['fieldErrorFor'] === error.field,
    );
    if (fieldOutput) fieldOutput.textContent = error.correction ?? error.message;
    const control = controls.find((element) => element.name === error.field);
    if (control) control.setAttribute('aria-invalid', 'true');
  }
}

function renderErrorSummary(messages: ValidationMessage[]): void {
  const errors = deduplicate(messages.filter(({ severity }) => severity === 'error'));
  if (errors.length === 0) return;
  const summary = byId<HTMLElement>('error-summary');
  summary.hidden = false;
  const heading = textElement('h2', '入力を確認してください');
  const list = document.createElement('ul');
  for (const error of errors) {
    list.append(
      textElement('li', error.correction ? `${error.message} ${error.correction}` : error.message),
    );
  }
  replaceChildren(summary, heading, list);
}

export function setStale(key: CalculationKey, stale: boolean): void {
  const banner = byId<HTMLElement>(`stale-${key}`);
  banner.hidden = !stale;
  output('result', key).classList.toggle('is-stale', stale);
}
