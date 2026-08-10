import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const site = "https://nkisworks.com";
const productPath = "/products/playlist-toolkit";
const supportEmail = "slarog.app@gmail.com";
const updated = "2026-08-10";

const common = {
  de: {
    lang: "de", label: "Deutsch", home: "Produkt", privacy: "Datenschutz", support: "Support", terms: "Nutzungsbedingungen",
    independent: "Playlist Toolkit ist ein unabhängiges Dienstprogramm eines Drittanbieters und steht in keiner Verbindung zu Amazon. Es wird von Amazon weder unterstützt noch empfohlen.",
    updated: "Zuletzt aktualisiert", eyebrow: "Playlist Toolkit",
  },
  es: {
    lang: "es", label: "Español", home: "Producto", privacy: "Privacidad", support: "Soporte", terms: "Condiciones",
    independent: "Playlist Toolkit es una utilidad independiente de terceros. No está afiliada, respaldada ni patrocinada por Amazon.",
    updated: "Última actualización", eyebrow: "Playlist Toolkit",
  },
  fr: {
    lang: "fr", label: "Français", home: "Produit", privacy: "Confidentialité", support: "Assistance", terms: "Conditions",
    independent: "Playlist Toolkit est un utilitaire tiers indépendant, sans affiliation avec Amazon et sans approbation ni parrainage de sa part.",
    updated: "Dernière mise à jour", eyebrow: "Playlist Toolkit",
  },
  it: {
    lang: "it", label: "Italiano", home: "Prodotto", privacy: "Privacy", support: "Assistenza", terms: "Condizioni",
    independent: "Playlist Toolkit è un'utilità indipendente di terze parti, non affiliata, approvata o sponsorizzata da Amazon.",
    updated: "Ultimo aggiornamento", eyebrow: "Playlist Toolkit",
  },
  "pt-br": {
    lang: "pt-BR", label: "Português (Brasil)", home: "Produto", privacy: "Privacidade", support: "Suporte", terms: "Termos",
    independent: "O Playlist Toolkit é um utilitário independente de terceiros e não é afiliado, endossado nem patrocinado pela Amazon.",
    updated: "Última atualização", eyebrow: "Playlist Toolkit",
  },
};

const documents = {
  de: {
    privacy: {
      title: "Datenschutzerklärung",
      lead: "Wie Playlist Toolkit Bedienungshilfe-Daten und andere Informationen auf Ihrem Android-Gerät behandelt.",
      sections: [
        ["1. Verantwortlicher", `Playlist Toolkit wird von NKIS Works bereitgestellt. Fragen zum Datenschutz richten Sie bitte an ${supportEmail}.`],
        ["2. Bedienungshilfe", "Die App verwendet den Android-Bedienungshilfedienst ausschließlich, um unterstützte Ansichten der Amazon-Music-App zu erkennen und die von Ihnen gestarteten Funktionen zur Playlist-Verwaltung auszuführen. Dazu können sichtbare Beschriftungen, Elementeigenschaften und die Position von Bedienelementen verarbeitet werden."],
        ["3. Verarbeitung auf dem Gerät", "Die Analyse der Benutzeroberfläche und die Automatisierung erfolgen auf Ihrem Gerät. Playlist Toolkit überträgt Bildschirminhalte, Playlist-Inhalte oder Bedienungshilfe-Daten nicht an NKIS Works und benötigt für diese Funktionen keine Internetberechtigung."],
        ["4. Speicherung", "Einstellungen, Kompatibilitätsergebnisse und technische Protokolle können lokal auf dem Gerät gespeichert werden. Diese Daten dienen dem Betrieb, der sicheren Unterbrechung und der Fehlerdiagnose. Sie werden bei der Deinstallation gemäß Android-Verhalten entfernt; Protokolle werden nur weitergegeben, wenn Sie sie selbst an den Support senden."],
        ["5. Zahlung", "Abonnements werden über Google Play abgewickelt. NKIS Works erhält keine vollständigen Zahlungs- oder Kreditkartendaten. Für die Abrechnung gelten die Datenschutzbestimmungen und Bedingungen von Google Play."],
        ["6. Weitergabe und Verkauf", "NKIS Works verkauft keine personenbezogenen Daten. Durch Playlist Toolkit erfasste Bedienungshilfe- oder Playlist-Daten werden nicht zu Werbe-, Profiling- oder Datenhandelszwecken an Dritte weitergegeben."],
        ["7. Berechtigungen und Kontrolle", "Sie können den Bedienungshilfedienst jederzeit in den Android-Einstellungen deaktivieren. Danach kann die App ihre unterstützten Automatisierungsfunktionen nicht mehr ausführen. Lokale App-Daten können über die Android-Einstellungen oder durch Deinstallation gelöscht werden."],
        ["8. Kinder", "Die App richtet sich nicht gezielt an Kinder. Wir erfassen nicht wissentlich personenbezogene Daten von Kindern."],
        ["9. Änderungen und Kontakt", `Wir können diese Erklärung bei Änderungen der App oder rechtlicher Anforderungen aktualisieren. Das Aktualisierungsdatum wird oben angezeigt. Kontakt: ${supportEmail}.`],
      ],
    },
    support: {
      title: "Support",
      lead: "Hilfe bei Kompatibilität, Bedienungshilfe, Abonnement und Playlist-Verwaltung.",
      sections: [
        ["Vor der Kontaktaufnahme", "Öffnen Sie in Playlist Toolkit die Kompatibilitätsprüfung und prüfen Sie, ob der Bedienungshilfedienst aktiviert ist. Wenn Amazon Music aktualisiert wurde, führen Sie die Prüfung erneut aus. Bei einem unbekannten Bildschirm stoppt die App absichtlich, statt die Bedienung fortzusetzen."],
        ["Ihre Nachricht", "Nennen Sie bitte Gerätemodell, Android-Version, Amazon-Music-Version, App-Sprache, betroffene Funktion und den angezeigten Fehler. Senden Sie keine Passwörter, Zahlungsdaten oder unnötigen personenbezogenen Informationen."],
        ["Abonnement und Erstattung", "Abonnements, Kündigungen und verfügbare Erstattungsverfahren werden von Google Play verwaltet. Verwenden Sie dafür die Abonnement- und Bestellverwaltung Ihres Google-Play-Kontos."],
        ["Kontakt", `Support-E-Mail: ${supportEmail}`],
      ],
    },
    terms: {
      title: "Nutzungsbedingungen",
      lead: "Bedingungen für die Nutzung von Playlist Toolkit.",
      sections: [
        ["1. Geltung", "Mit der Installation oder Nutzung von Playlist Toolkit stimmen Sie diesen Bedingungen zu. Wenn Sie nicht zustimmen, verwenden Sie die App bitte nicht."],
        ["2. Leistungsumfang", "Die App unterstützt die Verwaltung von Playlists durch Bedienung der sichtbaren Benutzeroberfläche einer kompatiblen Amazon-Music-App. Sie verändert Amazon Music nicht und greift nicht über eine offizielle Amazon-Music-API auf Ihr Konto zu."],
        ["3. Bedienungshilfe und Aufsicht", "Automatisierungen werden nur nach Ihrer Anforderung ausgeführt. Berühren Sie den Bildschirm während eines laufenden Vorgangs nicht und prüfen Sie das Ergebnis. Sie können einen Vorgang abbrechen; bei einer nicht erkannten Oberfläche kann die App sicher stoppen."],
        ["4. Kompatibilität", "Amazon Music ist ein Dienst eines Dritten und kann ohne Mitteilung geändert werden. Wir bemühen uns um fortlaufende Kompatibilität, garantieren jedoch keine unterbrechungsfreie Funktion mit jeder Version, jedem Gerät oder jeder Bildschirmkonfiguration."],
        ["5. Abonnement", "Kostenpflichtige Funktionen werden als automatisch verlängerbares Google-Play-Abonnement angeboten. Preis, Abrechnungszeitraum, Steuern, Verlängerung und Kündigung werden vor dem Kauf in Google Play angezeigt. Die Verwaltung erfolgt über Ihr Google-Play-Konto."],
        ["6. Zulässige Nutzung", "Nutzen Sie die App nur für Playlists, zu deren Verwaltung Sie berechtigt sind. Umgehen Sie keine Schutzmaßnahmen und verwenden Sie die App nicht rechtswidrig, missbräuchlich oder zur Beeinträchtigung anderer Dienste."],
        ["7. Gewährleistung und Haftung", "Die App wird im gesetzlich zulässigen Umfang ohne Garantie für einen bestimmten Zweck bereitgestellt. NKIS Works haftet nicht für Änderungen, Unterbrechungen oder Entscheidungen von Drittanbieterdiensten. Zwingende gesetzliche Verbraucherrechte bleiben unberührt."],
        ["8. Änderungen und Kontakt", `Wir können App und Bedingungen weiterentwickeln. Wesentliche Änderungen werden mit einem neuen Datum veröffentlicht. Kontakt: ${supportEmail}.`],
      ],
    },
  },
  es: {
    privacy: {
      title: "Política de privacidad",
      lead: "Cómo gestiona Playlist Toolkit los datos de accesibilidad y otra información en tu dispositivo Android.",
      sections: [
        ["1. Responsable", `Playlist Toolkit es ofrecida por NKIS Works. Para consultas de privacidad: ${supportEmail}.`],
        ["2. Servicio de accesibilidad", "La aplicación usa el servicio de accesibilidad de Android únicamente para reconocer pantallas compatibles de Amazon Music y ejecutar las funciones de gestión de listas que tú inicias. Puede procesar textos visibles, propiedades y posiciones de controles en pantalla."],
        ["3. Procesamiento en el dispositivo", "El análisis de la interfaz y la automatización se realizan en tu dispositivo. Playlist Toolkit no transmite a NKIS Works el contenido de la pantalla, de las listas ni los datos de accesibilidad, y estas funciones no necesitan permiso de Internet."],
        ["4. Almacenamiento", "Las preferencias, resultados de compatibilidad y registros técnicos pueden guardarse localmente para operar, detenerse de forma segura y diagnosticar errores. Android los elimina al desinstalar la aplicación. Solo compartes un registro si decides enviarlo al soporte."],
        ["5. Pagos", "Google Play procesa las suscripciones. NKIS Works no recibe los datos completos de tu tarjeta o pago. El tratamiento de la facturación se rige por las políticas y condiciones de Google Play."],
        ["6. Venta y cesión", "NKIS Works no vende datos personales. Los datos de accesibilidad o de listas tratados por Playlist Toolkit no se comparten con terceros para publicidad, creación de perfiles ni intermediación de datos."],
        ["7. Tus controles", "Puedes desactivar el servicio de accesibilidad en los ajustes de Android en cualquier momento; las funciones de automatización dejarán de estar disponibles. Puedes borrar los datos locales desde los ajustes de Android o desinstalando la aplicación."],
        ["8. Menores", "La aplicación no está dirigida específicamente a menores y no recopilamos conscientemente datos personales de menores."],
        ["9. Cambios y contacto", `Podemos actualizar esta política cuando cambien la aplicación o los requisitos legales. La fecha aparece arriba. Contacto: ${supportEmail}.`],
      ],
    },
    support: {
      title: "Soporte",
      lead: "Ayuda con compatibilidad, accesibilidad, suscripción y gestión de listas.",
      sections: [
        ["Antes de escribir", "Abre la comprobación de compatibilidad y confirma que el servicio de accesibilidad está activo. Si Amazon Music se actualizó, repite la comprobación. Ante una pantalla desconocida, la aplicación se detiene deliberadamente en lugar de continuar."],
        ["Qué incluir", "Indica modelo del dispositivo, versión de Android, versión de Amazon Music, idioma, función afectada y mensaje de error. No envíes contraseñas, datos de pago ni información personal innecesaria."],
        ["Suscripciones y reembolsos", "Google Play gestiona las suscripciones, cancelaciones y vías de reembolso disponibles. Usa la gestión de suscripciones y pedidos de tu cuenta de Google Play."],
        ["Contacto", `Correo de soporte: ${supportEmail}`],
      ],
    },
    terms: {
      title: "Condiciones de uso",
      lead: "Condiciones aplicables al uso de Playlist Toolkit.",
      sections: [
        ["1. Aceptación", "Al instalar o utilizar Playlist Toolkit aceptas estas condiciones. Si no estás de acuerdo, no utilices la aplicación."],
        ["2. Servicio", "La aplicación ayuda a gestionar listas operando sobre la interfaz visible de una versión compatible de Amazon Music. No modifica Amazon Music ni accede a tu cuenta mediante una API oficial de Amazon Music."],
        ["3. Accesibilidad y supervisión", "La automatización solo se ejecuta cuando la solicitas. No toques la pantalla durante el proceso y revisa el resultado. Puedes cancelar; si la interfaz no se reconoce, la aplicación puede detenerse de forma segura."],
        ["4. Compatibilidad", "Amazon Music es un servicio de terceros que puede cambiar sin aviso. Trabajamos para mantener la compatibilidad, pero no garantizamos funcionamiento ininterrumpido con cada versión, dispositivo o configuración de pantalla."],
        ["5. Suscripción", "Las funciones de pago se ofrecen mediante una suscripción autorrenovable de Google Play. Precio, periodo, impuestos, renovación y cancelación se muestran antes de comprar. La suscripción se gestiona desde tu cuenta de Google Play."],
        ["6. Uso permitido", "Utiliza la aplicación solo con listas que estés autorizado a gestionar. No eludas medidas de protección ni la uses de forma ilícita, abusiva o que interfiera con otros servicios."],
        ["7. Garantías y responsabilidad", "En la medida permitida por la ley, la aplicación se ofrece sin garantía de idoneidad para un fin concreto. NKIS Works no responde de cambios, interrupciones o decisiones de servicios de terceros. Se mantienen los derechos imperativos del consumidor."],
        ["8. Cambios y contacto", `Podemos modificar la aplicación y estas condiciones. Los cambios importantes se publicarán con una nueva fecha. Contacto: ${supportEmail}.`],
      ],
    },
  },
  fr: {
    privacy: {
      title: "Politique de confidentialité",
      lead: "Comment Playlist Toolkit traite les données d'accessibilité et les autres informations sur votre appareil Android.",
      sections: [
        ["1. Responsable", `Playlist Toolkit est fourni par NKIS Works. Questions relatives à la confidentialité : ${supportEmail}.`],
        ["2. Service d'accessibilité", "L'application utilise le service d'accessibilité Android uniquement pour reconnaître les écrans compatibles d'Amazon Music et exécuter les fonctions de gestion de playlists que vous lancez. Elle peut traiter les libellés visibles, les propriétés et la position des commandes à l'écran."],
        ["3. Traitement sur l'appareil", "L'analyse de l'interface et l'automatisation s'effectuent sur votre appareil. Playlist Toolkit ne transmet à NKIS Works ni le contenu de l'écran ou des playlists, ni les données d'accessibilité. Ces fonctions ne nécessitent pas l'autorisation Internet."],
        ["4. Stockage", "Les préférences, résultats de compatibilité et journaux techniques peuvent être conservés localement pour assurer le fonctionnement, l'arrêt sécurisé et le diagnostic. Android les supprime lors de la désinstallation. Un journal n'est transmis que si vous choisissez de l'envoyer au support."],
        ["5. Paiement", "Google Play traite les abonnements. NKIS Works ne reçoit pas les données complètes de carte ou de paiement. La facturation relève des règles de confidentialité et conditions de Google Play."],
        ["6. Vente et partage", "NKIS Works ne vend aucune donnée personnelle. Les données d'accessibilité ou de playlist traitées par Playlist Toolkit ne sont pas communiquées à des tiers à des fins publicitaires, de profilage ou de courtage de données."],
        ["7. Vos choix", "Vous pouvez désactiver le service d'accessibilité à tout moment dans les paramètres Android ; les fonctions d'automatisation ne seront alors plus disponibles. Vous pouvez effacer les données locales dans les paramètres Android ou en désinstallant l'application."],
        ["8. Enfants", "L'application ne cible pas spécifiquement les enfants et nous ne collectons pas sciemment leurs données personnelles."],
        ["9. Modifications et contact", `Cette politique peut évoluer avec l'application ou les exigences légales. La date figure ci-dessus. Contact : ${supportEmail}.`],
      ],
    },
    support: {
      title: "Assistance",
      lead: "Aide concernant la compatibilité, l'accessibilité, l'abonnement et la gestion des playlists.",
      sections: [
        ["Avant de nous contacter", "Lancez le contrôle de compatibilité et vérifiez que le service d'accessibilité est activé. Après une mise à jour d'Amazon Music, relancez le contrôle. Face à un écran inconnu, l'application s'arrête volontairement au lieu de poursuivre."],
        ["Informations utiles", "Indiquez le modèle, la version Android, la version d'Amazon Music, la langue, la fonction concernée et le message d'erreur. N'envoyez pas de mot de passe, de données de paiement ni d'informations personnelles inutiles."],
        ["Abonnements et remboursements", "Google Play gère les abonnements, les résiliations et les possibilités de remboursement. Utilisez la gestion des abonnements et commandes de votre compte Google Play."],
        ["Contact", `E-mail d'assistance : ${supportEmail}`],
      ],
    },
    terms: {
      title: "Conditions d'utilisation",
      lead: "Conditions applicables à l'utilisation de Playlist Toolkit.",
      sections: [
        ["1. Acceptation", "En installant ou en utilisant Playlist Toolkit, vous acceptez ces conditions. Dans le cas contraire, n'utilisez pas l'application."],
        ["2. Service", "L'application aide à gérer les playlists en agissant sur l'interface visible d'une version compatible d'Amazon Music. Elle ne modifie pas Amazon Music et n'accède pas à votre compte au moyen d'une API Amazon Music officielle."],
        ["3. Accessibilité et surveillance", "L'automatisation ne démarre qu'à votre demande. Ne touchez pas l'écran pendant l'opération et vérifiez le résultat. Vous pouvez annuler ; si l'interface n'est pas reconnue, l'application peut s'arrêter en sécurité."],
        ["4. Compatibilité", "Amazon Music est un service tiers susceptible de changer sans préavis. Nous cherchons à maintenir la compatibilité, sans garantir un fonctionnement continu avec chaque version, appareil ou configuration d'affichage."],
        ["5. Abonnement", "Les fonctions payantes sont proposées par abonnement Google Play à renouvellement automatique. Prix, période, taxes, renouvellement et résiliation sont affichés avant l'achat. La gestion s'effectue dans votre compte Google Play."],
        ["6. Utilisation autorisée", "Utilisez l'application uniquement pour des playlists que vous êtes autorisé à gérer. Ne contournez aucune protection et n'en faites pas un usage illégal, abusif ou perturbant d'autres services."],
        ["7. Garanties et responsabilité", "Dans les limites prévues par la loi, l'application est fournie sans garantie d'adaptation à un usage particulier. NKIS Works n'est pas responsable des modifications, interruptions ou décisions de services tiers. Les droits impératifs des consommateurs restent applicables."],
        ["8. Modifications et contact", `Nous pouvons faire évoluer l'application et ces conditions. Les changements importants seront publiés avec une nouvelle date. Contact : ${supportEmail}.`],
      ],
    },
  },
  it: {
    privacy: {
      title: "Informativa sulla privacy",
      lead: "Come Playlist Toolkit gestisce i dati di accessibilità e le altre informazioni sul dispositivo Android.",
      sections: [
        ["1. Titolare", `Playlist Toolkit è fornita da NKIS Works. Per domande sulla privacy: ${supportEmail}.`],
        ["2. Servizio di accessibilità", "L'app usa il servizio di accessibilità Android esclusivamente per riconoscere le schermate compatibili di Amazon Music ed eseguire le funzioni di gestione delle playlist avviate dall'utente. Può elaborare etichette visibili, proprietà e posizioni dei controlli sullo schermo."],
        ["3. Elaborazione sul dispositivo", "L'analisi dell'interfaccia e l'automazione avvengono sul dispositivo. Playlist Toolkit non trasmette a NKIS Works contenuti dello schermo, contenuti delle playlist o dati di accessibilità e queste funzioni non richiedono l'autorizzazione Internet."],
        ["4. Conservazione", "Preferenze, risultati di compatibilità e registri tecnici possono essere salvati localmente per il funzionamento, l'arresto sicuro e la diagnosi. Android li rimuove con la disinstallazione. Un registro viene condiviso solo se scegli di inviarlo all'assistenza."],
        ["5. Pagamenti", "Gli abbonamenti sono elaborati da Google Play. NKIS Works non riceve i dati completi della carta o del pagamento. Alla fatturazione si applicano privacy e condizioni di Google Play."],
        ["6. Vendita e condivisione", "NKIS Works non vende dati personali. I dati di accessibilità o delle playlist elaborati da Playlist Toolkit non vengono condivisi con terzi per pubblicità, profilazione o intermediazione di dati."],
        ["7. Controlli dell'utente", "Puoi disattivare il servizio di accessibilità in qualsiasi momento nelle impostazioni Android; le funzioni di automazione non saranno più disponibili. Puoi eliminare i dati locali dalle impostazioni Android o disinstallando l'app."],
        ["8. Minori", "L'app non è rivolta specificamente ai minori e non raccogliamo consapevolmente dati personali di minori."],
        ["9. Modifiche e contatti", `Possiamo aggiornare l'informativa per modifiche dell'app o requisiti legali. La data è indicata sopra. Contatto: ${supportEmail}.`],
      ],
    },
    support: {
      title: "Assistenza",
      lead: "Aiuto per compatibilità, accessibilità, abbonamento e gestione delle playlist.",
      sections: [
        ["Prima di contattarci", "Apri il controllo di compatibilità e verifica che il servizio di accessibilità sia attivo. Se Amazon Music è stato aggiornato, ripeti il controllo. Davanti a una schermata sconosciuta, l'app si arresta intenzionalmente invece di proseguire."],
        ["Cosa indicare", "Comunica modello del dispositivo, versione Android, versione Amazon Music, lingua, funzione interessata e messaggio di errore. Non inviare password, dati di pagamento o informazioni personali non necessarie."],
        ["Abbonamenti e rimborsi", "Google Play gestisce abbonamenti, annullamenti e opzioni di rimborso disponibili. Usa la gestione di abbonamenti e ordini del tuo account Google Play."],
        ["Contatti", `E-mail di assistenza: ${supportEmail}`],
      ],
    },
    terms: {
      title: "Condizioni d'uso",
      lead: "Condizioni applicabili all'uso di Playlist Toolkit.",
      sections: [
        ["1. Accettazione", "Installando o utilizzando Playlist Toolkit accetti queste condizioni. Se non le accetti, non usare l'app."],
        ["2. Servizio", "L'app aiuta a gestire le playlist operando sull'interfaccia visibile di una versione compatibile di Amazon Music. Non modifica Amazon Music e non accede all'account tramite un'API ufficiale di Amazon Music."],
        ["3. Accessibilità e supervisione", "L'automazione parte solo su tua richiesta. Non toccare lo schermo durante l'operazione e verifica il risultato. Puoi annullare; se l'interfaccia non è riconosciuta, l'app può arrestarsi in sicurezza."],
        ["4. Compatibilità", "Amazon Music è un servizio di terzi che può cambiare senza preavviso. Lavoriamo per mantenere la compatibilità, ma non garantiamo il funzionamento ininterrotto con ogni versione, dispositivo o configurazione dello schermo."],
        ["5. Abbonamento", "Le funzioni a pagamento sono offerte tramite abbonamento Google Play con rinnovo automatico. Prezzo, periodo, imposte, rinnovo e annullamento sono mostrati prima dell'acquisto. La gestione avviene nell'account Google Play."],
        ["6. Uso consentito", "Usa l'app solo con playlist che sei autorizzato a gestire. Non aggirare misure di protezione e non usare l'app illegalmente, abusivamente o interferendo con altri servizi."],
        ["7. Garanzie e responsabilità", "Nei limiti consentiti dalla legge, l'app è fornita senza garanzia di idoneità a uno scopo specifico. NKIS Works non risponde di modifiche, interruzioni o decisioni di servizi terzi. Restano salvi i diritti inderogabili dei consumatori."],
        ["8. Modifiche e contatti", `Possiamo modificare l'app e queste condizioni. Le modifiche importanti saranno pubblicate con una nuova data. Contatto: ${supportEmail}.`],
      ],
    },
  },
  "pt-br": {
    privacy: {
      title: "Política de Privacidade",
      lead: "Como o Playlist Toolkit trata dados de acessibilidade e outras informações no seu dispositivo Android.",
      sections: [
        ["1. Responsável", `O Playlist Toolkit é fornecido pela NKIS Works. Dúvidas sobre privacidade: ${supportEmail}.`],
        ["2. Serviço de acessibilidade", "O app usa o serviço de acessibilidade do Android somente para reconhecer telas compatíveis do Amazon Music e executar funções de gerenciamento de playlists iniciadas por você. Ele pode processar textos visíveis, propriedades e posições de controles na tela."],
        ["3. Processamento no dispositivo", "A análise da interface e a automação ocorrem no seu dispositivo. O Playlist Toolkit não transmite à NKIS Works conteúdo da tela, conteúdo das playlists ou dados de acessibilidade, e essas funções não precisam de permissão de Internet."],
        ["4. Armazenamento", "Preferências, resultados de compatibilidade e registros técnicos podem ser salvos localmente para operação, parada segura e diagnóstico. O Android os remove na desinstalação. Um registro só é compartilhado se você decidir enviá-lo ao suporte."],
        ["5. Pagamentos", "As assinaturas são processadas pelo Google Play. A NKIS Works não recebe os dados completos do cartão ou pagamento. O faturamento segue as políticas de privacidade e os termos do Google Play."],
        ["6. Venda e compartilhamento", "A NKIS Works não vende dados pessoais. Dados de acessibilidade ou de playlists processados pelo Playlist Toolkit não são compartilhados com terceiros para publicidade, criação de perfil ou comercialização de dados."],
        ["7. Seus controles", "Você pode desativar o serviço de acessibilidade a qualquer momento nas configurações do Android; as funções de automação deixarão de funcionar. É possível apagar os dados locais pelas configurações do Android ou desinstalando o app."],
        ["8. Crianças", "O app não é direcionado especificamente a crianças e não coletamos intencionalmente dados pessoais de crianças."],
        ["9. Alterações e contato", `Podemos atualizar esta política quando o app ou as exigências legais mudarem. A data aparece acima. Contato: ${supportEmail}.`],
      ],
    },
    support: {
      title: "Suporte",
      lead: "Ajuda com compatibilidade, acessibilidade, assinatura e gerenciamento de playlists.",
      sections: [
        ["Antes de entrar em contato", "Abra a verificação de compatibilidade e confirme se o serviço de acessibilidade está ativo. Se o Amazon Music foi atualizado, verifique novamente. Diante de uma tela desconhecida, o app para de propósito em vez de continuar."],
        ["O que informar", "Inclua modelo do aparelho, versão do Android, versão do Amazon Music, idioma, função afetada e mensagem de erro. Não envie senhas, dados de pagamento ou informações pessoais desnecessárias."],
        ["Assinaturas e reembolsos", "O Google Play gerencia assinaturas, cancelamentos e opções de reembolso disponíveis. Use o gerenciamento de assinaturas e pedidos da sua conta do Google Play."],
        ["Contato", `E-mail de suporte: ${supportEmail}`],
      ],
    },
    terms: {
      title: "Termos de Uso",
      lead: "Condições aplicáveis ao uso do Playlist Toolkit.",
      sections: [
        ["1. Aceitação", "Ao instalar ou usar o Playlist Toolkit, você concorda com estes termos. Se não concordar, não use o app."],
        ["2. Serviço", "O app auxilia no gerenciamento de playlists operando a interface visível de uma versão compatível do Amazon Music. Ele não modifica o Amazon Music nem acessa sua conta por uma API oficial do Amazon Music."],
        ["3. Acessibilidade e supervisão", "A automação só é executada quando você solicita. Não toque na tela durante a operação e confira o resultado. Você pode cancelar; se a interface não for reconhecida, o app poderá parar com segurança."],
        ["4. Compatibilidade", "O Amazon Music é um serviço de terceiros e pode mudar sem aviso. Buscamos manter a compatibilidade, mas não garantimos funcionamento ininterrupto com todas as versões, aparelhos ou configurações de tela."],
        ["5. Assinatura", "Os recursos pagos são oferecidos por assinatura renovável automaticamente no Google Play. Preço, período, tributos, renovação e cancelamento são exibidos antes da compra. A assinatura é gerenciada na sua conta do Google Play."],
        ["6. Uso permitido", "Use o app somente com playlists que você está autorizado a gerenciar. Não contorne proteções nem use o app de forma ilegal, abusiva ou que interfira em outros serviços."],
        ["7. Garantias e responsabilidade", "Na medida permitida por lei, o app é fornecido sem garantia de adequação a uma finalidade específica. A NKIS Works não responde por mudanças, interrupções ou decisões de serviços de terceiros. Direitos obrigatórios do consumidor permanecem válidos."],
        ["8. Alterações e contato", `Podemos modificar o app e estes termos. Alterações importantes serão publicadas com uma nova data. Contato: ${supportEmail}.`],
      ],
    },
  },
};

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function render(locale, type, doc) {
  const c = common[locale];
  const base = `${productPath}/${locale}`;
  const canonical = `${site}${base}/${type}/`;
  const alternates = [
    ["en", `${productPath}/${type}/`],
    ["ja", `${productPath}/ja/${type}/`],
    ...Object.entries(common).map(([slug, item]) => [item.lang, `${productPath}/${slug}/${type}/`]),
    ["x-default", `${productPath}/${type}/`],
  ].map(([language, path]) => `  <link rel="alternate" hreflang="${language}" href="${site}${path}">`).join("\n");
  const cards = doc.sections.map(([heading, text]) => {
    const email = escapeHtml(supportEmail);
    const body = escapeHtml(text).replaceAll(email, `<a href="mailto:${email}">${email}</a>`);
    return `<section class="legal-card"><h2>${escapeHtml(heading)}</h2><p>${body}</p></section>`;
  }).join("\n");
  const languageLinks = Object.entries(common).map(([slug, item]) => `<a href="${productPath}/${slug}/${type}/" hreflang="${item.lang}">${escapeHtml(item.label)}</a>`).join("\n");
  return `<!doctype html>
<html lang="${c.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(doc.lead)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${canonical}">
${alternates}
  <link rel="stylesheet" href="/assets/playlist-toolkit-legal.css">
  <title>${escapeHtml(doc.title)} | Playlist Toolkit</title>
</head>
<body>
  <header class="legal-header">
    <nav class="legal-nav" aria-label="Playlist Toolkit">
      <a class="legal-brand" href="${base}/">Playlist Toolkit</a>
      <div class="legal-links">
        <a href="${base}/">${c.home}</a>
        <a href="${base}/privacy/">${c.privacy}</a>
        <a href="${base}/support/">${c.support}</a>
        <a href="${base}/terms/">${c.terms}</a>
      </div>
    </nav>
  </header>
  <main class="legal-main">
    <span class="legal-eyebrow">${c.eyebrow}</span>
    <h1>${escapeHtml(doc.title)}</h1>
    <p class="legal-lead">${escapeHtml(doc.lead)}</p>
    <p class="legal-updated">${c.updated}: ${updated}</p>
    <div class="legal-sections">${cards}</div>
  </main>
  <footer class="legal-footer">
    <div class="language-links" aria-label="Languages">${languageLinks}</div>
    <p>${escapeHtml(c.independent)}</p>
    <p>© 2026 NKIS Works</p>
  </footer>
</body>
</html>`;
}

const root = process.cwd();
const dist = resolve(root, "dist");
await mkdir(resolve(dist, "assets"), { recursive: true });
await copyFile(resolve(root, "assets/playlist-toolkit-legal.css"), resolve(dist, "assets/playlist-toolkit-legal.css"));

for (const [locale, localeDocuments] of Object.entries(documents)) {
  for (const [type, doc] of Object.entries(localeDocuments)) {
    const destination = resolve(dist, `products/playlist-toolkit/${locale}/${type}`);
    await mkdir(destination, { recursive: true });
    await writeFile(resolve(destination, "index.html"), render(locale, type, doc), "utf8");
  }
}
