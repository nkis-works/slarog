import { calculateNetMedals } from '../../domain/calculators/net-medals';
import type { PlayScope } from '../../domain/types';
import { combineMessages, requiredInteger } from '../adapters';
import { byId, namedControl } from '../dom';
import { formatGames, formatMedals, formatPercent, formatSignedMedals } from '../formatters';
import type { ResultGroup } from '../renderers';
import type { UiCalculationOutcome, UiModeController } from './types';

export function setupNetMedalsUi(): UiModeController {
  const form = byId<HTMLFormElement>('net-form');
  return {
    calculate(): UiCalculationOutcome {
      const games = requiredInteger(form, 'net.games', 'G数');
      const netMedals = requiredInteger(form, 'net.netMedals', '差枚');
      const messages = combineMessages(games, netMedals);
      if (messages.length > 0 || games.value === undefined || netMedals.value === undefined) {
        return { key: 'net', messages };
      }
      const scope = (namedControl(form, 'net.scope')?.value ?? 'personal_session') as PlayScope;
      const result = calculateNetMedals({
        games: games.value,
        netMedals: netMedals.value,
        gamesScope: scope,
        netMedalsScope: scope,
      });
      if (!result.ok || !result.values) {
        const fieldNames = { games: 'net.games', netMedals: 'net.netMedals' } as const;
        return {
          key: 'net',
          result,
          messages: result.errors.map((message) => ({
            ...message,
            field: message.field
              ? (fieldNames[message.field as keyof typeof fieldNames] ?? message.field)
              : undefined,
          })),
        };
      }
      const values = result.values;
      const primaryItems: ResultGroup['items'] = [];
      if (values.payoutRateEstimate) {
        primaryItems.push({
          label: '差枚から概算した出玉率',
          value: formatPercent(values.payoutRateEstimate.display),
          provenance: result.provenance['payoutRateEstimate'] ?? 'estimated',
          primary: true,
          note: '1Gあたり3枚掛けとして換算した概算です。',
        });
      }
      primaryItems.push({
        label: '1,000Gあたり差枚',
        value: `${formatSignedMedals(values.netMedalsPer1000G.display)}／1,000G`,
        provenance: result.provenance['netMedalsPer1000G'] ?? 'calculated',
        primary: true,
      });
      const groups: ResultGroup[] = [
        { items: primaryItems },
        {
          title: '3枚掛けによる概算内訳',
          items: [
            {
              label: '想定IN（投入枚数）',
              value: formatMedals(values.assumedIn),
              provenance: result.provenance['assumedIn'] ?? 'estimated',
            },
            {
              label: '想定OUT（払出枚数）',
              value: formatMedals(values.assumedOut, true),
              provenance: result.provenance['assumedOut'] ?? 'estimated',
            },
            {
              label: '対象G数',
              value: formatGames(games.value),
              provenance: 'input',
            },
          ],
        },
      ];
      return { key: 'net', result, groups, messages: [] };
    },
  };
}
