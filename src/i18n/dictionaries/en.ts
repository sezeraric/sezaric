/** A line in the hero's boot sequence. */
export type BootLine = { text: string; delay: number; tone?: "ok" | "accent" };

/**
 * English copy. This file is the source of truth for the shape of a
 * dictionary — `Dictionary` is inferred from it, so adding a key here makes
 * TypeScript demand the same key in every other language.
 */
export const en = {
  meta: {
    htmlLang: "en",
    role: "Senior Software Developer",
    focus: "React · React Native · .NET",
    tagline:
      "I build web and mobile products end to end — the interface, the services behind it, and the performance work that decides whether either one survives contact with real users.",
    location: "Kadıköy, İstanbul",
    keywords: [
      "Furkan Sezer Ariç",
      "software engineer",
      "React Native",
      "mobile developer",
      "AI engineer",
      "TypeScript",
    ],
  },

  nav: {
    items: [
      { id: "hero", label: "Start" },
      { id: "bullet-time", label: "Bullet time" },
      { id: "about", label: "About" },
      { id: "experience", label: "Experience" },
      { id: "work", label: "Work" },
      { id: "ai", label: "AI" },
    ],
    blog: "Writing",
    contact: "Contact",
    backHome: "Back to the site",
    languageLabel: "Language",
    skipToContent: "Skip to content",
  },

  boot: <BootLine[]>[
    { text: "$ ssh sezeraric@matrix --identity=./portfolio", delay: 0 },
    { text: "Establishing connection ...", delay: 420 },
    { text: "Connection established.", delay: 380, tone: "ok" },
    { text: "", delay: 120 },
    { text: "Wake up, Furkan...", delay: 900, tone: "accent" },
    { text: "The codebase has you.", delay: 700, tone: "accent" },
    { text: "Follow the white rabbit.", delay: 700, tone: "accent" },
  ],

  hero: { scroll: "Scroll" },

  bullets: [
    { label: "ANR", detail: "Main-thread blocks that freeze Android" },
    { label: "OOM", detail: "Out-of-memory kills on low-end devices" },
    { label: "JANK", detail: "Dropped frames during scroll and gesture" },
    { label: "RACE", detail: "Concurrent requests overwriting state" },
    { label: "LEAK", detail: "Listeners and timers that outlive the screen" },
    { label: "COLD START", detail: "Seconds of blank screen before first paint" },
    { label: "CRASH LOOP", detail: "Boot-time failures that brick the session" },
    { label: "REGRESSION", detail: "Yesterday's fix breaking today's flow" },
  ],

  bulletTime: {
    eyebrow: "// bullet time",
    incoming: "// incoming",
    resolved: "// resolved",
    title: "Everything ships broken first.",
    body:
      "Features are the easy part. What decides whether a product survives is how it behaves on a three-year-old phone, on a train, with 3% battery and a flaky connection. That is the work I actually do.",
    outro: "Dodging these is the job. Not a side quest.",
  },

  about: {
    eyebrow: "// the choice",
    title: "Two ways to build.",
    whoami: "// whoami",
    blue: {
      pill: "Blue pill",
      heading: "Ship it and hope.",
      body:
        "Merge the happy path, watch the store rating drift down, and file the crash reports under noise.",
    },
    red: {
      pill: "Red pill",
      heading: "See the whole system.",
      body:
        "Profile the render, read the native trace, reproduce it on the cheapest device you own, then fix the cause instead of the symptom.",
    },
    bio: [
      "I'm a senior software developer in İstanbul. I work across React, React Native and Vue.js on the front, and C# / ASP.NET Core on the back — API design, business logic and the data layer included.",
      "Most of what I've shipped lives where the hard parts are: realtime features, payment and subscription flows, map-based services, and the enterprise admin panels nobody demos but everybody depends on. For three years that meant health technology, building clinical products used across twelve countries.",
      "I care about the unglamorous half — frame timing, cold start, memory, what happens when the network isn't there — because that is the half users actually feel. And I own the whole line: from the idea to the thing running in production.",
    ],
  },

  skills: {
    eyebrow: "// arsenal",
    groups: [
      {
        group: "Frontend",
        items: ["React.js", "React Native (CLI & Expo)", "Vue.js", "TypeScript", "JavaScript", "Component Architecture", "Responsive Design"],
      },
      {
        group: "State & Data Flow",
        items: ["Zustand", "Redux Toolkit", "Redux-Saga", "Context API", "REST API", "Socket.io", "SignalR"],
      },
      { group: "Backend", items: ["C#", ".NET / ASP.NET Core", "RESTful API", "Service & business logic"] },
      { group: "Data", items: ["MsSQL", "Redis", "Elasticsearch", "SQL / NoSQL query optimisation"] },
      {
        group: "Mobile",
        items: ["iOS / Android", "Push Notifications", "Maps", "In-App Purchase", "Firebase Auth / Firestore / FCM", "Reanimated", "Skia"],
      },
      { group: "Tooling", items: ["GitHub", "Bitbucket", "Jira", "Postman", "Sentry", "Adjust", "CI/CD", "Unit Testing"] },
    ],
  },

  experience: {
    eyebrow: "// experience",
    title: "Six years, shipping.",
    roles: [
      {
        company: "Aren Yazılım",
        title: "Full Stack Developer",
        period: "08/2025 — present",
        points: [
          "Responsive, performance-focused web interfaces in React and Vue.js.",
          "RESTful APIs and business services in .NET, wiring frontend to backend end to end.",
          "Database, CI/CD, testing and performance work to keep product quality sustainable.",
        ],
      },
      {
        company: "Massive Bio",
        title: "Senior React Native Developer",
        period: "08/2022 — 07/2025",
        points: [
          "Built scalable React Native products in health technology and took an active role in architectural decisions.",
          "Alongside mobile, handled API integration, performance and error management on web projects.",
          "Turned complex clinical and research workflows into interfaces people could move through quickly.",
        ],
      },
      {
        company: "Elephant Apps",
        title: "Middle React Native Developer",
        period: "09/2021 — 08/2022",
        points: [
          "Cross-platform mobile apps and web interfaces; API integration and reusable components.",
          "Performance improvements and product stability work.",
        ],
      },
      {
        company: "Freelance",
        title: "Full Stack Developer",
        period: "12/2019 — 09/2021",
        points: [
          "Ran web and mobile projects end to end: UI/UX, frontend, API, database and go-live.",
          "Performance optimisation and critical bug fixes across a range of clients.",
        ],
      },
      {
        company: "Bigg Plus Group of Companies",
        title: "React Native Developer / Software Developer Intern",
        period: "07/2019 — 12/2019",
        points: [
          "Corporate React Native applications, third-party integrations and performance work.",
          "Frontend-to-backend integration, technical planning and code quality.",
        ],
      },
    ],
  },

  education: {
    eyebrow: "// background",
    items: [
      { label: "Anadolu Üniversitesi", value: "BSc, Management Information Systems" },
      { label: "Nişantaşı Üniversitesi", value: "Associate Degree, Computer Programming" },
      { label: "English", value: "B2 — professional working proficiency" },
    ],
  },

  caseStudy: {
    eyebrow: "// case study",
    name: "MyGarage Global",
    kind: "React Native · iOS & Android",
    stackLabel: "// stack",
    summary:
      "A social and commerce platform for car and motorcycle owners: a digital garage for your vehicles, a feed and forum for the community, maintenance and expense tracking, drive recording, realtime messaging, map-based service discovery and a marketplace for shops.",
    stats: [
      { value: "392", label: "commits" },
      { value: "2", label: "platforms shipped" },
      { value: "60fps", label: "scroll target held" },
      { value: "62", label: "E2E flows automated" },
    ],
    highlights: [
      {
        title: "Performance under load",
        body:
          "Gated 230 console calls behind __DEV__, moved serialisation out of render bodies, and killed idle re-renders that were driving 60fps redraws on a static screen. Verified with gfxinfo frame capture on a real device, not a simulator.",
      },
      {
        title: "The native layer",
        body:
          "Patched react-native-maps so images inside markers actually load, wrote Nitro module bridges, and fixed an Android TextInput state chain that leaked on every keystroke and overflowed the stack on teardown.",
      },
      {
        title: "Tested like a product",
        body:
          "62 Maestro end-to-end flows covering auth, garage, feed, social, shop mode and account. A single QA pass across them surfaced 178 fixes.",
      },
      {
        title: "Architecture",
        body:
          "Redux with Saga and persisted state, MMKV for hot storage, SignalR for realtime, Firebase for auth and messaging, In-App Purchase for subscriptions, Sentry for whatever still gets through.",
      },
    ],
    stack: [
      "React Native", "TypeScript", "Redux-Saga", "Reanimated", "Shopify Skia",
      "FlashList", "Nitro Modules", "Vision Camera", "react-native-maps",
      "Firebase", "SignalR", "Sentry", "MMKV", "Maestro",
    ],
  },

  projects: {
    eyebrow: "// selected work",
    title: "Things I've built.",
    items: [
      { name: "SYNERGY-AI Cancer Trial Finder", blurb: "Health platform running in twelve countries: patient-to-clinic matching, automated report flows and advanced filtering over clinical data.", tags: ["React Native", "Health", "Data"] },
      { name: "Dr-Arturo AI & Ask Fiona AI", blurb: "AI-assisted clinical trial discovery and oncology data analysis for health professionals. Presented at ASCO 2024 and 2025.", tags: ["AI", "Oncology", "Product"] },
      { name: "Berksan Mühendislik", blurb: "Corporate web platform. React front end, .NET backend services and the REST layer between them; responsive structure and data flows handled end to end.", tags: ["React", ".NET", "Web"] },
      { name: "Panel Rewards", blurb: "Loyalty and reward management platform: points, balances, campaigns, transaction flows, validation and the admin panel that operates all of it.", tags: ["Platform", "API", "Admin"] },
      { name: "GFC Loyalty — Rewards", blurb: "Modular platform joining social features to a reward system: point transfer, shipment tracking and payment integrations.", tags: ["Mobile", "Payments"] },
      { name: "ICCOUS", blurb: "Industrial tracking for energy and natural gas facilities. Expo-based field application with realtime sync between field teams and backend.", tags: ["Expo", "Realtime", "Industrial"] },
      { name: "E-mülk", blurb: "GIS-integrated real estate information system: map-based, realtime property and asset tracking.", tags: ["GIS", "Maps", "Web"] },
      { name: "uLouder", blurb: "Location-based social network built on geo-fencing and map services, with clubs and a live feed.", tags: ["Geo-fencing", "Social"] },
      { name: "Kampüs365 / iKampüs", blurb: "Education ecosystem covering school administration, content sharing and teacher-to-parent communication.", tags: ["Education", "Mobile"] },
    ],
  },

  ai: {
    eyebrow: "// signal",
    title: "Where the machines came in.",
    body:
      "For three years my work sat next to applied AI in oncology — products that read clinical data and put an answer in front of a doctor. That is a domain where a plausible-looking wrong answer is not a bug report, it is a patient.",
    notes: [
      { title: "AI in the clinic, not the demo", body: "Dr-Arturo AI and Ask Fiona AI help health professionals find clinical trials and make sense of oncology data. My side was the product layer: turning model output into something a clinician can act on, and making the uncertainty legible instead of hidden." },
      { title: "Matching at scale", body: "SYNERGY-AI matches patients to trials across twelve countries. The hard part was never the matching — it was the filtering, the reporting and the data hygiene that make a match trustworthy." },
      { title: "How I work now", body: "I run large refactors, QA passes and migrations through coding agents, with tight and verifiable success criteria. The skill is context design and knowing exactly what to check. The bottleneck has moved from typing to judgement — telling a correct system from a plausible one is becoming the whole job." },
    ],
  },

  contact: {
    eyebrow: "// end of line",
    title: "There is no spoon.",
    body: "But there is an inbox. If you're building something that has to work on real devices, for real users, say hello.",
    cta: "Send a message",
    links: { email: "Email", github: "GitHub", linkedin: "LinkedIn", x: "X" },
    profileLabel: "Profile",
  },

  footer: {
    built: "Built with Next.js, three.js and too much coffee",
  },

  blog: {
    eyebrow: "// writing",
    title: "Notes from the field.",
    lead: "Occasional pieces about building software, and about the industry currently losing its mind over it.",
    /** {n} is replaced with the minute count — see formatCount(). */
    readingTime: "{n} min read",
    backToList: "All writing",
    publishedOn: "Published",
    alsoIn: "Also in",
    charts: {
      bubbleShape: {
        axis: "attention and money over time",
        description:
          "A curve that climbs slowly, spikes, collapses, and settles above where it started.",
        phases: ["technology", "story", "money", "everyone", "pop", "infrastructure"],
      },
      leftovers: {
        description: "What a bubble destroys, and what it leaves behind.",
        deadHead: "Goes",
        aliveHead: "Stays",
        dead: ["Valuations", "\"AI-powered\" relabels", "Decks without products", "The word agent"],
        alive: ["Compute that got built", "Access that got cheap", "People who shipped", "How we write software"],
      },
    },
    empty: "Nothing published yet.",
  },
};

/**
 * The shape every language must provide.
 *
 * Deliberately inferred from the English file and NOT declared `as const`:
 * literal types would make the contract demand the English sentences
 * themselves. Adding a key to `en` makes TypeScript require it everywhere.
 */
export type Dictionary = typeof en;
