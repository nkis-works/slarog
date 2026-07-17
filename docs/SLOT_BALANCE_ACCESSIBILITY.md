# スロバランス Accessibility仕様

## 実装

- `lang="ja"`、header／nav／main／section／aside／footer、単一h1と順序付き見出し。
- フォーム先頭へ移動できるskip link。
- mode buttonの`aria-pressed`とroving tabindex。矢印、Home、End対応。
- 全入力へlabel、name、単位、例、`aria-describedby`。error時`aria-invalid`。
- focus可能なerror summaryと修正方法。
- 計算完了・動的区間操作を`aria-live="polite"`で通知。
- 主要button、link、radio／checkbox labelを44px以上。
- `:focus-visible`、色以外の文言・border・見出し、reduced motion、forced colors。
- 数式はtextで表示し、折返し可能。横スクロールを前提としない。

## 検証

- axe-core: critical／serious violation 0。
- キーボード: main mode、submode、details、add／remove／Undo、calculate、linksを操作可能。
- mode切替のArrowLeft／Right／Up／Down、Home、End。
- 320〜1,440pxの7幅で横overflowなし。
- CSS zoomに依存しない流動幅、1列mobile layoutにより200%でも主要操作を維持。

自動検査だけを合格根拠にせず、DOM snapshot、focus順、field error、実画面スクリーンショットを併用する。
