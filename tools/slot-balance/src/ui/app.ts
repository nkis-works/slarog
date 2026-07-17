import { announce, focusErrorSummary, revealResults } from './accessibility';
import { byId } from './dom';
import { setupInvestmentRecoveryUi } from './modes/investment-recovery-ui';
import { setupNetMedalsUi } from './modes/net-medals-ui';
import { setupSegmentsInOutUi } from './modes/segments-inout-ui';
import type { UiCalculationOutcome, UiModeController } from './modes/types';
import {
  clearValidationDisplay,
  renderFailureMessages,
  renderSuccessfulCalculation,
  setActiveCalculationKey,
  setStale,
} from './renderers';
import {
  createUiState,
  markCalculationSucceeded,
  markInputChanged,
  type CalculationKey,
  type MainMode,
} from './state';

const state = createUiState();
let mainMode: MainMode = 'net';
let segmentsSubmode: CalculationKey = 'segments';

function activeKey(): CalculationKey {
  if (mainMode === 'net') return 'net';
  if (mainMode === 'investment') return 'investment';
  return segmentsSubmode;
}

function markDirty(key: CalculationKey): void {
  const stale = markInputChanged(state, key);
  setStale(key, stale);
}

const dynamicControllers = setupSegmentsInOutUi({ markDirty, announce });
const controllers: Record<CalculationKey, UiModeController> = {
  net: setupNetMedalsUi(),
  investment: setupInvestmentRecoveryUi(),
  ...dynamicControllers,
};

function setPressed(buttons: HTMLButtonElement[], value: string, dataKey: string): void {
  for (const button of buttons) {
    const selected = button.dataset[dataKey] === value;
    button.setAttribute('aria-pressed', String(selected));
    button.tabIndex = selected ? 0 : -1;
  }
}

function bindRovingButtons(
  buttons: HTMLButtonElement[],
  select: (button: HTMLButtonElement) => void,
): void {
  buttons.forEach((button) => {
    button.addEventListener('click', () => select(button));
    button.addEventListener('keydown', (event) => {
      const index = buttons.indexOf(button);
      let targetIndex: number | undefined;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        targetIndex = (index + 1) % buttons.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        targetIndex = (index - 1 + buttons.length) % buttons.length;
      } else if (event.key === 'Home') {
        targetIndex = 0;
      } else if (event.key === 'End') {
        targetIndex = buttons.length - 1;
      }
      if (targetIndex === undefined) return;
      event.preventDefault();
      const target = buttons[targetIndex];
      if (target) {
        select(target);
        target.focus();
      }
    });
  });
}

const mainButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-main-mode]'));

function selectMainMode(button: HTMLButtonElement): void {
  const mode = button.dataset['mainMode'] as MainMode | undefined;
  if (!mode) return;
  mainMode = mode;
  setPressed(mainButtons, mode, 'mainMode');
  document.querySelectorAll<HTMLElement>('[data-main-panel]').forEach((panel) => {
    panel.hidden = panel.dataset['mainPanel'] !== mode;
  });
  setActiveCalculationKey(activeKey());
  clearValidationDisplay();
  announce(
    `${button.textContent?.trim() ?? 'モード'}へ切り替えました。入力内容は保持されています。`,
  );
}

bindRovingButtons(mainButtons, selectMainMode);

const submodeButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>('[data-segments-submode]'),
);

function selectSegmentsSubmode(button: HTMLButtonElement): void {
  const key = button.dataset['segmentsSubmode'] as CalculationKey | undefined;
  if (!key || !['segments', 'inout', 'coin'].includes(key)) return;
  segmentsSubmode = key;
  setPressed(submodeButtons, key, 'segmentsSubmode');
  document.querySelectorAll<HTMLElement>('[data-submode-panel]').forEach((panel) => {
    panel.hidden = panel.dataset['submodePanel'] !== key;
  });
  if (mainMode === 'segments-inout') setActiveCalculationKey(key);
  clearValidationDisplay();
  announce(`${button.textContent?.trim() ?? '入力方式'}へ切り替えました。`);
}

bindRovingButtons(submodeButtons, selectSegmentsSubmode);

function handleCalculation(outcome: UiCalculationOutcome): void {
  clearValidationDisplay();
  if (!outcome.result || !outcome.result.ok || !outcome.groups) {
    const messages =
      outcome.messages.length > 0 ? outcome.messages : (outcome.result?.errors ?? []);
    renderFailureMessages(outcome.key, messages);
    setActiveCalculationKey(outcome.key);
    announce('入力エラーがあります。計算結果は更新されていません。');
    if (messages.some(({ severity }) => severity === 'error')) focusErrorSummary();
    return;
  }
  markCalculationSucceeded(state, outcome.key);
  renderSuccessfulCalculation(outcome.key, outcome.result, outcome.groups);
  setStale(outcome.key, false);
  setActiveCalculationKey(outcome.key);
  announce('計算が完了しました。結果を更新しました。');
  revealResults();
}

document.querySelectorAll<HTMLButtonElement>('[data-calculate]').forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.dataset['calculate'] as CalculationKey | undefined;
    if (!key) return;
    handleCalculation(controllers[key].calculate());
  });
});

document.querySelectorAll<HTMLFormElement>('[data-calculation-key]').forEach((form) => {
  const onChange = (): void => {
    const key = form.dataset['calculationKey'] as CalculationKey | undefined;
    if (key) markDirty(key);
  };
  form.addEventListener('input', onChange);
  form.addEventListener('change', onChange);
  form.addEventListener('submit', (event) => event.preventDefault());
});

byId<HTMLAnchorElement>('skip-to-tool').addEventListener('click', () => {
  window.setTimeout(() => byId<HTMLElement>('mode-heading').focus(), 0);
});

setPressed(mainButtons, mainMode, 'mainMode');
setPressed(submodeButtons, segmentsSubmode, 'segmentsSubmode');
setActiveCalculationKey(activeKey());
