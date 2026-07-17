# AdSense導入計画

## 現在の状態

Phase 2B0ではAdSenseを無効のまま維持する。publisher ID、slot ID、広告script、外部広告request、広告表示DOM、空の広告枠、`ads.txt`は存在しない。CSPも広告domainを許可しない。

HTMLには次のコメントを1件だけ置き、将来の挿入位置を固定する。

```html
<!-- SLOT_BALANCE_MANUAL_AD_INSERTION_POINT -->
```

位置はスラログCTAの後、一般計算式の前である。入力中、計算結果、警告、計算根拠へ広告を割り込ませない。

## 許可する広告形式

- Google AdSenseのmanual responsive display ad 1枠だけ
- スラログCTAより後
- 計算式より前
- mobile／desktopでcontainer幅に収まるresponsive表示
- 読み込み失敗または未設定時はDOMごと非表示
- パーソナライズ広告を前提にしない

## 使用しない形式

- Auto ads
- anchor／sticky
- vignette／interstitial
- side rail
- multiplex
- popup／popunder
- 画面固定、入力追従、結果への差し込み
- 誤タップを誘うボタン近接配置

## 有効化の前提

1. Cloudflare productionとcustom domainが安定している。
2. AdSense審査が完了し、正式なpublisher IDとslot IDを確認できる。
3. privacyを広告、Cookie、第三者事業者、利用目的に合わせて更新する。
4. 対象地域とGoogle要件からCMP／consentの要否を確認する。
5. CSPへ必要最小限の広告domainだけを追加する変更案をレビューする。
6. `ads.txt`の正規行をAdSense管理画面の値と照合する。
7. mobile／desktopでレイアウト、CLS、誤タップ、結果導線を確認する。

## 将来の設定契約

将来の実装では、例えば次のproduction-only環境変数を使用し、値をHTMLやsourceへ直書きしない。

- `ADSENSE_CLIENT_ID`
- `ADSENSE_SLOT_ID`

両方が揃わない場合はbuildを失敗させるか、広告を完全に無効化する。片方だけ、形式不正、テストID、既知の仮IDでは広告markupを生成しない。previewでは値が存在しても広告を有効にしない。

Phase 2B0のbuildにはこの設定処理自体を追加しない。実ID取得後の別phaseで、形式validationとfail-closed testを実装する。

## CSP変更方針

現在のCSPは`script-src 'self'`、`connect-src 'none'`、`frame-src 'none'`であり、広告は動作しない。広告有効化時はGoogle公式要件をその時点で再確認し、必要なdirectiveとdomainだけを追加する。

`unsafe-inline`、`unsafe-eval`、無関係なwildcardを安易に許可しない。広告を止めれば元の厳格CSPへ戻せる差分にする。

## privacy／同意

広告有効化前に、少なくとも次をprivacyへ反映する。

- 利用する広告事業者
- Cookie等の識別子の利用有無
- 広告配信と測定の目的
- 第三者への送信項目
- opt-out／consent管理方法
- 対象地域ごとの同意要件

同意が必要な地域では、広告scriptより前に同意状態を確定する。入力値、計算結果、金額、差枚、G数、機種名、店舗名を広告parameterへ渡さない。

EEA、英国、スイス向けの同意管理は、導入時点のGoogle側設定と法的要件を確認して一致させる。計算入力を広告payload、URL query、console、data attributeへ含めない。

## Test項目

- 広告は1枠だけ
- CTAより後、計算式より前
- 入力／結果／警告の途中にない
- 未設定／previewでは広告DOM、label、script、requestが0
- 外部request先がallowlistだけ
- publisher／slot IDをconsole、URL、errorへ不用意に出さない
- user入力を広告requestへ含めない
- localStorage等へ計算値を保存しない
- 320pxで横overflowなし
- 広告block時に空白を残さない
- 広告ブロッカー使用時も計算とSlarog CTAが正常に動作する
- CLSと誤タップ距離を確認

## Rollback

広告に起因するCSP error、layout shift、privacy不一致、審査違反、表示障害があれば、広告生成を無効化し、広告domainをCSPから削除し、広告導入前のdeploymentへ戻す。広告が埋まらない場合や読み込みに失敗した場合は枠を畳む。計算機能とスラログCTAは広告から独立して維持する。
