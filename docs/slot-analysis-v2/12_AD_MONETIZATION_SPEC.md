# 広告・収益化仕様

## 現在の判断

本フェーズおよび次の初期実装では、AdSense、広告コード、Auto Ads、CMP、Analytics、ads.txtを追加しない。プロトタイプの破線枠は配置検討だけで、公開DOMに空枠を残さない。

## 将来の許容モデル

- Google AdSenseの手動レスポンシブdisplay adを**1枠だけ**。
- 位置は「クイック結果 → 詳細分析 → スラログCTA」の後、「計算式」の前。
- 入力途中、入力と計算ボタンの間、主要結果、比較リスト、エラー内、sticky/fixed位置には置かない。
- Auto Ads、アンカー、全画面、インタースティシャル、Multiplexを使わない。
- 広告とスラログCTAを視覚・意味上で明確に分け、広告ラベルを表示する。

## 有効化ゲート

次をすべて満たすまで、広告scriptと枠をDOMへ出さない。

1. AdSenseアカウントとサイト審査の状態を確認。
2. 実アカウントからpublisher IDとad slotを取得。
3. 正式ドメインとpreview/pages.devの判定を実装。
4. EEA/英国/スイスを含む配信方針とGoogle認定CMPを決定。
5. privacy/cookie開示、同意撤回導線を更新。
6. CSPへ必要最小のGoogle公式originを追加しテスト。
7. ads.txtの正確な1行をアカウント画面から取得。
8. 広告なしでもレイアウト、機能、CTAが完全に成立。

## 構成案

ビルド時に以下を注入する。値は例であり、コードやリポジトリへ秘密値を置かない。

```text
ADSENSE_ENABLED=false
ADSENSE_CLIENT=
ADSENSE_SLOT=
SITE_ORIGIN=https://nkisworks.com
```

有効条件:

```text
ADSENSE_ENABLED === true
AND SITE_ORIGIN === https://nkisworks.com
AND client/slotが検証済み形式
AND CMP/地域別同意状態が広告要求を許可
```

preview/pages.dev、localhost、未設定、CMPエラーではfail closedとし、広告script、`ins.adsbygoogle`、空白、ネットワーク要求を生成しない。Previewへ本番広告変数を設定しない。

## CMPと同意

Googleの欧州ユーザー同意ポリシーに従い、該当地域でCookie/local storageや個人データを利用する場合は必要な開示と同意を得る。EEA/英国向けパーソナライズド広告にはGoogle認定TCF CMPが必要で、スイスも対象。Googleの現行TCF要件（調査時点v2.3を含む）は実装直前に再確認する。

- CMPが必要な場合も、計算機能は同意前から利用可能。
- 拒否しても計算、結果、CTAを隠さない。
- 同意撤回リンクをprivacy/cookie説明から常時到達可能にする。
- 同意値へ総G、差枚、計算結果を含めない。
- CMP導入前の現状はCookie/storage 0を維持する。

## ads.txt

- Googleはads.txtを推奨するが必須ではない。
- 実AdSense画面が提示したpublisher IDを使い、推測で作らない。
- `https://nkisworks.com/ads.txt` のrootに置く。
- 通常形式 `google.com, pub-..., DIRECT, f08c47fec0942fa0` は、アカウント表示と完全一致を確認してから。
- preview用の偽IDや空ファイルを公開しない。

## CSP

現在の`connect-src 'none'`等を広告導入前提で緩めない。導入時にGoogleが実際に発行するコードと公式ドキュメントから、script/frame/img/connectの必要originを列挙し、ワイルドカードは避ける。CSP違反を見て場当たり的に`*`や`unsafe-eval`を追加しない。

## プライバシー

- 入力値・結果を広告属性、custom targeting、URL、data attribute、consoleへ渡さない。
- 広告script読込前に計算DOMから個別値をマスクする必要はないが、広告コードから値を参照しない境界をテストする。
- Analyticsとは別の承認とし、広告有効化を理由にAnalyticsも追加しない。
- 未成年・ギャンブル関連ポリシー、コンテンツポリシーを公開直前に公式情報で再確認する。

## QA

- 広告OFF: request 0、DOM 0、空白0。
- Preview: 常にOFF、noindex維持。
- 同意前/拒否: 広告要求なし、計算可能。
- 同意後（該当地域）: 手動1枠のみ、結果へ割込みなし。
- 320/390/430/768/1440と200%ズームでoverflowなし。
- 広告blocker、timeout、CSP拒否でもUIが壊れない。
- CLSを測り、枠予約をする場合も広告OFF時には予約しない。

## Google公式参照（2026-07-18確認）

- Responsive display ads: <https://support.google.com/adsense/answer/9183363?hl=en>
- ads.txt: <https://support.google.com/adsense/answer/12171612?hl=en>
- Google-certified CMP requirement: <https://support.google.com/adsense/answer/13554116?hl=en>
- EU user consent setup: <https://support.google.com/adsense/answer/7670013?hl=en>
- TCF integration: <https://support.google.com/adsense/answer/9804260?hl=en>
- Ad partners management: <https://support.google.com/adsense/answer/10960670?hl=en>
- Consent revocation: <https://support.google.com/adsense/answer/10959060?hl=en>
