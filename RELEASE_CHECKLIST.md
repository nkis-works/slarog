# 公式サイト公開直前チェック

このブランチはリリース用の退避ブランチです。App Store審査提出・アプリ公開・本番サイト公開を行うまでは、`main`へマージせず、本番デプロイもしません。

## 公開時に最終確認する項目

- App Store URL: `https://apps.apple.com/jp/app/スラログ/id6792632919`
- Google Play URL: `https://play.google.com/store/apps/details?id=jp.yuya.slumparchive`
- 無料計算ツールURL: `https://nkisworks.com/tools/slot-balance/`
- ストア登録情報と販売者正式住所の一致

ストアURLはアプリID／packageと対応済みです。公開切替前に、一般ユーザーとして両URLを開けることを確認します。

## 公開時の手動操作

1. App Store／Google PlayのURLを一般ユーザーとして開けることを確認する。
2. 販売者情報の正式住所をストア登録情報と照合する。
3. `REQUIRE_CONFIRMED_ADDRESS=1 pnpm run test` と `pnpm run preflight` を実行する。
4. `dist/` をローカルサーバーで開き、320px、390px、768px、1280pxでVisual QAを行う。
5. Androidは「初回の正常な保存から14日間／Google Playトライアルではない／未登録のまま自動課金なし」、iOSは「対象者は2週間無料／終了後は月額380円で自動更新」で、サイト、規約、アプリ、ストアが一致することを確認する。
6. production buildからnoindexが除かれ、preview buildではnoindexが維持されることを確認する。
7. 承認されたCloudflare Pages公開手順に従い、本物サイトを公開ドメインのトップへ切り替える。
8. 公開後、旧maintenance本文へ到達できないこと、トップ・4文書・無料計算ツール・404、slash 301、robots、sitemapを確認する。
9. 無料計算ツールで3モードの計算、入力非保存・非送信、横はみ出し0、console error 0を再確認する。
