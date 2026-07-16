# NKIS Works / Slarog Website

NKIS Worksが運営するスラログ公式サイトの静的ファイル一式です。公開サイトは [https://nkis-works.github.io/slarog/](https://nkis-works.github.io/slarog/) です。

## 公開方式

GitHub Pagesが`main`ブランチの`/(root)`を直接配信しています。HTML、CSS、JavaScript、画像はリポジトリ直下から静的ファイルとして公開され、デプロイ用のビルド処理はありません。

`main`への反映は公開サイトへ直結します。作業はfeatureブランチで検証し、公開対象と未公開の機能を確認してから取り込んでください。

## 構成

```text
index.html              スラログ公式サイト
support.html            サポート
privacy.html            プライバシーポリシー
terms.html              利用規約
404.html                GitHub Pages用404
robots.txt
sitemap.xml
.nojekyll
assets/                 共通CSS、JavaScript、画像
tools/slot-balance/     スロバランス（Phase 2A実動作UI・ドメイン・E2E）
docs/                   仕様・計算・QA資料
scripts/                開発用ビルド処理
```

Phase 2Aでは`tools/slot-balance/index.html`と実動作UIを追加済みです。既存`index.html`からの公開導線、sitemap、privacy、terms、GitHub Pages設定はまだ変更していません。

## ローカル確認

静的サイトだけを確認する場合は、リポジトリ直下で次を実行します。

```bash
python3 -m http.server 4173
```

その後、既存サイトは`http://localhost:4173/`、スロバランスは`http://localhost:4173/tools/slot-balance/index.html`を開きます。CSPと相対URLを含めた確認のため、スロバランスは`file://`ではなくHTTP server経由で確認してください。

## スロバランス開発

前提はNode.js 22以上とnpm 10以上です。

```bash
npm install
npx playwright install chromium
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run check
npm run test:e2e
npm run check:all
```

`npm run build`は`tools/slot-balance/src/ui/app.ts`をbrowser向けIIFEへbundleし、追跡対象の`tools/slot-balance/assets/slot-balance-app.js`へ出力します。source mapとruntime dependencyは含めません。2回のbuildで同じSHA-256になる決定的出力を維持します。

`npm run test:e2e`はlocalhost:4173でPlaywrightを実行し、主要計算、stale、privacy、キーボード、axe、レスポンシブ、既存ページ回帰、Visual QAを確認します。スクリーンショットは無視対象の`artifacts/phase2a/`へ出力します。

## スロバランスの実装済み範囲

- TypeScript strictの計算ドメイン
- 入力正規化と構造化validation
- 差枚、投資・回収、区間、実IN/OUT、通常時コイン持ち
- 計算根拠、値の出所、分かること／分からないこと
- versionedなスラログ引き継ぎ契約
- privacy-safeなanalyticsイベント契約
- 正解値付きunit testと不変条件テスト
- 3モードのモバイル優先UI
- 入力revisionによるstale表示
- error summary、field error、ARIA live、provenance、根拠表示
- スラログ公式サイトへの通常の相対リンク
- Playwright E2E、axe、7幅レスポンシブ、既存サイト回帰、6画面Visual QA

履歴、共有カード、広告、analytics送信、計算結果transfer、アプリdeep link、公開導線、sitemap、privacy／terms本番更新、本番公開はPhase 2Aの対象外です。

## 公開前チェック

- `support@nkisworks.com`または掲載中の連絡先が実際に受信できること
- App Store / Google Play公開後のURLを追加すること
- 価格、無料期間、サブスクリプション条件をサイト、ストア説明、アプリ内表示で一致させること
- スロバランス公開時にprivacy、terms、sitemap、ナビゲーションを同時に更新すること
- 広告を有効化する場合、スラログCTAより下の手動1枠だけに限定すること

## 表現方針

「設定がわかる」「勝てる」「高設定を見抜く」「続行・ヤメを推奨する」などの断定表現は使用しません。スラログは記録・比較、スロバランスは入力値と明示した前提から数字を整理するツールとして扱います。
