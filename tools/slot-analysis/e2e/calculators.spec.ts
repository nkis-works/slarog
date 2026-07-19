import { expect, test } from '@playwright/test';

import { calculateQuick, gotoTool, openPanel, selectSegmentMethod } from './helpers';

test.describe('クイック実績', () => {
  test('全角入力から指定ケースと計算条件を表示する', async ({ page }) => {
    await gotoTool(page);
    await expect(page.locator('#quick-result')).toBeHidden();

    await calculateQuick(page);

    await expect(page.locator('#quick-rate')).toHaveText('104.2%');
    await expect(page.locator('#quick-per-1000')).toHaveText('+125枚／1,000G');
    await expect(page.locator('#quick-input-summary')).toHaveText('4,000G／+500枚');
    await page.locator('#quick-conditions').click();
    await expect(page.locator('#quick-condition-content')).toContainText('想定IN 12,000枚');
    await expect(page.locator('#quick-condition-content')).toContainText('想定OUT 12,500枚');
    await expect(page.locator('#quick-condition-content')).toContainText(
      '1Gあたり3枚として実績出玉率を計算',
    );
    await expect(page.locator('#quick-condition-content')).toContainText(
      '出玉率は小数第2位を四捨五入し、小数1桁で表示します。',
    );
    await expect(page.locator('#quick-condition-content')).not.toContainText('計算バージョン');
    await expect(page.locator('#quick-condition-content')).not.toContainText('half-away-from-zero');
  });

  test('0Gを拒否し、要約・フィールド・フォーカスを関連付ける', async ({ page }) => {
    await gotoTool(page);
    await calculateQuick(page, '0G', '+500枚');

    await expect(page.locator('#error-summary')).toBeVisible();
    await expect(page.locator('#error-summary')).toContainText('総ゲーム数は1以上の整数');
    await expect(page.locator('#quick-games')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#quick-games-error')).not.toBeEmpty();
    await expect(page.locator('#error-summary')).toBeFocused();
    await page.locator('#error-summary-list .error-summary-link').click();
    await expect(page.locator('#quick-games')).toBeFocused();
    expect(page.url()).not.toContain('#');
  });

  test('想定OUTが負になる極端値を安全に拒否する', async ({ page }) => {
    await gotoTool(page);
    await calculateQuick(page, '1000G', '-3001枚');

    await expect(page.locator('#quick-result')).toBeHidden();
    await expect(page.locator('#error-summary')).toContainText('想定OUTが0枚未満');
  });

  test('基準は初期未選択で、選択した基準だけ評価文を表示する', async ({ page }) => {
    await gotoTool(page);
    await calculateQuick(page);

    await expect(page.locator('[data-quick-benchmark]')).toHaveCount(3);
    await expect(page.locator('[data-quick-benchmark="100"]')).toContainText('基準差枚 0枚');
    await expect(page.locator('[data-quick-benchmark="100"]')).toContainText('実績は +500枚上回る');
    await expect(page.locator('[data-quick-benchmark="103"]')).toContainText('基準差枚 +360枚');
    await expect(page.locator('[data-quick-benchmark="103"]')).toContainText('実績は +140枚上回る');
    await expect(page.locator('[data-quick-benchmark="105"]')).toContainText('実績は −100枚下回る');
    await expect(page.locator('#quick-benchmark-list')).not.toContainText('期待');
    await expect(page.locator('[data-quick-benchmark][aria-pressed="true"]')).toHaveCount(0);
    await expect(page.locator('#quick-benchmark-summary')).toBeHidden();

    await page.locator('[data-quick-benchmark="103"]').click();
    await expect(page.locator('[data-quick-benchmark="103"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('#quick-benchmark-summary')).toHaveText(
      'この入力は103%基準の差枚を140枚上回ります。',
    );
  });

  test('入力変更後は結果をstaleにし、転送系機能を再計算まで止める', async ({ page }) => {
    await gotoTool(page);
    await calculateQuick(page);

    await page.locator('#quick-games').fill('5000');
    await expect(page.locator('#quick-stale')).toBeVisible();
    await expect(page.locator('#quick-stale')).toContainText('再計算してください');
    await expect(page.locator('[data-launcher="target"]')).toBeDisabled();
    await expect(page.locator('[data-launcher="segments"]')).toBeDisabled();
    await expect(page.locator('[data-launcher="investment"]')).toBeEnabled();

    await page.locator('#quick-form button[type="submit"]').click();
    await expect(page.locator('#quick-stale')).toBeHidden();
    await expect(page.locator('[data-launcher="target"]')).toBeEnabled();
    await expect(page.locator('#quick-input-summary')).toHaveText('5,000G／+500枚');
  });
});

test.describe('目標逆算', () => {
  test('不足時は必要なプラス差枚を符号付きで示す', async ({ page }) => {
    await gotoTool(page);
    await calculateQuick(page, '4000', '-300');
    await openPanel(page, 'target');
    await page.locator('#target-games').fill('5000');
    await page.locator('#target-rate').fill('100');
    await page.locator('#target-form button[type="submit"]').click();

    await expect(page.locator('#target-result')).toContainText('あと+300枚必要');
    await expect(page.locator('#target-result')).toContainText('110.0%以上');
    await expect(page.locator('#target-result')).toContainText(
      '達成確率や将来の結果を示すものではありません',
    );
  });

  test('余裕時は許容できるマイナス差枚として示す', async ({ page }) => {
    await gotoTool(page);
    await calculateQuick(page);
    await openPanel(page, 'target');
    await page.locator('[data-target-games="1000"]').click();
    await page.locator('[data-target-rate="100"]').click();
    await page.locator('#target-form button[type="submit"]').click();

    await expect(page.locator('#target-result')).toContainText('−500枚までなら目標を維持');
    await expect(page.locator('#target-result')).toContainText('83.3%以上');
    await expect(page.locator('#target-result')).toContainText('残りゲーム数1,000G');
  });
});

test.describe('区間分析', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTool(page);
    await calculateQuick(page);
    await openPanel(page, 'segments');
  });

  test('方式は初期未選択で、直接入力を合計から再計算しundoできる', async ({ page }) => {
    await expect(page.locator('[name="segment.method"]:checked')).toHaveCount(0);
    await expect(page.locator('#segments-form')).toBeHidden();

    await selectSegmentMethod(page, 'direct');
    await expect(page.locator('[data-direct-row]')).toHaveCount(2);
    await expect(page.locator('[name="segments.direct.0.games"]')).toHaveValue('');
    await expect(page.locator('[name="segments.direct.0.netMedals"]')).toHaveValue('');
    await page.locator('[name="segments.direct.0.games"]').fill('1000');
    await page.locator('[name="segments.direct.0.netMedals"]').fill('+200');
    await page.locator('[name="segments.direct.1.games"]').fill('2000');
    await page.locator('[name="segments.direct.1.netMedals"]').fill('-400');
    await page.locator('#segments-form button[type="submit"]').click();

    await expect(page.locator('#segment-facts')).toContainText('97.8%');
    await expect(page.locator('#segment-facts')).toContainText('合計G3,000G');
    await expect(page.locator('#segment-facts')).toContainText('合計差枚−200枚');
    await expect(page.locator('#segment-facts')).toContainText('入力した地点間の最大下落400枚');
    await expect(page.locator('#segment-benchmark-result')).toBeHidden();

    await page.locator('[data-direct-row]').nth(1).locator('[data-remove-direct]').click();
    await expect(page.locator('#direct-undo')).toBeVisible();
    await page.locator('#direct-undo button').click();
    await expect(page.locator('[data-direct-row]')).toHaveCount(2);
    await expect(page.locator('[name="segments.direct.1.netMedals"]')).toHaveValue('-400');
  });

  test('現在結果は明示操作だけで区間1へ入力し、既存値を上書きしない', async ({ page }) => {
    await selectSegmentMethod(page, 'direct');
    const games = page.locator('[name="segments.direct.0.games"]');
    const net = page.locator('[name="segments.direct.0.netMedals"]');
    await expect(games).toHaveValue('');
    await expect(net).toHaveValue('');
    await page.locator('#transfer-to-direct').click();
    await expect(games).toHaveValue('4000');
    await expect(net).toHaveValue('500');
    await expect(page.locator('#transfer-to-direct')).toBeDisabled();

    await games.fill('1234');
    await expect(page.locator('#transfer-to-direct')).toBeDisabled();
    await expect(games).toHaveValue('1234');
    await expect(net).toHaveValue('500');
  });

  test('累積地点は開始0/0だけを用意し、現在結果を地点1へ明示入力する', async ({ page }) => {
    await selectSegmentMethod(page, 'cumulative');
    await expect(page.locator('[name="segments.points.0.games"]')).toHaveValue('0');
    await expect(page.locator('[name="segments.points.0.netMedals"]')).toHaveValue('0');
    await expect(page.locator('[name="segments.points.1.games"]')).toHaveValue('');
    await expect(page.locator('[name="segments.points.1.netMedals"]')).toHaveValue('');
    await expect(page.locator('[name="segments.points.2.games"]')).toHaveValue('');
    await expect(page.locator('[name="segments.points.2.netMedals"]')).toHaveValue('');
    await page.locator('#transfer-to-cumulative').click();
    await expect(page.locator('[name="segments.points.1.games"]')).toHaveValue('4000');
    await expect(page.locator('[name="segments.points.1.netMedals"]')).toHaveValue('500');
    await expect(page.locator('#transfer-to-cumulative')).toBeDisabled();
  });

  test('選択基準だけ区間の押し上げ・押し下げを表示する', async ({ page }) => {
    await selectSegmentMethod(page, 'direct');
    await page.locator('[name="segments.direct.0.label"]').fill('A');
    await page.locator('[name="segments.direct.0.games"]').fill('1000');
    await page.locator('[name="segments.direct.0.netMedals"]').fill('+200');
    await page.locator('[name="segments.direct.1.label"]').fill('B');
    await page.locator('[name="segments.direct.1.games"]').fill('2000');
    await page.locator('[name="segments.direct.1.netMedals"]').fill('-400');
    await page.locator('#segments-form button[type="submit"]').click();

    await expect(page.locator('[name="segment.benchmark"]:checked')).toHaveCount(0);
    await page.locator('[name="segment.benchmark"][value="103"]').check();
    await expect(page.locator('#segment-benchmark-result')).toContainText('103.0%基準');
    await expect(page.locator('#segment-benchmark-result')).toContainText('A');
    await expect(page.locator('#segment-benchmark-result')).toContainText('+110枚・上回る');
    await expect(page.locator('#segment-benchmark-result')).toContainText('B');
    await expect(page.locator('#segment-benchmark-result')).toContainText('−580枚・下回る');
    await expect(page.locator('#segment-benchmark-result')).toContainText('最大の押し上げA +110枚');
    await expect(page.locator('#segment-benchmark-result')).toContainText('最大の押し下げB −580枚');
  });

  test('累積地点を隣接区間へ変換し、最大下落と回復を表示する', async ({ page }) => {
    await selectSegmentMethod(page, 'cumulative');
    await expect(page.locator('[data-cumulative-row]')).toHaveCount(3);
    await page.locator('[name="segments.points.1.games"]').fill('1000');
    await page.locator('[name="segments.points.1.netMedals"]').fill('200');
    await page.locator('[name="segments.points.2.games"]').fill('3000');
    await page.locator('[name="segments.points.2.netMedals"]').fill('-200');
    await page.locator('#segments-form button[type="submit"]').click();

    await expect(page.locator('#segment-facts')).toContainText('グラフの累積地点');
    await expect(page.locator('#segment-facts')).toContainText('3,000G');
    await expect(page.locator('#segment-facts')).toContainText('−200枚');
    await expect(page.locator('#segment-facts')).toContainText('最大下落400枚');
    await expect(page.locator('#segment-facts')).toContainText('最大回復0枚');
  });

  test('累積地点の有効なマイナス区間とOUT 0境界を通し、下限を具体的に案内する', async ({
    page,
  }) => {
    await selectSegmentMethod(page, 'cumulative');
    await page.locator('#add-cumulative-point').click();
    await page.locator('[name="segments.points.1.games"]').fill('1000');
    await page.locator('[name="segments.points.1.netMedals"]').fill('600');
    await page.locator('[name="segments.points.2.games"]').fill('2000');
    await page.locator('[name="segments.points.2.netMedals"]').fill('700');
    await page.locator('[name="segments.points.3.games"]').fill('3000');
    const endNet = page.locator('[name="segments.points.3.netMedals"]');
    const submit = page.locator('#segments-form button[type="submit"]');

    await endNet.fill('-1000');
    await submit.click();
    await expect(page.locator('#error-summary')).toBeHidden();
    await expect(page.locator('#segment-facts')).toContainText('合計差枚−1,000枚');

    await endNet.fill('-2300');
    await submit.click();
    await expect(page.locator('#error-summary')).toBeHidden();
    await expect(page.locator('#segment-facts')).toContainText('合計差枚−2,300枚');

    await endNet.fill('-2301');
    await submit.click();
    await expect(page.locator('#error-summary')).toContainText('下限を1枚下回っています');
    await expect(endNet).toHaveAttribute('aria-invalid', 'true');
    const fieldError = page.locator('[data-error-for="segments.points.3.netMedals"]');
    await expect(fieldError.locator('summary')).toHaveText('入力できる下限を見る');
    await expect(fieldError).toContainText('地点2から地点3');
    await expect(fieldError).toContainText('1,000Gで−3,001枚');
    await expect(fieldError).toContainText('最大−3,000枚');
    await expect(fieldError).toContainText('累積差枚を−2,300枚以上');
    await expect(fieldError).toContainText('マイナス区間は入力できます');
    await page.locator('#error-summary-list .error-summary-link').click();
    await expect(endNet).toBeFocused();

    await endNet.fill('-3000');
    await submit.click();
    await expect(page.locator('#error-summary')).toContainText('下限を700枚下回っています');
    await expect(fieldError).toContainText('1,000Gで−3,700枚');
    await expect(fieldError).toContainText('累積差枚−2,300枚が下限');
  });

  test('直接入力は全角マイナスを含む有効値とOUT 0境界を通す', async ({ page }) => {
    await selectSegmentMethod(page, 'direct');
    await page.locator('[data-direct-row]').nth(1).locator('[data-remove-direct]').click();
    await page.locator('[name="segments.direct.0.games"]').fill('1000');
    const net = page.locator('[name="segments.direct.0.netMedals"]');
    const submit = page.locator('#segments-form button[type="submit"]');

    await net.fill('－１，７００');
    await submit.click();
    await expect(page.locator('#error-summary')).toBeHidden();
    await expect(page.locator('#segment-facts')).toContainText('合計差枚−1,700枚');

    await net.fill('-3000');
    await submit.click();
    await expect(page.locator('#error-summary')).toBeHidden();
    await expect(page.locator('#segment-facts')).toContainText('0.0%');

    await net.fill('-3001');
    await submit.click();
    await expect(page.locator('#error-summary')).toContainText('下限を1枚下回っています');
    await expect(page.locator('[data-error-for="segments.direct.0.netMedals"]')).toContainText(
      'マイナス区間は入力できます',
    );
  });

  test('方式ごとの上限と最小行数を守る', async ({ page }) => {
    await selectSegmentMethod(page, 'direct');
    for (let index = 2; index < 10; index += 1) await page.locator('#add-direct-segment').click();
    await expect(page.locator('[data-direct-row]')).toHaveCount(10);
    await expect(page.locator('#add-direct-segment')).toBeDisabled();
    await expect(page.locator('#direct-limit-note')).toHaveText('10件（最大10件）');

    for (let index = 9; index > 0; index -= 1) {
      await page.locator('[data-direct-row]').nth(index).locator('[data-remove-direct]').click();
    }
    await expect(page.locator('[data-direct-row]')).toHaveCount(1);
    await expect(page.locator('[data-direct-row] [data-remove-direct]')).toBeDisabled();
  });
});

test.describe('補助計算', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTool(page);
    await calculateQuick(page);
  });

  test('開いている詳細パネルを1つに限定し、未送信値はメモリ内で保つ', async ({ page }) => {
    await openPanel(page, 'investment');
    await page.locator('#investment-cash').fill('12345');
    await openPanel(page, 'inout');
    await expect(page.locator('#investment-panel')).toBeHidden();
    await expect(page.locator('#inout-panel')).toBeVisible();
    await openPanel(page, 'investment');
    await expect(page.locator('#investment-cash')).toHaveValue('12345');
    await expect(page.locator('[data-analysis-panel]:visible')).toHaveCount(1);
  });

  test('主導線は3つだけ表示し、補助計算はその他を開くまで隠す', async ({ page }) => {
    await expect(page.locator('.launchers > .launcher-grid > [data-launcher]')).toHaveCount(3);
    await expect(page.locator('.other-launchers')).not.toHaveAttribute('open');
    await expect(page.locator('[data-launcher="inout"]')).toBeHidden();
    await expect(page.locator('[data-launcher="coin"]')).toBeHidden();
    await page.locator('.other-launchers summary').click();
    await expect(page.locator('[data-launcher="inout"]')).toBeVisible();
    await expect(page.locator('[data-launcher="coin"]')).toBeVisible();
  });

  test('主要・詳細・確認入力に専用の近接エラー領域を関連付ける', async ({ page }) => {
    const names = [
      'investment.cash',
      'investment.current',
      'investment.exchange',
      'investment.unit',
      'investment.stored',
      'investment.exchanged',
      'investment.lend',
      'investment.games',
      'investment.net',
      'coin.games',
      'coin.medals',
      'coin.atBonus',
      'coin.scope',
      'segment.customBenchmark',
    ];
    for (const name of names) {
      const control = page.locator(`[name="${name}"]`);
      const describedBy = await control.getAttribute('aria-describedby');
      expect(describedBy, name).toBeTruthy();
      const output = page.locator(`[data-error-for="${name}"]`);
      await expect(output, name).toHaveCount(1);
      const outputId = await output.getAttribute('id');
      expect(describedBy?.split(/\s+/), name).toContain(outputId);
    }
  });

  test('基本3項目だけで投資・回収を計算する', async ({ page }) => {
    await openPanel(page, 'investment');
    await page.locator('#investment-cash').fill('20,000円');
    await page.locator('#investment-current').fill('1,200枚');
    await page.locator('#investment-exchange').fill('50');
    await page.locator('#investment-form button[type="submit"]').click();

    await expect(page.locator('#investment-result')).toContainText('交換額見込み24,000円');
    await expect(page.locator('#investment-result')).toContainText('現金収支+4,000円');
    await expect(page.locator('#investment-result')).toContainText('現金回収率120.0%');
    await page.locator('#investment-result details').click();
    await expect(page.locator('#investment-result')).toContainText('現金回収ライン1,000枚');
  });

  test('詳細投資で交換単位・貯メダル・貸出条件を反映する', async ({ page }) => {
    await openPanel(page, 'investment');
    await page.locator('#investment-cash').fill('20000');
    await page.locator('#investment-current').fill('1200');
    await page.locator('#investment-exchange').fill('50');
    await page.locator('.advanced-inputs').click();
    await page.locator('#investment-unit').fill('500');
    await page.locator('#investment-stored').fill('500');
    await page.locator('#investment-lend').fill('46');
    await page.locator('#investment-games').fill('4000');
    await page.locator('#investment-net').fill('500');
    await page.locator('#investment-form button[type="submit"]').click();

    await expect(page.locator('#investment-result')).toContainText('貯メダル込み回収率80.0%');
    await expect(page.locator('#investment-result')).toContainText('貯メダル込み回収ライン1,500枚');
    await expect(page.locator('#investment-result')).toContainText('現金投資の貸出枚数相当920枚');
    await expect(page.locator('#investment-result')).toContainText('非等価交換');
  });

  test('実IN/OUTを差枚ベースと分離して計算し、0 INを拒否する', async ({ page }) => {
    await openPanel(page, 'inout');
    await page.locator('#actual-in').fill('12000');
    await page.locator('#actual-out').fill('12500');
    await page.locator('#inout-form button[type="submit"]').click();
    await expect(page.locator('#inout-result')).toContainText('104.2%');
    await expect(page.locator('#inout-result')).toContainText('+500枚');
    await expect(page.locator('#inout-result')).toContainText('12,000枚 → 12,500枚');

    await page.locator('#actual-in').fill('0');
    await page.locator('#inout-form button[type="submit"]').click();
    await expect(page.locator('#error-summary')).toContainText(
      '同じ対象範囲の実INを確認してください。',
    );
  });

  test('コイン持ちは2つの対象確認後だけ計算する', async ({ page }) => {
    await openPanel(page, 'coin');
    await page.locator('#coin-games').fill('680');
    await page.locator('#coin-medals').fill('1000');
    await page.locator('#coin-form button[type="submit"]').click();
    await expect(page.locator('#error-summary')).toContainText('AT・ボーナス区間を除外');
    await expect(page.locator('#error-summary')).toContainText('同じ対象区間');

    await page.locator('[name="coin.atBonus"]').check();
    await page.locator('[name="coin.scope"]').check();
    await page.locator('#coin-form button[type="submit"]').click();
    await expect(page.locator('#coin-result')).toContainText('34.0G／50枚');
    await expect(page.locator('#coin-result')).toContainText('AT・ボーナス除外済み');
  });
});
