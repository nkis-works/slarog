import { describe, expect, it } from 'vitest';

import {
  createAnalyticsEvent,
  sanitizeAnalyticsMetadata,
} from '../src/application/analytics-events';
import {
  prepareSlotBalanceTransfer,
  sanitizeSlotBalanceTransfer,
  serializeSlotBalanceTransfer,
} from '../src/application/slarog-transfer';
import { CALCULATION_VERSION } from '../src/domain/version';

describe('privacy-safe application contracts', () => {
  it('allows only approved analytics metadata', () => {
    const sanitized = sanitizeAnalyticsMetadata({
      mode: 'net_medals',
      outcome: 'success',
      calculationKind: 'estimated',
      viewportCategory: 'mobile',
      errorCode: 'invalid_transfer_payload',
      cashInvestmentYen: 20000,
      netMedals: 500,
      games: 4000,
      machineName: '自由入力機種',
      venueName: '店舗',
      memo: 'private note',
    });
    expect(sanitized).toEqual({
      mode: 'net_medals',
      outcome: 'success',
      errorCode: 'invalid_transfer_payload',
      calculationKind: 'estimated',
      viewportCategory: 'mobile',
    });
    expect(JSON.stringify(sanitized)).not.toMatch(
      /cashInvestmentYen|netMedals|games|machineName|venueName|memo|20000|500|4000/,
    );
  });

  it('creates a typed analytics event without sending it', () => {
    expect(
      createAnalyticsEvent('calculation_completed', {
        mode: 'investment_recovery',
        outcome: 'success',
      }),
    ).toEqual({
      name: 'calculation_completed',
      metadata: { mode: 'investment_recovery', outcome: 'success' },
    });
  });

  it.each([
    '20000',
    '自由入力機種',
    'ゲーム数は1以上で入力してください。',
    'unknown_snake_case_code',
    'games not positive',
    `games_not_positive\nprivate`,
    'a'.repeat(65),
  ])('drops a non-allowlisted analytics error code: %s', (errorCode) => {
    expect(sanitizeAnalyticsMetadata({ errorCode })).toEqual({});
  });

  it('keeps an approved stable analytics error code', () => {
    expect(sanitizeAnalyticsMetadata({ errorCode: 'invalid_transfer_payload' })).toEqual({
      errorCode: 'invalid_transfer_payload',
    });
  });

  it('removes monetary and unknown fields from a runtime transfer payload', () => {
    const transfer = sanitizeSlotBalanceTransfer({
      version: 1,
      source: 'nkisworks-slot-balance',
      calculationVersion: CALCULATION_VERSION,
      mode: 'investment_recovery',
      scope: 'personal_session',
      games: 4000,
      netMedals: 500,
      cashInvestmentYen: 20000,
      storedMedalValueYen: 10000,
      alreadyExchangedYen: 5000,
      venueName: 'private',
    });
    expect(transfer).toEqual({
      version: 1,
      source: 'nkisworks-slot-balance',
      calculationVersion: CALCULATION_VERSION,
      mode: 'investment_recovery',
      scope: 'personal_session',
      games: 4000,
      netMedals: 500,
    });
    expect(JSON.stringify(transfer)).not.toMatch(
      /cashInvestmentYen|storedMedalValueYen|alreadyExchangedYen|venueName|20000|10000|5000/,
    );
  });

  it('serializes JSON only and does not generate a URL or deep link', () => {
    const transfer = {
      version: 1 as const,
      source: 'nkisworks-slot-balance' as const,
      calculationVersion: CALCULATION_VERSION,
      mode: 'net_medals' as const,
      games: 4000,
      netMedals: 500,
    };
    const serialized = serializeSlotBalanceTransfer(transfer);
    expect(serialized.startsWith('{')).toBe(true);
    expect(serialized).not.toMatch(/https?:|slarog:|[?&]games=/);
  });

  it('prepares a current, valid transfer snapshot', () => {
    const prepared = prepareSlotBalanceTransfer(
      {
        version: 1,
        source: 'nkisworks-slot-balance',
        calculationVersion: CALCULATION_VERSION,
        mode: 'segments_inout',
        segments: [{ label: 'A', actualIn: 12000, actualOut: 12500 }],
      },
      { calculatedInputRevision: 'revision-1', currentInputRevision: 'revision-1' },
    );
    expect(prepared.ok).toBe(true);
    expect(prepared.errors).toEqual([]);
    expect(prepared.serialized).toBe(JSON.stringify(prepared.value));
  });

  it('requires valid mode-specific net-medals fields', () => {
    const base = {
      version: 1,
      source: 'nkisworks-slot-balance',
      calculationVersion: CALCULATION_VERSION,
      mode: 'net_medals',
    };
    expect(sanitizeSlotBalanceTransfer({ ...base, games: 1, netMedals: 0 })).toBeDefined();
    expect(sanitizeSlotBalanceTransfer({ ...base, games: 0, netMedals: 0 })).toBeUndefined();
    expect(sanitizeSlotBalanceTransfer({ ...base, games: 1 })).toBeUndefined();
    expect(sanitizeSlotBalanceTransfer({ ...base, games: 1.5, netMedals: 0 })).toBeUndefined();
    expect(
      sanitizeSlotBalanceTransfer({ ...base, games: 1, netMedals: Number.MAX_SAFE_INTEGER + 1 }),
    ).toBeUndefined();
  });

  it('requires investment games and net medals together', () => {
    const base = {
      version: 1,
      source: 'nkisworks-slot-balance',
      calculationVersion: CALCULATION_VERSION,
      mode: 'investment_recovery',
    };
    expect(sanitizeSlotBalanceTransfer(base)).toBeDefined();
    expect(sanitizeSlotBalanceTransfer({ ...base, games: 100 })).toBeUndefined();
    expect(sanitizeSlotBalanceTransfer({ ...base, netMedals: 20 })).toBeUndefined();
    expect(sanitizeSlotBalanceTransfer({ ...base, games: 100, netMedals: 20 })).toBeDefined();
  });

  it('requires one homogeneous, complete segment form and enforces the maximum', () => {
    const base = {
      version: 1,
      source: 'nkisworks-slot-balance',
      calculationVersion: CALCULATION_VERSION,
      mode: 'segments_inout',
    };
    expect(sanitizeSlotBalanceTransfer({ ...base, segments: [] })).toBeUndefined();
    expect(
      sanitizeSlotBalanceTransfer({ ...base, segments: [{ games: 100, netMedals: 20 }] }),
    ).toBeDefined();
    expect(
      sanitizeSlotBalanceTransfer({ ...base, segments: [{ actualIn: 100, actualOut: 120 }] }),
    ).toBeDefined();
    expect(sanitizeSlotBalanceTransfer({ ...base, segments: [{}] })).toBeUndefined();
    expect(sanitizeSlotBalanceTransfer({ ...base, segments: [{ games: 100 }] })).toBeUndefined();
    expect(
      sanitizeSlotBalanceTransfer({
        ...base,
        segments: [{ actualIn: 100, actualOut: -1 }],
      }),
    ).toBeUndefined();
    expect(
      sanitizeSlotBalanceTransfer({
        ...base,
        segments: [{ games: 100, netMedals: 20, actualIn: 300, actualOut: 320 }],
      }),
    ).toBeUndefined();
    expect(
      sanitizeSlotBalanceTransfer({
        ...base,
        segments: [
          { games: 100, netMedals: 20 },
          { actualIn: 300, actualOut: 320 },
        ],
      }),
    ).toBeUndefined();
    expect(
      sanitizeSlotBalanceTransfer({
        ...base,
        segments: Array.from({ length: 101 }, () => ({ games: 1, netMedals: 0 })),
      }),
    ).toBeUndefined();
  });

  it.each(['2025-02-29', '2024-13-01', '2024-04-31', '24-01-01'])(
    'rejects an invalid play date: %s',
    (playDate) => {
      expect(
        sanitizeSlotBalanceTransfer({
          version: 1,
          source: 'nkisworks-slot-balance',
          calculationVersion: CALCULATION_VERSION,
          mode: 'net_medals',
          games: 100,
          netMedals: 0,
          playDate,
        }),
      ).toBeUndefined();
    },
  );

  it('accepts a real leap-day date', () => {
    expect(
      sanitizeSlotBalanceTransfer({
        version: 1,
        source: 'nkisworks-slot-balance',
        calculationVersion: CALCULATION_VERSION,
        mode: 'net_medals',
        games: 100,
        netMedals: 0,
        playDate: '2024-02-29',
      })?.playDate,
    ).toBe('2024-02-29');
  });

  it.each([
    { machineName: `機${'種'.repeat(200)}` },
    { memo: 'a'.repeat(501) },
    { machineName: '機種\n秘密' },
    { memo: 'memo\u0000private' },
  ])('rejects over-limit or control-character text without truncating it', (text) => {
    expect(
      sanitizeSlotBalanceTransfer({
        version: 1,
        source: 'nkisworks-slot-balance',
        calculationVersion: CALCULATION_VERSION,
        mode: 'net_medals',
        games: 100,
        netMedals: 0,
        ...text,
      }),
    ).toBeUndefined();
  });

  it('rejects an invalid transfer contract', () => {
    const prepared = prepareSlotBalanceTransfer(
      { version: 2, source: 'other', mode: 'net_medals' },
      { calculatedInputRevision: 1, currentInputRevision: 1 },
    );
    expect(prepared.ok).toBe(false);
    expect(prepared.errors[0]?.code).toBe('invalid_transfer_payload');
  });
});
