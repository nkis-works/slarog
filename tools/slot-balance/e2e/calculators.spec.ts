import { expect, test } from '@playwright/test';

import {
  calculateNet,
  fillInvestmentBase,
  gotoTool,
  selectMainMode,
  selectSubmode,
} from './helpers';

test.describe('差枚', () => {
  test('accepts full-width input and renders rate, IN/OUT, explanation and stale state', async ({
    page,
  }) => {
    await gotoTool(page);
    await calculateNet(page);
    await expect(page.locator('#result-net')).toContainText('104.2%');
    await expect(page.locator('#result-net')).toContainText('+125枚／1,000G');
    await expect(page.locator('#result-net')).toContainText('12,000枚');
    await expect(page.locator('#result-net')).toContainText('+12,500枚');
    await expect(page.locator('#explanations-net')).toContainText('差枚から概算した出玉率');
    await page.locator('[name="net.netMedals"]').fill('＋５０１枚');
    await expect(page.locator('#stale-net')).toBeVisible();
    await expect(page.locator('#stale-net')).toContainText('再計算してください');
  });

  test('blocks 0G and connects the field to its correction', async ({ page }) => {
    await gotoTool(page);
    await calculateNet(page, '0G', '+500枚');
    await expect(page.locator('#error-summary')).toBeVisible();
    await expect(page.locator('#error-summary')).toContainText('ゲーム数は1G以上');
    await expect(page.locator('[name="net.games"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#net-games-error')).not.toBeEmpty();
  });

  test('omits payout rate when three-medal assumed OUT would be negative', async ({ page }) => {
    await gotoTool(page);
    await calculateNet(page, '1000G', '-3001枚');
    await expect(page.locator('#result-net')).not.toContainText('差枚から概算した出玉率');
    await expect(page.locator('#messages-net')).toContainText('3枚掛け換算OUTが0枚未満');
  });
});

test.describe('投資・回収', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTool(page);
    await selectMainMode(page, 'investment');
  });

  test('cash-only case', async ({ page }) => {
    await fillInvestmentBase(page, { cash: '20,000円', current: '1,200枚', exchange: '50' });
    await page.locator('[data-calculate="investment"]').click();
    await expect(page.locator('#result-investment')).toContainText('24,000円');
    await expect(page.locator('#result-investment')).toContainText('+4,000円');
    await expect(page.locator('#result-investment')).toContainText('120.0%');
    await expect(page.locator('#result-investment')).toContainText('1,000枚');
  });

  test('cash plus stored medals keeps two recovery lines separate', async ({ page }) => {
    await fillInvestmentBase(page, { cash: '20000', current: '1200', exchange: '50' });
    await page.getByText('追加条件を入力', { exact: true }).click();
    await page.locator('[name="investment.storedMedals"]').fill('500');
    await page.locator('[data-calculate="investment"]').click();
    await expect(page.locator('#result-investment')).toContainText('-6,000円');
    await expect(page.locator('#result-investment')).toContainText(
      '現金・使用貯メダル分の回収ライン（現在枚数）',
    );
    await expect(page.locator('#result-investment')).toContainText('1,500枚');
  });

  test('non-equivalent exchange and exchange unit are explicit', async ({ page }) => {
    await fillInvestmentBase(page, { cash: '20000', current: '1000', exchange: '56', unit: '500' });
    await page.getByText('追加条件を入力', { exact: true }).click();
    await page.locator('[name="investment.lendRate"]').fill('46');
    await page.locator('[data-calculate="investment"]').click();
    await expect(page.locator('#result-investment')).toContainText('17,500円');
    await expect(page.locator('#messages-investment')).toContainText('非等価交換');
  });

  test('already-exchanged money is included', async ({ page }) => {
    await fillInvestmentBase(page, { cash: '10000', current: '400', exchange: '50', unit: '500' });
    await page.getByText('追加条件を入力', { exact: true }).click();
    await page.locator('[name="investment.exchangedYen"]').fill('5000');
    await page.locator('[data-calculate="investment"]').click();
    await expect(page.locator('#result-investment')).toContainText('13,000円');
    await expect(page.locator('#result-investment')).toContainText('+3,000円');
  });

  test('cash zero omits cash recovery rate', async ({ page }) => {
    await fillInvestmentBase(page, { cash: '0', current: '600', exchange: '50' });
    await page.getByText('追加条件を入力', { exact: true }).click();
    await page.locator('[name="investment.storedMedals"]').fill('500');
    await page.locator('[data-calculate="investment"]').click();
    await expect(page.locator('#result-investment')).not.toContainText('現金回収率');
    await expect(page.locator('#result-investment')).toContainText('120.0%');
    await expect(page.locator('#messages-investment')).toContainText('現金投資0円');
  });
});

test.describe('区間・IN/OUT', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTool(page);
    await selectMainMode(page, 'segments-inout');
  });

  test('segment totals are recalculated instead of averaging rates, with undo', async ({
    page,
  }) => {
    await page.locator('[name="segments.0.games"]').fill('1000');
    await page.locator('[name="segments.0.netMedals"]').fill('+200');
    await page.locator('#add-net-segment').click();
    await page.locator('[name="segments.1.games"]').fill('2000');
    await page.locator('[name="segments.1.netMedals"]').fill('-400');
    await page.locator('[data-calculate="segments"]').click();
    await expect(page.locator('#result-segments')).toContainText('3,000G');
    await expect(page.locator('#result-segments')).toContainText('-200枚');
    await expect(page.locator('#result-segments')).toContainText('97.8%');
    await expect(page.locator('#result-segments')).toContainText('単純平均ではなく');

    const removeButtons = page.locator('#net-segment-list [data-remove-row]');
    await removeButtons.nth(1).click();
    await expect(page.locator('#net-segment-undo')).toBeVisible();
    await page.locator('#undo-net-segment').click();
    await expect(page.locator('#net-segment-list [data-segment-row]')).toHaveCount(2);
  });

  test('actual IN/OUT calculates measured rate and blocks zero IN', async ({ page }) => {
    await selectSubmode(page, 'inout');
    await page.locator('[name="inout.actualIn"]').fill('12000');
    await page.locator('[name="inout.actualOut"]').fill('12500');
    await page.locator('[data-calculate="inout"]').click();
    await expect(page.locator('#result-inout')).toContainText('104.2%');
    await expect(page.locator('#result-inout')).toContainText('+500枚');
    await expect(page.locator('#result-inout')).toContainText('実測');

    await page.locator('[name="inout.actualIn"]').fill('0');
    await page.locator('[data-calculate="inout"]').click();
    await expect(page.locator('#error-summary')).toContainText('実IN（総投入枚数）は1枚以上');
  });

  test('coin hold requires confirmations and works for direct and breakdown input', async ({
    page,
  }) => {
    await selectSubmode(page, 'coin');
    await page.locator('[name="coin.normalGames"]').fill('680');
    await page.locator('[name="coin.netUsedMedals"]').fill('1000');
    await page.locator('[data-calculate="coin"]').click();
    await expect(page.locator('#error-summary')).toContainText('確認が必要');

    await page.locator('[name="coin.atBonusExcluded"]').check();
    await page.locator('[name="coin.scopeConfirmed"]').check();
    await page.locator('[data-calculate="coin"]').click();
    await expect(page.locator('#result-coin')).toContainText('34.0G／50枚');

    await page.getByLabel('内訳から入力').check();
    await page.locator('[name="coin.startMedals"]').fill('500');
    await page.locator('[name="coin.addedMedals"]').fill('500');
    await page.locator('[name="coin.endMedals"]').fill('0');
    await page.locator('[name="coin.takenOutMedals"]').fill('0');
    await page.locator('[data-calculate="coin"]').click();
    await expect(page.locator('#result-coin')).toContainText('34.0G／50枚');
  });
});
