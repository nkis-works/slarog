# スロバランス Decision Log

## D-001 基点

2026-07-16。`feature/real-app-screenshots-and-benefit-copy`の`bcc8c87`から`feature/slot-balance-complete-core`を分岐する。既存のWebサイト改善を引き継ぎ、mainや元ブランチへ直接実装しない。

## D-002 静的サイトを維持

サイト全体をReact、Next.js、Vue、Svelte等へ移行しない。既存HTML/CSS/Vanilla JavaScriptとGitHub Pagesのbranch deploymentを維持する。

## D-003 開発専用ツールチェーン

Node.js、npm scripts、TypeScript strict、Vitest、ESLint、Prettier、esbuildを追加する。build出力は無視対象の`build/`へ置き、Phase 1で公開経路を作らない。

## D-004 金額精度

貸出・交換条件を10進文字列から有理数へ変換する。金額判断、切り捨て、切り上げは分数のまま行い、二進浮動小数点へ依存しない。

## D-005 貯メダル評価

使用貯メダルは交換条件で機会費用評価し、交換単位で切り捨てない。現在枚数の交換見込額だけに交換単位を適用する。

## D-006 差枚と現在枚数

差枚は出玉率、現在枚数は交換見込額へ使用する。両方入力しても互いへ加算せず、同値の場合は混同疑いwarningを返す。

## D-007 区間重複

開始・終了Gを明示した区間の重複は、集計を二重計上するためerrorとする。単に極端な率であることはerrorにしない。

## D-008 負数の丸め

四捨五入はhalf away from zeroとする。JavaScript標準の符号非対称な丸めを使用しない。

## D-009 transfer freshness

transfer準備には計算時と現在の入力revision一致を必須とする。stale結果はシリアライズしない。Phase 1でURL、Universal Link、Custom Schemeは生成しない。

## D-010 analytics allowlist

analytics metadataはallowlistから再構成する。型だけでなくruntime sanitizerでも金額、差枚、G数、自由入力を落とす。送信処理は実装しない。

## D-011 公開保留

Phase 1では`index.html`、privacy、terms、sitemap、GitHub Pages設定を変更しない。UI、公開導線、広告、analytics送信、E2E、デプロイはPhase 2以降とする。

## D-012 Phase 2Aの静的UI

2026-07-16。`ea2e572`から`feature/slot-balance-functional-ui`を分岐し、`tools/slot-balance/index.html`へVanilla TypeScript UIを追加する。既存サイトのHTML/CSS/JavaScript構成とGitHub Pages branch deploymentを維持する。

## D-013 公開bundle

Phase 1の無視対象`build/slot-balance/slot-balance-domain.js`はruntime consumerがなく、source mapを含む検証専用出力だったため生成を終了する。Phase 2AはUI entrypointとドメインを単一IIFEへbundleし、追跡対象の`tools/slot-balance/assets/slot-balance-app.js`だけを生成する。source mapは生成せず、2回buildの同一性を検証する。

## D-014 Transfer v1を維持

mode別必須項目、safe integer、実在日付、制御文字、文字数、segment 1〜100件、pair、同一形式をruntimeで厳格検証する。フィールド構造自体はversion 1互換のためversion 2へ上げない。`CALCULATION_VERSION`も`1.0.0`を維持する。

## D-015 Analytics未知codeは省略

形式regexと64文字制限だけでは自由入力漏えいを止められないため、安定codeのallowlistも必須とする。未知codeは`unknown_error`へ変換せず省略し、送信処理は引き続き実装しない。

## D-016 モード別revision

差枚、投資、区間、実IN/OUT、コイン持ちでrevisionを分離する。入力変更で旧結果を消さずstale表示し、モード切替だけでは計算しない。これにより入力保持と結果混在防止を両立する。

## D-017 保存・通信なし

Phase 2Aはブラウザ保存、Cookie、API、広告、analytics、URL query／hashを一切使用しない。CSPは外部接続を禁止し、Slarog導線は計算結果を含まない通常の相対リンクだけとする。

## D-018 PlaywrightとVisual QA

Playwright＋axeで主要計算、privacy、keyboard、7幅、既存ページ回帰を検証する。Visual QA成果物は`artifacts/phase2a/`へ置いてGit管理対象外とし、mobile 390px／desktop 1,440pxの6画面を実画像で確認する。
