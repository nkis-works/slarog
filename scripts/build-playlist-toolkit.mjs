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
      menu: 'Menu',
      studio: 'NKIS Works home',
      slarog: 'Slarog (Japan)',
    },
    home: {
      metaTitle: 'Amazon Music Playlist Organizer & Sort Tool | Playlist Toolkit',
      metaDescription:
        'Sort and organize Amazon Music playlists on Android. Review duplicate songs, restore display order, audit long playlists and check compatibility before subscribing.',
      eyebrow: 'PLAYLIST CONTROL, WITHOUT THE CLUTTER',
      title: 'Your playlists. Your order.',
      lead: 'Remember display order, review duplicates and playlist health, prepare additions, and return to the playlists you use most. Playlist Toolkit guides supported actions in Amazon Music without modifying the Amazon Music app.',
      primary: 'Explore features',
      secondary: 'Check support',
      store: 'Get it on Google Play',
      price: 'Japan: ¥200 / month · Auto-renewing',
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
      searchEyebrow: 'AMAZON MUSIC PLAYLIST ORGANIZER',
      searchTitle: 'A clearer way to sort and organize Amazon Music playlists.',
      searchLead:
        'Playlist Toolkit supports the repetitive playlist work that is difficult to manage one song at a time, while keeping Amazon Music as a separate, unmodified app.',
      searchItems: [
        [
          'Sort Amazon Music playlists',
          'Restore artist, title, recently added, or duration display order on supported playlist screens.',
        ],
        [
          'Find duplicate songs',
          'Review duplicate candidates across a long playlist without uploading visible track labels to an NKIS Works server.',
        ],
        [
          'Reorder and audit playlists',
          'Prepare supported organization steps, review playlist condition, and safely stop when the expected interface cannot be verified.',
        ],
        [
          'Return to favorite playlists',
          'Reduce repeated navigation by saving the playlist destination you use most.',
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
      menu: 'メニュー',
      studio: 'NKIS Worksホーム',
      slarog: 'スラログ',
    },
    home: {
      metaTitle: 'Amazon Musicプレイリスト並び替え・整理ツール｜Playlist Toolkit',
      metaDescription:
        'Amazon MusicのプレイリストをAndroidで並び替え・整理。表示順の復元、重複曲候補の確認、長いプレイリストの監査、購入前の互換性確認を支援します。',
      eyebrow: 'Amazon Musicのプレイリスト整理を、もっと手軽に',
      title: '並び替えも、確認も、もっと手軽に。',
      lead: '表示順の復元、重複候補の確認、追加前の整理、よく使うプレイリストへの移動までをひとつに。Amazon Musicアプリを改変せず、対応する画面で必要な操作を支援します。',
      primary: '機能を見る',
      secondary: 'サポートを確認',
      store: 'Google Playで入手',
      price: '月額200円・自動更新',
      localPrice: '日本以外の価格はGoogle Playに表示',
      status: 'Androidで利用できます',
      consoleLabel: 'PLAYLIST TOOLKIT',
      consoleStatus: '端末内で確認',
      rows: [
        ['01', '表示順を復元', '設定済み'],
        ['02', '重複候補を確認', '端末内'],
        ['03', '追加前に整理', 'ユーザー操作'],
      ],
      cardLabel: '無料の互換性チェック',
      cardTitle: '使えることを確かめてから',
      cardBody: '対応画面を確認できた場合だけ、月額プランをご案内します。',
      trust: [
        ['プレイリスト情報は端末内処理', '表示された曲名等をNKIS Worksのサーバーへ送信しません。'],
        ['購入前に互換性を確認', 'サブスクリプション開始前に対応画面を無料で確認できます。'],
        ['推測せず安全停止', '必要な操作項目を確認できない場合は操作を続行しません。'],
      ],
      featuresEyebrow: 'ひとつの整理フロー',
      featuresTitle: '繰り返していた操作を、ひとつの流れに。',
      featuresLead:
        '並び替え、確認、追加前の整理、いつものプレイリストへの移動を、迷いにくい手順にまとめます。',
      features: [
        [
          'ORDER',
          '表示順を、いつでもすぐに復元',
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
      flowEyebrow: 'ご利用開始までの流れ',
      flowTitle: '使えることを確かめてから、申し込む。',
      flowLead:
        'Android設定を開く前に画面操作支援の目的を説明し、無料互換性チェックだけでは料金が発生しません。',
      steps: [
        ['価値と価格を確認', '強い権限を求める前に、月額料金と主要機能を表示します。'],
        ['画面操作支援を許可', 'Accessibilityは説明したプレイリスト支援のためだけに使用します。'],
        ['無料互換性チェック', '見出し、曲一覧、並び替え、曲追加の操作項目を確認します。'],
        ['利用開始を選択', '対応端末と確認できた場合だけGoogle Playの購入画面へ進めます。'],
      ],
      safetyEyebrow: '継続的な互換性対応',
      safetyTitle: '確認できる画面だけを、安全に操作。',
      safetyLead:
        'Amazon Music画面のラベルや操作項目をその場で確認して動作します。少しの配置変更には対応し、必要な項目が見つからないときは、誤操作を避けるため安全に停止します。',
      safety: [
        [
          '画面上の操作項目を確認',
          'ひとつの固定位置ではなく、そのとき表示されているラベルやボタンから対象を探します。',
        ],
        [
          '開始前に必要項目を確認',
          '対応操作を始める前に、必要なプレイリスト項目がそろっているか確認します。',
        ],
        ['未知UIでは安全停止', '操作項目が不足または曖昧な場合、未確認の操作をせず停止します。'],
        [
          'Google Play更新で継続対応',
          'Amazon Musicの変更を確認後、Playlist Toolkitの更新を通じて互換性を改善します。',
        ],
      ],
      searchEyebrow: 'AMAZON MUSIC プレイリスト整理',
      searchTitle: '面倒だったプレイリスト整理を、ひとつずつ軽くする。',
      searchLead:
        '一曲ずつ確認していた作業や、毎回たどっていた画面を減らします。表示順の復元は、保存済みの曲順そのものを変更しません。',
      searchItems: [
        [
          '表示順をすぐに戻す',
          'アーティスト、タイトル、最近追加、再生時間の表示順を対応画面で記憶・復元します。',
        ],
        [
          '重複候補をまとめて確認',
          '長いプレイリストを監査し、表示された曲名をNKIS Worksのサーバーへ送らずに重複候補を確認します。',
        ],
        [
          'プレイリスト全体を監査',
          '追加候補や状態をまとめて確認し、必要な画面を確認できない場合は推測せず安全に停止します。',
        ],
        [
          'いつものプレイリストへ移動',
          'お気に入りの移動先を記憶し、Amazon Music内で繰り返していた移動を減らします。',
        ],
      ],
      faqTitle: 'ご利用前によくある質問',
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
      ctaTitle: 'まずは、この端末で使えるか確認。',
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
    title: 'Deine Playlists. Deine Reihenfolge.',
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
    title: 'Tus playlists, en el orden que prefieres.',
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
    title: 'Vos playlists, dans l’ordre qui vous convient.',
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
    title: 'Le tue playlist, nell’ordine che preferisci.',
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
    title: 'Suas playlists, na ordem que você prefere.',
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
      menu: 'Menü',
      autoRenew: 'Automatische Verlängerung',
      eyebrow: 'PLAYLISTS EINFACH VERWALTEN',
      featuresEyebrow: 'EIN KLARER ABLAUF',
      flowEyebrow: 'KLAR UND TRANSPARENT',
      safetyEyebrow: 'KOMPATIBILITÄT',
      consoleLabel: 'KOMPATIBILITÄTSPRÜFUNG',
      consoleStatus: 'OBERFLÄCHE UNTERSTÜTZT',
      rows: [
        ['01', 'Künstler-Reihenfolge', 'gespeichert'],
        ['02', 'Duplikatprüfung', 'auf dem Gerät'],
        ['03', 'Smart Add', 'vom Nutzer gestartet'],
      ],
      cardLabel: 'SICHERHEITSPRÜFUNG',
      cardTitle: 'Bereit',
      searchEyebrow: 'AMAZON-MUSIC-PLAYLISTS ORGANISIEREN',
      searchTitle: 'Amazon-Music-Playlists einfacher sortieren und organisieren.',
      searchLead:
        'Playlist Toolkit unterstützt wiederkehrende Sortier-, Prüf- und Navigationsschritte, ohne die Amazon-Music-App zu verändern.',
      searchItems: [
        [
          'Playlists sortieren',
          'Künstler-, Titel-, zuletzt hinzugefügt- oder Daueransicht auf unterstützten Bildschirmen wiederherstellen.',
        ],
        [
          'Doppelte Songs prüfen',
          'Duplikatkandidaten in langen Playlists lokal auf dem Gerät überprüfen.',
        ],
        [
          'Playlists prüfen',
          'Zustand und unterstützte Organisationsschritte prüfen und bei unbekannten Ansichten sicher stoppen.',
        ],
        [
          'Favoriten schneller öffnen',
          'Wiederholte Navigation zur meistgenutzten Playlist reduzieren.',
        ],
      ],
    },
    'Lanzamiento para Android en preparación': {
      store: 'Descargar en Google Play',
      status: 'Disponible para Android',
      updated: 'Vigente y actualizado por última vez: 2 de septiembre de 2026',
      menu: 'Menú',
      autoRenew: 'Renovación automática',
      eyebrow: 'PLAYLISTS BAJO CONTROL',
      featuresEyebrow: 'UN SOLO FLUJO',
      flowEyebrow: 'CLARO DESDE EL PRINCIPIO',
      safetyEyebrow: 'COMPATIBILIDAD',
      consoleLabel: 'COMPROBACIÓN DE COMPATIBILIDAD',
      consoleStatus: 'INTERFAZ COMPATIBLE',
      rows: [
        ['01', 'Orden por artista', 'guardado'],
        ['02', 'Revisión de duplicados', 'en el dispositivo'],
        ['03', 'Smart Add', 'iniciado por ti'],
      ],
      cardLabel: 'COMPROBACIÓN DE SEGURIDAD',
      cardTitle: 'Listo',
      searchEyebrow: 'ORGANIZADOR DE PLAYLISTS DE AMAZON MUSIC',
      searchTitle: 'Ordena y organiza playlists de Amazon Music con menos pasos.',
      searchLead:
        'Playlist Toolkit ayuda con tareas repetitivas de orden, revisión y navegación sin modificar la aplicación Amazon Music.',
      searchItems: [
        [
          'Ordenar playlists',
          'Restaura la vista por artista, título, añadidas recientemente o duración en pantallas compatibles.',
        ],
        [
          'Buscar canciones duplicadas',
          'Revisa candidatos duplicados en playlists largas mediante procesamiento local.',
        ],
        [
          'Auditar playlists',
          'Comprueba el estado y detiene la operación si no puede verificar la interfaz esperada.',
        ],
        [
          'Volver a playlists favoritas',
          'Reduce la navegación repetida hasta la playlist que más utilizas.',
        ],
      ],
    },
    'Sortie Android en préparation': {
      store: 'Télécharger sur Google Play',
      status: 'Disponible sur Android',
      updated: 'En vigueur et dernière mise à jour : 2 septembre 2026',
      menu: 'Menu',
      autoRenew: 'Renouvellement automatique',
      eyebrow: 'VOS PLAYLISTS, SOUS CONTRÔLE',
      featuresEyebrow: 'UN SEUL PARCOURS',
      flowEyebrow: 'CLAIR DÈS LE DÉPART',
      safetyEyebrow: 'COMPATIBILITÉ',
      consoleLabel: 'CONTRÔLE DE COMPATIBILITÉ',
      consoleStatus: 'INTERFACE PRISE EN CHARGE',
      rows: [
        ['01', 'Ordre par artiste', 'mémorisé'],
        ['02', 'Recherche de doublons', 'sur l’appareil'],
        ['03', 'Smart Add', 'lancé par vous'],
      ],
      cardLabel: 'CONTRÔLE DE SÉCURITÉ',
      cardTitle: 'Prêt',
      searchEyebrow: 'ORGANISATEUR DE PLAYLISTS AMAZON MUSIC',
      searchTitle: 'Triez et organisez vos playlists Amazon Music plus simplement.',
      searchLead:
        'Playlist Toolkit facilite les tâches répétitives de tri, de contrôle et de navigation sans modifier l’application Amazon Music.',
      searchItems: [
        [
          'Trier les playlists',
          'Restaurez l’affichage par artiste, titre, ajout récent ou durée sur les écrans compatibles.',
        ],
        [
          'Repérer les doublons',
          'Examinez localement les doublons potentiels dans les longues playlists.',
        ],
        [
          'Contrôler les playlists',
          'Vérifiez leur état et arrêtez en sécurité si l’interface attendue ne peut pas être confirmée.',
        ],
        [
          'Retrouver les favorites',
          'Réduisez la navigation répétée vers la playlist la plus utilisée.',
        ],
      ],
    },
    'Uscita Android in preparazione': {
      store: 'Scarica da Google Play',
      status: 'Disponibile per Android',
      updated: 'In vigore e ultimo aggiornamento: 2 settembre 2026',
      menu: 'Menu',
      autoRenew: 'Rinnovo automatico',
      eyebrow: 'PLAYLIST SOTTO CONTROLLO',
      featuresEyebrow: 'UN SOLO FLUSSO',
      flowEyebrow: 'CHIARO FIN DALL’INIZIO',
      safetyEyebrow: 'COMPATIBILITÀ',
      consoleLabel: 'CONTROLLO COMPATIBILITÀ',
      consoleStatus: 'INTERFACCIA SUPPORTATA',
      rows: [
        ['01', 'Ordine per artista', 'memorizzato'],
        ['02', 'Controllo duplicati', 'sul dispositivo'],
        ['03', 'Smart Add', 'avviato da te'],
      ],
      cardLabel: 'CONTROLLO DI SICUREZZA',
      cardTitle: 'Pronto',
      searchEyebrow: 'ORGANIZZATORE PLAYLIST AMAZON MUSIC',
      searchTitle: 'Ordina e organizza le playlist Amazon Music con meno passaggi.',
      searchLead:
        'Playlist Toolkit assiste le attività ripetitive di ordinamento, controllo e navigazione senza modificare l’app Amazon Music.',
      searchItems: [
        [
          'Ordinare le playlist',
          'Ripristina la vista per artista, titolo, aggiunte recenti o durata nelle schermate supportate.',
        ],
        [
          'Trovare brani duplicati',
          'Controlla localmente i possibili duplicati nelle playlist lunghe.',
        ],
        [
          'Verificare le playlist',
          'Controlla lo stato e si ferma in sicurezza se l’interfaccia attesa non è verificabile.',
        ],
        [
          'Tornare alle preferite',
          'Riduce la navigazione ripetuta verso la playlist usata più spesso.',
        ],
      ],
    },
    'Lançamento Android em preparação': {
      store: 'Baixar no Google Play',
      status: 'Disponível para Android',
      updated: 'Vigente e atualizado em: 2 de setembro de 2026',
      menu: 'Menu',
      autoRenew: 'Renovação automática',
      eyebrow: 'PLAYLISTS SOB CONTROLE',
      featuresEyebrow: 'UM ÚNICO FLUXO',
      flowEyebrow: 'CLARO DESDE O INÍCIO',
      safetyEyebrow: 'COMPATIBILIDADE',
      consoleLabel: 'VERIFICAÇÃO DE COMPATIBILIDADE',
      consoleStatus: 'INTERFACE COMPATÍVEL',
      rows: [
        ['01', 'Ordem por artista', 'salva'],
        ['02', 'Revisão de duplicatas', 'no dispositivo'],
        ['03', 'Smart Add', 'iniciado por você'],
      ],
      cardLabel: 'VERIFICAÇÃO DE SEGURANÇA',
      cardTitle: 'Pronto',
      searchEyebrow: 'ORGANIZADOR DE PLAYLISTS DO AMAZON MUSIC',
      searchTitle: 'Ordene e organize playlists do Amazon Music com menos etapas.',
      searchLead:
        'Playlist Toolkit auxilia tarefas repetitivas de ordenação, revisão e navegação sem modificar o app Amazon Music.',
      searchItems: [
        [
          'Ordenar playlists',
          'Restaure a exibição por artista, título, adição recente ou duração em telas compatíveis.',
        ],
        [
          'Encontrar músicas duplicadas',
          'Revise localmente possíveis duplicatas em playlists longas.',
        ],
        [
          'Auditar playlists',
          'Verifique o estado e pare com segurança quando a interface esperada não puder ser confirmada.',
        ],
        ['Voltar às favoritas', 'Reduza a navegação repetida até a playlist que você mais usa.'],
      ],
    },
  }[status];
}

function makeTranslation(config) {
  const release = getLocalizedRelease(config.status);
  const [features, flow, privacy, support, terms] = config.nav;
  const common = {
    product: 'Playlist Toolkit',
    maker: 'NKIS WORKS PRODUCT',
    independent: config.independent,
    footer: config.footer,
    back: features,
    contents: config.language,
    email: support,
    menu: release.menu,
    studio: 'NKIS Works',
    slarog: 'Slarog (Japan)',
  };
  const home = {
    metaTitle: `Playlist Toolkit | ${config.title}`,
    metaDescription: config.lead,
    eyebrow: release.eyebrow,
    title: config.title,
    lead: config.lead,
    primary: features,
    secondary: support,
    store: release.store,
    price: `${config.price} · ${release.autoRenew}`,
    localPrice: config.localPrice,
    status: release.status,
    consoleLabel: release.consoleLabel,
    consoleStatus: release.consoleStatus,
    rows: release.rows,
    cardLabel: release.cardLabel,
    cardTitle: release.cardTitle,
    cardBody: config.safety[2][1],
    trust: [
      [config.safety[0][0], config.safety[0][1]],
      [config.steps[2][0], config.steps[2][1]],
      [config.safety[2][0], config.safety[2][1]],
    ],
    featuresEyebrow: release.featuresEyebrow,
    featuresTitle: config.featureTitle,
    featuresLead: config.featureLead,
    features: config.features,
    flowEyebrow: release.flowEyebrow,
    flowTitle: config.flowTitle,
    flowLead: config.flowLead,
    steps: config.steps,
    safetyEyebrow: release.safetyEyebrow,
    safetyTitle: config.safetyTitle,
    safetyLead: config.safetyLead,
    safety: config.safety,
    searchEyebrow: release.searchEyebrow,
    searchTitle: release.searchTitle,
    searchLead: release.searchLead,
    searchItems: release.searchItems,
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
  const locale = localizedLocale(config.status);
  const translated = getLocalizedLegalSections(locale);
  if (translated) {
    return {
      privacy: translated.privacy.map((paragraphs, index) => [
        `${index + 1}. ${localizedSectionTitle(locale, 'privacy', index, '')}`,
        paragraphs,
      ]),
      support: translated.support.map((paragraphs, index) => [
        localizedSectionTitle(locale, 'support', index, ''),
        paragraphs,
      ]),
      terms: translated.terms.map((paragraphs, index) => [
        `${index + 1}. ${localizedSectionTitle(locale, 'terms', index, '')}`,
        paragraphs,
      ]),
    };
  }
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

function localizedLocale(status) {
  return {
    'Android-Veröffentlichung in Vorbereitung': 'de',
    'Lanzamiento para Android en preparación': 'es',
    'Sortie Android en préparation': 'fr',
    'Uscita Android in preparazione': 'it',
    'Lançamento Android em preparação': 'pt-BR',
  }[status];
}

function getLocalizedLegalSections(language) {
  return {
    de: {
      privacy: [
        [
          'Playlist Toolkit ist ein unabhängiges Android-Dienstprogramm von NKIS Works. Es ist kein Amazon-Produkt und weder mit Amazon verbunden noch von Amazon empfohlen.',
        ],
        [
          'Wenn die Android-Bedienungshilfe aktiviert ist, kann die App sichtbare Texte, Beschriftungen, Steuerelemente und Eigenschaften des Bedienungshilfe-Knotenbaums auf unterstützten Amazon-Music-Bildschirmen prüfen. Dies dient dazu, Playlist-Kopfzeilen, Titelzeilen, Sortieroptionen, die Schaltfläche zum Hinzufügen und vom Nutzer gewählte Verschiebeziele zu erkennen.',
          'Der Dienst ist auf das Amazon-Music-Paket beschränkt. Solange die schwebende Hilfe sichtbar ist, kann die App prüfen, welche App im Vordergrund läuft, damit sie sich außerhalb von Amazon Music ausblendet. Diese Funktion wird nicht für Werbung oder Nutzerprofile verwendet.',
        ],
        [
          'Playlist-Namen, sichtbare Titelnamen und Beschriftungen, Prüfergebnisse, gespeicherte Sortierwünsche, Favoriten, Kompatibilitätssignale und begrenzte Diagnosedaten werden ausschließlich auf dem Gerät verarbeitet. Playlist-Inhalte werden weder an einen NKIS-Works-Server übertragen noch verkauft.',
        ],
        [
          'Ein begrenztes Diagnoseprotokoll kann im App-Speicher verbleiben, solange der Dienst läuft. Es wird auf Wunsch oder beim Beenden des Prozesses gelöscht. Diagnosedaten verlassen die App nur, wenn der Nutzer sie ausdrücklich kopiert und teilt. Bitte prüfen Sie die Daten vor dem Versand an den Support.',
        ],
        [
          'Google Play Billing zeigt Abonnements an, schließt Käufe ab, stellt Zugriffe wieder her und prüft Berechtigungen. Google verarbeitet Zahlungsdaten nach den eigenen Richtlinien. NKIS Works erhält keine vollständigen Kartendaten, sondern nur die für den bezahlten Zugriff erforderlichen Kauf- und Berechtigungsinformationen.',
        ],
        [
          'Bei einer Support-Anfrage erhält NKIS Works die E-Mail-Adresse, die Nachricht und alle Diagnosedaten, Screenshots, Geräteinformationen oder Dateien, die der Nutzer freiwillig mitsendet. Diese Angaben werden nur zur Bearbeitung der Anfrage und zur Fehleranalyse verwendet.',
        ],
        [
          'Lokale Einstellungen und Ergebnisse lassen sich durch Löschen der App-Daten oder Deinstallation entfernen. Die Bedienungshilfe kann jederzeit in den Android-Einstellungen deaktiviert werden. Support-E-Mails werden nur so lange gespeichert, wie es für Bearbeitung, Dokumentation, Missbrauchsschutz oder gesetzliche Pflichten erforderlich ist.',
        ],
        [
          'NKIS Works beschränkt die Verarbeitung auf die hier beschriebenen Funktionen und prüft diese Richtlinie bei Änderungen der App. Wesentliche Änderungen werden mit einem neuen Datum auf dieser Seite veröffentlicht. Datenschutzfragen können an die unten angegebene Support-Adresse gesendet werden.',
        ],
      ],
      support: [
        [
          'Nennen Sie die Versionen von Playlist Toolkit, Android und Amazon Music, die gewählte App-Sprache sowie den Vorgang, der gestoppt wurde. Senden Sie niemals Ihr Amazon-Passwort oder Zahlungskartendaten.',
        ],
        [
          'Öffnen Sie eine selbst erstellte oder verwaltbare Playlist. Prüfen Sie, ob Titelliste, Sortierung und „Songs hinzufügen“ sichtbar sind, und kehren Sie dann zur Prüfung zurück. Nach einer Änderung der Amazon-Music-Oberfläche kann ein kompatibles Update erforderlich sein.',
        ],
        [
          'Die App stoppt absichtlich, wenn ein erforderliches Steuerelement nicht eindeutig bestätigt werden kann, der Bildschirm unerwartet wechselt, eine Geste abgelehnt wird oder ein Zeitlimit erreicht ist. Kehren Sie zum erwarteten Playlist-Bildschirm zurück und versuchen Sie es erst bei stabilem Bildschirm erneut.',
        ],
        [
          'Öffnen Sie die Android-Einstellungen, wählen Sie Bedienungshilfen, dann Playlist Toolkit, und deaktivieren Sie den Dienst. Eine Deinstallation entfernt ebenfalls lokale App-Daten und den Dienst.',
        ],
        [
          'Öffnen Sie Google Play, wählen Sie Zahlungen & Abos, dann Abos und anschließend Playlist Toolkit. Kündigung und Abrechnungszeitpunkt richten sich nach Google Play und den beim Kauf angezeigten Bedingungen.',
        ],
        [
          `${SUPPORT_EMAIL} ist der gemeinsame Support-Kanal von NKIS Works. Falls hilfreich, prüfen und kopieren Sie die begrenzten Diagnosedaten der App und fügen Sie sie in die Nachricht ein.`,
        ],
      ],
      terms: [
        [
          'Playlist Toolkit unterstützt vom Nutzer gestartete Playlist-Abläufe auf kompatiblen Bildschirmen der separat installierten Amazon-Music-App für Android. Funktionen können je nach App- und Android-Version, Gerät, Region, Sprache, Abonnement und Oberfläche abweichen.',
        ],
        [
          'Playlist Toolkit ist weder mit Amazon verbunden noch von Amazon gesponsert oder empfohlen. Amazon und Amazon Music sind Marken ihrer jeweiligen Inhaber. Amazon Music muss separat und gemäß den Bedingungen von Amazon genutzt werden.',
        ],
        [
          'Bezahlte Funktionen werden über ein automatisch verlängerndes Google-Play-Abonnement angeboten. In Japan beträgt der Preis 200 ¥ pro Monat. Maßgeblich sind Preis, Steuer, Währung, Verlängerungsdatum, Testzeitraum und weitere Bedingungen, die Google Play vor dem Kauf anzeigt. Die Kompatibilitätsprüfung löst keine Zahlung aus.',
        ],
        [
          'Abonnements werden über Google Play verwaltet und gekündigt. Das Löschen von Playlist Toolkit beendet ein Abonnement nicht automatisch. Abrechnung, Kündigungszeitpunkt und Erstattungen richten sich nach Google-Play-Regeln und geltendem Recht.',
        ],
        [
          'Prüfen Sie vor jedem Vorgang Ziel-Playlist und Bildschirm, bedienen Sie Amazon Music nicht während einer automatischen Prüfung oder unterstützten Geste und stoppen Sie bei einem falschen Ziel. Nutzer bleiben für ihre Playlists und Kontoaktivitäten verantwortlich.',
        ],
        [
          'Die App darf nicht zur Verletzung von Gesetzen, Rechten Dritter, Amazon-Bedingungen, Google-Play-Richtlinien oder Gerätesicherheit verwendet werden. Umgehung von Zahlungen, Missbrauch der Bedienungshilfe, Verteilung veränderter Kopien und unbefugte Zugriffsversuche sind im gesetzlich zulässigen Umfang untersagt.',
        ],
        [
          'Amazon Music kann Steuerelemente ohne Vorankündigung ändern oder entfernen. Playlist Toolkit kann einen Bildschirm oder eine Version vorübergehend nicht unterstützen. Bei nicht bestätigten Steuerelementen soll die App stoppen; eine lückenlose Verfügbarkeit oder Unterstützung jeder künftigen Oberfläche wird jedoch nicht garantiert.',
        ],
        [
          'Soweit gesetzlich zulässig, wird der Dienst ohne Garantie für ununterbrochenen Betrieb, fehlerfreie Ergebnisse oder Eignung für jeden Ablauf bereitgestellt. NKIS Works kann diese Bedingungen bei Änderungen des Dienstes aktualisieren. Fragen können an die unten angegebene Support-Adresse gesendet werden.',
        ],
      ],
    },
    es: {
      privacy: [
        [
          'Playlist Toolkit es una utilidad independiente para Android publicada por NKIS Works. No es un producto de Amazon ni está afiliada, patrocinada o respaldada por Amazon.',
        ],
        [
          'Cuando se activa la asistencia de Accesibilidad de Android, la aplicación puede examinar textos, etiquetas, controles y propiedades visibles del árbol de nodos de accesibilidad en pantallas compatibles de Amazon Music. Se usa para identificar encabezados y filas de playlists, opciones de orden, el control para añadir canciones y destinos de movimiento solicitados por el usuario.',
          'El servicio está limitado al paquete de Amazon Music. Mientras la ayuda flotante está visible, la aplicación puede comprobar qué app está en primer plano para ocultarse fuera de Amazon Music. Esta capacidad no se usa para publicidad ni para crear perfiles.',
        ],
        [
          'Los nombres de playlists, títulos y etiquetas visibles, resultados de auditoría, preferencias de orden, favoritos, señales de compatibilidad y diagnósticos limitados se procesan localmente. El contenido de las playlists no se envía a servidores de NKIS Works ni se vende.',
        ],
        [
          'Puede conservarse un registro de diagnóstico limitado en la memoria mientras funciona el servicio. Se elimina al solicitarlo o al finalizar el proceso. Solo sale de la aplicación cuando el usuario lo copia y comparte expresamente. Revísalo antes de enviarlo al soporte.',
        ],
        [
          'Google Play Billing muestra suscripciones, completa compras, restaura el acceso y verifica derechos. Google trata los datos de pago según sus propias políticas. NKIS Works no recibe números completos de tarjeta; solo la información de compra y derecho necesaria para habilitar el acceso de pago.',
        ],
        [
          'Si contactas con soporte, NKIS Works recibe tu correo, mensaje y los diagnósticos, capturas, datos del dispositivo o archivos que decidas adjuntar. Se usan para responder y analizar el problema comunicado.',
        ],
        [
          'Las preferencias y resultados locales pueden eliminarse borrando los datos o desinstalando la aplicación. La asistencia de pantalla puede desactivarse en Ajustes de Android. Los correos de soporte se conservan solo el tiempo razonablemente necesario para atender la solicitud, mantener registros, evitar abusos o cumplir la ley.',
        ],
        [
          'NKIS Works limita el tratamiento a las funciones descritas y revisa esta política cuando cambia el comportamiento de la app. Los cambios importantes aparecerán en esta página con una fecha nueva. Las consultas de privacidad pueden enviarse al correo de soporte indicado abajo.',
        ],
      ],
      support: [
        [
          'Indica las versiones de Playlist Toolkit, Android y Amazon Music, el idioma seleccionado y la operación que se detuvo. No incluyas tu contraseña de Amazon ni datos de tarjetas.',
        ],
        [
          'Abre una playlist creada o administrable por ti, confirma que se ven la lista, el control de orden y la opción para añadir canciones, y vuelve a comprobar. Si Amazon Music cambió su interfaz, puede ser necesaria una actualización compatible.',
        ],
        [
          'La parada es intencionada cuando no puede verificarse un control, la pantalla cambia de forma inesperada, se rechaza un gesto o vence el tiempo. Regresa a la pantalla de playlist esperada y reintenta solo cuando esté estable.',
        ],
        [
          'Abre Ajustes de Android, ve a Accesibilidad, selecciona Playlist Toolkit y desactiva el servicio. Desinstalar la aplicación también elimina sus datos locales y el servicio.',
        ],
        [
          'Abre Google Play, entra en Pagos y suscripciones, después en Suscripciones y elige Playlist Toolkit. Google Play controla la cancelación, las fechas de cobro y las condiciones mostradas al comprar.',
        ],
        [
          `${SUPPORT_EMAIL} es el canal compartido de soporte de NKIS Works. Si resulta útil, revisa y copia los diagnósticos limitados de la aplicación antes de pegarlos en el mensaje.`,
        ],
      ],
      terms: [
        [
          'Playlist Toolkit ayuda en flujos de organización iniciados por el usuario sobre pantallas compatibles de la aplicación Amazon Music para Android instalada por separado. Las funciones pueden variar según las versiones, el dispositivo, la región, el idioma, la suscripción y la interfaz.',
        ],
        [
          'Playlist Toolkit no está afiliada, patrocinada ni respaldada por Amazon. Amazon y Amazon Music son marcas de sus respectivos titulares. El usuario debe obtener y utilizar Amazon Music por separado conforme a las condiciones de Amazon.',
        ],
        [
          'Las funciones de pago se ofrecen mediante una suscripción de Google Play con renovación automática. En Japón cuesta 200 ¥ al mes. El precio, impuestos, moneda, fecha de renovación, prueba y demás condiciones válidas son las mostradas por Google Play antes de confirmar. La comprobación de compatibilidad no genera ningún cargo.',
        ],
        [
          'Las suscripciones se gestionan o cancelan en Google Play. Eliminar Playlist Toolkit no cancela la suscripción. La facturación, el momento de cancelación y los reembolsos se rigen por Google Play y la legislación aplicable.',
        ],
        [
          'Antes de iniciar, revisa la playlist y la pantalla de destino, no interactúes con Amazon Music durante una auditoría automática o gesto asistido y detén la operación si el objetivo mostrado no es correcto. Cada usuario conserva la responsabilidad sobre sus playlists y su cuenta.',
        ],
        [
          'No se puede usar la aplicación para infringir leyes, derechos de terceros, condiciones de Amazon, políticas de Google Play o seguridad del dispositivo. Se prohíbe eludir pagos, abusar de la Accesibilidad, distribuir copias modificadas o intentar accesos no autorizados en la medida permitida por la ley.',
        ],
        [
          'Amazon Music puede cambiar o eliminar controles sin aviso. Playlist Toolkit puede dejar de admitir temporalmente una pantalla o versión. La app está diseñada para detenerse si no verifica los controles, pero no se garantiza disponibilidad continua ni compatibilidad con todas las interfaces futuras.',
        ],
        [
          'En la medida permitida por la ley, el servicio se ofrece sin garantías de funcionamiento ininterrumpido, resultados sin errores o idoneidad para todos los flujos. NKIS Works puede actualizar estas condiciones cuando cambie el servicio. Las consultas pueden enviarse al soporte indicado abajo.',
        ],
      ],
    },
    fr: {
      privacy: [
        [
          'Playlist Toolkit est un utilitaire Android indépendant publié par NKIS Works. Ce n’est pas un produit Amazon et il n’est ni affilié, ni sponsorisé, ni approuvé par Amazon.',
        ],
        [
          'Lorsque l’assistance d’Accessibilité Android est activée, l’application peut examiner les textes, libellés, commandes et propriétés visibles de l’arbre de nœuds d’accessibilité sur les écrans Amazon Music compatibles. Cela permet d’identifier les en-têtes et lignes de playlist, les choix de tri, la commande d’ajout et les destinations de déplacement demandées par l’utilisateur.',
          'Le service est limité au package Amazon Music. Tant que l’assistant flottant est affiché, l’application peut vérifier quelle app est au premier plan afin de se masquer hors d’Amazon Music. Cette capacité n’est utilisée ni pour la publicité ni pour le profilage.',
        ],
        [
          'Les noms de playlists, titres et libellés visibles, résultats d’audit, préférences de tri, favoris, signaux de compatibilité et diagnostics limités sont traités localement sur l’appareil. Le contenu des playlists n’est ni transmis à un serveur NKIS Works ni vendu.',
        ],
        [
          'Un journal de diagnostic limité peut rester en mémoire tant que le service fonctionne. Il est effacé sur demande ou à la fin du processus. Il ne quitte l’application que si l’utilisateur le copie et le partage expressément. Vérifiez-le avant tout envoi au support.',
        ],
        [
          'Google Play Billing affiche les abonnements, finalise les achats, restaure l’accès et vérifie les droits. Google traite les données de paiement selon ses propres règles. NKIS Works ne reçoit pas les numéros complets de carte, uniquement les informations d’achat et de droit nécessaires à l’accès payant.',
        ],
        [
          'Si vous contactez le support, NKIS Works reçoit votre adresse e-mail, votre message et les diagnostics, captures, informations sur l’appareil ou fichiers que vous choisissez de joindre. Ces éléments servent à répondre et à analyser le problème signalé.',
        ],
        [
          'Les préférences et résultats locaux peuvent être supprimés en effaçant les données ou en désinstallant l’application. L’assistance d’écran peut être désactivée dans les paramètres Android. Les e-mails de support ne sont conservés que le temps raisonnablement nécessaire au traitement, au suivi, à la prévention des abus ou au respect de la loi.',
        ],
        [
          'NKIS Works limite le traitement aux fonctions décrites et révise cette politique lorsque le comportement de l’application change. Toute modification importante apparaîtra ici avec une nouvelle date. Les questions de confidentialité peuvent être envoyées à l’adresse de support ci-dessous.',
        ],
      ],
      support: [
        [
          'Indiquez les versions de Playlist Toolkit, Android et Amazon Music, la langue choisie et l’opération interrompue. Ne transmettez jamais votre mot de passe Amazon ni vos données de carte bancaire.',
        ],
        [
          'Ouvrez une playlist que vous avez créée ou pouvez gérer, vérifiez que la liste, le tri et l’ajout de titres sont visibles, puis relancez le contrôle. Si l’interface Amazon Music a changé, une mise à jour compatible peut être nécessaire.',
        ],
        [
          'L’arrêt est volontaire lorsqu’une commande requise ne peut pas être vérifiée, que l’écran change de façon inattendue, qu’un geste est refusé ou qu’un délai expire. Revenez à l’écran de playlist attendu et réessayez uniquement lorsqu’il est stable.',
        ],
        [
          'Ouvrez les paramètres Android, accédez à Accessibilité, sélectionnez Playlist Toolkit et désactivez le service. La désinstallation supprime également les données locales et le service.',
        ],
        [
          'Dans Google Play, ouvrez Paiements et abonnements, puis Abonnements et sélectionnez Playlist Toolkit. Google Play gère l’annulation, les échéances et les conditions affichées lors de l’achat.',
        ],
        [
          `${SUPPORT_EMAIL} est le canal de support commun de NKIS Works. Si nécessaire, examinez puis copiez les diagnostics limités de l’application avant de les joindre au message.`,
        ],
      ],
      terms: [
        [
          'Playlist Toolkit assiste les parcours de gestion lancés par l’utilisateur sur les écrans compatibles de l’application Amazon Music Android installée séparément. Les fonctions peuvent varier selon les versions, l’appareil, la région, la langue, l’abonnement et l’interface.',
        ],
        [
          'Playlist Toolkit n’est ni affilié, ni sponsorisé, ni approuvé par Amazon. Amazon et Amazon Music sont des marques de leurs propriétaires respectifs. L’utilisateur doit obtenir et utiliser Amazon Music séparément selon les conditions d’Amazon.',
        ],
        [
          'Les fonctions payantes sont proposées par un abonnement Google Play à renouvellement automatique. Au Japon, le tarif est de 200 ¥ par mois. Le prix, les taxes, la devise, la date de renouvellement, l’essai et les autres conditions applicables sont ceux affichés par Google Play avant confirmation. Le contrôle de compatibilité ne déclenche aucun paiement.',
        ],
        [
          'Les abonnements se gèrent et s’annulent dans Google Play. Supprimer Playlist Toolkit ne résilie pas l’abonnement. La facturation, la date d’effet de l’annulation et les remboursements relèvent des règles Google Play et du droit applicable.',
        ],
        [
          'Avant toute opération, vérifiez la playlist et l’écran ciblés, n’utilisez pas Amazon Music pendant un audit automatique ou un geste assisté et arrêtez si la cible affichée n’est pas la bonne. L’utilisateur reste responsable de ses playlists et de son compte.',
        ],
        [
          'L’application ne doit pas servir à enfreindre la loi, les droits de tiers, les conditions d’Amazon, les règles Google Play ou la sécurité de l’appareil. Le contournement du paiement, l’abus de l’Accessibilité, la diffusion de copies modifiées et les tentatives d’accès non autorisé sont interdits dans les limites de la loi.',
        ],
        [
          'Amazon Music peut modifier ou supprimer des commandes sans préavis. Playlist Toolkit peut cesser temporairement de prendre en charge un écran ou une version. L’application doit s’arrêter si les commandes ne sont pas vérifiées, mais la disponibilité continue et la compatibilité avec toute interface future ne sont pas garanties.',
        ],
        [
          'Dans les limites autorisées par la loi, le service est fourni sans garantie de fonctionnement continu, de résultats exempts d’erreur ou d’adaptation à tous les parcours. NKIS Works peut modifier ces conditions si le service évolue. Les questions peuvent être adressées au support ci-dessous.',
        ],
      ],
    },
    it: {
      privacy: [
        [
          'Playlist Toolkit è un’utilità Android indipendente pubblicata da NKIS Works. Non è un prodotto Amazon e non è affiliata, sponsorizzata o approvata da Amazon.',
        ],
        [
          'Quando l’assistenza Accessibilità di Android è attiva, l’app può esaminare testi, etichette, controlli e proprietà visibili dell’albero dei nodi di accessibilità nelle schermate Amazon Music supportate. Serve a individuare intestazioni e righe delle playlist, opzioni di ordinamento, il controllo di aggiunta e le destinazioni di spostamento richieste dall’utente.',
          'Il servizio è limitato al pacchetto Amazon Music. Finché l’assistente mobile è visibile, l’app può verificare quale applicazione è in primo piano per nascondersi fuori da Amazon Music. Questa capacità non viene usata per pubblicità o profilazione.',
        ],
        [
          'Nomi delle playlist, titoli ed etichette visibili, risultati di controllo, preferenze di ordinamento, preferiti, segnali di compatibilità e diagnostica limitata sono elaborati localmente sul dispositivo. Il contenuto delle playlist non viene inviato a server NKIS Works né venduto.',
        ],
        [
          'Un registro diagnostico limitato può restare in memoria durante il servizio. Viene cancellato su richiesta o alla chiusura del processo. Esce dall’app solo se l’utente lo copia e condivide esplicitamente. Verificalo prima di inviarlo al supporto.',
        ],
        [
          'Google Play Billing mostra gli abbonamenti, completa gli acquisti, ripristina l’accesso e verifica i diritti. Google gestisce i dati di pagamento secondo le proprie norme. NKIS Works non riceve numeri completi di carta, ma solo le informazioni di acquisto e diritto necessarie all’accesso a pagamento.',
        ],
        [
          'Se contatti il supporto, NKIS Works riceve l’indirizzo e-mail, il messaggio e gli eventuali dati diagnostici, screenshot, informazioni sul dispositivo o file che scegli di allegare. Sono usati per rispondere e analizzare il problema segnalato.',
        ],
        [
          'Preferenze e risultati locali possono essere rimossi cancellando i dati o disinstallando l’app. L’assistenza schermo può essere disattivata nelle impostazioni Android. Le e-mail di supporto sono conservate solo per il tempo ragionevolmente necessario a gestire la richiesta, mantenere registri, prevenire abusi o rispettare la legge.',
        ],
        [
          'NKIS Works limita il trattamento alle funzioni descritte e rivede questa informativa quando cambia il comportamento dell’app. Le modifiche sostanziali saranno pubblicate qui con una nuova data. Le domande sulla privacy possono essere inviate all’indirizzo di supporto indicato sotto.',
        ],
      ],
      support: [
        [
          'Indica le versioni di Playlist Toolkit, Android e Amazon Music, la lingua scelta e l’operazione interrotta. Non includere la password Amazon o dati delle carte di pagamento.',
        ],
        [
          'Apri una playlist creata o gestibile da te, verifica che siano visibili elenco, ordinamento e aggiunta di brani, quindi ripeti il controllo. Se l’interfaccia Amazon Music è cambiata, potrebbe servire un aggiornamento compatibile.',
        ],
        [
          'L’arresto è intenzionale quando un controllo necessario non può essere verificato, la schermata cambia inaspettatamente, un gesto viene rifiutato o scade il tempo. Torna alla schermata playlist prevista e riprova solo quando è stabile.',
        ],
        [
          'Apri Impostazioni Android, vai ad Accessibilità, scegli Playlist Toolkit e disattiva il servizio. La disinstallazione rimuove anche dati locali e servizio.',
        ],
        [
          'Apri Google Play, scegli Pagamenti e abbonamenti, poi Abbonamenti e Playlist Toolkit. Google Play gestisce cancellazione, tempi di fatturazione e condizioni mostrate all’acquisto.',
        ],
        [
          `${SUPPORT_EMAIL} è il canale di supporto condiviso di NKIS Works. Se utile, esamina e copia la diagnostica limitata dell’app prima di inserirla nel messaggio.`,
        ],
      ],
      terms: [
        [
          'Playlist Toolkit assiste i flussi di gestione avviati dall’utente sulle schermate supportate dell’app Amazon Music per Android installata separatamente. Le funzioni possono variare in base a versioni, dispositivo, regione, lingua, abbonamento e interfaccia.',
        ],
        [
          'Playlist Toolkit non è affiliata, sponsorizzata o approvata da Amazon. Amazon e Amazon Music sono marchi dei rispettivi proprietari. L’utente deve ottenere e usare Amazon Music separatamente secondo i termini Amazon.',
        ],
        [
          'Le funzioni a pagamento sono offerte tramite un abbonamento Google Play a rinnovo automatico. In Giappone il prezzo è di 200 ¥ al mese. Fanno fede prezzo, imposte, valuta, data di rinnovo, prova e altre condizioni mostrate da Google Play prima della conferma. Il controllo di compatibilità non avvia alcun addebito.',
        ],
        [
          'Gli abbonamenti si gestiscono o annullano tramite Google Play. Eliminare Playlist Toolkit non annulla l’abbonamento. Fatturazione, tempi di annullamento e rimborsi seguono le regole Google Play e la legge applicabile.',
        ],
        [
          'Prima di iniziare, controlla playlist e schermata di destinazione, non interagire con Amazon Music durante un controllo automatico o gesto assistito e interrompi se la destinazione mostrata non è corretta. L’utente resta responsabile di playlist e attività dell’account.',
        ],
        [
          'L’app non può essere usata per violare leggi, diritti di terzi, termini Amazon, norme Google Play o sicurezza del dispositivo. Elusione dei pagamenti, abuso dell’Accessibilità, distribuzione di copie modificate e tentativi di accesso non autorizzato sono vietati nei limiti di legge.',
        ],
        [
          'Amazon Music può cambiare o rimuovere controlli senza preavviso. Playlist Toolkit può smettere temporaneamente di supportare una schermata o versione. L’app è progettata per fermarsi se i controlli non sono verificabili, ma non garantisce disponibilità continua o compatibilità con ogni interfaccia futura.',
        ],
        [
          'Nei limiti consentiti dalla legge, il servizio è fornito senza garanzia di funzionamento ininterrotto, risultati privi di errori o idoneità a ogni flusso. NKIS Works può aggiornare questi termini quando il servizio cambia. Le domande possono essere inviate al supporto indicato sotto.',
        ],
      ],
    },
    'pt-BR': {
      privacy: [
        [
          'Playlist Toolkit é um utilitário Android independente publicado pela NKIS Works. Não é um produto da Amazon e não é afiliado, patrocinado ou endossado pela Amazon.',
        ],
        [
          'Quando a assistência de Acessibilidade do Android está ativada, o app pode examinar textos, rótulos, controles e propriedades visíveis da árvore de nós de acessibilidade em telas compatíveis do Amazon Music. Isso identifica cabeçalhos e linhas de playlists, opções de ordenação, o controle de adicionar músicas e destinos de movimento solicitados pelo usuário.',
          'O serviço é limitado ao pacote Amazon Music. Enquanto o assistente flutuante estiver visível, o app pode verificar qual aplicativo está em primeiro plano para se ocultar fora do Amazon Music. Esse recurso não é usado para publicidade ou criação de perfis.',
        ],
        [
          'Nomes de playlists, títulos e rótulos visíveis, resultados de auditoria, preferências de ordenação, favoritos, sinais de compatibilidade e diagnósticos limitados são processados localmente no dispositivo. O conteúdo das playlists não é enviado a servidores da NKIS Works nem vendido.',
        ],
        [
          'Um registro de diagnóstico limitado pode permanecer na memória enquanto o serviço funciona. Ele é apagado quando solicitado ou quando o processo termina. Só sai do app se o usuário o copiar e compartilhar expressamente. Revise-o antes de enviar ao suporte.',
        ],
        [
          'O Google Play Billing exibe assinaturas, conclui compras, restaura acesso e verifica direitos. O Google processa dados de pagamento conforme as próprias políticas. A NKIS Works não recebe números completos de cartão, apenas as informações de compra e direito necessárias ao acesso pago.',
        ],
        [
          'Ao contatar o suporte, a NKIS Works recebe seu e-mail, mensagem e os diagnósticos, capturas, informações do dispositivo ou arquivos que você decidir anexar. Esses dados são usados para responder e investigar o problema relatado.',
        ],
        [
          'Preferências e resultados locais podem ser removidos ao limpar os dados ou desinstalar o app. A assistência de tela pode ser desativada nas configurações do Android. E-mails de suporte são mantidos apenas pelo tempo razoavelmente necessário para atender a solicitação, manter registros, evitar abuso ou cumprir a lei.',
        ],
        [
          'A NKIS Works limita o processamento às funções descritas e revisa esta política quando o comportamento do app muda. Alterações relevantes serão publicadas nesta página com nova data. Dúvidas sobre privacidade podem ser enviadas ao endereço de suporte abaixo.',
        ],
      ],
      support: [
        [
          'Informe as versões do Playlist Toolkit, Android e Amazon Music, o idioma selecionado e a operação interrompida. Não inclua sua senha da Amazon nem dados de cartão.',
        ],
        [
          'Abra uma playlist criada ou gerenciável por você, confirme que lista, ordenação e adição de músicas estão visíveis e repita a verificação. Se a interface do Amazon Music mudou, uma atualização compatível pode ser necessária.',
        ],
        [
          'A parada é intencional quando um controle necessário não pode ser verificado, a tela muda inesperadamente, um gesto é rejeitado ou o tempo se esgota. Volte à tela esperada da playlist e tente novamente somente quando ela estiver estável.',
        ],
        [
          'Abra Configurações do Android, vá a Acessibilidade, selecione Playlist Toolkit e desative o serviço. Desinstalar o app também remove dados locais e o serviço.',
        ],
        [
          'Abra o Google Play, escolha Pagamentos e assinaturas, depois Assinaturas e selecione Playlist Toolkit. O Google Play controla cancelamento, datas de cobrança e condições exibidas na compra.',
        ],
        [
          `${SUPPORT_EMAIL} é o canal compartilhado de suporte da NKIS Works. Quando útil, revise e copie os diagnósticos limitados do app antes de colá-los na mensagem.`,
        ],
      ],
      terms: [
        [
          'Playlist Toolkit auxilia fluxos de organização iniciados pelo usuário em telas compatíveis do app Amazon Music para Android instalado separadamente. Os recursos podem variar conforme versões, dispositivo, região, idioma, assinatura e interface.',
        ],
        [
          'Playlist Toolkit não é afiliado, patrocinado ou endossado pela Amazon. Amazon e Amazon Music são marcas de seus respectivos proprietários. O usuário deve obter e usar o Amazon Music separadamente conforme os termos da Amazon.',
        ],
        [
          'Os recursos pagos são oferecidos por assinatura do Google Play com renovação automática. No Japão, o preço é de ¥ 200 por mês. Valem preço, impostos, moeda, data de renovação, teste e demais condições mostradas pelo Google Play antes da confirmação. A verificação de compatibilidade não gera cobrança.',
        ],
        [
          'Assinaturas são gerenciadas ou canceladas pelo Google Play. Excluir o Playlist Toolkit não cancela a assinatura. Cobrança, momento do cancelamento e reembolsos seguem as regras do Google Play e a legislação aplicável.',
        ],
        [
          'Antes de iniciar, confira playlist e tela de destino, não interaja com o Amazon Music durante auditoria automática ou gesto assistido e interrompa se o destino exibido não for o pretendido. O usuário continua responsável por suas playlists e atividades da conta.',
        ],
        [
          'O app não pode ser usado para violar leis, direitos de terceiros, termos da Amazon, políticas do Google Play ou segurança do dispositivo. Burlar pagamentos, abusar da Acessibilidade, distribuir cópias modificadas e tentar acesso não autorizado são proibidos no limite da lei.',
        ],
        [
          'O Amazon Music pode alterar ou remover controles sem aviso. O Playlist Toolkit pode deixar de oferecer suporte temporariamente a uma tela ou versão. O app foi projetado para parar quando os controles não são verificáveis, mas não garante disponibilidade contínua nem compatibilidade com toda interface futura.',
        ],
        [
          'No limite permitido pela lei, o serviço é fornecido sem garantia de operação ininterrupta, resultados sem erro ou adequação a todo fluxo. A NKIS Works pode atualizar estes termos quando o serviço mudar. Dúvidas podem ser enviadas ao suporte indicado abaixo.',
        ],
      ],
    },
  }[language];
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
  <meta property="og:image" content="${ORIGIN}/assets/playlist-toolkit-og-v2.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Playlist Toolkit by NKIS Works">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${ORIGIN}/assets/playlist-toolkit-og-v2.png">
  <link rel="canonical" href="${ORIGIN}${route}">
${alternateLinks(page)}
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/playlist-toolkit.css">
  <link rel="stylesheet" href="/assets/playlist-toolkit-refinement.css">
${page === 'home' ? renderStructuredData(data, route) : ''}
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
      <a href="${routeFor(locale, 'terms')}">${escapeHtml(text.nav.terms)}</a>
      ${renderLanguage(locale, text, page)}
    </div>
    ${renderMobileMenu(locale, text, page)}
  </nav>
</header>`;
}

function renderLanguage(current, text, page) {
  return `<details class="pt-language"><summary aria-label="${escapeHtml(text.language)}: ${escapeHtml(current.label)}">${escapeHtml(text.language)}: ${escapeHtml(current.label)}</summary><div class="pt-language-list">${locales.map((locale) => `<a href="${routeFor(locale, page)}" hreflang="${locale.code}"${locale.code === current.code ? ' aria-current="page"' : ''}>${escapeHtml(locale.label)}</a>`).join('')}</div></details>`;
}

function renderMobileMenu(current, text, page) {
  const home = routeFor(current, 'home');
  return `<details class="pt-mobile-menu"><summary>${escapeHtml(text.common.menu)}</summary><div class="pt-mobile-panel"><div class="pt-mobile-page-links"><a href="${home}#features">${escapeHtml(text.nav.features)}</a><a href="${home}#flow">${escapeHtml(text.nav.flow)}</a><a href="${routeFor(current, 'privacy')}">${escapeHtml(text.nav.privacy)}</a><a href="${routeFor(current, 'support')}">${escapeHtml(text.nav.support)}</a><a href="${routeFor(current, 'terms')}">${escapeHtml(text.nav.terms)}</a></div><strong class="pt-mobile-language-label">${escapeHtml(text.language)}</strong><div class="pt-mobile-languages">${locales.map((locale) => `<a href="${routeFor(locale, page)}" hreflang="${locale.code}"${locale.code === current.code ? ' aria-current="page"' : ''}>${escapeHtml(locale.label)}</a>`).join('')}</div></div></details>`;
}

function renderStructuredData(home, route) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Playlist Toolkit',
    description: home.metaDescription,
    url: `${ORIGIN}${route}`,
    downloadUrl: GOOGLE_PLAY_URL,
    image: `${ORIGIN}/assets/playlist-toolkit-og-v2.png`,
    operatingSystem: 'Android',
    applicationCategory: 'MultimediaApplication',
    softwareVersion: '1.1.3',
    keywords: home.searchItems.map(([title]) => title),
    sameAs: [GOOGLE_PLAY_URL],
    isPartOf: {
      '@type': 'WebSite',
      name: 'NKIS Works',
      url: `${ORIGIN}/en/`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'NKIS Works',
      url: ORIGIN,
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      eligibleRegion: 'JP',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '200',
        priceCurrency: 'JPY',
        billingDuration: 'P1M',
      },
    },
    subjectOf: {
      '@type': 'FAQPage',
      mainEntity: home.faqs.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      })),
    },
  };
  return `  <script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`;
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
  <section class="pt-shell pt-section" id="playlist-organizer"><div class="pt-section-heading"><p class="pt-eyebrow">${escapeHtml(home.searchEyebrow)}</p><h2>${escapeHtml(home.searchTitle)}</h2><p>${escapeHtml(home.searchLead)}</p></div><div class="pt-search-panel">${home.searchItems.map(([title, body]) => `<article class="pt-search-item"><span aria-hidden="true"></span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></div></article>`).join('')}</div></section>
  <section class="pt-shell pt-section"><div class="pt-section-heading"><p class="pt-eyebrow">FAQ</p><h2>${escapeHtml(home.faqTitle)}</h2></div><div class="pt-faq">${home.faqs.map(([question, answer]) => `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join('')}</div></section>
  <section class="pt-shell pt-cta"><div class="pt-cta-card"><h2>${escapeHtml(home.ctaTitle)}</h2><p>${escapeHtml(home.ctaBody)}</p><div class="pt-actions"><a class="pt-button pt-button-primary" href="${GOOGLE_PLAY_URL}" rel="external">${escapeHtml(home.store)}</a></div></div></section>
</main>`;
}

function renderDocument(text, page) {
  const doc = text[page];
  return `<main class="pt-doc-main"><div class="pt-shell"><header class="pt-doc-hero"><p class="pt-eyebrow">${escapeHtml(text.common.maker)}</p><h1>${escapeHtml(doc.title)}</h1><p>${escapeHtml(doc.intro)}</p><p class="pt-updated">${escapeHtml(doc.updated)}</p><p class="pt-independent">${escapeHtml(text.common.independent)}</p></header><div class="pt-doc-layout"><aside class="pt-doc-aside"><strong>${escapeHtml(text.common.contents)}</strong>${doc.sections.map(([title], index) => `<a href="#section-${index + 1}">${escapeHtml(title)}</a>`).join('')}</aside><article class="pt-doc-card">${doc.sections.map(([title, paragraphs], index) => `<section class="pt-doc-section" id="section-${index + 1}"><h2>${escapeHtml(title)}</h2>${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}${index === doc.sections.length - 1 ? `<a class="pt-support-email" href="mailto:${SUPPORT_EMAIL}?subject=Playlist%20Toolkit%20Support">${escapeHtml(text.common.email)} · ${SUPPORT_EMAIL}</a>` : ''}</section>`).join('')}</article></div></div></main>`;
}

function renderFooter(text, locale) {
  const studioRoute = locale.code === 'ja' ? '/ja/' : '/en/';
  return `<footer class="pt-footer"><div class="pt-footer-inner"><div class="pt-footer-copy"><strong>© 2026 NKIS Works</strong><p>${escapeHtml(text.common.footer)}</p></div><nav class="pt-footer-links" aria-label="Footer"><a href="${studioRoute}">${escapeHtml(text.common.studio)}</a><a href="/">${escapeHtml(text.common.slarog)}</a><a href="${routeFor(locale, 'home')}">${escapeHtml(text.common.back)}</a><a href="${routeFor(locale, 'privacy')}">${escapeHtml(text.nav.privacy)}</a><a href="${routeFor(locale, 'support')}">${escapeHtml(text.nav.support)}</a><a href="${routeFor(locale, 'terms')}">${escapeHtml(text.nav.terms)}</a></nav></div></footer>`;
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
