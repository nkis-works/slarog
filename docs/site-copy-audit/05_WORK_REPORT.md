# 作業報告

## 実装

- 共通ページのメタ情報、ナビ、フッター、active状態を更新
- サポートのH1、リード、問い合わせ項目、Webツール説明を更新
- 利用規約のサービス説明と計算値の扱いを現行仕様へ整合
- プライバシーのお問い合わせ情報と端末内計算の表現を更新
- ツールの静的文言、動的結果、live region、エラー周辺文言を平易化
- 404へ公式サイトと新ツールの復帰導線を追加
- source robots／sitemapの正式ドメインと更新日を整合
- サイト全体のcopy・meta・navigation E2Eを追加
- スラログを14日間無料体験・月額380円の単一料金導線へ変更
- 困りごと、利用後の変化、「作った理由」、実画面を中心とするトップ構成へ変更
- 料金、FAQ、サポート、利用規約、プライバシー、OGP、READMEを同じ確定事項へ統一
- ストア未確認事項を`OPEN_FACT_CHECKS.md`へ分離

## ローカル検証結果

- `check:all`：成功
- format、lint、typecheck：成功
- Unit：138件成功
- Source E2E：49件成功
- Dist E2E：29件成功
- preview build：成功、canonicalなし／noindexを確認
- production build：成功、正式canonical・robots・sitemap契約を確認
- dist contract：23ファイルを確認
- axe critical／serious：0件
- 320〜1440px responsive：横overflowなし
- 200%文字拡大相当：操作可能
- console、pageerror、external request：0件
- localStorage、sessionStorage、IndexedDB、Cookie：使用なし

## Visual QA

- PC／モバイル：トップ、サポート、プライバシー、利用規約、404、ツール初期、計算結果、投資・回収、区間入力、計算式・FAQを確認
- モバイルメニュー展開を確認
- スクリーンショット23件を`artifacts/site-copy-audit/`へ保存（Git追跡対象外）
- 料金セクションをPC／モバイルで個別撮影し、単一導線、改行、横overflowを確認
- 撮影時のsmooth scrollとskip link写り込みをテスト側で除外し、実表示とアーティファクトを一致

## 安全境界

main、本番Cloudflare Pages、nkisworks.com、DNS、Custom Domain、GitHub Pages設定は変更しない。広告、Analytics、storageも追加しない。
