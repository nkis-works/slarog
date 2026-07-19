import { describe, expect, it } from 'vitest';

import { normalizeDecimalInput, normalizeIntegerInput } from '../src/domain/normalizers';

describe('numeric input normalizers', () => {
  it.each([
    ['４,０００Ｇ', 4000],
    ['＋５００枚', 500],
    ['20 000円', 20000],
    ['－７５０枚', -750],
    ['-750枚', -750],
    [' 1,234 ゲーム ', 1234],
  ])('normalizes %s to %d', (raw, expected) => {
    const result = normalizeIntegerInput(raw, 'value', '入力値');
    expect(result.messages).toEqual([]);
    expect(result.value).toBe(expected);
  });

  it('distinguishes a blank value from zero', () => {
    expect(normalizeIntegerInput('', 'value').value).toBeUndefined();
    expect(normalizeIntegerInput('   ', 'value').value).toBeUndefined();
    expect(normalizeIntegerInput(undefined, 'value').value).toBeUndefined();
    expect(normalizeIntegerInput('0', 'value').value).toBe(0);
  });

  it('accepts decimal exchange conditions only when decimals are enabled', () => {
    expect(normalizeDecimalInput('４６.５枚', 'exchange').value).toBe(46.5);
    const integerResult = normalizeIntegerInput('46.5枚', 'medals');
    expect(integerResult.messages[0]?.code).toBe('integer_required');
  });

  it('does not silently discard unsupported characters', () => {
    const result = normalizeIntegerInput('4千G', 'games', 'ゲーム数');
    expect(result.value).toBeUndefined();
    expect(result.messages[0]).toMatchObject({
      severity: 'error',
      code: 'invalid_numeric_input',
      field: 'games',
    });
    expect(result.messages[0]?.correction).toBeTruthy();
  });

  it('rejects non-finite and unsafe integer values', () => {
    expect(normalizeIntegerInput(Number.POSITIVE_INFINITY, 'value').messages[0]?.code).toBe(
      'non_finite_number',
    );
    expect(normalizeIntegerInput(Number.MAX_SAFE_INTEGER + 1, 'value').messages[0]?.code).toBe(
      'unsafe_integer',
    );
  });
});
