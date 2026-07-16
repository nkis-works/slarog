# スロバランス Phase 2B0 QA記録

## Gitと範囲

- Repository: `/Users/nkis/Documents/スラログios版`
- Remote: `https://github.com/nkis-works/slarog.git`
- Base: `feature/slot-balance-functional-ui`
- Base HEAD: `800d59657f8a7bca8b74e83a039271f5093e1eb8`
- Branch: `feature/slot-balance-cloudflare-release-candidate`
- 実装コミット:
  - `24a9328 build: add curated Cloudflare Pages distribution`
  - `94e4f6d feat: prepare slot balance public content and site navigation`
  - `9562334 test: validate release distribution and privacy boundaries`
  - `docs: document Cloudflare migration and ad rollout`（本記録を含む）

main merge、tag、GitHub Pages設定変更、Cloudflare account／project／DNS、custom domain、production deploy、AdSense設定は行っていない。

## 自動検証

| 項目          | 結果                    |
| ------------- | ----------------------- |
| format        | PASS                    |
| lint          | PASS                    |
| typecheck     | PASS                    |
| unit          | 9 files / 83 tests PASS |
| preview build | PASS                    |
| dist manifest | 23 files PASS           |
| source E2E    | 22 tests PASS           |
| dist E2E      | 14 tests PASS           |
| axe           | critical／serious 0     |
| `check`       | PASS                    |
| `check:all`   | PASS                    |

## Build境界

- `dist/`はbuild開始時に必ず削除する。
- root HTML 5件、robots、sitemap、root assets、スロバランスHTML／CSS／bundle、`_headers`、`_redirects`だけをcopyする。
- TypeScript、source、tests、E2E、docs、package／lock、config、node_modules、artifacts、source mapを含めない。
- 追跡bundleとdist bundleのbyte一致を検査する。
- 同じpreview buildを2回実行し、23ファイル全てのSHA-256一覧が一致した。
- `SITE_ORIGIN`なしのproduction buildは意図どおり失敗した。
- 最終`dist/`はpreview modeで、公開ドメイン、canonical、`og:url`を含まない。

## Security

- `_headers`: nosniff、strict-origin referrer、DENY、Permissions-Policy、厳格CSP。
- CSP: self-hosted script／style／imageだけ、`connect-src 'none'`、`frame-src 'none'`、`frame-ancestors 'none'`、`object-src 'none'`。
- `unsafe-inline`、`unsafe-eval`なし。
- meta CSPはheaderから`frame-ancestors`だけを除いた内容で全HTML一致。
- `_redirects`はスロバランスの末尾スラッシュ正規化2件だけ。SPA fallbackなし。
- 外部runtime、iframe、外部form action、source map、広告ID、広告script、秘密情報らしき文字列なし。

## Privacy／network

計算後を含め、次が0または空であることを確認した。

- external request
- fetch／XHR／WebSocket／EventSource／beacon
- console全level
- page error
- localStorage／sessionStorage
- Cookie
- IndexedDB database
- Cache Storage
- URL query／hashへの入力値

生のテスト入力`4321`、`987`もconsoleへ出ない。

## Content／navigation

- 制作途中の公開文言を削除。
- 公式トップ、mobile menu、support、footerからスロバランスへ遷移可能。
- スロバランスから公式トップ、support、privacy、termsへ遷移可能。
- 計算結果、警告、境界、動的根拠、スラログCTA、広告挿入位置、一般計算式、使い方、FAQ、免責の順序を確認。
- 一般計算式9項目、FAQ 10項目。
- 広告挿入コメントは1件、広告DOM／label／script／requestは0。
- privacyとtermsを現状へ更新し、広告・解析を使用中とは記載していない。

## Responsive／browser

dist E2Eでは全6ページを320、390、768、1,440pxで確認し、horizontal overflowは0。source E2Eでは320、360、390、430、768、1,024、1,440pxを確認した。

実ブラウザで1,280×720と390×844を再確認した。desktop／mobileともhorizontal overflow 0、console全level 0、計算式9、FAQ 10であった。

## Visual QA成果物

`artifacts/phase2b0/`はGit管理対象外で、次の10枚だけを配置した。

- `site-home-mobile.png`
- `site-home-desktop.png`
- `slot-balance-mobile-net.png`
- `slot-balance-mobile-investment.png`
- `slot-balance-mobile-segments.png`
- `slot-balance-desktop-net.png`
- `slot-balance-desktop-investment.png`
- `slot-balance-desktop-segments.png`
- `slot-balance-formulas-faq-mobile.png`
- `slot-balance-formulas-faq-desktop.png`

全10枚を実画像で確認した。公式サイトのlazy imageは撮影前に全件読込し、黒い未読込placeholderが残らない状態で再撮影した。スロバランスはmobile／desktopとも入力、結果、CTA、計算式、FAQが既存サイトの白・淡灰・青の設計と整合し、横崩れや文字切れはない。

## 公開前に残る作業

1. Cloudflare branch previewの作成と確認。
2. 所有ドメインとapex／www canonicalの決定。
3. production `SITE_ORIGIN`設定。
4. custom domain／DNS／SSL確認。
5. PR reviewと`main` merge。
6. 旧GitHub Pages URLの処理決定。
7. Search Console／sitemap。
8. production安定後のAdSense申請。
9. 別承認による手動広告1枠の実装・有効化。
