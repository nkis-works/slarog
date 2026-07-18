# Decision Log

- Status: proposed/fixed for design review
- Date: 2026-07-18
- Scope: Slot Analysis v2 design phase

## Decisions

### V2-D001 — Product is past-performance analysis

- Decision: 過去に入力された数値の分析だけを扱う。
- Reason: 数式で説明可能な範囲を守り、設定推測・未来予測の誤認を避ける。
- Rejected: 設定判別、勝敗予測、台推奨。

### V2-D002 — No machine database

- Decision: 機種名、公称値、設定別率を入力要件にしない。
- Reason: 汎用性、更新不要、誤情報回避。
- Rejected: 機種選択を最初に置く。

### V2-D003 — Two-field quick start

- Decision: 初期入力は総ゲーム数と差枚のみ。
- Reason: 20秒以内に代表価値へ到達する。
- Rejected: 現行3モードを同格で上部表示。

### V2-D004 — Three initial result blocks

- Decision: 実績率、/1,000G、想定IN/OUTを初期結果にする。
- Reason: 重要度と説明可能性。
- Rejected: すべての派生指標をカード化。

### V2-D005 — Neutral benchmark default

- Decision: 100/103/105%は全表示するが、初期選択と好調/不調判定を置かない。
- Reason: 任意基準を正解や設定に見せない。
- Rejected: 103%自動選択、100%自動選択、総合スコア。

### V2-D006 — Vertical benchmark list

- Decision: 正式UIは縦リスト。
- Reason: 320px、200%ズーム、読み上げ順、全件発見性。
- Rejected: 横レールを主UIにする。

### V2-D007 — Assumed IN naming

- Decision: `G×3`は必ず「想定IN/OUT」と表す。
- Reason: 実測IN/OUTとの混同を避ける。
- Rejected: 単にIN/OUTと表示。

### V2-D008 — Benchmark contribution

- Decision: 区間寄与は「区間差枚 − 基準期待差枚」。
- Reason: 合計が全体の基準差と一致する。
- Rejected: 区間差枚の正負だけを押上/押下と呼ぶ。

### V2-D009 — Two segment input models

- Decision: 直接区間と累積地点を別タブで提供し、混在させない。
- Reason: データ表示方式の違いへ対応し、二重加算を防ぐ。
- Rejected: 自動推定、1表での混在。

### V2-D010 — Endpoint-only drawdown

- Decision: 最大下落/回復は入力した区間終点だけから計算。
- Reason: 区間内軌跡は観測できない。
- Rejected: 区間内の最悪値を推定。

### V2-D011 — Recovery starts after a decline

- Decision: 最大回復は下落が発生した後の最安地点から計測し、開始から最初の上昇は含めない。
- Reason: 「回復」という日本語と一致させる。
- Rejected: 単純な最大run-up。

### V2-D012 — Target reverse is a condition, not forecast

- Decision: 必要差枚と必要残区間率を「数学上の境界」「以上」で表示。
- Reason: 未来結果の保証に見せない。
- Rejected: 達成確率、期待値、推奨続行。

### V2-D013 — Progressive disclosure

- Decision: 目標、区間、投資・回収は結果後の明示操作で1つずつ開く。
- Reason: 初回タスクの認知負荷を抑える。
- Rejected: すべてのフォームを初期DOMで展開。

### V2-D014 — No persistence or share URL

- Decision: 値はメモリ内のみ。storage/cookie/query/hashへ入れない。
- Reason: プライバシー、同意、ログ漏えいを最小化。
- Rejected: 履歴、共有リンク、自動復元。

### V2-D015 — Slarog before ads

- Decision: 結果と詳細の後にSlarog CTA、その後に将来広告。
- Reason: 自社価値と計算体験を優先。
- Rejected: 入力中/結果中の広告。

### V2-D016 — Advertising remains off

- Decision: 初期実装は広告DOM/通信/空白0。
- Reason: AdSense審査、CMP、CSP、privacyを別ゲートにする。
- Rejected: placeholderを本番に残す、Auto Ads。

### V2-D017 — Recommended name

- Decision: 一次推奨は「スロット出玉分析」。
- Reason: 直接的、過去実績中心、機能拡張にも耐える。
- Rejected: スロバランス（不明瞭）、機械割分析（誤認）、分析ノート（保存を示唆）。

### V2-D018 — Recommended slug

- Decision: `/tools/slot-analysis/`。
- Reason: 英語内部名と一致し、将来機能を狭めない。
- Rejected: `/payout/`, `/machine-rate/`, 現行slug継続。

### V2-D019 — Preserve old URL until release gate

- Decision: 新URL検証後に旧URLを恒久転送し、本設計フェーズでは変更しない。
- Reason: 既存リンクと検索評価を保護。
- Rejected: 先に削除、JavaScript転送。

### V2-D020 — Extend existing domain assets

- Decision: 既存正規化、BigInt rational、rounding、message、provenanceを再利用。
- Reason: 83 unitの信頼性を継承。
- Rejected: prototype.jsを本番移植、全面再実装。

### V2-D021 — Explicit build allowlist

- Decision: 現行allowlistを維持し、新公開ファイルだけを将来明示追加。
- Reason: docs/prototypes/artifacts混入防止。
- Rejected: ディレクトリ全コピー。

### V2-D022 — Prototype is intentionally separate

- Decision: prototypeは本番domainをimportせず、非公開・noindex・外部依存なし。
- Reason: 設計の試行と本番変更を混同しない。
- Rejected: 現行production HTML上でA/B実装。

### V2-D023 — No new framework

- Decision: 静的HTML/CSS/TypeScriptの現行構成を維持。
- Reason: 配信・保守・CSP・bundleを単純にする。
- Rejected: React/Vue/Svelte導入。

### V2-D024 — Accessibility is a release gate

- Decision: keyboard、focus-visible、200%ズーム、axe serious/critical 0を必須。
- Reason: 後付けでなく情報構造から担保する。
- Rejected: axeだけで完了扱い。

### V2-D025 — No production/deployment changes in this phase

- Decision: 本PRはdocs/prototype/artifacts/専用テストだけ。
- Reason: ユーザー指定の安全境界。
- Rejected: main merge、Cloudflare preview、本番URL更新。
