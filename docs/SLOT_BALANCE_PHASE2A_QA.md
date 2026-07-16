# スロバランス Phase 2A QA記録

## 自動検証

| 項目          | 結果                 |
| ------------- | -------------------- |
| format        | PASS                 |
| lint          | PASS                 |
| typecheck     | PASS                 |
| unit          | 9 files / 83 tests   |
| build         | PASS、2回同一SHA-256 |
| Playwright    | 3 spec / 22 tests    |
| axe           | critical／serious 0  |
| existing site | 5 pages＋tool PASS   |
| check         | PASS                 |
| check:all     | PASS                 |

## Browser確認

- console errorなし。
- localhost以外のrequestなし。
- localStorage、sessionStorage、Cookieは空。
- 入力値はURL、consoleへ出ない。
- 320、360、390、430、768、1024、1,440pxで横overflowなし。
- desktopのcontent幅は1,040px以下。
- 既存indexのmobile menuは開閉可能。

## Visual QA成果物

- `artifacts/phase2a/slot-balance-mobile-net-medals.png`（viewport 390px）
- `artifacts/phase2a/slot-balance-mobile-investment.png`（viewport 390px）
- `artifacts/phase2a/slot-balance-mobile-segments.png`（viewport 390px）
- `artifacts/phase2a/slot-balance-desktop-net-medals.png`（viewport 1,440px）
- `artifacts/phase2a/slot-balance-desktop-investment.png`（viewport 1,440px）
- `artifacts/phase2a/slot-balance-desktop-segments.png`（viewport 1,440px）

成果物はGit管理対象外。全6枚を実画像で確認した。

## 発見と修正

1. 選択中modeの補助文とfooter補助文字がWCAG AA 4.5:1をわずかに下回ったため、`--muted`を濃くした。
2. full-page自動撮影がskip linkへ人工的なfocusを残し固定表示したため、skip linkを標準的なabsolute配置へ変更し、撮影時だけ人工focusを除外した。キーボードfocus時の表示は維持した。
3. dynamic fieldsetのlegendを直接子へ修正し、accessible nameと視覚見出しを一致させた。

## 最終評価

入力と結果が主役で、既存NKIS Worksサイトと同じ白・淡灰・青を使用している。派手な装飾、過剰なshadow、外部assetはない。mobileは1列、desktopは最大幅を保ち、動的区間、単位、数式、警告に重なりや横はみ出しはない。
