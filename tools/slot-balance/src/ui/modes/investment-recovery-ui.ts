import { calculateInvestmentRecovery } from '../../domain/calculators/investment-recovery';
import type { ValidationMessage } from '../../domain/types';
import {
  combineMessages,
  optionalDecimal,
  optionalInteger,
  pairedOptionalMessage,
  requiredInteger,
} from '../adapters';
import { byId } from '../dom';
import { formatMedals, formatPercent, formatSignedMedals, formatYen } from '../formatters';
import type { ResultGroup } from '../renderers';
import type { UiCalculationOutcome, UiModeController } from './types';

export function setupInvestmentRecoveryUi(): UiModeController {
  const form = byId<HTMLFormElement>('investment-form');
  return {
    calculate(): UiCalculationOutcome {
      const cash = requiredInteger(form, 'investment.cash', '現金投資額');
      const current = requiredInteger(form, 'investment.currentMedals', '現在手元にある枚数');
      const stored = optionalInteger(form, 'investment.storedMedals', '使用した貯メダル');
      const exchanged = optionalInteger(form, 'investment.exchangedYen', 'すでに交換した金額');
      const lend = optionalDecimal(form, 'investment.lendRate', '貸出条件');
      const exchange = optionalDecimal(form, 'investment.exchangeRate', '交換条件');
      const unit = optionalInteger(form, 'investment.exchangeUnit', '交換単位');
      const games = optionalInteger(form, 'investment.games', 'G数');
      const netMedals = optionalInteger(form, 'investment.netMedals', '差枚');
      const messages: ValidationMessage[] = [
        ...combineMessages(
          cash,
          current,
          stored,
          exchanged,
          lend,
          exchange,
          unit,
          games,
          netMedals,
        ),
        ...pairedOptionalMessage(
          games,
          netMedals,
          'investment.games',
          'investment.netMedals',
          'G数と差枚は同じ対象範囲で両方入力してください。',
        ),
      ];
      if (messages.length > 0 || cash.value === undefined || current.value === undefined) {
        return { key: 'investment', messages };
      }
      const result = calculateInvestmentRecovery({
        cashInvestmentYen: cash.value,
        currentMedals: current.value,
        storedMedalsUsed: stored.value,
        alreadyExchangedYen: exchanged.value,
        lendMedalsPer1000Yen: lend.value,
        exchangeMedalsPer1000Yen: exchange.value,
        exchangeUnitYen: unit.value,
        requestRecoveryLines: exchange.value !== undefined,
        games: games.value,
        netMedals: netMedals.value,
      });
      if (!result.ok || !result.values) {
        const fieldNames: Record<string, string> = {
          cashInvestmentYen: 'investment.cash',
          currentMedals: 'investment.currentMedals',
          storedMedalsUsed: 'investment.storedMedals',
          alreadyExchangedYen: 'investment.exchangedYen',
          lendMedalsPer1000Yen: 'investment.lendRate',
          exchangeMedalsPer1000Yen: 'investment.exchangeRate',
          exchangeUnitYen: 'investment.exchangeUnit',
          games: 'investment.games',
          netMedals: 'investment.netMedals',
        };
        return {
          key: 'investment',
          result,
          messages: result.errors.map((message) => ({
            ...message,
            field: message.field ? (fieldNames[message.field] ?? message.field) : undefined,
          })),
        };
      }
      const values = result.values;
      const groups: ResultGroup[] = [
        {
          items: [
            {
              label: '現在枚数の交換見込額',
              value: formatYen(values.currentExchangeEstimateYen),
              provenance: result.provenance['currentExchangeEstimateYen'] ?? 'estimated',
              primary: true,
            },
            {
              label: '合計回収見込額',
              value: formatYen(values.grossReturnEstimateYen),
              provenance: result.provenance['grossReturnEstimateYen'] ?? 'estimated',
              primary: true,
            },
            {
              label: '現金投資との差額',
              value: formatYen(values.cashNetEstimateYen, true),
              provenance: result.provenance['cashNetEstimateYen'] ?? 'estimated',
              primary: true,
            },
            {
              label: '使用貯メダルの価値を含む差額',
              value: formatYen(values.totalValueNetEstimateYen.display, true),
              provenance: result.provenance['totalValueNetEstimateYen'] ?? 'estimated',
              primary: true,
            },
          ],
        },
        {
          title: '換算内訳',
          items: [
            {
              label: '現在枚数の理論交換額',
              value: formatYen(values.currentTheoreticalExchangeYen.display),
              provenance: result.provenance['currentTheoreticalExchangeYen'] ?? 'estimated',
            },
            {
              label: '使用貯メダルの相当額',
              value: formatYen(values.storedMedalValueYen.display),
              provenance: result.provenance['storedMedalValueYen'] ?? 'estimated',
            },
          ],
        },
      ];
      const rateItems: ResultGroup['items'] = [];
      if (values.cashRecoveryRate) {
        rateItems.push({
          label: '現金回収率',
          value: formatPercent(values.cashRecoveryRate.display),
          provenance: result.provenance['cashRecoveryRate'] ?? 'estimated',
        });
      }
      if (values.totalRecoveryRate) {
        rateItems.push({
          label: '貯メダル込み回収率',
          value: formatPercent(values.totalRecoveryRate.display),
          provenance: result.provenance['totalRecoveryRate'] ?? 'estimated',
        });
      }
      if (rateItems.length > 0) groups.push({ title: '回収率', items: rateItems });

      const lineItems: ResultGroup['items'] = [];
      if (values.cashRecoveryLine) {
        lineItems.push(
          {
            label: '現金投資額の回収に必要な枚数',
            value: formatMedals(values.cashRecoveryLine.requiredMedals),
            provenance: result.provenance['cashRecoveryLine'] ?? 'estimated',
          },
          {
            label: '現金投資額の回収までの過不足枚数',
            value: formatSignedMedals(-values.cashRecoveryLine.gapMedals),
            provenance: result.provenance['cashRecoveryLine'] ?? 'estimated',
            note: 'プラスは必要枚数を上回る状態、マイナスは不足している状態です。',
          },
        );
      }
      if (values.showTotalRecoveryLine && values.totalRecoveryLine) {
        lineItems.push(
          {
            label: '現金・使用貯メダル分の回収に必要な枚数',
            value: formatMedals(values.totalRecoveryLine.requiredMedals),
            provenance: result.provenance['totalRecoveryLine'] ?? 'estimated',
          },
          {
            label: '現金・使用貯メダル分の回収までの過不足枚数',
            value: formatSignedMedals(-values.totalRecoveryLine.gapMedals),
            provenance: result.provenance['totalRecoveryLine'] ?? 'estimated',
          },
        );
      }
      if (lineItems.length > 0) groups.push({ title: '回収に必要な枚数', items: lineItems });
      if (values.cashBorrowedMedalsEquivalent) {
        groups.push({
          title: '貸出条件の参考',
          items: [
            {
              label: '現金投資で借りた枚数の換算値',
              value: formatMedals(values.cashBorrowedMedalsEquivalent.display),
              provenance: result.provenance['cashBorrowedMedalsEquivalent'] ?? 'reference',
            },
          ],
        });
      }
      if (values.netMedalsAnalysis) {
        const netItems: ResultGroup['items'] = [
          {
            label: '1,000Gあたり差枚',
            value: `${formatSignedMedals(values.netMedalsAnalysis.netMedalsPer1000G.display)}／1,000G`,
            provenance: 'calculated',
          },
        ];
        if (values.netMedalsAnalysis.payoutRateEstimate) {
          netItems.unshift({
            label: '差枚から概算した出玉率',
            value: formatPercent(values.netMedalsAnalysis.payoutRateEstimate.display),
            provenance: 'estimated',
          });
        }
        groups.push({ title: '追加したG数・差枚', items: netItems });
      }
      return { key: 'investment', result, groups, messages: [] };
    },
  };
}
