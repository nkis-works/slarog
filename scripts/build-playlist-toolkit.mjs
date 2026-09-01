import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ORIGIN = 'https://nkisworks.com';
const BASE = '/products/playlist-toolkit';
const SUPPORT_EMAIL = 'slarog.app@gmail.com';
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=app.playlistsort.assistant';
const locales = [
  { code: 'en', segment: '', label: 'English', htmlLang: 'en', og: 'en_US' },
  { code: 'ja', segment: 'ja', label: '日本語', htmlLang: 'ja', og: 'ja_JP' },
  { code: 'de', segment: 'de', label: 'Deutsch', htmlLang: 'de', og: 'de_DE' },
  { code: 'es', segment: 'es', label: 'Español', htmlLang: 'es', og: 'es_ES' },
  { code: 'fr', segment: 'fr', label: 'Français', htmlLang: 'fr', og: 'fr_FR' },
  { code: 'it', segment: 'it', label: 'Italiano', htmlLang: 'it', og: 'it_IT' },
  { code: 'pt-BR', segment: 'pt-br', label: 'Português (Brasil)', htmlLang: 'pt-BR', og: 'pt_BR' },
];

const copy = {
  en: {
    language: 'Language',
    nav: {
      features: 'Features',
      flow: 'How it works',
      privacy: 'Privacy',
      support: 'Support',
      terms: 'Terms',
    },
    common: {
      product: 'Playlist Toolkit',
      maker: 'AN NKIS WORKS PRODUCT',
      independent:
        'Independent third-party utility. Not affiliated with, sponsored by, or endorsed by Amazon.',
      footer:
        'Playlist Toolkit works with supported screens in the separately installed Amazon Music Android app. Amazon and Amazon Music are trademarks of their respective owner.',
      back: 'Product overview',
      contents: 'On this page',
      email: 'Email support',
    },
    home: {
      metaTitle: 'Playlist Toolkit | Playlist management utility for Amazon Music',
      metaDescription:
        'An independent Android utility for Amazon Music playlist sorting, audits, duplicate review, Smart Add and compatibility checks.',
      eyebrow: 'PLAYLIST CONTROL, WITHOUT THE CLUTTER',
      title: 'Put every playlist back in order.',
      lead: 'Remember display order, review duplicates and playlist health, prepare additions, and return to the playlists you use most. Playlist Toolkit guides supported actions in Amazon Music without modifying the Amazon Music app.',
      primary: 'Explore features',
      secondary: 'Check support',
      store: 'Get it on Google Play',
      price: 'Japan: ¥200 / month',
      localPrice: 'Local price is shown in Google Play',
      status: 'Available on Android',
      consoleLabel: 'COMPATIBILITY CONSOLE',
      consoleStatus: 'SUPPORTED UI',
      rows: [
        ['01', 'Artist order', 'remembered'],
        ['02', 'Duplicate review', 'on device'],
        ['03', 'Smart Add', 'user initiated'],
      ],
      cardLabel: 'SAFETY CHECK',
      cardTitle: 'Ready to assist',
      cardBody: 'Required controls were found. Unknown screens stop safely.',
      trust: [
        [
          'On-device playlist processing',
          'Visible playlist labels are not sent to an NKIS Works server.',
        ],
        [
          'Compatibility before purchase',
          'Check supported Amazon Music screens before starting a subscription.',
        ],
        [
          'Safe stop by design',
          'The assistant does not guess when a required control cannot be verified.',
        ],
      ],
      featuresEyebrow: 'ONE WORKFLOW',
      featuresTitle: 'Less tapping. More listening.',
      featuresLead:
        'Built around the repetitive playlist work Amazon Music leaves to manual navigation.',
      features: [
        [
          'ORDER',
          'Remember your preferred display order',
          'Restore artist, title, recently added, or duration order on supported playlist screens without changing the saved track sequence.',
        ],
        [
          'AUDIT',
          'Review a long playlist as a whole',
          'Scan visible playlist rows to review duplicate candidates and available indicators such as download, like, lyrics, and audio quality.',
        ],
        [
          'ADD',
          'Prepare additions before acting',
          'Smart Add organizes candidate tracks and performs only the supported, user-started steps you approve.',
        ],
        [
          'RETURN',
          'Get back to the playlist that matters',
          'Save a favorite playlist destination and reduce repeated navigation when you open Amazon Music again.',
        ],
      ],
      flowEyebrow: 'CLEAR BY DESIGN',
      flowTitle: 'Check first. Subscribe second. Stay in control.',
      flowLead:
        'Screen operation support is explained before Android settings open, and the free compatibility check does not start a charge.',
      steps: [
        [
          'See value and price',
          'The monthly plan and core features are shown before any strong permission is requested.',
        ],
        [
          'Enable screen assistance',
          'Android Accessibility is used only for the disclosed playlist support workflow.',
        ],
        [
          'Run the free check',
          'Playlist header, track list, sort control, and Add Songs control are verified.',
        ],
        [
          'Choose whether to subscribe',
          'Only a compatible device proceeds to the Google Play purchase screen.',
        ],
      ],
      safetyEyebrow: 'COMPATIBILITY MAINTENANCE',
      safetyTitle: 'Dynamic where it should be. Conservative where it must be.',
      safetyLead:
        'Playlist Toolkit locates supported controls from the current screen using known view identifiers and localized labels. It is resilient to ordinary layout movement, but it does not claim to understand every future Amazon Music interface.',
      safety: [
        [
          'Dynamic control discovery',
          'Supported controls are found from the current accessibility node tree rather than a single hard-coded tap position.',
        ],
        [
          'Known interface contract',
          'The app checks required playlist controls before supported automation begins.',
        ],
        [
          'Unknown interface, safe stop',
          'Missing or ambiguous controls end the operation instead of triggering an unverified action.',
        ],
        [
          'Updates through Google Play',
          'Compatibility improvements are delivered through Playlist Toolkit updates after Amazon Music changes are reviewed.',
        ],
      ],
      faqTitle: 'Before you install',
      faqs: [
        [
          'Is this an Amazon app?',
          'No. Playlist Toolkit is developed and published independently by NKIS Works and is not affiliated with or endorsed by Amazon.',
        ],
        [
          'Does it need my Amazon password?',
          'No. The app does not ask for or store your Amazon account password. Amazon Music remains a separate installed app.',
        ],
        [
          'What does Accessibility do?',
          'It reads supported visible Amazon Music interface text and controls and performs narrow, user-started playlist assistance. The app explains this before Android settings open.',
        ],
        [
          'What happens after an Amazon Music update?',
          'The compatibility check may stop unsupported operations. NKIS Works can then review the change and provide an updated supported profile through Google Play.',
        ],
        [
          'Is playlist information uploaded?',
          'Playlist names and visible track labels used by the organizer are processed on the device and are not sent to an NKIS Works server. Google Play separately handles purchase and subscription status.',
        ],
      ],
      ctaTitle: 'Know whether it works before you pay.',
      ctaBody:
        'The initial compatibility check is free. If the supported playlist controls are not found, the subscription screen is not offered.',
      ctaButton: 'Read compatibility help',
    },
    privacy: {
      title: 'Privacy Policy',
      intro:
        'This policy explains how Playlist Toolkit handles information while providing playlist assistance for the Amazon Music Android app.',
      updated: 'Effective and last updated: September 2, 2026',
      sections: [
        [
          '1. Scope and publisher',
          [
            'Playlist Toolkit is an independent Android utility published by NKIS Works. It is not an Amazon product and is not affiliated with or endorsed by Amazon.',
          ],
        ],
        [
          '2. Screen operation support',
          [
            'When Android Accessibility screen operation support is enabled, the app can inspect visible text, labels, controls, and accessibility node properties on supported Amazon Music screens. This is used to identify playlist headers, track rows, sort choices, Add Songs controls, and user-requested move targets.',
            'The service is configured for the Amazon Music package. While the floating assistant is visible, the app may check which app is in the foreground so it can hide outside Amazon Music. It does not use this capability for advertising or user profiling.',
          ],
        ],
        [
          '3. On-device playlist data',
          [
            'Playlist names, visible track titles and labels, audit results, saved sort preferences, favorite playlist settings, compatibility signals, and bounded diagnostics are processed locally on the device. Playlist content is not transmitted to an NKIS Works server and is not sold.',
          ],
        ],
        [
          '4. Diagnostics and user export',
          [
            'A limited diagnostic log may remain in app memory while the service process runs. It is cleared when requested or when the process ends. Diagnostics leave the app only when the user explicitly copies and shares them. Users should review copied diagnostics before sending them to support.',
          ],
        ],
        [
          '5. Google Play purchases',
          [
            'Google Play Billing is used to display subscription products, complete purchases, restore access, and verify entitlement status. Google processes payment information under its own policies. NKIS Works does not directly receive credit card numbers. The app receives only the purchase and entitlement information required to provide paid access.',
          ],
        ],
        [
          '6. Support communications',
          [
            "If a user contacts support, NKIS Works receives the sender's email address, message, and any diagnostics, screenshots, device information, or files the user chooses to include. This information is used to answer the request and investigate the reported issue.",
          ],
        ],
        [
          '7. Retention, deletion, and control',
          [
            'Local preferences and results can be removed by clearing app data or uninstalling the app. Screen operation support can be disabled in Android Settings at any time. Support emails are retained only as reasonably necessary to handle the request, maintain support records, prevent abuse, or comply with law.',
          ],
        ],
        [
          '8. Security, changes, and contact',
          [
            'NKIS Works limits processing to the functions described above and reviews the policy when app behavior changes. Material changes will be reflected on this page with a revised date. Privacy questions can be sent to the support address below.',
          ],
        ],
      ],
    },
    support: {
      title: 'Support',
      intro:
        'Compatibility help, subscription guidance, and safe recovery steps for Playlist Toolkit.',
      updated: 'Support contact: slarog.app@gmail.com',
      sections: [
        [
          'Before contacting support',
          [
            'Include the Playlist Toolkit version, Android version, Amazon Music version, selected app language, and the operation that stopped. Do not include your Amazon password or payment card information.',
          ],
        ],
        [
          'Compatibility check does not complete',
          [
            'Open a playlist you created or can manage, confirm that its track list, Sort control, and Add Songs control are visible, then return to the compatibility check. If Amazon Music changed its interface, the app may stop until a compatible update is available.',
          ],
        ],
        [
          'The assistant stopped during an operation',
          [
            'A stop is intentional when a required control cannot be verified, the screen changes unexpectedly, a gesture is rejected, or the operation times out. Return to the expected playlist screen and retry only after confirming the screen is stable.',
          ],
        ],
        [
          'Disable screen operation support',
          [
            'Open Android Settings, go to Accessibility, select Playlist Toolkit, and turn the service off. Uninstalling the app also removes its local data and service.',
          ],
        ],
        [
          'Manage or cancel the subscription',
          [
            'Open Google Play, choose Payments & subscriptions, then Subscriptions, and select Playlist Toolkit. Cancellation and billing timing are controlled by Google Play and the terms shown for the purchase.',
          ],
        ],
        [
          'Contact',
          [
            "Email is the shared NKIS Works support channel. When useful, copy the app's bounded diagnostics after reviewing them and paste them into the message.",
          ],
        ],
      ],
    },
    terms: {
      title: 'Terms of Use',
      intro:
        'These terms apply to the use of Playlist Toolkit, an independent playlist assistance utility published by NKIS Works.',
      updated: 'Effective and last updated: September 2, 2026',
      sections: [
        [
          '1. Service',
          [
            'Playlist Toolkit assists user-initiated playlist organization workflows on supported screens in the separately installed Amazon Music Android app. Features can vary by app version, Android version, device, region, language, subscription status, and Amazon Music interface.',
          ],
        ],
        [
          '2. Independent third-party product',
          [
            "Playlist Toolkit is not affiliated with, sponsored by, or endorsed by Amazon. Amazon and Amazon Music are trademarks of their respective owner. Users must separately obtain and use Amazon Music under Amazon's applicable terms.",
          ],
        ],
        [
          '3. Subscription and billing',
          [
            'Paid features are offered through an automatically renewing Google Play subscription. In Japan, the price is ¥200 per month; the actual price, tax, currency, renewal date, trial availability, and other purchase terms are those displayed by Google Play before confirmation. The compatibility check itself does not start a charge.',
          ],
        ],
        [
          '4. Cancellation and refunds',
          [
            'Subscriptions can be managed or canceled through Google Play. Deleting Playlist Toolkit does not by itself cancel a subscription. Billing, cancellation timing, and refunds are handled under Google Play rules and applicable law.',
          ],
        ],
        [
          '5. User responsibility',
          [
            'Users must review the target playlist and screen before starting an operation, avoid interacting with Amazon Music while an automated audit or supported gesture is in progress, and stop the operation if the displayed target is not the intended one. Users remain responsible for their playlists and account activity.',
          ],
        ],
        [
          '6. Acceptable use',
          [
            "Users may not use the app to violate law, third-party rights, Amazon's terms, Google Play policies, or device security. Circumventing payment, abusing accessibility capabilities, distributing modified copies, or attempting unauthorized access is prohibited to the extent permitted by law.",
          ],
        ],
        [
          '7. Compatibility and availability',
          [
            'Amazon Music can change or remove interface controls without notice. Playlist Toolkit may temporarily stop supporting a screen or version. The app is designed to stop when required controls cannot be verified, but uninterrupted availability or compatibility with every future interface is not guaranteed.',
          ],
        ],
        [
          '8. Disclaimer, changes, and contact',
          [
            'To the extent permitted by law, the service is provided without guarantees of uninterrupted operation, error-free results, or fitness for every playlist workflow. NKIS Works may update these terms when the service changes. Questions can be sent to the support address below.',
          ],
        ],
      ],
    },
  },
  ja: {
    language: '言語',
    nav: {
      features: '機能',
      flow: '使い方',
      privacy: 'プライバシー',
      support: 'サポート',
      terms: '利用規約',
    },
    common: {
      product: 'Playlist Toolkit',
      maker: 'NKIS WORKS PRODUCT',
      independent:
        '独立した第三者製ユーティリティです。Amazonとの提携・後援・承認関係はありません。',
      footer:
        'Playlist Toolkitは、別途インストールされたAmazon Music Android版の対応画面で動作します。AmazonおよびAmazon Musicは各権利者の商標です。',
      back: '製品概要',
      contents: 'このページの内容',
      email: 'メールで問い合わせ',
    },
    home: {
      metaTitle: 'Playlist Toolkit｜Amazon Musicのプレイリスト整理支援',
      metaDescription:
        'Amazon Musicのプレイリスト並び順復元、監査、重複確認、Smart Add、互換性チェックを支援する独立したAndroidユーティリティです。',
      eyebrow: 'プレイリスト整理を、もっと軽やかに',
      title: '聴きたい順を、いつもの状態に。',
      lead: '表示順の記憶と復元、重複候補やプレイリスト状態の監査、追加候補の整理、よく使うプレイリストへの復帰をひとつに。Amazon Musicアプリを改変せず、対応する画面操作を支援します。',
      primary: '機能を見る',
      secondary: 'サポートを確認',
      store: 'Google Playで入手',
      price: '日本：月額200円',
      localPrice: '他地域の価格はGoogle Playに表示',
      status: 'Android版 配信中',
      consoleLabel: '互換性コンソール',
      consoleStatus: '対応UIを確認',
      rows: [
        ['01', 'アーティスト順', '記憶済み'],
        ['02', '重複候補の監査', '端末内処理'],
        ['03', 'Smart Add', 'ユーザー開始'],
      ],
      cardLabel: '安全確認',
      cardTitle: '支援を開始できます',
      cardBody: '必要な操作項目を確認済み。不明な画面では安全に停止します。',
      trust: [
        ['プレイリスト情報は端末内処理', '表示された曲名等をNKIS Worksのサーバーへ送信しません。'],
        ['購入前に互換性を確認', 'サブスクリプション開始前に対応画面を無料で確認できます。'],
        ['推測せず安全停止', '必要な操作項目を確認できない場合は操作を続行しません。'],
      ],
      featuresEyebrow: 'ひとつの整理フロー',
      featuresTitle: 'タップを減らして、音楽の時間を増やす。',
      featuresLead:
        'Amazon Musicで何度も繰り返していたプレイリスト操作を、分かりやすい流れにまとめます。',
      features: [
        [
          'ORDER',
          '好みの表示順を記憶・復元',
          'アーティスト、タイトル、最近追加、再生時間の表示順を対応画面で復元します。保存された曲順を変更する操作とは区別されます。',
        ],
        [
          'AUDIT',
          '長いプレイリストをまとめて確認',
          '表示された曲を読み取り、重複候補、ダウンロード、いいね、歌詞、音質など取得可能な状態を確認します。',
        ],
        [
          'ADD',
          '追加候補を整理してから操作',
          'Smart Addで候補曲を整理し、ユーザーが開始した対応手順だけを実行します。',
        ],
        [
          'RETURN',
          'よく使うプレイリストへすぐ戻る',
          'お気に入りのプレイリストを記憶し、Amazon Musicを開いた後の繰り返し移動を減らします。',
        ],
      ],
      flowEyebrow: '分かりやすい初回導線',
      flowTitle: '確認してから、支払う。操作の主導権はユーザーに。',
      flowLead:
        'Android設定を開く前に画面操作支援の目的を説明し、無料互換性チェックだけでは料金が発生しません。',
      steps: [
        ['価値と価格を確認', '強い権限を求める前に、月額料金と主要機能を表示します。'],
        ['画面操作支援を許可', 'Accessibilityは説明したプレイリスト支援のためだけに使用します。'],
        ['無料互換性チェック', '見出し、曲一覧、並び替え、曲追加の操作項目を確認します。'],
        ['利用開始を選択', '対応端末と確認できた場合だけGoogle Playの購入画面へ進めます。'],
      ],
      safetyEyebrow: '継続的な互換性対応',
      safetyTitle: '動的に探し、分からないときは止まる。',
      safetyLead:
        '既知のView IDと多言語ラベルから現在の画面上の操作項目を探します。通常の位置変更には耐性がありますが、将来のあらゆるAmazon Music画面を自律理解すると保証するものではありません。',
      safety: [
        [
          '操作項目を動的探索',
          'ひとつの固定タップ位置ではなく、現在のAccessibility Nodeツリーから対応項目を探します。',
        ],
        ['既知UI契約を確認', '対応操作の開始前に必要なプレイリスト項目を検査します。'],
        ['未知UIでは安全停止', '操作項目が不足または曖昧な場合、未確認の操作をせず停止します。'],
        [
          'Google Play更新で継続対応',
          'Amazon Musicの変更を確認後、Playlist Toolkitの更新を通じて互換性を改善します。',
        ],
      ],
      faqTitle: 'インストール前の確認',
      faqs: [
        [
          'Amazon公式アプリですか？',
          'いいえ。NKIS Worksが独立して開発・公開する第三者製品で、Amazonとの提携・承認関係はありません。',
        ],
        [
          'Amazonのパスワードは必要ですか？',
          '不要です。Amazonアカウントのパスワードを要求・保存しません。Amazon Musicは別アプリとして動作します。',
        ],
        [
          'Accessibilityは何をしますか？',
          '対応するAmazon Music画面の表示文字と操作項目を確認し、ユーザーが開始した限定的なプレイリスト支援を行います。Android設定を開く前にアプリ内で説明します。',
        ],
        [
          'Amazon Music更新後はどうなりますか？',
          '互換性チェックで非対応操作を停止する場合があります。変更確認後、対応プロファイルをGoogle Play経由のアプリ更新で提供します。',
        ],
        [
          'プレイリスト情報を送信しますか？',
          '整理に使うプレイリスト名と画面上の曲ラベルは端末内で処理し、NKIS Worksのサーバーへ送信しません。購入状態はGoogle Playが別途処理します。',
        ],
      ],
      ctaTitle: '支払う前に、この端末で使えるか確認。',
      ctaBody:
        '最初の互換性チェックは無料です。必要なプレイリスト操作項目が見つからない場合、購入画面へ進めません。',
      ctaButton: '互換性ヘルプを見る',
    },
    privacy: {
      title: 'プライバシーポリシー',
      intro:
        'Amazon Music Android版のプレイリスト支援において、Playlist Toolkitが情報をどのように扱うかを説明します。',
      updated: '施行日・最終更新日：2026年9月2日',
      sections: [
        [
          '1. 適用範囲と提供者',
          [
            'Playlist ToolkitはNKIS Worksが提供する独立したAndroidユーティリティです。Amazonの製品ではなく、Amazonとの提携・後援・承認関係はありません。',
          ],
        ],
        [
          '2. 画面操作支援',
          [
            'AndroidのAccessibilityによる画面操作支援を有効にすると、対応するAmazon Music画面に表示された文字、ラベル、操作項目およびNode属性を確認できます。プレイリスト見出し、曲一覧、並び替え候補、曲追加項目、ユーザーが指定した移動対象を識別するために使用します。',
            'サービスのイベント対象はAmazon Musicパッケージに制限しています。フローティング支援パネルの表示中は、Amazon Music以外でパネルを隠すために前面アプリを確認する場合があります。広告やユーザー追跡には使用しません。',
          ],
        ],
        [
          '3. 端末内で扱うプレイリスト情報',
          [
            'プレイリスト名、画面上の曲名・ラベル、監査結果、並び順設定、お気に入りプレイリスト、互換性信号、件数を制限した診断情報は端末内で処理します。プレイリスト内容をNKIS Worksのサーバーへ送信・販売しません。',
          ],
        ],
        [
          '4. 診断情報とユーザーによる共有',
          [
            '限定的な診断ログがサービス動作中のメモリに残る場合があります。消去操作またはプロセス終了で消えます。ユーザーが明示的にコピー・共有した場合だけアプリ外へ出ます。サポートへ送る前に内容を確認してください。',
          ],
        ],
        [
          '5. Google Playでの購入',
          [
            '商品表示、購入、復元、有効状態確認にGoogle Play Billingを使用します。支払い情報はGoogleの方針に従ってGoogleが処理し、NKIS Worksがクレジットカード番号を直接取得しません。アプリは有料機能提供に必要な購入・利用権情報だけを受け取ります。',
          ],
        ],
        [
          '6. サポートへの問い合わせ',
          [
            'メールで問い合わせた場合、送信元メールアドレス、本文、ユーザーが任意で添付した診断情報、画像、端末情報、ファイルを受け取ります。回答と不具合調査に使用します。',
          ],
        ],
        [
          '7. 保存期間、削除、管理',
          [
            'ローカル設定と結果はアプリデータ消去またはアンインストールで削除できます。画面操作支援はAndroid設定からいつでも無効化できます。問い合わせメールは対応、記録、不正防止、法令対応に合理的に必要な期間だけ保持します。',
          ],
        ],
        [
          '8. 安全管理、変更、連絡先',
          [
            '上記の機能に必要な範囲へ処理を限定し、アプリ動作の変更時に本ポリシーを見直します。重要な変更は更新日とともに本ページへ反映します。プライバシーに関する質問は下記窓口へ連絡してください。',
          ],
        ],
      ],
    },
    support: {
      title: 'サポート',
      intro: 'Playlist Toolkitの互換性、サブスクリプション、安全な復旧手順をご案内します。',
      updated: 'サポート窓口：slarog.app@gmail.com',
      sections: [
        [
          '問い合わせ前にご確認ください',
          [
            'Playlist Toolkitのバージョン、Android版、Amazon Music版、選択言語、停止した操作を記載してください。Amazonのパスワードやカード情報は送らないでください。',
          ],
        ],
        [
          '互換性チェックが完了しない',
          [
            '自分で作成または管理できるプレイリストを開き、曲一覧、並び替え、曲追加が表示されていることを確認してからチェックへ戻ってください。Amazon Musicの画面変更時は対応更新まで停止する場合があります。',
          ],
        ],
        [
          '操作中に支援が停止した',
          [
            '必要な項目を確認できない、画面が予期せず変化した、ジェスチャーが拒否された、時間切れになった場合の停止は安全機構です。画面が安定していることを確認してから再実行してください。',
          ],
        ],
        [
          '画面操作支援を無効にする',
          [
            'Android設定のAccessibilityからPlaylist Toolkitを選択し、サービスをオフにします。アンインストールするとローカルデータとサービスも削除されます。',
          ],
        ],
        [
          'サブスクリプションを管理・解約する',
          [
            'Google Playの「お支払いと定期購入」から「定期購入」を開き、Playlist Toolkitを選択します。解約時期と請求はGoogle Playに表示される条件に従います。',
          ],
        ],
        [
          'お問い合わせ',
          [
            'NKIS Works共通窓口としてメールで受け付けます。必要な場合はアプリ内の診断情報を確認してからコピーし、本文へ貼り付けてください。',
          ],
        ],
      ],
    },
    terms: {
      title: '利用規約',
      intro:
        '本規約は、NKIS Worksが提供する独立したプレイリスト整理支援ツールPlaylist Toolkitの利用に適用されます。',
      updated: '施行日・最終更新日：2026年9月2日',
      sections: [
        [
          '1. サービス内容',
          [
            '別途インストールされたAmazon Music Android版の対応画面において、ユーザーが開始したプレイリスト整理を支援します。機能はアプリ版、Android版、端末、地域、言語、契約状態、Amazon Musicの画面構成により異なる場合があります。',
          ],
        ],
        [
          '2. 独立した第三者製品',
          [
            'Amazonとの提携・後援・承認関係はありません。AmazonおよびAmazon Musicは各権利者の商標です。Amazon MusicはAmazonの適用条件に従って別途取得・利用してください。',
          ],
        ],
        [
          '3. サブスクリプションと請求',
          [
            '有料機能はGoogle Playの自動更新サブスクリプションで提供します。日本での価格は月額200円です。実際の価格、税、通貨、更新日、試用の有無等は購入確定前のGoogle Play表示が優先されます。互換性チェックだけでは料金は発生しません。',
          ],
        ],
        [
          '4. 解約と返金',
          [
            'Google Playから管理・解約できます。アプリ削除だけでは解約されません。請求、解約時期、返金はGoogle Playの規則と適用法令に従います。',
          ],
        ],
        [
          '5. ユーザーの責任',
          [
            '操作前に対象プレイリストと画面を確認し、自動監査や対応ジェスチャーの実行中はAmazon Musicを操作せず、意図しない対象が表示された場合は停止してください。プレイリストとアカウント操作の管理責任はユーザーにあります。',
          ],
        ],
        [
          '6. 禁止事項',
          [
            '法令、第三者の権利、Amazonの条件、Google Playポリシー、端末の安全性に反する利用を禁止します。決済回避、Accessibilityの悪用、改変版の配布、不正アクセスの試みは禁止します。',
          ],
        ],
        [
          '7. 互換性と提供',
          [
            'Amazon Musicは予告なく画面項目を変更・削除する場合があります。一時的に非対応となる可能性があり、将来の全画面との継続的な互換性を保証しません。必要な項目を確認できない場合は停止する設計です。',
          ],
        ],
        [
          '8. 免責、変更、連絡先',
          [
            '法令で認められる範囲で、中断のない提供、完全な無誤謬、すべての用途への適合を保証しません。サービス変更に応じて規約を更新する場合があります。質問は下記窓口へ連絡してください。',
          ],
        ],
      ],
    },
  },
};

const translations = {
  de: makeTranslation({
    language: 'Sprache',
    nav: ['Funktionen', 'Ablauf', 'Datenschutz', 'Support', 'Bedingungen'],
    independent:
      'Unabhängiges Drittanbieter-Tool. Keine Verbindung, Förderung oder Unterstützung durch Amazon.',
    footer:
      'Playlist Toolkit arbeitet mit unterstützten Ansichten der separat installierten Amazon Music-App für Android. Amazon und Amazon Music sind Marken ihrer jeweiligen Inhaber.',
    title: 'Jede Playlist. Wieder in deiner Ordnung.',
    lead: 'Merke die Anzeigeordnung, prüfe Duplikat-Kandidaten, bereite Ergänzungen vor und kehre schneller zu häufig genutzten Playlists zurück. Ohne die Amazon Music-App zu verändern.',
    price: 'Japan: ¥200 / Monat',
    localPrice: 'Lokaler Preis wird in Google Play angezeigt',
    status: 'Android-Veröffentlichung in Vorbereitung',
    featureTitle: 'Weniger Tippen. Mehr Musik.',
    featureLead: 'Wiederkehrende Playlist-Arbeit in Amazon Music wird zu einem klaren Ablauf.',
    features: [
      [
        'REIHENFOLGE',
        'Bevorzugte Anzeigeordnung merken',
        'Stelle Künstler, Titel, zuletzt hinzugefügt oder Dauer auf unterstützten Playlist-Ansichten wieder her.',
      ],
      [
        'PRÜFUNG',
        'Lange Playlists vollständig prüfen',
        'Prüfe sichtbare Zeilen auf Duplikat-Kandidaten und verfügbare Statusanzeigen.',
      ],
      [
        'HINZUFÜGEN',
        'Kandidaten vor der Aktion ordnen',
        'Smart Add organisiert Titel und führt nur unterstützte, von dir gestartete Schritte aus.',
      ],
      [
        'ZURÜCK',
        'Schneller zur wichtigen Playlist',
        'Speichere ein bevorzugtes Ziel und reduziere wiederholte Navigation.',
      ],
    ],
    flowTitle: 'Erst prüfen. Dann abonnieren. Du behältst die Kontrolle.',
    flowLead:
      'Der Zweck der Bedienungshilfe wird erklärt, bevor Android-Einstellungen geöffnet werden. Der kostenlose Kompatibilitätstest löst keine Zahlung aus.',
    steps: [
      ['Wert und Preis sehen', 'Preis und Kernfunktionen erscheinen vor der Berechtigungsanfrage.'],
      ['Bedienungshilfe aktivieren', 'Accessibility dient nur dem beschriebenen Playlist-Ablauf.'],
      [
        'Kostenlos prüfen',
        'Kopfzeile, Titelliste, Sortierung und Titel hinzufügen werden geprüft.',
      ],
      ['Abo selbst wählen', 'Nur ein kompatibles Gerät gelangt zum Kauf in Google Play.'],
    ],
    safetyTitle: 'Dynamisch suchen. Bei Unsicherheit stoppen.',
    safetyLead:
      'Bekannte View-IDs und lokalisierte Beschriftungen finden Bedienelemente im aktuellen Bildschirm. Künftige Oberflächen werden nicht ungeprüft erraten.',
    safety: [
      [
        'Dynamische Suche',
        'Bedienelemente werden im aktuellen Accessibility-Node-Baum statt an einer festen Position gesucht.',
      ],
      ['Bekannter UI-Vertrag', 'Erforderliche Playlist-Elemente werden vor dem Start geprüft.'],
      ['Sicherer Stopp', 'Fehlende oder mehrdeutige Elemente beenden die Aktion.'],
      ['Fortlaufende Updates', 'Geprüfte Anpassungen werden über Google Play ausgeliefert.'],
    ],
    faqTitle: 'Vor der Installation',
    faqs: [
      [
        'Ist dies eine Amazon-App?',
        'Nein. NKIS Works entwickelt und veröffentlicht Playlist Toolkit unabhängig.',
      ],
      [
        'Braucht die App mein Amazon-Passwort?',
        'Nein. Das Amazon-Passwort wird weder angefordert noch gespeichert.',
      ],
      [
        'Wofür wird Accessibility verwendet?',
        'Für sichtbare, unterstützte Amazon Music-Bedienelemente und eng begrenzte, von dir gestartete Playlist-Hilfe.',
      ],
      [
        'Was passiert nach einem Amazon Music-Update?',
        'Nicht unterstützte Abläufe können stoppen, bis ein geprüftes Update bereitsteht.',
      ],
      [
        'Werden Playlist-Daten hochgeladen?',
        'Playlist-Namen und sichtbare Titellabels werden lokal verarbeitet und nicht an einen NKIS Works-Server gesendet.',
      ],
    ],
    privacyTitle: 'Datenschutzerklärung',
    privacyIntro:
      'So verarbeitet Playlist Toolkit Informationen bei der Playlist-Unterstützung für Amazon Music auf Android.',
    termsTitle: 'Nutzungsbedingungen',
    termsIntro: 'Bedingungen für Playlist Toolkit, ein unabhängiges Tool von NKIS Works.',
    supportTitle: 'Support',
    supportIntro: 'Hilfe zu Kompatibilität, Abonnement und sicherer Wiederherstellung.',
    updated: 'Gültig und zuletzt aktualisiert: 10. August 2026',
  }),
  es: makeTranslation({
    language: 'Idioma',
    nav: ['Funciones', 'Proceso', 'Privacidad', 'Soporte', 'Términos'],
    independent:
      'Utilidad independiente de terceros. No está afiliada, patrocinada ni respaldada por Amazon.',
    footer:
      'Playlist Toolkit funciona con pantallas compatibles de la aplicación Amazon Music para Android instalada por separado. Amazon y Amazon Music son marcas de sus respectivos propietarios.',
    title: 'Cada playlist, otra vez en tu orden.',
    lead: 'Recuerda el orden de visualización, revisa posibles duplicados, prepara adiciones y vuelve antes a tus playlists habituales, sin modificar la aplicación Amazon Music.',
    price: 'Japón: ¥200 al mes',
    localPrice: 'Google Play muestra el precio local',
    status: 'Lanzamiento para Android en preparación',
    featureTitle: 'Menos toques. Más música.',
    featureLead: 'Convierte el trabajo repetitivo de las playlists en un flujo claro.',
    features: [
      [
        'ORDEN',
        'Recuerda tu orden de visualización',
        'Restaura artista, título, añadidos recientes o duración en pantallas compatibles.',
      ],
      [
        'AUDITORÍA',
        'Revisa playlists largas',
        'Comprueba filas visibles, posibles duplicados e indicadores disponibles.',
      ],
      [
        'AÑADIR',
        'Organiza candidatos antes de actuar',
        'Smart Add ejecuta solo pasos compatibles iniciados por ti.',
      ],
      [
        'VOLVER',
        'Regresa a tu playlist habitual',
        'Guarda un destino favorito y reduce la navegación repetida.',
      ],
    ],
    flowTitle: 'Primero comprueba. Después decide si pagar.',
    flowLead:
      'Se explica el uso de Accessibility antes de abrir los ajustes. La comprobación gratuita no genera cargos.',
    steps: [
      [
        'Consulta valor y precio',
        'El precio y las funciones aparecen antes de solicitar permisos.',
      ],
      ['Activa la asistencia', 'Accessibility se limita al flujo explicado.'],
      ['Comprueba gratis', 'Se verifican cabecera, lista, orden y Añadir canciones.'],
      ['Decide suscribirte', 'Solo un dispositivo compatible pasa a Google Play.'],
    ],
    safetyTitle: 'Busca de forma dinámica. Se detiene si hay dudas.',
    safetyLead:
      'Identificadores conocidos y etiquetas localizadas encuentran controles actuales. No se adivinan interfaces futuras.',
    safety: [
      ['Detección dinámica', 'Busca controles en el árbol actual de nodos.'],
      ['Contrato conocido', 'Verifica controles necesarios antes de actuar.'],
      ['Parada segura', 'Detiene controles ausentes o ambiguos.'],
      ['Actualizaciones continuas', 'Las mejoras revisadas llegan mediante Google Play.'],
    ],
    faqTitle: 'Antes de instalar',
    faqs: [
      [
        '¿Es una aplicación de Amazon?',
        'No. NKIS Works la desarrolla y publica de forma independiente.',
      ],
      ['¿Necesita mi contraseña de Amazon?', 'No se solicita ni almacena la contraseña.'],
      [
        '¿Para qué usa Accessibility?',
        'Para controles visibles compatibles y asistencia limitada iniciada por el usuario.',
      ],
      [
        '¿Qué ocurre tras una actualización?',
        'Una operación no compatible puede detenerse hasta recibir una actualización revisada.',
      ],
      [
        '¿Se suben datos de playlists?',
        'Los nombres y etiquetas visibles se procesan en el dispositivo y no se envían a un servidor de NKIS Works.',
      ],
    ],
    privacyTitle: 'Política de privacidad',
    privacyIntro:
      'Cómo trata Playlist Toolkit la información al ayudar con playlists de Amazon Music en Android.',
    termsTitle: 'Términos de uso',
    termsIntro: 'Condiciones de Playlist Toolkit, una utilidad independiente de NKIS Works.',
    supportTitle: 'Soporte',
    supportIntro: 'Ayuda de compatibilidad, suscripción y recuperación segura.',
    updated: 'Vigente y actualizado por última vez: 10 de agosto de 2026',
  }),
  fr: makeTranslation({
    language: 'Langue',
    nav: ['Fonctions', 'Parcours', 'Confidentialité', 'Assistance', 'Conditions'],
    independent:
      'Utilitaire tiers indépendant. Sans affiliation, parrainage ni approbation d’Amazon.',
    footer:
      'Playlist Toolkit fonctionne avec les écrans compatibles de l’application Amazon Music Android installée séparément. Amazon et Amazon Music sont des marques de leurs propriétaires respectifs.',
    title: 'Chaque playlist, de nouveau dans votre ordre.',
    lead: 'Mémorisez l’ordre d’affichage, examinez les doublons possibles, préparez les ajouts et retrouvez rapidement vos playlists, sans modifier l’application Amazon Music.',
    price: 'Japon : 200 ¥ / mois',
    localPrice: 'Le prix local est affiché dans Google Play',
    status: 'Sortie Android en préparation',
    featureTitle: 'Moins de gestes. Plus de musique.',
    featureLead: 'Transformez les tâches répétitives en un parcours clair.',
    features: [
      [
        'ORDRE',
        'Mémoriser l’ordre d’affichage',
        'Restaurez artiste, titre, ajout récent ou durée sur les écrans compatibles.',
      ],
      [
        'AUDIT',
        'Examiner une longue playlist',
        'Vérifiez les lignes visibles, les doublons possibles et les indicateurs disponibles.',
      ],
      [
        'AJOUT',
        'Organiser avant d’agir',
        'Smart Add exécute uniquement les étapes compatibles que vous lancez.',
      ],
      [
        'RETOUR',
        'Revenir à votre playlist',
        'Enregistrez une destination favorite et réduisez la navigation répétée.',
      ],
    ],
    flowTitle: 'Vérifiez d’abord. Abonnez-vous ensuite.',
    flowLead:
      'L’usage d’Accessibility est expliqué avant l’ouverture des réglages. Le contrôle gratuit n’entraîne aucun débit.',
    steps: [
      [
        'Voir la valeur et le prix',
        'Prix et fonctions sont affichés avant la demande d’autorisation.',
      ],
      ['Activer l’assistance', 'Accessibility reste limité au parcours expliqué.'],
      ['Vérifier gratuitement', 'En-tête, liste, tri et ajout de titres sont contrôlés.'],
      ['Choisir l’abonnement', 'Seul un appareil compatible accède à Google Play.'],
    ],
    safetyTitle: 'Recherche dynamique. Arrêt en cas de doute.',
    safetyLead:
      'Des identifiants connus et des libellés localisés trouvent les commandes présentes. L’app ne devine pas les futures interfaces.',
    safety: [
      ['Détection dynamique', 'Recherche dans l’arbre de nœuds actuel.'],
      ['Interface connue', 'Vérifie les commandes avant d’agir.'],
      ['Arrêt sûr', 'Interrompt les commandes absentes ou ambiguës.'],
      ['Mises à jour continues', 'Les adaptations vérifiées arrivent via Google Play.'],
    ],
    faqTitle: 'Avant l’installation',
    faqs: [
      ['Est-ce une app Amazon ?', 'Non. NKIS Works la développe et la publie indépendamment.'],
      ['Mon mot de passe Amazon est-il requis ?', 'Non. Il n’est ni demandé ni conservé.'],
      [
        'Pourquoi Accessibility ?',
        'Pour les commandes visibles compatibles et une aide limitée lancée par l’utilisateur.',
      ],
      [
        'Après une mise à jour d’Amazon Music ?',
        'Une opération peut s’arrêter jusqu’à une mise à jour de compatibilité vérifiée.',
      ],
      [
        'Les playlists sont-elles envoyées ?',
        'Les noms et libellés visibles sont traités localement, sans envoi vers un serveur NKIS Works.',
      ],
    ],
    privacyTitle: 'Politique de confidentialité',
    privacyIntro:
      'Traitement des informations lors de l’assistance aux playlists Amazon Music sur Android.',
    termsTitle: 'Conditions d’utilisation',
    termsIntro: 'Conditions de Playlist Toolkit, utilitaire indépendant de NKIS Works.',
    supportTitle: 'Assistance',
    supportIntro: 'Aide pour la compatibilité, l’abonnement et la récupération sûre.',
    updated: 'En vigueur et dernière mise à jour : 10 août 2026',
  }),
  it: makeTranslation({
    language: 'Lingua',
    nav: ['Funzioni', 'Procedura', 'Privacy', 'Assistenza', 'Termini'],
    independent:
      'Utility indipendente di terze parti. Non affiliata, sponsorizzata o approvata da Amazon.',
    footer:
      'Playlist Toolkit funziona con schermate supportate dell’app Amazon Music per Android installata separatamente. Amazon e Amazon Music sono marchi dei rispettivi proprietari.',
    title: 'Ogni playlist, di nuovo nel tuo ordine.',
    lead: 'Ricorda l’ordine di visualizzazione, controlla possibili duplicati, prepara le aggiunte e torna rapidamente alle playlist preferite, senza modificare l’app Amazon Music.',
    price: 'Giappone: ¥200 al mese',
    localPrice: 'Google Play mostra il prezzo locale',
    status: 'Uscita Android in preparazione',
    featureTitle: 'Meno tocchi. Più musica.',
    featureLead: 'Rendi chiaro il lavoro ripetitivo sulle playlist.',
    features: [
      [
        'ORDINE',
        'Ricorda l’ordine preferito',
        'Ripristina artista, titolo, aggiunte recenti o durata nelle schermate supportate.',
      ],
      [
        'CONTROLLO',
        'Esamina playlist lunghe',
        'Controlla righe visibili, possibili duplicati e indicatori disponibili.',
      ],
      [
        'AGGIUNGI',
        'Organizza prima di agire',
        'Smart Add esegue solo passaggi supportati avviati da te.',
      ],
      [
        'RITORNO',
        'Torna alla playlist preferita',
        'Salva una destinazione e riduci la navigazione ripetuta.',
      ],
    ],
    flowTitle: 'Prima controlla. Poi scegli se abbonarti.',
    flowLead:
      'L’uso di Accessibility viene spiegato prima delle impostazioni. Il controllo gratuito non genera addebiti.',
    steps: [
      ['Vedi valore e prezzo', 'Prezzo e funzioni appaiono prima del permesso.'],
      ['Attiva l’assistenza', 'Accessibility è limitata al flusso spiegato.'],
      ['Controlla gratis', 'Verifica intestazione, elenco, ordinamento e aggiunta.'],
      ['Scegli l’abbonamento', 'Solo un dispositivo compatibile passa a Google Play.'],
    ],
    safetyTitle: 'Ricerca dinamica. Arresto in caso di dubbi.',
    safetyLead:
      'ID noti ed etichette localizzate trovano i controlli attuali. Le interfacce future non vengono indovinate.',
    safety: [
      ['Ricerca dinamica', 'Trova i controlli nell’albero di nodi attuale.'],
      ['Interfaccia nota', 'Verifica i controlli prima dell’azione.'],
      ['Arresto sicuro', 'Interrompe controlli mancanti o ambigui.'],
      ['Aggiornamenti continui', 'Gli adattamenti verificati arrivano tramite Google Play.'],
    ],
    faqTitle: 'Prima dell’installazione',
    faqs: [
      ['È un’app Amazon?', 'No. È sviluppata e pubblicata indipendentemente da NKIS Works.'],
      ['Serve la password Amazon?', 'No. Non viene richiesta né salvata.'],
      [
        'Perché Accessibility?',
        'Per controlli visibili supportati e assistenza limitata avviata dall’utente.',
      ],
      [
        'Dopo un aggiornamento Amazon Music?',
        'Un’operazione può fermarsi fino a un aggiornamento verificato.',
      ],
      [
        'I dati vengono caricati?',
        'Nomi ed etichette visibili sono elaborati sul dispositivo e non inviati a un server NKIS Works.',
      ],
    ],
    privacyTitle: 'Informativa sulla privacy',
    privacyIntro:
      'Trattamento delle informazioni durante l’assistenza alle playlist Amazon Music su Android.',
    termsTitle: 'Termini di utilizzo',
    termsIntro: 'Termini di Playlist Toolkit, utility indipendente di NKIS Works.',
    supportTitle: 'Assistenza',
    supportIntro: 'Aiuto per compatibilità, abbonamento e ripristino sicuro.',
    updated: 'In vigore e ultimo aggiornamento: 10 agosto 2026',
  }),
  'pt-BR': makeTranslation({
    language: 'Idioma',
    nav: ['Recursos', 'Fluxo', 'Privacidade', 'Suporte', 'Termos'],
    independent:
      'Utilitário independente de terceiros. Não afiliado, patrocinado nem endossado pela Amazon.',
    footer:
      'O Playlist Toolkit funciona com telas compatíveis do app Amazon Music para Android instalado separadamente. Amazon e Amazon Music são marcas de seus respectivos proprietários.',
    title: 'Cada playlist, de volta à sua ordem.',
    lead: 'Lembre a ordem de exibição, revise possíveis duplicatas, prepare adições e volte rapidamente às playlists favoritas, sem modificar o app Amazon Music.',
    price: 'Japão: ¥200 por mês',
    localPrice: 'O Google Play mostra o preço local',
    status: 'Lançamento Android em preparação',
    featureTitle: 'Menos toques. Mais música.',
    featureLead: 'Transforme tarefas repetitivas em um fluxo claro.',
    features: [
      [
        'ORDEM',
        'Lembre sua ordem de exibição',
        'Restaure artista, título, adições recentes ou duração nas telas compatíveis.',
      ],
      [
        'AUDITORIA',
        'Revise playlists longas',
        'Verifique linhas visíveis, possíveis duplicatas e indicadores disponíveis.',
      ],
      [
        'ADICIONAR',
        'Organize antes de agir',
        'O Smart Add executa apenas etapas compatíveis iniciadas por você.',
      ],
      [
        'VOLTAR',
        'Retorne à playlist favorita',
        'Salve um destino favorito e reduza a navegação repetida.',
      ],
    ],
    flowTitle: 'Primeiro verifique. Depois decida assinar.',
    flowLead:
      'O uso da Acessibilidade é explicado antes das configurações. A verificação gratuita não gera cobrança.',
    steps: [
      ['Veja valor e preço', 'Preço e recursos aparecem antes da permissão.'],
      ['Ative a assistência', 'A Acessibilidade é limitada ao fluxo explicado.'],
      ['Verifique grátis', 'Confirma cabeçalho, lista, ordenação e adição.'],
      ['Escolha assinar', 'Somente um dispositivo compatível segue ao Google Play.'],
    ],
    safetyTitle: 'Busca dinâmica. Parada em caso de dúvida.',
    safetyLead:
      'IDs conhecidos e rótulos localizados encontram controles atuais. Interfaces futuras não são adivinhadas.',
    safety: [
      ['Busca dinâmica', 'Encontra controles na árvore atual de nós.'],
      ['Interface conhecida', 'Verifica controles antes de agir.'],
      ['Parada segura', 'Interrompe controles ausentes ou ambíguos.'],
      ['Atualizações contínuas', 'Ajustes verificados chegam pelo Google Play.'],
    ],
    faqTitle: 'Antes de instalar',
    faqs: [
      [
        'É um app da Amazon?',
        'Não. É desenvolvido e publicado de forma independente pela NKIS Works.',
      ],
      ['Precisa da senha da Amazon?', 'Não. A senha não é solicitada nem armazenada.'],
      [
        'Por que Acessibilidade?',
        'Para controles visíveis compatíveis e assistência limitada iniciada pelo usuário.',
      ],
      [
        'Após atualização do Amazon Music?',
        'Uma operação pode parar até uma atualização de compatibilidade verificada.',
      ],
      [
        'Os dados são enviados?',
        'Nomes e rótulos visíveis são processados no dispositivo e não enviados a um servidor da NKIS Works.',
      ],
    ],
    privacyTitle: 'Política de Privacidade',
    privacyIntro:
      'Como o Playlist Toolkit trata informações ao auxiliar playlists do Amazon Music no Android.',
    termsTitle: 'Termos de Uso',
    termsIntro: 'Termos do Playlist Toolkit, utilitário independente da NKIS Works.',
    supportTitle: 'Suporte',
    supportIntro: 'Ajuda com compatibilidade, assinatura e recuperação segura.',
    updated: 'Vigente e atualizado em: 10 de agosto de 2026',
  }),
};

Object.assign(copy, translations);

export function playlistToolkitRoutes() {
  return locales.flatMap((locale) =>
    ['home', 'privacy', 'support', 'terms'].map((page) => routeFor(locale, page)),
  );
}

export async function buildPlaylistToolkit(dist) {
  for (const locale of locales) {
    const text = copy[locale.code];
    for (const page of ['home', 'privacy', 'support', 'terms']) {
      const route = routeFor(locale, page);
      const directory = resolve(dist, route.slice(1));
      await mkdir(directory, { recursive: true });
      await writeFile(resolve(directory, 'index.html'), renderPage(locale, text, page));
    }
  }
}

function getLocalizedRelease(status) {
  return {
    'Android-Veröffentlichung in Vorbereitung': {
      store: 'Bei Google Play herunterladen',
      status: 'Für Android verfügbar',
      updated: 'Gültig und zuletzt aktualisiert: 2. September 2026',
    },
    'Lanzamiento para Android en preparación': {
      store: 'Descargar en Google Play',
      status: 'Disponible para Android',
      updated: 'Vigente y actualizado por última vez: 2 de septiembre de 2026',
    },
    'Sortie Android en préparation': {
      store: 'Télécharger sur Google Play',
      status: 'Disponible sur Android',
      updated: 'En vigueur et dernière mise à jour : 2 septembre 2026',
    },
    'Uscita Android in preparazione': {
      store: 'Scarica da Google Play',
      status: 'Disponibile per Android',
      updated: 'In vigore e ultimo aggiornamento: 2 settembre 2026',
    },
    'Lançamento Android em preparação': {
      store: 'Baixar no Google Play',
      status: 'Disponível para Android',
      updated: 'Vigente e atualizado em: 2 de setembro de 2026',
    },
  }[status];
}

function makeTranslation(config) {
  const release = getLocalizedRelease(config.status);
  const en = copy.en;
  const [features, flow, privacy, support, terms] = config.nav;
  const common = {
    product: 'Playlist Toolkit',
    maker: 'NKIS WORKS PRODUCT',
    independent: config.independent,
    footer: config.footer,
    back: features,
    contents: config.language,
    email: support,
  };
  const home = {
    metaTitle: `Playlist Toolkit | ${config.title}`,
    metaDescription: config.lead,
    eyebrow: 'PLAYLIST TOOLKIT',
    title: config.title,
    lead: config.lead,
    primary: features,
    secondary: support,
    store: release.store,
    price: config.price,
    localPrice: config.localPrice,
    status: release.status,
    consoleLabel: 'COMPATIBILITY CONSOLE',
    consoleStatus: 'SUPPORTED UI',
    rows: en.home.rows,
    cardLabel: 'SAFETY CHECK',
    cardTitle: 'Ready',
    cardBody: config.safety[2][1],
    trust: [
      [config.safety[0][0], config.safety[0][1]],
      [config.steps[2][0], config.steps[2][1]],
      [config.safety[2][0], config.safety[2][1]],
    ],
    featuresEyebrow: 'ONE WORKFLOW',
    featuresTitle: config.featureTitle,
    featuresLead: config.featureLead,
    features: config.features,
    flowEyebrow: 'CLEAR BY DESIGN',
    flowTitle: config.flowTitle,
    flowLead: config.flowLead,
    steps: config.steps,
    safetyEyebrow: 'COMPATIBILITY',
    safetyTitle: config.safetyTitle,
    safetyLead: config.safetyLead,
    safety: config.safety,
    faqTitle: config.faqTitle,
    faqs: config.faqs,
    ctaTitle: config.flowTitle,
    ctaBody: config.steps[2][1],
    ctaButton: support,
  };
  const localSections = makeLocalizedLegalSections(config);
  return {
    language: config.language,
    nav: { features, flow, privacy, support, terms },
    common,
    home,
    privacy: {
      title: config.privacyTitle,
      intro: config.privacyIntro,
      updated: release.updated,
      sections: localSections.privacy,
    },
    support: {
      title: config.supportTitle,
      intro: config.supportIntro,
      updated: `${support}: ${SUPPORT_EMAIL}`,
      sections: localSections.support,
    },
    terms: {
      title: config.termsTitle,
      intro: config.termsIntro,
      updated: release.updated,
      sections: localSections.terms,
    },
  };
}

function makeLocalizedLegalSections(config) {
  const en = copy.en;
  const localNotice = config.independent;
  const privacy = en.privacy.sections.map(([title, paragraphs], index) => [
    `${index + 1}. ${localizedSectionTitle(config.language, 'privacy', index, title.replace(/^\d+\.\s*/, ''))}`,
    index === 0 ? [localNotice] : paragraphs,
  ]);
  const support = en.support.sections.map(([title, paragraphs], index) => [
    localizedSectionTitle(config.language, 'support', index, title),
    index === en.support.sections.length - 1 ? [`${SUPPORT_EMAIL}. ${paragraphs[0]}`] : paragraphs,
  ]);
  const terms = en.terms.sections.map(([title, paragraphs], index) => [
    `${index + 1}. ${localizedSectionTitle(config.language, 'terms', index, title.replace(/^\d+\.\s*/, ''))}`,
    index === 1 ? [localNotice] : paragraphs,
  ]);
  return { privacy, support, terms };
}

function localizedSectionTitle(language, type, index, fallback) {
  const titles = {
    de: {
      privacy: [
        'Geltungsbereich',
        'Bedienungshilfe',
        'Lokale Playlist-Daten',
        'Diagnose',
        'Google Play-Käufe',
        'Support-Kommunikation',
        'Löschung und Kontrolle',
        'Änderungen und Kontakt',
      ],
      support: [
        'Vor der Kontaktaufnahme',
        'Kompatibilitätsprüfung',
        'Sicherer Stopp',
        'Bedienungshilfe deaktivieren',
        'Abonnement verwalten',
        'Kontakt',
      ],
      terms: [
        'Dienst',
        'Unabhängiges Produkt',
        'Abonnement',
        'Kündigung',
        'Verantwortung',
        'Zulässige Nutzung',
        'Kompatibilität',
        'Änderungen und Kontakt',
      ],
    },
    es: {
      privacy: [
        'Alcance',
        'Asistencia de pantalla',
        'Datos locales',
        'Diagnóstico',
        'Compras en Google Play',
        'Comunicaciones',
        'Eliminación y control',
        'Cambios y contacto',
      ],
      support: [
        'Antes de contactar',
        'Comprobación de compatibilidad',
        'Parada segura',
        'Desactivar asistencia',
        'Gestionar suscripción',
        'Contacto',
      ],
      terms: [
        'Servicio',
        'Producto independiente',
        'Suscripción',
        'Cancelación',
        'Responsabilidad',
        'Uso permitido',
        'Compatibilidad',
        'Cambios y contacto',
      ],
    },
    fr: {
      privacy: [
        'Champ d’application',
        'Assistance d’écran',
        'Données locales',
        'Diagnostic',
        'Achats Google Play',
        'Communications',
        'Suppression et contrôle',
        'Modifications et contact',
      ],
      support: [
        'Avant de nous contacter',
        'Contrôle de compatibilité',
        'Arrêt sûr',
        'Désactiver l’assistance',
        'Gérer l’abonnement',
        'Contact',
      ],
      terms: [
        'Service',
        'Produit indépendant',
        'Abonnement',
        'Résiliation',
        'Responsabilité',
        'Utilisation autorisée',
        'Compatibilité',
        'Modifications et contact',
      ],
    },
    it: {
      privacy: [
        'Ambito',
        'Assistenza schermo',
        'Dati locali',
        'Diagnostica',
        'Acquisti Google Play',
        'Comunicazioni',
        'Eliminazione e controllo',
        'Modifiche e contatti',
      ],
      support: [
        'Prima di contattarci',
        'Controllo compatibilità',
        'Arresto sicuro',
        'Disattivare assistenza',
        'Gestire abbonamento',
        'Contatti',
      ],
      terms: [
        'Servizio',
        'Prodotto indipendente',
        'Abbonamento',
        'Annullamento',
        'Responsabilità',
        'Uso consentito',
        'Compatibilità',
        'Modifiche e contatti',
      ],
    },
    'pt-BR': {
      privacy: [
        'Escopo',
        'Assistência de tela',
        'Dados locais',
        'Diagnóstico',
        'Compras no Google Play',
        'Comunicações',
        'Exclusão e controle',
        'Alterações e contato',
      ],
      support: [
        'Antes de contatar',
        'Verificação de compatibilidade',
        'Parada segura',
        'Desativar assistência',
        'Gerenciar assinatura',
        'Contato',
      ],
      terms: [
        'Serviço',
        'Produto independente',
        'Assinatura',
        'Cancelamento',
        'Responsabilidade',
        'Uso permitido',
        'Compatibilidade',
        'Alterações e contato',
      ],
    },
  };
  return titles[language]?.[type]?.[index] ?? fallback;
}

function routeFor(locale, page) {
  const languagePath = locale.segment ? `/${locale.segment}` : '';
  const pagePath = page === 'home' ? '' : `/${page}`;
  return `${BASE}${languagePath}${pagePath}/`;
}

function renderPage(locale, text, page) {
  const data = page === 'home' ? text.home : text[page];
  const title = page === 'home' ? data.metaTitle : `${data.title} | Playlist Toolkit`;
  const description = page === 'home' ? data.metaDescription : data.intro;
  const route = routeFor(locale, page);
  return `<!doctype html>
<html lang="${locale.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'self'">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#174e40">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${ORIGIN}${route}">
  <meta property="og:locale" content="${locale.og}">
  <link rel="canonical" href="${ORIGIN}${route}">
${alternateLinks(page)}
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/playlist-toolkit.css">
</head>
<body>
  ${renderHeader(locale, text, page)}
  ${page === 'home' ? renderHome(text) : renderDocument(text, page)}
  ${renderFooter(text, locale, page)}
</body>
</html>
`;
}

function renderHeader(locale, text, page) {
  return `<header class="pt-header">
  <nav class="pt-nav" aria-label="${escapeHtml(text.common.product)}">
    <a class="pt-brand" href="${routeFor(locale, 'home')}"><span class="pt-mark" aria-hidden="true"><span></span></span><span class="pt-brand-copy">${escapeHtml(text.common.product)}<small>NKIS WORKS</small></span></a>
    <div class="pt-nav-links">
      <a href="${routeFor(locale, 'home')}#features">${escapeHtml(text.nav.features)}</a>
      <a href="${routeFor(locale, 'home')}#flow">${escapeHtml(text.nav.flow)}</a>
      <a href="${routeFor(locale, 'privacy')}">${escapeHtml(text.nav.privacy)}</a>
      <a href="${routeFor(locale, 'support')}">${escapeHtml(text.nav.support)}</a>
      ${renderLanguage(locale, text, page)}
    </div>
  </nav>
</header>`;
}

function renderLanguage(current, text, page) {
  return `<details class="pt-language"><summary>${escapeHtml(text.language)}</summary><div class="pt-language-list">${locales.map((locale) => `<a href="${routeFor(locale, page)}" hreflang="${locale.code}"${locale.code === current.code ? ' aria-current="page"' : ''}>${escapeHtml(locale.label)}</a>`).join('')}</div></details>`;
}

function renderHome(text) {
  const home = text.home;
  return `<main class="pt-main">
  <section class="pt-shell pt-hero">
    <div>
      <p class="pt-eyebrow">${escapeHtml(home.eyebrow)}</p>
      <h1>${escapeHtml(home.title)}</h1>
      <p class="pt-hero-lead">${escapeHtml(home.lead)}</p>
      <div class="pt-actions"><a class="pt-button pt-button-primary" href="${GOOGLE_PLAY_URL}" rel="external">${escapeHtml(home.store)}</a><a class="pt-button pt-button-secondary" href="#features">${escapeHtml(home.primary)}</a></div>
      <div class="pt-price"><span>${escapeHtml(home.price)}</span><span>${escapeHtml(home.localPrice)}</span><span>${escapeHtml(home.status)}</span></div>
      <p class="pt-independent">${escapeHtml(text.common.independent)}</p>
    </div>
    <div class="pt-console" aria-label="${escapeHtml(home.consoleLabel)}">
      <div class="pt-console-inner">
        <div class="pt-console-top"><span>${escapeHtml(home.consoleLabel)}</span><span class="pt-console-status">${escapeHtml(home.consoleStatus)}</span></div>
        <div class="pt-sort-stack">${home.rows.map(([number, title, state]) => `<div class="pt-sort-row"><span class="pt-sort-number">${escapeHtml(number)}</span><b>${escapeHtml(title)}</b><small>${escapeHtml(state)}</small></div>`).join('')}</div>
        <div class="pt-console-card"><small>${escapeHtml(home.cardLabel)}</small><b>${escapeHtml(home.cardTitle)}</b><p>${escapeHtml(home.cardBody)}</p></div>
      </div>
    </div>
  </section>
  <section class="pt-trust-strip"><div class="pt-shell pt-trust-grid">${home.trust.map(([title, body]) => `<div class="pt-trust-item"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(body)}</span></div>`).join('')}</div></section>
  <section class="pt-shell pt-section" id="features"><div class="pt-section-heading"><p class="pt-eyebrow">${escapeHtml(home.featuresEyebrow)}</p><h2>${escapeHtml(home.featuresTitle)}</h2><p>${escapeHtml(home.featuresLead)}</p></div><div class="pt-feature-grid">${home.features.map(([label, title, body], index) => `<article class="pt-feature-card" data-index="0${index + 1}"><small>${escapeHtml(label)}</small><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></article>`).join('')}</div></section>
  <section class="pt-dark-band" id="flow"><div class="pt-shell pt-section"><div class="pt-section-heading"><p class="pt-eyebrow">${escapeHtml(home.flowEyebrow)}</p><h2>${escapeHtml(home.flowTitle)}</h2><p>${escapeHtml(home.flowLead)}</p></div><div class="pt-flow">${home.steps.map(([title, body]) => `<article class="pt-step"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></article>`).join('')}</div></div></section>
  <section class="pt-shell pt-section pt-safety"><div class="pt-section-heading"><p class="pt-eyebrow">${escapeHtml(home.safetyEyebrow)}</p><h2>${escapeHtml(home.safetyTitle)}</h2><p>${escapeHtml(home.safetyLead)}</p></div><div class="pt-safety-panel">${home.safety.map(([title, body]) => `<div class="pt-safety-line"><span>✓</span><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></div></div>`).join('')}</div></section>
  <section class="pt-shell pt-section"><div class="pt-section-heading"><p class="pt-eyebrow">FAQ</p><h2>${escapeHtml(home.faqTitle)}</h2></div><div class="pt-faq">${home.faqs.map(([question, answer]) => `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join('')}</div></section>
  <section class="pt-shell pt-cta"><div class="pt-cta-card"><h2>${escapeHtml(home.ctaTitle)}</h2><p>${escapeHtml(home.ctaBody)}</p><div class="pt-actions"><a class="pt-button pt-button-primary" href="${GOOGLE_PLAY_URL}" rel="external">${escapeHtml(home.store)}</a></div></div></section>
</main>`;
}

function renderDocument(text, page) {
  const doc = text[page];
  return `<main class="pt-doc-main"><div class="pt-shell"><header class="pt-doc-hero"><p class="pt-eyebrow">${escapeHtml(text.common.maker)}</p><h1>${escapeHtml(doc.title)}</h1><p>${escapeHtml(doc.intro)}</p><p class="pt-updated">${escapeHtml(doc.updated)}</p><p class="pt-independent">${escapeHtml(text.common.independent)}</p></header><div class="pt-doc-layout"><aside class="pt-doc-aside"><strong>${escapeHtml(text.common.contents)}</strong>${doc.sections.map(([title], index) => `<a href="#section-${index + 1}">${escapeHtml(title)}</a>`).join('')}</aside><article class="pt-doc-card">${doc.sections.map(([title, paragraphs], index) => `<section class="pt-doc-section" id="section-${index + 1}"><h2>${escapeHtml(title)}</h2>${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${index === doc.sections.length - 1 ? `<a class="pt-support-email" href="mailto:${SUPPORT_EMAIL}?subject=Playlist%20Toolkit%20Support">${escapeHtml(text.common.email)} · ${SUPPORT_EMAIL}</a>` : ''}</section>`).join('')}</article></div></div></main>`;
}

function renderFooter(text, locale) {
  return `<footer class="pt-footer"><div class="pt-footer-inner"><div class="pt-footer-copy"><strong>© 2026 NKIS Works</strong><p>${escapeHtml(text.common.footer)}</p></div><nav class="pt-footer-links" aria-label="Footer"><a href="${routeFor(locale, 'home')}">${escapeHtml(text.common.back)}</a><a href="${routeFor(locale, 'privacy')}">${escapeHtml(text.nav.privacy)}</a><a href="${routeFor(locale, 'support')}">${escapeHtml(text.nav.support)}</a><a href="${routeFor(locale, 'terms')}">${escapeHtml(text.nav.terms)}</a></nav></div></footer>`;
}

function alternateLinks(page) {
  return [
    ...locales.map(
      (locale) =>
        `  <link rel="alternate" hreflang="${locale.code}" href="${ORIGIN}${routeFor(locale, page)}">`,
    ),
    `  <link rel="alternate" hreflang="x-default" href="${ORIGIN}${routeFor(locales[0], page)}">`,
  ].join('\n');
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );
}
