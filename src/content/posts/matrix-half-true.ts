import type { Post } from "../types";

/**
 * Every factual claim here was checked against a source before publishing:
 * Snopes and the production designer on the code, the VFX team on bullet time,
 * Will Smith's own account, Lilly Wachowski's 2020 interview, and the Academy
 * records. Where sources disagree (the exact camera count), the text says so.
 */
export const matrixHalfTrue: Post = {
  slug: "matrix-half-true",
  date: "2026-09-21",
  minutes: { tr: 7, en: 7 },
  cover: {
    src: "/blog/matrix-cover.jpg",
    alt: {
      tr: "Karanlıkta siyah bir taş üzerinde tek bir somonlu nigiri; üzerinden buhar gibi yükselen soluk yeşil dijital karakter sütunları.",
      en: "A single salmon nigiri on a dark slate, with faint columns of green digital glyphs rising from it like steam.",
    },
  },

  body: {
    tr: {
      kicker: "// efsane kontrolü",
      title: "Matrix hakkında bildiğin her şey yarı doğru.",
      lead:
        "Matrix, üzerine en çok konuşulan filmlerden biri — bu da hakkında 'bilinen' şeylerin çoğunun anlatıla anlatıla kaydığı anlamına geliyor. Meşhur hikâyelerden altısı, gerçekten orada olan insanların anlattıklarıyla karşılaştırıldı.",
      blocks: [
        { type: "h2", text: "“Yeşil kod suşi tarifidir”" },
        { type: "p", text: "**Yarı doğru.** Dijital yağmuru yapım tasarımcısı Simon Whiteley tasarladı. Karısı Japon; Whiteley onun yemek kitaplarındaki karakterleri tarayıp dijital olarak işledi." },
        { type: "p", text: "Ama ekrana çıkan şey okunabilir bir tarif değil. Son hâli, **aynalanmış yarım genişlik katakana** ile Latin harfleri ve rakamlardan oluşan özel bir yazı tipi. Kaynağı mutfak, ama çıktı tamamen stilize." },
        { type: "aside", text: "Bu sayfanın arkasındaki yağmur da aynı hileyi kullanıyor: yarım genişlik katakana, çalışma anında aynalanarak çiziliyor. Eğer o sütunlarda suşi tarifi arıyorsan, üzgünüm — ben de bulamadım." },

        { type: "h2", text: "“Bullet time ağır çekimdir”" },
        { type: "p", text: "**Değil.** Ağır çekim, oynattığından daha hızlı çekmek demektir. Bullet time hiçbir şeyi yavaşlatmaz: bir anı dondurur ve kamerayı o anın içinden geçirir." },
        { type: "p", text: "Oyuncunun etrafına bir yay boyunca yaklaşık **120 fotoğraf makinesi** dizildi — kaynaklar 120 ile 121 arasında değişiyor — ve iki ucuna birer sinema kamerası kondu. Makineler hassas bir sırayla ateşlendi; her fotoğraf bir kare oldu. Aradaki boşluklar kare enterpolasyonu ve optical flow ile dolduruldu, arka planlar fotogrametriyle kuruldu." },
        { type: "figure", chart: "bullet-rig", caption: "Düzeneğin sadeleştirilmiş üstten görünümü. Noktalar temsilidir, her makineyi tek tek göstermez." },
        { type: "p", text: "Ekip John Gaeta ve Manex Visual Effects liderliğindeydi; Kim Libreri, Dan Piponi ve George Borshukov gibi isimlerle birlikte." },
        { type: "quote", text: "O kadar hızlı hareket eden bir kamera yapamadılar. Onun yerine hiç hareket etmeyen bir sürü kamera yapıp aradaki boşluğu yazılımla doldurdular." },
        { type: "p", text: "Sinema tarihindeki en yazılımcı kafalı çözüm bu olabilir." },

        { type: "h2", text: "“Baudrillard hakkında bir film”" },
        { type: "p", text: "**Baudrillard böyle düşünmüyordu.** Wachowski'ler, Jean Baudrillard'ın *Simulakrlar ve Simülasyon* kitabını oyunculara okuma ödevi olarak verdi. Filmde de görünüyor: Neo, hacker zulasını içi oyulmuş bir kopyasında saklıyor." },
        { type: "p", text: "Ama Baudrillard filmin kendi çalışmasıyla ilgisi olmadığını söyledi. Anlaşmazlık şurada: Matrix, simülasyonun altında uyanabileceğin gerçek bir dünya olduğunu varsayıyor. Baudrillard'ın iddiası ise tam tersiydi — öyle bir zemin yok, simülasyondan başka bir şey yok." },
        { type: "p", text: "Yani filmin felsefe okuma listesi verildi, okundu ve yazarı tarafından reddedildi. Kütüphanesinin, geliştiricisinin hiç kastetmediği bir şekilde kullanıldığını görmüş herkes bu hissi tanır." },

        { type: "h2", text: "“Will Smith rolü reddetti”" },
        { type: "p", text: "**Doğru — ve sebebi efsaneden daha iyi.** Men in Black'in ardından Neo rolü teklif edilen Smith, onun yerine *Wild Wild West*'i çekti." },
        { type: "p", text: "Sonradan anlattığına göre sunum kafasını karıştırmıştı; Wachowski'lerin fikri anlatmakta kötü bir iş çıkardığını söyledi. O versiyonda Morpheus için Val Kilmer'ın düşünüldüğünü de anlattı." },
        { type: "p", text: "Matrix dünya çapında yaklaşık **463,5 milyon dolar**, Wild Wild West yaklaşık **222,1 milyon dolar** hasılat yaptı. Aradaki fark kabaca 240 milyon dolar." },
        { type: "p", text: "Her yazılımcı parlak bir fikrin kötü bir demoda öldüğünü görmüştür. Bu, onun 240 milyon dolarlık versiyonu." },

        { type: "h2", text: "“Sadece bir aksiyon filmi”" },
        { type: "p", text: "**Yaratıcıları başka diyor.** Lilly Wachowski 2020'de, üçlemenin asıl niyetinin bir trans alegorisi olduğunu söyledi: dönüşüm arzusu üzerine, dolaptaki birinin bakış açısından anlatılmış bir hikâye. Dünyanın, özellikle de kurumsal dünyanın o zaman buna hazır olmadığını ekledi." },
        { type: "p", text: "Filme giremeyen bir ayrıntı: Switch karakteri, gerçek dünyada bir erkek, Matrix'in içinde bir kadın olarak yazılmıştı. İki yönetmen de üçleme tamamlandıktan sonra trans olduklarını açıkladı — Lana 2010'da, Lilly 2016'da." },

        { type: "h2", text: "“Efektleriyle kazandı”" },
        { type: "p", text: "**Dört şeyle kazandı.** Matrix dört Oscar aldı: Kurgu, Ses, Ses Efekti Kurgusu ve Görsel Efekt." },
        { type: "p", text: "Görsel efekt ödülü, teknik kategorileri silip süpürmesi beklenen *Star Wars: Bölüm I*'in çıktığı yıl geldi. O film yaklaşık 115 milyon dolara mal olmuştu; Matrix'in bütçesi ise yaklaşık 63 milyon dolardı." },

        { type: "h2", text: "Bunu neden bir yazılımcının sitesinde yazıyorum" },
        { type: "p", text: "Çünkü ders film hakkında değil. Bu hikâyelerin her biri 'doğru' hâline gelene kadar tekrarlandı ve her biri biraz yanlıştı." },
        { type: "p", text: "Kod tabanları da aynı efsanelerle dolu: “o fonksiyon yavaş”, “o modüle dokunamayız”, “önbellek düzeltiyor”. İki yerde de çözüm aynı — kaynağa geri dön ve gerçekte ne yazdığını oku." },
        { type: "quote", text: "Kırmızı hap bu. Filmdeki kadar dramatik değil. Çoğunlukla sadece okumak." },
      ],
    },

    en: {
      kicker: "// folklore check",
      title: "Everything you know about The Matrix is half true.",
      lead:
        "The Matrix is one of the most retold films ever made, which means most of what people 'know' about it has been repeated until it drifted. Six of the famous stories, checked against the people who were actually there.",
      blocks: [
        { type: "h2", text: "“The code is sushi recipes”" },
        { type: "p", text: "**Half true.** The digital rain was designed by production designer Simon Whiteley. His wife is Japanese, and he scanned characters out of her cookbooks and reworked them digitally." },
        { type: "p", text: "But what ended up on screen isn't a readable recipe. The final version is a custom typeface of **mirrored half-width katakana** plus Latin letters and numerals. The source was a kitchen; the output is thoroughly stylised." },
        { type: "aside", text: "The rain behind this page uses the same trick: half-width katakana, drawn mirrored at runtime. If you've been reading those columns for sushi instructions, I'm sorry — I couldn't find any either." },

        { type: "h2", text: "“Bullet time is slow motion”" },
        { type: "p", text: "**It isn't.** Slow motion means filming faster than you play back. Bullet time doesn't slow anything down: it freezes a single moment and moves the camera through it." },
        { type: "p", text: "Around **120 still cameras** were set on an arc around the actor — sources put it at 120 or 121 — with a motion-picture camera at each end. They fired in a precisely timed sequence, and each still became one frame. The gaps were filled with frame interpolation and optical flow, and the backgrounds were built with photogrammetry." },
        { type: "figure", chart: "bullet-rig", caption: "A simplified top-down view of the rig. The dots are representative, not one per camera." },
        { type: "p", text: "The work was led by John Gaeta and Manex Visual Effects, with Kim Libreri, Dan Piponi and George Borshukov among many others." },
        { type: "quote", text: "They couldn't build a camera that moved that fast. So they built a lot of cameras that didn't move at all, and wrote software to fill in the gaps." },
        { type: "p", text: "It may be the most developer-shaped solution in the history of film." },

        { type: "h2", text: "“It's a film about Baudrillard”" },
        { type: "p", text: "**Baudrillard disagreed.** The Wachowskis made Jean Baudrillard's *Simulacra and Simulation* required reading for the cast. It's on screen, too: Neo keeps his hacker stash in a hollowed-out copy." },
        { type: "p", text: "But Baudrillard said the film had nothing to do with his work. The disagreement is this: The Matrix assumes there's a real world underneath the simulation that you can wake up into. Baudrillard's argument was the opposite — there's no such floor; the simulation is all there is." },
        { type: "p", text: "So the film's philosophy reading list was assigned, read, and rejected by its author. Anyone who has watched their library get used in a way the maintainer never intended will recognise the feeling." },

        { type: "h2", text: "“Will Smith turned it down”" },
        { type: "p", text: "**True — and the reason is better than the legend.** Offered Neo off the back of Men in Black, Smith made *Wild Wild West* instead." },
        { type: "p", text: "His own account since: the pitch confused him, and he has said the Wachowskis did a bad job of explaining it. He's also said that in that version, Val Kilmer was being considered for Morpheus." },
        { type: "p", text: "The Matrix grossed about **$463.5 million** worldwide. Wild Wild West grossed about **$222.1 million**. The gap is roughly $240 million." },
        { type: "p", text: "Every developer has watched a brilliant idea die in a bad demo. This is the $240 million version." },

        { type: "h2", text: "“It's just an action film”" },
        { type: "p", text: "**Its makers say otherwise.** In 2020, Lilly Wachowski said the trilogy's original intention was a trans allegory: a story about the desire for transformation, told from a closeted point of view. The world, and the corporate world in particular, wasn't ready for it yet, she added." },
        { type: "p", text: "One detail that didn't survive into the film: the character Switch was written as a man in the real world and a woman inside the Matrix. Both directors came out as trans after the trilogy was finished — Lana in 2010, Lilly in 2016." },

        { type: "h2", text: "“It won on its effects”" },
        { type: "p", text: "**It won on four things.** The Matrix took four Academy Awards: Film Editing, Sound, Sound Effects Editing and Visual Effects." },
        { type: "p", text: "The visual effects win came in the same year as *Star Wars: Episode I*, which was expected to sweep the technical categories. That film cost around $115 million. The Matrix cost around $63 million." },

        { type: "h2", text: "Why this is on a developer's site" },
        { type: "p", text: "Because the lesson isn't about film. Every one of these stories was repeated until it became 'true', and every one of them was slightly off." },
        { type: "p", text: "Codebases are full of the same folklore: “that function is slow”, “we can't touch that module”, “the cache fixes it”. The fix is the same in both places — go back to the source and read what's actually there." },
        { type: "quote", text: "That's the red pill. It's less dramatic than the film makes it look. Mostly it's reading." },
      ],
    },
  },
};
