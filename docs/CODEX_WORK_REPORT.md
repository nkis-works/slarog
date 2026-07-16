# Codex Work Report: Slot Balance Phase 1

## 1. Git

- Repository: `/Users/nkis/Documents/スラログios版`
- Remote: `https://github.com/nkis-works/slarog.git`
- Base branch: `feature/real-app-screenshots-and-benefit-copy`
- Base HEAD: `bcc8c87e4f61d9b055ee5555b107ade5f86a0325`
- Work branch: `feature/slot-balance-complete-core`
- Commits:
  - `76bdd7a docs: define slot balance product and calculation contracts`
  - `9b74f7d feat: add slot balance domain calculation engine`
  - `test: add exact slot balance calculation cases`（本報告とテストを含む最終Phase 1 commit）

mainへのmerge、tag、GitHub Pages設定変更、デプロイは行っていない。

## 2. 実装範囲

### Phase 1A

サービス境界、入力辞書、計算式、丸め、validation、正解値、不変条件、プライバシー契約、判断記録を文書化した。READMEを現在のGitHub Pages公開状態へ合わせて更新した。

### Phase 1B

次をTypeScript strictで実装した。

- `CALCULATION_VERSION = "1.0.0"`
- 値の出所: input / calculated / estimated / reference
- NFKC数値正規化
- error / warning / infoの構造化validation
- 設定ファイルへ分離した極端値しきい値
- BigInt有理数による金額・交換条件計算
- 負数を含むhalf away from zero丸め
- 差枚ベース出玉率
- 投資・回収と2本の回収ライン
- 区間差枚集計
- 実IN/OUT集計
- 通常時コイン持ち
- 計算根拠
- 分かること／分からないこと
- stale防止付きスラログ引き継ぎ契約
- allowlist方式のprivacy-safe analytics契約

### Phase 1C

9ファイル、61件のunit testを追加した。外部property-based test依存は追加せず、決定的なループで不変条件を検証した。

## 3. 開発ツール

- Node.js: 22以上をサポート。検証はCodex bundled Node.js 24.14.0
- npm: 10以上をサポート。検証はnpm 10.9.4
- TypeScript: 5.9.3
- Vitest: 4.1.10
- esbuild: 0.28.1
- ESLint: 10.7.0
- Prettier: 3.9.5

`npm install`は成功し、auditは0 vulnerabilitiesだった。`package-lock.json`をcommit対象とした。

## 4. BuildとGitHub Pages

`npm run build`は`tools/slot-balance/src/index.ts`をbrowser向けES moduleへbundleし、次へ出力する。

```text
build/slot-balance/slot-balance-domain.js
build/slot-balance/slot-balance-domain.js.map
```

検証時サイズはJavaScript 56.7KB、source map 96.0KB。`build/`は既存`.gitignore`の対象であり、GitHub Pagesの`main`ルートへ公開されない。既存HTML、CSS、JavaScript、privacy、terms、sitemapには変更を加えていない。

## 5. 検証結果

```text
npm run format:check  PASS
npm run lint          PASS
npm run typecheck     PASS
npm run test          PASS (9 files / 61 tests)
npm run build         PASS
npm run check         PASS
```

正解値テストは差枚A〜F、実IN/OUT、区間集計、投資・回収Case 1〜5、コイン持ち、正規化、端数を含む。

不変条件テストは次を含む。

- 差枚0なら100.0%
- 同一G数で差枚増加時に率が低下しない
- 区間集計と総G・総差枚の直接計算が一致
- 現在枚数増加時に交換見込額が低下しない
- 交換済み金額増加時に残り回収ラインが増えない
- 使用貯メダル0なら両回収ラインが一致
- 交換単位反映額が理論値を超えない
- 切り捨て差が交換単位未満
- 同義入力の正規化結果が一致
- stale結果をtransferできない

## 6. 検証中に修正した内容

1. registry最新TypeScript 7はtypescript-eslintのpeer範囲外だったため、対応範囲内のTypeScript 5.9.3へ固定した。
2. strict設定`noPropertyAccessFromIndexSignature`がruntime sanitizerとテストのRecordアクセスを検出したため、bracket accessへ修正した。
3. Codex環境はNodeが通常PATHにないため、依存のpostinstall検証ではbundled NodeをPATHへ明示した。一般のNode/npm環境ではREADME記載の`npm install`でよい。
4. npmとpnpm形式node_modulesの混在を避け、cleanなnpm installでpackage-lockと依存セットを再検証した。

計算の正解値テスト自体に失敗はなかった。

## 7. 変更ファイル

### 文書

- `README.md`
- `docs/SLOT_BALANCE_MASTER_SPEC.md`
- `docs/SLOT_BALANCE_INPUT_DICTIONARY.md`
- `docs/SLOT_BALANCE_CALCULATIONS.md`
- `docs/SLOT_BALANCE_ROUNDING.md`
- `docs/SLOT_BALANCE_VALIDATION.md`
- `docs/SLOT_BALANCE_QA_CASES.md`
- `docs/SLOT_BALANCE_DECISION_LOG.md`
- `docs/CODEX_WORK_REPORT.md`

### 開発設定

- `.prettierignore`
- `.prettierrc.json`
- `eslint.config.js`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `scripts/build-slot-balance.mjs`

### ドメインとapplication

- `tools/slot-balance/src/index.ts`
- `tools/slot-balance/src/domain/index.ts`
- `tools/slot-balance/src/domain/types.ts`
- `tools/slot-balance/src/domain/version.ts`
- `tools/slot-balance/src/domain/thresholds.ts`
- `tools/slot-balance/src/domain/rational.ts`
- `tools/slot-balance/src/domain/rounding.ts`
- `tools/slot-balance/src/domain/normalizers.ts`
- `tools/slot-balance/src/domain/validators.ts`
- `tools/slot-balance/src/domain/explanations.ts`
- `tools/slot-balance/src/domain/calculators/index.ts`
- `tools/slot-balance/src/domain/calculators/shared.ts`
- `tools/slot-balance/src/domain/calculators/net-medals.ts`
- `tools/slot-balance/src/domain/calculators/investment-recovery.ts`
- `tools/slot-balance/src/domain/calculators/segments.ts`
- `tools/slot-balance/src/domain/calculators/in-out.ts`
- `tools/slot-balance/src/domain/calculators/coin-hold.ts`
- `tools/slot-balance/src/application/index.ts`
- `tools/slot-balance/src/application/slarog-transfer.ts`
- `tools/slot-balance/src/application/analytics-events.ts`

### テスト

- `tools/slot-balance/tests/normalizers.test.ts`
- `tools/slot-balance/tests/net-medals.test.ts`
- `tools/slot-balance/tests/investment-recovery.test.ts`
- `tools/slot-balance/tests/segments.test.ts`
- `tools/slot-balance/tests/in-out.test.ts`
- `tools/slot-balance/tests/coin-hold.test.ts`
- `tools/slot-balance/tests/rounding.test.ts`
- `tools/slot-balance/tests/invariants.test.ts`
- `tools/slot-balance/tests/privacy.test.ts`

## 8. 未実装

- 3モードのUI
- 履歴とlocalStorage migration
- 共有カード
- スラログCTA表示と実際の遷移
- 広告枠
- analytics送信
- privacy / terms / sitemapの公開更新
- Playwright E2E
- 本番広告ID、ストアURL、deep link
- main merge、デプロイ

## 9. Phase 2へ持ち越すリスク

- 静的サイトの相対URL設計を`/tools/slot-balance/`階層で統一する必要がある。
- UIは入力文字列のnormalizer結果をcalculatorの数値入力へ明示的に接続する必要がある。
- stale revision管理を履歴、共有、CTAの全操作へ適用する必要がある。
- ブラウザ内共有カードでBigIntを直接JSON化せず、公開済みの文字列分数を使用する必要がある。
- 広告やanalyticsを有効化する前にprivacy、同意要件、イベントpayloadを再監査する必要がある。
- 現在の作業ブランチは未mergeのWeb改善3コミットを含むため、main取り込み時の差分範囲を確認する必要がある。
