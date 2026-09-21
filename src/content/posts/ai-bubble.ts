import type { Post } from "../types";

export const aiBubble: Post = {
  slug: "ai-bubble",
  date: "2026-09-21",
  minutes: { tr: 8, en: 8 },
  cover: {
    src: "/blog/ai-bubble-cover.jpg",
    alt: {
      tr: "Karanlık bir sunucu salonunda süzülen dev bir sabun köpüğü; içinde parlayan bir ekran kartı, yerde tek bir iğne.",
      en: "An enormous soap bubble drifting through a dark server hall, a glowing GPU suspended inside it, a single pin on the floor below.",
    },
  },

  body: {
    tr: {
      kicker: "// sinyal ve gürültü",
      title: "Evet, balon. Hayır, önemli değil.",
      lead:
        "Yapay zeka bir balon mu diye soruyorlar. Cevabım: bal gibi balon. Ama bu soru yanlış soru — çünkü balonun patlaması, teknolojinin yanlış olduğu anlamına gelmiyor. Bir yazılımcının sahadan bakışı.",
      blocks: [
        {
          type: "p",
          text: "Geçen hafta bir yatırım sunumu gördüm. Şirketin yaptığı iş, bir metin kutusuna yazdığınız şeyi alıp bir başka metin kutusuna yazmaktı. Arada yapay zeka vardı. Değerlemesi, benim yaşadığım mahallenin tamamından yüksekti.",
        },
        {
          type: "p",
          text: "Aynı hafta, üç gün sürmesi gereken bir refactor'ı bir öğleden sonrada bitirdim. Arada yine aynı yapay zeka vardı.",
        },
        {
          type: "p",
          text: "İşte tam olarak bu yüzden \"balon mu, devrim mi?\" sorusu insanları çıldırtıyor. Çünkü ikisi aynı anda oluyor ve kimse bunu tek cümlede söylemek istemiyor. Ben söyleyeyim: **balon, teknolojinin değerlendirmesi değil, finansmanının yöntemidir.**",
        },

        { type: "h2", text: "Balon olduğunu nereden biliyoruz" },
        {
          type: "p",
          text: "Bir balonun teknik göstergesi yoktur, sosyolojik göstergesi vardır. Ve hepsi sahada:",
        },
        {
          type: "list",
          items: [
            "Ürün tanımı yerine model adı söyleyen şirketler. \"Ne yapıyorsunuz?\" sorusuna \"GPT-5 kullanıyoruz\" cevabı, \"Ne inşa ediyorsunuz?\" sorusuna \"çimento\" demek gibidir.",
            "Aynı ürünün adında \"AI\" olduğu için iki katına çıkan fiyatı. Aynı kod. Aynı sunucu. Yeni etiket.",
            "Teknik olmayan insanların teknik terimlerle konuşması. 2021'de herkes \"cüzdan\" diyordu, şimdi herkes \"ajan\" diyor. Kimse ikisinde de ne demek istediğini bilmiyor.",
            "Ve en net olanı: kimsenin kâr etmediği, ama herkesin büyüdüğü bir sektör.",
          ],
        },
        {
          type: "p",
          text: "Bunların hiçbiri teknolojinin işe yaramadığını göstermiyor. Sadece paranın, teknolojinin olgunlaşmasından daha hızlı hareket ettiğini gösteriyor. Bu da zaten balonun tanımı.",
        },

        { type: "figure", chart: "bubble-shape", caption: "Balonun şekli. Veri değil, tekrar eden bir desen — ve şu an neredeyiz sorusunun cevabı dürüstçe: bilmiyoruz." },

        { type: "h2", text: "Dot-com'un bıraktığı fatura ve miras" },
        {
          type: "p",
          text: "1999'da Pets.com'un bir kukla maskotu vardı ve Super Bowl reklamı verdi. Şirket, halka arzından dokuz ay sonra kapandı. Webvan, internetten market satmak için milyarlarca dolar yaktı ve battı. O dönem Cisco, kısa bir süre dünyanın en değerli şirketi oldu.",
        },
        {
          type: "p",
          text: "Balon patladığında Amazon hisselerinin yaklaşık %90'ını kaybetti. Bugün Amazon'un ne olduğunu biliyorsunuz.",
        },
        {
          type: "quote",
          text: "Balon, yanlış şirketleri öldürür. Altyapıyı öldürmez.",
        },
        {
          type: "p",
          text: "Dot-com döneminde telekom şirketleri, asla dolmayacağını düşündüğümüz miktarda fiber optik kablo döşedi. Sonra battılar. Kablolar yerinde kaldı. Ve o \"gereksiz\" fiber, on yıl sonra video akışını, bulut bilişimi ve bugün elinizde tuttuğunuz her şeyi mümkün kıldı.",
        },
        {
          type: "p",
          text: "Yani Pets.com'un kukla maskotuna verdiğiniz para boşa gitmedi. Sadece size gitmedi.",
        },

        { type: "image", src: "/blog/ai-bubble-fiber.jpg", alt: "Karanlık bir kablo galerisinde canlı fiber optik demetleri; altında tozlanmış, terk edilmiş 90'lar ofis ekipmanı.", caption: "Üstte hayatta kalan altyapı, altta ölen şirketler. Her balon bu iki katmanı bırakır." },

        { type: "h2", text: "Peki gerçek olan ne" },
        {
          type: "p",
          text: "Ben bir yazılımcıyım. Hype'ı ölçemem ama işimin ne kadar değiştiğini ölçebilirim. Dürüst cevap: çok değişti, ama sandığınız yerden değil.",
        },
        {
          type: "p",
          text: "Yapay zeka benim yerime kod yazmıyor. Yazdığı kodun doğru olup olmadığını hâlâ benim bilmem gerekiyor — ve işin zor kısmı zaten hep o. Değişen şey, bir seferde kafamda tutabildiğim sistemin büyüklüğü. On dosyayı aynı anda düşünebiliyorum. 392 commit'lik bir kod tabanında \"bu hata nerede\" sorusunu grep'le değil, yapıyla cevaplayabiliyorum.",
        },
        {
          type: "p",
          text: "Karşılığında yeni bir beceri öğrenmek zorunda kaldım: **makul olanla doğru olanı ayırmak.** Model size her zaman kendinden emin bir cevap verir. Cevabın yanlış olduğunu anlamanın tek yolu, sistemi zaten anlıyor olmanız.",
        },
        {
          type: "aside",
          text: "Üç yıl onkolojide, klinik veriyi okuyup doktorun önüne cevap koyan ürünlerde çalıştım. Orada makul görünen yanlış bir cevap, bir hata kaydı değil — bir hastadır. Bu, \"AI bazen uyduruyor\" cümlesinin ne kadar hafif kaldığını öğreten bir okul oldu.",
        },
        {
          type: "p",
          text: "Yani evet, devrim gerçek. Ama devrim \"yazılımcılar bitti\" devrimi değil. \"Bir kişinin taşıyabileceği karmaşıklık arttı\" devrimi. Bunlar çok farklı iki cümle ve yatırım sunumları hep birincisini satıyor.",
        },

        { type: "h2", text: "Patladıktan sonra ne kalacak" },
        {
          type: "p",
          text: "Sunum yapan şirketlerin çoğu gidecek. \"AI destekli\" etiketini ürününe yapıştırıp fiyatını ikiye katlayanlar gidecek. Ajan kelimesini bir metin kutusu için kullananlar gidecek.",
        },
        { type: "figure", chart: "leftovers", caption: "Her balonun ardında kalanlar aynı kategorilerden çıkıyor: donanım, ucuzlayan kapasite ve bir şeyi gerçekten kurmuş insanlar." },
        {
          type: "p",
          text: "Kalacak olanlar şunlar: döşenen hesaplama kapasitesi, ucuzlamış model erişimi, bu araçlarla gerçekten bir şey inşa etmiş insanlar ve — en sıkıcısı, en değerlisi — yazılım üretme biçimimizin sessizce değişmiş olması.",
        },
        {
          type: "p",
          text: "Balon patladığında gazeteler \"yapay zeka bitti\" yazacak. O sırada birileri, kimsenin bakmadığı bir yerde, ucuzlamış kapasiteyle hiç mümkün olmayan bir şey kuruyor olacak. Her seferinde böyle oldu.",
        },
        {
          type: "quote",
          text: "Balon bir yargı değil, bir finansman biçimi. Fatura yatırımcıya, kablolar bize kalıyor.",
        },
        {
          type: "p",
          text: "O yüzden \"balon mu?\" sorusuna cevabım: evet. Ve ben bu sırada iş yapmaya devam edeceğim, çünkü patlayacak olan şey benim editörümdeki araç değil — birinin slaytındaki değerleme.",
        },
      ],
    },

    en: {
      kicker: "// signal and noise",
      title: "Yes, it's a bubble. No, that isn't the point.",
      lead:
        "People keep asking whether AI is a bubble. It is, obviously. But that is the wrong question — a bubble popping has never meant the technology was wrong. A working developer's view from the floor.",
      blocks: [
        {
          type: "p",
          text: "Last week I saw a pitch deck. The company's product took what you typed into one text box and put it into another text box. There was AI in between. Its valuation was higher than the entire neighbourhood I live in.",
        },
        {
          type: "p",
          text: "That same week I finished a refactor in an afternoon that should have taken three days. There was AI in between there too.",
        },
        {
          type: "p",
          text: "This is exactly why \"bubble or revolution?\" drives everyone mad. Both are happening at once, and nobody wants to put that in one sentence. So I will: **a bubble is not a verdict on the technology, it is a way of financing it.**",
        },

        { type: "h2", text: "How we know it's a bubble" },
        {
          type: "p",
          text: "A bubble has no technical indicator. It has sociological ones, and all of them are visible from the floor:",
        },
        {
          type: "list",
          items: [
            "Companies that answer \"what do you do?\" with a model name. Saying \"we use GPT-5\" is like answering \"what are you building?\" with \"cement\".",
            "The same product, twice the price, because the word AI is now in the name. Same code. Same servers. New sticker.",
            "Non-technical people fluent in technical words. In 2021 everyone said \"wallet\". Now everyone says \"agent\". Nobody knew what they meant either time.",
            "And the clearest one: an industry where nobody makes money and everybody grows.",
          ],
        },
        {
          type: "p",
          text: "None of this means the technology doesn't work. It means money is moving faster than the technology is maturing. Which is the definition of a bubble.",
        },

        { type: "figure", chart: "bubble-shape", caption: "The shape of a bubble. Not data — a pattern that keeps repeating. Where we are on it right now, honestly: nobody knows." },

        { type: "h2", text: "The dot-com invoice, and what it paid for" },
        {
          type: "p",
          text: "In 1999 Pets.com had a sock puppet mascot and a Super Bowl ad. The company shut down nine months after going public. Webvan burned billions selling groceries online and collapsed. For a brief moment in that era, Cisco was the most valuable company in the world.",
        },
        {
          type: "p",
          text: "When it popped, Amazon lost roughly 90% of its value. You know how that one turned out.",
        },
        { type: "quote", text: "A bubble kills the wrong companies. It does not kill the infrastructure." },
        {
          type: "p",
          text: "During dot-com, telecoms laid far more fibre optic cable than anyone believed would ever be filled. Then they went bankrupt. The cable stayed in the ground. A decade later that \"excess\" fibre is what made video streaming, cloud computing and most of what is in your pocket possible.",
        },
        {
          type: "p",
          text: "So the money you put into a sock puppet wasn't wasted. It just wasn't returned to you.",
        },

        { type: "image", src: "/blog/ai-bubble-fiber.jpg", alt: "Live fibre optic bundles running through a dark cable vault, with dusty abandoned 1990s office equipment on the floor beneath them.", caption: "Surviving infrastructure above, dead companies below. Every bubble leaves both layers behind." },

        { type: "h2", text: "So what is actually real" },
        {
          type: "p",
          text: "I'm a developer. I can't measure hype, but I can measure how much my work changed. The honest answer: a lot, though not where you'd expect.",
        },
        {
          type: "p",
          text: "AI does not write my code for me. I still have to know whether what it wrote is correct — and that was always the hard part. What changed is the size of the system I can hold in my head at once. I can reason across ten files. In a codebase with 392 commits I can answer \"where is this bug\" from structure instead of from grep.",
        },
        {
          type: "p",
          text: "In exchange I had to learn a new skill: **telling the plausible from the correct.** A model always answers confidently. The only way to notice it is wrong is to already understand the system.",
        },
        {
          type: "aside",
          text: "I spent three years in oncology, on products that read clinical data and put an answer in front of a doctor. There, a plausible wrong answer is not a bug report — it is a patient. That job taught me how weak the sentence \"AI sometimes hallucinates\" really is.",
        },
        {
          type: "p",
          text: "So yes, the revolution is real. But it is not the \"developers are finished\" revolution. It is the \"one person can carry more complexity\" revolution. Those are very different sentences, and pitch decks only ever sell the first one.",
        },

        { type: "h2", text: "What survives the pop" },
        {
          type: "p",
          text: "Most of the companies making those decks will go. So will everyone who stuck an \"AI-powered\" label on their product and doubled the price. So will everyone using the word agent to describe a text box.",
        },
        { type: "figure", chart: "leftovers", caption: "What a bubble leaves behind falls into the same categories every time: hardware, capacity that got cheap, and people who actually built something." },
        {
          type: "p",
          text: "What stays: the compute that got built, model access that got cheap, the people who actually built something with these tools, and — the dullest and most valuable of all — the fact that how we make software quietly changed.",
        },
        {
          type: "p",
          text: "When it pops, the headlines will read \"AI is over\". Meanwhile, somewhere nobody is looking, someone will be building something that was never possible before, on capacity that just got cheap. It has gone this way every single time.",
        },
        { type: "quote", text: "A bubble isn't a verdict, it's a funding mechanism. Investors get the invoice; we get the cable." },
        {
          type: "p",
          text: "So when someone asks me if it's a bubble: yes. And I'll keep working through it, because the thing about to pop isn't the tool in my editor — it's a valuation on somebody's slide.",
        },
      ],
    },
  },
};
