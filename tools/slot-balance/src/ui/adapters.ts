import { namedControl } from './dom';
import { normalizeDecimalInput, normalizeIntegerInput } from '../domain/normalizers';
import type { ValidationMessage } from '../domain/types';

export interface ParsedValue<T> {
  value?: T;
  messages: ValidationMessage[];
}

function requiredMessage(field: string, label: string): ValidationMessage {
  return {
    severity: 'error',
    code: 'required_input',
    field,
    message: `${label}を入力してください。`,
    correction: '入力例と単位を確認して、数字を入力してください。',
  };
}

function rawValue(form: HTMLFormElement, field: string): string {
  return namedControl(form, field)?.value ?? '';
}

export function requiredInteger(
  form: HTMLFormElement,
  field: string,
  label: string,
): ParsedValue<number> {
  const raw = rawValue(form, field);
  if (raw.trim() === '') return { messages: [requiredMessage(field, label)] };
  const normalized = normalizeIntegerInput(raw, field, label);
  return { value: normalized.value, messages: normalized.messages };
}

export function optionalInteger(
  form: HTMLFormElement,
  field: string,
  label: string,
): ParsedValue<number> {
  const raw = rawValue(form, field);
  if (raw.trim() === '') return { messages: [] };
  const normalized = normalizeIntegerInput(raw, field, label);
  return { value: normalized.value, messages: normalized.messages };
}

export function optionalDecimal(
  form: HTMLFormElement,
  field: string,
  label: string,
): ParsedValue<number> {
  const raw = rawValue(form, field);
  if (raw.trim() === '') return { messages: [] };
  const normalized = normalizeDecimalInput(raw, field, label);
  return { value: normalized.value, messages: normalized.messages };
}

export function requiredIntegerFromRaw(
  raw: string,
  field: string,
  label: string,
): ParsedValue<number> {
  if (raw.trim() === '') return { messages: [requiredMessage(field, label)] };
  const normalized = normalizeIntegerInput(raw, field, label);
  return { value: normalized.value, messages: normalized.messages };
}

export function optionalIntegerFromRaw(
  raw: string,
  field: string,
  label: string,
): ParsedValue<number> {
  if (raw.trim() === '') return { messages: [] };
  const normalized = normalizeIntegerInput(raw, field, label);
  return { value: normalized.value, messages: normalized.messages };
}

export function pairedOptionalMessage(
  first: ParsedValue<number>,
  second: ParsedValue<number>,
  firstField: string,
  secondField: string,
  message: string,
): ValidationMessage[] {
  if ((first.value === undefined) === (second.value === undefined)) return [];
  return [
    {
      severity: 'error',
      code: 'paired_inputs_required',
      field: first.value === undefined ? firstField : secondField,
      message,
      correction: '両方を入力するか、両方を空欄にしてください。',
    },
  ];
}

export function combineMessages(...parsed: Array<ParsedValue<unknown>>): ValidationMessage[] {
  return parsed.flatMap(({ messages }) => messages);
}
