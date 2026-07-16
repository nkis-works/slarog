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
tools/slot-balance/     スロバランス（Phase 1はドメイン実装のみ）
docs/                   仕様・計算・QA資料
scripts/                開発用ビルド処理
```

Phase 1ではスロバランスの公開ページや既存サイトからの導線を追加していません。`tools/slot-balance/src`は将来のUIから利用するTypeScriptドメインコードです。

## ローカル確認

静的サイトだけを確認する場合は、リポジトリ直下で次を実行します。

```bash
python3 -m http.server 4173
```

その後、`http://localhost:4173/`を開きます。`index.html`を直接開くこともできます。

## スロバランス開発

前提はNode.js 22以上とnpm 10以上です。

```bash
npm install
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run check
```

`npm run build`はブラウザ向けES moduleを`build/slot-balance/slot-balance-domain.js`へ生成します。`build/`は検証用の未追跡成果物で、GitHub Pagesへ公開されません。Phase 2でUIを実装する際に、検証済みエントリポイントを公開用静的JavaScriptへ出力します。

## スロバランスのPhase 1範囲

- TypeScript strictの計算ドメイン
- 入力正規化と構造化validation
- 差枚、投資・回収、区間、実IN/OUT、通常時コイン持ち
- 計算根拠、値の出所、分かること／分からないこと
- versionedなスラログ引き継ぎ契約
- privacy-safeなanalyticsイベント契約
- 正解値付きunit testと不変条件テスト

UI、履歴、共有カード、広告、解析送信、公開導線、E2E、本番公開はPhase 1の対象外です。

## 公開前チェック

- `support@nkisworks.com`または掲載中の連絡先が実際に受信できること
- App Store / Google Play公開後のURLを追加すること
- 価格、無料期間、サブスクリプション条件をサイト、ストア説明、アプリ内表示で一致させること
- スロバランス公開時にprivacy、terms、sitemap、ナビゲーションを同時に更新すること
- 広告を有効化する場合、スラログCTAより下の手動1枠だけに限定すること

## 表現方針

「設定がわかる」「勝てる」「高設定を見抜く」「続行・ヤメを推奨する」などの断定表現は使用しません。スラログは記録・比較、スロバランスは入力値と明示した前提から数字を整理するツールとして扱います。
