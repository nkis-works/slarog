# 実装ロードマップ

## 原則

- 各フェーズを独立PRにし、mainへの統合・本番公開は都度承認する。
- 現行 `/tools/slot-balance/` を新実装の検証完了まで維持する。
- UIとdomainを同時に全面置換せず、計算契約→UI→URLの順に進める。
- 広告は機能公開と別PR・別承認。

## Gate 0 — 設計承認（本PR）

成果:

- 00〜17の設計文書。
- 操作可能な非公開プロトタイプ。
- 390/1440の12画像、320/430/768/200%追加検証。
- 名称、広告、技術境界、未決事項。

出口条件:

- 推奨名称/slug。
- 基準比較の初期中立。
- 最大回復定義。
- 区間入力2方式。
- 広告OFFのMVP。

## Phase 1 — Domain contract

作業:

- 既存83 unitを保護。
- benchmark、sensitivity、target reverse、segment conversion/contribution/drawdown/recoveryを純粋関数で追加。
- integer/rational、丸め、provenance、validationを再利用。
- property/boundary testを追加。

出口:

- 既存83件＋新規テスト全成功。
- 代表値と逆算の手計算一致。
- DOM、network、storage依存0。

推奨ブランチ: `feature/slot-analysis-v2-domain`

## Phase 2 — UI implementation behind old publication boundary

作業:

- 推奨HTML/CSS/JSを本番品質で実装。
- クイック入力、縦比較、段階開示、CTA、式、FAQ。
- 目標/区間/投資は承認範囲に応じてMVP/Nextを分割。
- source E2Eを新UIへ追加し、既存UIの回帰を保持。

出口:

- 20秒タスク、keyboard、axe、viewport、privacy契約合格。
- 外部request/console/pageerror/storage/cookie 0。
- 本番URL/allowlistはまだ変更しないpreview QAが可能。

推奨ブランチ: `feature/slot-analysis-v2-ui`

## Phase 3 — Naming and URL migration

作業:

- 専門家/権利者による名称確認。
- 新 `/tools/slot-analysis/` をbuild allowlistへ追加。
- title/H1/nav/canonical/sitemap/robotsを統一。
- 旧 `/tools/slot-balance/` 恒久転送。
- root/support/privacy/termsは必要な名称/リンク箇所だけ最小変更。

出口:

- preview noindex。
- source/dist E2E合格。
- 旧URL→新URL1回転送、loopなし。
- design docs/prototype/artifactsがdistにない。

推奨ブランチ: `feature/slot-analysis-v2-release-candidate`

## Phase 4 — Preview usability and production QA

作業:

- 6〜8名のテストまたは内部同等評価。
- 390/1440視覚比較、320/430/768/200%。
- Cloudflare previewでheaders、canonical/noindex、asset、CSP。
- 本番デプロイ前チェックリスト。

出口:

- P0/P1 0。
- 全既存check:all＋新テスト成功。
- main統合と公開の明示承認。

## Phase 5 — Production release

作業:

- PR差分、公開対象、Cloudflare設定を再監査。
- mainへ通常merge（force push/履歴書換えなし）。
- 正式ドメイン7 URL、旧URL、pages.dev noindexを実ブラウザQA。
- 既存GitHub Pagesは別途移行計画が承認されるまで変更しない。

出口:

- HTTPS 200、canonical/sitemap/robots一致。
- 計算、CSS/JS、console、headers、privacy契約合格。
- rollback commit/deploymentを記録。

## Phase 6 — Optional ad experiment（別案件）

前提: 機能公開が安定し、AdSense/CMP/privacy/ads.txtの承認があること。

- 手動1枠だけ。
- CTA後。
- preview/localhostはOFF。
- 広告なし/拒否/失敗時もレイアウト不変。
- Auto Ads/Analyticsを同時導入しない。

## 概算

| フェーズ | 規模 | 主な不確実性             |
| -------- | ---- | ------------------------ |
| Domain   | M    | 区間/回復定義の境界値    |
| UI       | L    | モバイル密度、フォーカス |
| URL移行  | S〜M | redirect/canonical/検索  |
| QA       | M    | 実機・利用者誤認         |
| 広告     | 別L  | CMP/CSP/審査             |

時間見積りではなく相対規模。公開期限を先に固定せず、ゲート合格で進める。

## ロールバック

- Domain/UI PR: revert commitで現行ツールへ戻す。
- URL: 新URLの公開を維持したまま、旧URL転送を一時解除できるよう変更を分離。
- Cloudflare: 成功済み直前deploymentへrollback。
- 広告: flagをfalseにして広告DOM/通信を0へ戻す。計算機能と分離。

## 本フェーズで実施しないこと

本番HTML/ロジック/URL/ビルド/Cloudflare/DNS/GitHub Pages/AdSense/Analytics/CMPの変更、main merge、deployは行わない。
