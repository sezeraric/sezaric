import type { BootLine, Dictionary } from "./en";

/** Turkish copy. Written, not machine-translated — the jokes do not survive that. */
export const tr: Dictionary = {
  meta: {
    htmlLang: "tr",
    role: "Kıdemli Yazılım Geliştirici",
    focus: "React · React Native · .NET",
    tagline:
      "Web ve mobil ürünleri uçtan uca kuruyorum — arayüzü, arkasındaki servisleri ve ikisinin de gerçek kullanıcıyla karşılaşınca ayakta kalıp kalmayacağını belirleyen performans işini.",
    location: "Kadıköy, İstanbul",
    keywords: [
      "Furkan Sezer Ariç",
      "yazılım geliştirici",
      "React Native",
      "mobil geliştirici",
      "yapay zeka",
      "TypeScript",
    ],
  },

  nav: {
    items: [
      { id: "hero", label: "Başlangıç" },
      { id: "bullet-time", label: "Bullet time" },
      { id: "about", label: "Hakkımda" },
      { id: "experience", label: "Deneyim" },
      { id: "work", label: "İşler" },
      { id: "ai", label: "Yapay zeka" },
    ],
    blog: "Yazılar",
    contact: "İletişim",
    backHome: "Siteye dön",
    languageLabel: "Dil",
    skipToContent: "İçeriğe geç",
  },

  boot: <BootLine[]>[
    { text: "$ ssh sezeraric@matrix --identity=./portfolio", delay: 0 },
    { text: "Bağlantı kuruluyor ...", delay: 420 },
    { text: "Bağlantı kuruldu.", delay: 380, tone: "ok" },
    { text: "", delay: 120 },
    { text: "Uyan, Furkan...", delay: 900, tone: "accent" },
    { text: "Kod seni ele geçirdi.", delay: 700, tone: "accent" },
    { text: "Beyaz tavşanı takip et.", delay: 700, tone: "accent" },
  ],

  hero: { scroll: "Kaydır" },

  bullets: [
    { label: "ANR", detail: "Android'i donduran ana iş parçacığı kilitleri" },
    { label: "OOM", detail: "Düşük bellekli cihazlarda çöken uygulamalar" },
    { label: "JANK", detail: "Kaydırma ve jest sırasında düşen kareler" },
    { label: "RACE", detail: "Birbirinin state'ini ezen eşzamanlı istekler" },
    { label: "LEAK", detail: "Ekrandan uzun yaşayan dinleyiciler ve sayaçlar" },
    { label: "SOĞUK AÇILIŞ", detail: "İlk piksel gelene kadar geçen boş saniyeler" },
    { label: "ÇÖKME DÖNGÜSÜ", detail: "Açılışta patlayıp oturumu kilitleyen hatalar" },
    { label: "REGRESYON", detail: "Dünkü düzeltmenin bugünkü akışı bozması" },
  ],

  bulletTime: {
    eyebrow: "// bullet time",
    incoming: "// geliyor",
    resolved: "// atlatıldı",
    title: "Her şey önce bozuk çıkar.",
    body:
      "Özellik yazmak kolay kısım. Bir ürünün ayakta kalıp kalmayacağını belirleyen şey, üç yaşındaki bir telefonda, trende, %3 şarjla ve kopuk bağlantıyla nasıl davrandığı. Benim asıl işim bu.",
    outro: "Bunlardan kaçmak işin kendisi. Yan görev değil.",
  },

  about: {
    eyebrow: "// seçim",
    title: "İki türlü yazılım yapılır.",
    whoami: "// whoami",
    choose: {
      prompt: "Birini seç. Geri alma yok.",
      blueResponse:
        "Peki. Sekmeyi kapat, umutla ship etmeye devam et. Çökme raporları seni bekliyor olacak.",
      redResponse: "Güzel. Bakalım stack trace ne kadar derine iniyor.",
      tryOther: "Kırmızıyı al",
      takeBlue: "Mavi hapı al",
      takeRed: "Kırmızı hapı al",
    },
    blue: {
      pill: "Mavi hap",
      heading: "Gönder, en iyisini um.",
      body:
        "Mutlu yolu merge et, mağaza puanının düşüşünü izle, çökme raporlarını gürültü diye bir kenara at.",
    },
    red: {
      pill: "Kırmızı hap",
      heading: "Sistemin tamamını gör.",
      body:
        "Render'ı profille, native trace'i oku, elindeki en ucuz cihazda tekrar üret; sonra belirtiyi değil sebebi düzelt.",
    },
    bio: [
      "İstanbul'da kıdemli yazılım geliştiricisiyim. Önde React, React Native ve Vue.js; arkada C# / ASP.NET Core ile çalışıyorum — API tasarımı, iş mantığı ve veri katmanı dahil.",
      "Ürettiğim işlerin çoğu zor kısımların olduğu yerde: gerçek zamanlı özellikler, ödeme ve abonelik akışları, harita tabanlı servisler ve kimsenin demo yapmadığı ama herkesin bağımlı olduğu kurumsal yönetim panelleri. Üç yıl boyunca bu, on iki ülkede kullanılan klinik ürünler geliştirmek anlamına geldi.",
      "İşin gösterişsiz yarısını önemsiyorum — kare zamanlaması, soğuk açılış, bellek, ağ olmadığında ne olduğu — çünkü kullanıcının gerçekten hissettiği yarı o. Ve hattın tamamını üstleniyorum: fikirden canlıda çalışan şeye kadar.",
    ],
  },

  skills: {
    eyebrow: "// cephanelik",
    groups: [
      {
        group: "Önyüz",
        items: ["React.js", "React Native (CLI & Expo)", "Vue.js", "TypeScript", "JavaScript", "Bileşen mimarisi", "Responsive tasarım"],
      },
      {
        group: "State & Veri Akışı",
        items: ["Zustand", "Redux Toolkit", "Redux-Saga", "Context API", "REST API", "Socket.io", "SignalR"],
      },
      { group: "Arka uç", items: ["C#", ".NET / ASP.NET Core", "RESTful API", "Servis ve iş mantığı"] },
      { group: "Veri", items: ["MsSQL", "Redis", "Elasticsearch", "SQL / NoSQL sorgu optimizasyonu"] },
      {
        group: "Mobil",
        items: ["iOS / Android", "Push bildirimleri", "Haritalar", "Uygulama içi satın alma", "Firebase Auth / Firestore / FCM", "Reanimated", "Skia"],
      },
      { group: "Araçlar", items: ["GitHub", "Bitbucket", "Jira", "Postman", "Sentry", "Adjust", "CI/CD", "Birim testi"] },
    ],
  },

  experience: {
    eyebrow: "// deneyim",
    title: "Altı yıldır sahada.",
    roles: [
      {
        company: "Aren Yazılım",
        title: "Full Stack Developer",
        period: "08/2025 — günümüz",
        points: [
          "React ve Vue.js ile responsive, performans odaklı web arayüzleri.",
          ".NET ile RESTful API ve iş servisleri; önyüz ile arka ucu uçtan uca bağlama.",
          "Veritabanı, CI/CD, test ve performans çalışmalarıyla ürün kalitesini sürdürülebilir kılma.",
        ],
      },
      {
        company: "Massive Bio",
        title: "Senior React Native Developer",
        period: "08/2022 — 07/2025",
        points: [
          "Sağlık teknolojilerinde ölçeklenebilir React Native ürünleri geliştirdim ve mimari kararlarda aktif rol aldım.",
          "Mobilin yanında web projelerinde API entegrasyonu, performans ve hata yönetimini üstlendim.",
          "Karmaşık klinik ve araştırma akışlarını, insanların hızla ilerleyebildiği arayüzlere dönüştürdüm.",
        ],
      },
      {
        company: "Elephant Apps",
        title: "Middle React Native Developer",
        period: "09/2021 — 08/2022",
        points: [
          "Çapraz platform mobil uygulamalar ve web arayüzleri; API entegrasyonu ve yeniden kullanılabilir bileşenler.",
          "Performans iyileştirmeleri ve ürün kararlılığı çalışmaları.",
        ],
      },
      {
        company: "Freelance",
        title: "Full Stack Developer",
        period: "12/2019 — 09/2021",
        points: [
          "Web ve mobil projeleri uçtan uca yürüttüm: UI/UX, önyüz, API, veritabanı ve canlıya alma.",
          "Farklı müşteriler için performans optimizasyonu ve kritik hata çözümleri.",
        ],
      },
      {
        company: "Bigg Plus Group of Companies",
        title: "React Native Developer / Yazılım Geliştirici Stajyeri",
        period: "07/2019 — 12/2019",
        points: [
          "Kurumsal React Native uygulamaları, üçüncü parti entegrasyonlar ve performans çalışmaları.",
          "Önyüz-arka uç entegrasyonu, teknik planlama ve kod kalitesi.",
        ],
      },
    ],
  },

  education: {
    eyebrow: "// arka plan",
    items: [
      { label: "Anadolu Üniversitesi", value: "Yönetim Bilişim Sistemleri, Lisans" },
      { label: "Nişantaşı Üniversitesi", value: "Bilgisayar Programcılığı, Ön Lisans" },
      { label: "İngilizce", value: "B2 — profesyonel çalışma yeterliliği" },
    ],
  },

  caseStudy: {
    eyebrow: "// vaka çalışması",
    name: "MyGarage Global",
    kind: "React Native · iOS & Android",
    stackLabel: "// teknolojiler",
    shotsLabel: "// ekranlar",
    shots: [
      {
        src: "/mygarage/garage.jpg",
        alt: "MyGarage profil ekranı: üyelik durumu, takipçi sayıları, favori işletmeler ve kullanıcının araç listesi.",
        caption: "Garajın: araçlar, üyelik ve işletme moduna açılan kapı.",
      },
      {
        src: "/mygarage/vehicle.jpg",
        alt: "MyGarage'da tek bir araç: hatırlatıcılar, dijital torpido, yakıt ve masraf takibi, kilometre geçmişi ve bakım kayıtları.",
        caption: "Tek araç: hatırlatıcı, belge, yakıt, kilometre ve servis geçmişi tek yerde.",
      },
      {
        src: "/mygarage/map.jpg",
        alt: "MyGarage yakındaki servisler haritası: İstanbul'un canlı haritası, kategori filtreleri ve sıralanmış oto servis listesi.",
        caption: "Harita üzerinden keşif: iki yüz yakın servis.",
      },
    ],
    summary:
      "Otomobil ve motosiklet sahipleri için sosyal ve ticari bir platform: araçların için dijital garaj, topluluk için akış ve forum, bakım ve masraf takibi, sürüş kaydı, gerçek zamanlı mesajlaşma, harita tabanlı servis keşfi ve dükkanlar için pazar yeri.",
    stats: [
      { value: "392", label: "commit" },
      { value: "2", label: "platformda yayında" },
      { value: "60fps", label: "kaydırma hedefi tutuldu" },
      { value: "62", label: "uçtan uca test akışı" },
    ],
    highlights: [
      {
        title: "Yük altında performans",
        body:
          "230 console çağrısını __DEV__ kapısına aldım, serileştirmeyi render gövdesinden çıkardım ve statik bir ekranda 60fps yeniden çizim yaptıran boşta render'ları öldürdüm. Simülatörde değil, gerçek cihazda gfxinfo kare yakalamasıyla doğruladım.",
      },
      {
        title: "Native katman",
        body:
          "Harita pinlerinin içindeki görseller hiç yüklenmiyordu, react-native-maps'i yamaladım; Nitro modül köprüleri yazdım; her tuş vuruşunda sızan ve yıkımda stack'i taşıran bir Android TextInput state zincirini düzelttim.",
      },
      {
        title: "Ürün gibi test edildi",
        body:
          "Kimlik doğrulama, garaj, akış, sosyal, dükkan modu ve hesabı kapsayan 62 Maestro uçtan uca akışı. Tek bir QA turu bunların üzerinden 178 düzeltme çıkardı.",
      },
      {
        title: "Mimari",
        body:
          "Saga ve kalıcı state ile Redux, sıcak depolama için MMKV, gerçek zamanlı için SignalR, kimlik ve mesajlaşma için Firebase, abonelikler için uygulama içi satın alma, kaçan her şey için Sentry.",
      },
    ],
    stack: [
      "React Native", "TypeScript", "Redux-Saga", "Reanimated", "Shopify Skia",
      "FlashList", "Nitro Modules", "Vision Camera", "react-native-maps",
      "Firebase", "SignalR", "Sentry", "MMKV", "Maestro",
    ],
  },

  projects: {
    eyebrow: "// seçilmiş işler",
    title: "Yaptığım şeyler.",
    items: [
      { name: "SYNERGY-AI Cancer Trial Finder", blurb: "On iki ülkede çalışan sağlık platformu: hasta-klinik eşleştirme, otomatik rapor akışları ve klinik veri üzerinde gelişmiş filtreleme.", tags: ["React Native", "Sağlık", "Veri"] },
      { name: "Dr-Arturo AI & Ask Fiona AI", blurb: "Sağlık profesyonelleri için yapay zeka destekli klinik araştırma bulma ve onkoloji veri analizi. ASCO 2024 ve 2025'te sunuldu.", tags: ["Yapay zeka", "Onkoloji", "Ürün"] },
      { name: "Berksan Mühendislik", blurb: "Kurumsal web platformu. React önyüz, .NET arka uç servisleri ve aradaki REST katmanı; responsive yapı ve veri akışları uçtan uca.", tags: ["React", ".NET", "Web"] },
      { name: "Panel Rewards", blurb: "Sadakat ve ödül yönetim platformu: puanlar, bakiyeler, kampanyalar, işlem akışları, doğrulamalar ve hepsini işleten yönetim paneli.", tags: ["Platform", "API", "Panel"] },
      { name: "GFC Loyalty — Rewards", blurb: "Sosyal özellikleri ödül sistemine bağlayan modüler platform: puan transferi, kargo takibi ve ödeme entegrasyonları.", tags: ["Mobil", "Ödeme"] },
      { name: "ICCOUS", blurb: "Enerji ve doğalgaz tesisleri için endüstriyel takip. Saha ekipleriyle arka uç arasında gerçek zamanlı senkronizasyon sağlayan Expo tabanlı saha uygulaması.", tags: ["Expo", "Gerçek zamanlı", "Endüstriyel"] },
      { name: "E-mülk", blurb: "CBS entegreli gayrimenkul bilgi sistemi: harita tabanlı, gerçek zamanlı mülk ve varlık takibi.", tags: ["CBS", "Harita", "Web"] },
      { name: "uLouder", blurb: "Geo-fencing ve harita servisleri üzerine kurulu konum tabanlı sosyal ağ; kulüpler ve canlı akış.", tags: ["Geo-fencing", "Sosyal"] },
      { name: "Kampüs365 / iKampüs", blurb: "Okul yönetimi, içerik paylaşımı ve öğretmen-veli iletişimini kapsayan eğitim ekosistemi.", tags: ["Eğitim", "Mobil"] },
    ],
  },

  ai: {
    eyebrow: "// sinyal",
    title: "Makineler işin içine böyle girdi.",
    body:
      "Üç yıl boyunca işim onkolojide uygulamalı yapay zekanın yanı başındaydı — klinik veriyi okuyup bir doktorun önüne cevap koyan ürünler. Orada makul görünen yanlış bir cevap hata kaydı değil, bir hastadır.",
    notes: [
      { title: "Demoda değil, klinikte yapay zeka", body: "Dr-Arturo AI ve Ask Fiona AI, sağlık profesyonellerinin klinik araştırma bulmasına ve onkoloji verisini anlamlandırmasına yardım ediyor. Benim tarafım ürün katmanıydı: model çıktısını bir klinisyenin üzerine işlem yapabileceği bir şeye çevirmek ve belirsizliği gizlemek yerine okunur kılmak." },
      { title: "Ölçekte eşleştirme", body: "SYNERGY-AI on iki ülkede hastaları araştırmalarla eşleştiriyor. Zor kısım hiçbir zaman eşleştirmenin kendisi değildi — eşleşmeyi güvenilir kılan filtreleme, raporlama ve veri hijyeniydi." },
      { title: "Şimdi nasıl çalışıyorum", body: "Büyük refactor'ları, QA turlarını ve göçleri kodlama ajanları üzerinden, dar ve doğrulanabilir başarı ölçütleriyle yürütüyorum. Beceri, bağlam tasarımı ve tam olarak neyi kontrol edeceğini bilmek. Darboğaz yazmaktan muhakemeye kaydı — doğru bir sistemi makul görünen bir sistemden ayırmak işin kendisi hâline geliyor." },
    ],
  },

  contact: {
    eyebrow: "// hattın sonu",
    title: "Kaşık diye bir şey yok.",
    body: "Ama bir gelen kutusu var. Gerçek cihazlarda, gerçek kullanıcılar için çalışmak zorunda olan bir şey kuruyorsan yaz.",
    cta: "Mesaj gönder",
    links: { email: "E-posta", github: "GitHub", linkedin: "LinkedIn", x: "X" },
    profileLabel: "Profil",
  },

  footer: {
    built: "Next.js, three.js ve fazlaca kahveyle yapıldı",
  },

  blog: {
    eyebrow: "// yazılar",
    title: "Sahadan notlar.",
    lead: "Yazılım geliştirmek ve şu sıralar onun yüzünden aklını kaçıran sektör üzerine ara sıra yazılar.",
    readingTime: "{n} dk okuma",
    backToList: "Tüm yazılar",
    publishedOn: "Yayın",
    alsoIn: "Şu dilde de var",
    charts: {
      bubbleShape: {
        axis: "zamana karşı ilgi ve para",
        description:
          "Yavaş yükselen, sıçrayan, çöken ve başladığı yerin üstünde duran bir eğri.",
        phases: ["teknoloji", "hikâye", "para", "herkes", "pop", "altyapı"],
      },
      leftovers: {
        description: "Bir balonun yok ettikleri ve geride bıraktıkları.",
        deadHead: "Gider",
        aliveHead: "Kalır",
        dead: ["Değerlemeler", "\"AI destekli\" etiketler", "Ürünsüz sunumlar", "Ajan kelimesi"],
        alive: ["Kurulan hesaplama gücü", "Ucuzlayan erişim", "Gerçekten üretenler", "Yazılım yazma biçimimiz"],
      },
    },
    empty: "Henüz yayınlanmış yazı yok.",
  },
};
