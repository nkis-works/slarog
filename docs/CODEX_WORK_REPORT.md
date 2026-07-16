# Codex Work Report: Slot Balance Phase 1 / Phase 2A / Phase 2B0

## Phase 2B0 update（2026-07-17）

### Gitと範囲

- Base: `feature/slot-balance-functional-ui` / `800d59657f8a7bca8b74e83a039271f5093e1eb8`
- Work branch: `feature/slot-balance-cloudflare-release-candidate`
- Phase 2B0 commits:
  - `24a9328 build: add curated Cloudflare Pages distribution`
  - `94e4f6d feat: prepare slot balance public content and site navigation`
  - `9562334 test: validate release distribution and privacy boundaries`
  - `docs: document Cloudflare migration and ad rollout`（本報告を含む）
- `main`、GitHub Pages設定、Cloudflare account／Pages project／DNS、custom domain、AdSenseは変更していない。
- merge、tag、production deployは行っていない。

### 公開候補build

`scripts/build-site.mjs`が毎回`dist/`を削除し、23ファイルの固定allowlistからCloudflare Pages公開物を再生成する。HTML 5件、robots、sitemap、root assets、スロバランスHTML／CSS／bundle、`_headers`、`_redirects`だけを含め、TypeScript、tests、E2E、docs、package情報、source map、秘密情報、広告IDは除外する。

previewは全ページを`noindex, nofollow`とし、canonical、`og:url`、公開URL入りsitemapを生成しない。productionは確認済みのHTTPS `SITE_ORIGIN`を必須とし、未設定、localhost、`pages.dev`、`github.io`、path／query／fragment付きの値を拒否する。正式オリジン未確定のため、Phase 2B0ではproduction成功buildを作らず、未指定時のfail-closedだけを検証した。

### 公開コンテンツ

公式サイトのdesktop／mobile navigation、トップページの控えめなツール案内、supportから`/tools/slot-balance/`への導線を追加した。スロバランスは、結果と動的根拠、Slarog CTA、広告差込位置、一般計算式9項目、使い方、FAQ 10項目、免責の順に整理した。

広告はHTMLコメント`SLOT_BALANCE_MANUAL_AD_INSERTION_POINT`の1か所だけを固定し、広告DOM、空枠、script、request、ID、`ads.txt`、広告domainのCSP許可を追加していない。privacyとtermsは端末内計算、保存・送信なし、広告・analytics未稼働、概算と判断非対応という現在の事実へ更新した。

### 検証

```text
format:check  PASS
lint          PASS
typecheck     PASS
unit          PASS（9 files / 83 tests）
preview build PASS（23 files、2回同一SHA-256一覧）
source E2E    PASS（22 tests）
dist E2E      PASS（14 tests）
axe           PASS（critical / serious 0）
check         PASS
check:all     PASS
```

dist E2Eでは全6ページ、導線、section順、header／meta CSP、redirect、320／390／768／1,440px、console全level、外部通信、fetch／XHR／WebSocket／EventSource／beacon、localStorage／sessionStorage／Cookie／IndexedDB／Cache Storage、URLへの入力漏えいを確認した。

### Visual QAと運用文書

mobile／desktop 10画面を`artifacts/phase2b0/`へ取得し、全画像を確認した。初回の公式トップ画像でlazy imageが未読込の黒い状態だったため、撮影前に全画像を読込するようE2Eを修正して再取得した。最終画像はスラログを主役に保ち、ツール導線、入力、結果、CTA、計算式、FAQに横崩れや文字切れがない。

Cloudflare Pages設定、custom domain／DNS／SSL、rollback、GitHub Pages旧URL、Search Console、AdSense手動1枠の順序と停止条件を、それぞれの運用文書へ記録した。

### Phase 2B1へ持ち越し

Cloudflare account／Pages project、branch preview、custom domain、DNS、SSL、正式`SITE_ORIGIN`、PR／main merge、production deploy、GitHub Pages停止、旧URL処理、Search Console、AdSense申請、publisher／slot ID、`ads.txt`、CMP、実広告、analytics、履歴、共有、transfer、deep link、ストアリンク、tagは未実装である。

## Phase 2A update（2026-07-16）

### Gitと範囲

- Base: `feature/slot-balance-complete-core` / `ea2e5722eb4a76de7fdd14f145c2c978ebafa206`
- Work branch: `feature/slot-balance-functional-ui`
- Phase 2A commits:
  - `832e5f0 fix: harden slot balance transfer and analytics boundaries`
  - `3530613 feat: add functional slot balance web interface`
  - `a998a6c test: add slot balance browser and accessibility coverage`
  - `docs: document slot balance phase 2a implementation`（本報告を含む）
- main、GitHub Pages設定、既存`index.html`、privacy、terms、sitemapは変更していない。
- merge、tag、deployは行っていない。

### 境界補強

Transfer v1へmode別必須項目、safe integer、pair、形式混在禁止、segment 1〜100件、実在日付、制御文字、文字数上限を追加した。不正値は黙って除去・切り詰めずpayload全体を拒否する。金額は引き続き除外し、URL／deep linkは生成しない。

Analytics `errorCode`は`^[a-z0-9_]+$`、64文字以下、安定code allowlistの3条件を必須とし、未知codeを省略する。生の金額、機種名、全文メッセージ、改行をテストした。`CALCULATION_VERSION`は`1.0.0`、transfer versionは1のまま維持した。

### UI

`tools/slot-balance/index.html`へ次を実装した。

- 差枚から見る
- 投資・回収を見る
- 区間差枚／実IN/OUT／通常時コイン持ち
- raw文字列からnormalizerを通したPhase 1 calculator接続
- mode別revision、stale表示、結果混在防止
- error summary、field error、warning／info、ARIA live
- `ValueProvenance`由来の入力／計算／概算／参考／実測ラベル
- 分かること／分からないこと、`CalculationExplanation`
- Slarogへの通常の相対リンク
- CSP、外部asset・通信・storageなし

### Build

UI entrypointをbrowser向けIIFEへbundleし、追跡対象の`tools/slot-balance/assets/slot-balance-app.js`へ出力する。source mapとruntime dependencyはない。検証時105.0KB。2回buildのSHA-256はいずれも次で一致した。

```text
bb22de6837ea4edd5d056b3f2872cdb1dcfae9c6995594cd4a09b080916b7ecf
```

Phase 1の`build/slot-balance/slot-balance-domain.js`はruntime consumerがないため生成を終了した。判断理由はDecision Log D-013へ記録した。

### 検証

```text
format:check  PASS
lint          PASS
typecheck     PASS
unit          PASS（9 files / 83 tests）
build         PASS（決定性確認を含む）
E2E           PASS（3 spec files / 22 tests）
axe           PASS（critical / serious 0）
check         PASS
check:all     PASS
```

E2Eは主要計算全モード、全角入力、stale、privacy、相対リンク、keyboard、320／360／390／430／768／1024／1440px、既存5ページ＋ツールページ、console error、外部requestを確認した。

### Visual QA

viewport 390pxのmobile 3画面と1,440pxのdesktop 3画面を`artifacts/phase2a/`へ取得し、実画像を確認した。初回確認で補助文字のコントラスト不足と、full-page自動撮影時のskip link固定表示を発見した。補助色を濃くし、skip linkを標準的なabsolute配置へ変更し、撮影時の人工的focusを除外して再撮影した。

最終評価は、入力と結果の関係が明瞭、既存サイトと同じ白・淡灰・青、カード入れ子と影を抑制、390px／1,440pxとも横崩れなしである。

### Phase 2Bへ持ち越し

履歴・migration・削除、共有カード、SNS／Web Share、計算結果transfer、アプリdeep link、ストアリンク、広告、analytics送信、Cookie同意、既存index導線、sitemap、robots、privacy／terms本番更新、main merge、deploy、tagを未実装のまま維持した。

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
