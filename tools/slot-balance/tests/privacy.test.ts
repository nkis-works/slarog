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
      errorCode: 'none',
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
      errorCode: 'none',
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

  it('rejects an invalid transfer contract', () => {
    const prepared = prepareSlotBalanceTransfer(
      { version: 2, source: 'other', mode: 'net_medals' },
      { calculatedInputRevision: 1, currentInputRevision: 1 },
    );
    expect(prepared.ok).toBe(false);
    expect(prepared.errors[0]?.code).toBe('invalid_transfer_payload');
  });
});
