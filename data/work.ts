export type WorkKind = "game" | "product" | "ai" | "research" | "tool";

export type WorkFilter = "all" | WorkKind;

export interface WorkLink {
  label: string;
  href: string;
}

export interface WorkItem {
  /** Stable id. Hero scraps dispatch `portfolio:load-project` with these, so keep them. */
  id: string;
  name: string;
  /** One line, shown in the index row. */
  tagline: string;
  /** Two or three sentences, shown when a row is opened. */
  description: string;
  tags: string[];
  year: string;
  kind: WorkKind;
  /** Short human label for the kind column, e.g. "Sports data". */
  label: string;
  status: "live" | "shipped" | "research" | "private" | "playable";
  image: string | null;
  video: string | null;
  links: WorkLink[];
  with?: string;
}

export const workFilters: Array<{ id: WorkFilter; label: string }> = [
  { id: "all", label: "Everything" },
  { id: "game", label: "Games" },
  { id: "product", label: "Products" },
  { id: "ai", label: "AI & agents" },
  { id: "research", label: "Research" },
  { id: "tool", label: "Tools" },
];

export const work: WorkItem[] = [
  {
    id: "gleipnir",
    name: "Gleipnir",
    tagline: "A two-ink parry duel with five bosses you learn to read.",
    description:
      "A 2.5D Norse folk-horror action game where the shield is half the moveset. Light weapons get a forgiving parry window and heavy ones a tight one, so picking the greatsword is choosing a harder read, and mashing decays the window to nothing. Five bosses share one readability grammar: one tell per attack, a consistent commit cue, and red for anything you cannot parry. Learn one fight and you can read the next. I played the metroidvania levels, found them a chore, and re-scoped the game into short boss-first missions.",
    tags: ["Godot 4", "GDScript", "Combat design", "Boss design", "Playtest tuning"],
    year: "2026",
    kind: "game",
    label: "Soulslike",
    status: "playable",
    image: "/previews/gleipnir.webp",
    video: null,
    links: [{ label: "Download on itch.io", href: "https://sprite123.itch.io/gleipnir" }],
  },
  {
    id: "the-merciful",
    name: "The Merciful",
    tagline: "A kraken cult, a 24-day voyage, and a crew that is starting to talk.",
    description:
      "You are a secret kraken-worshipper cooking for a 1715 brig. Suspicion and rumour do the work an enemy AI usually does, and the whole thing is built on one rule: you should only ever be caught for a reason you could have read. Conversations are timed rather than menu-driven, so hesitating costs something. In playtests I found one loop that beat everything else, so I priced every action in time and re-ran scripted strategies across seeds until careful play could lose again.",
    tags: ["Godot 4", "GDScript", "Systems design", "Narrative design", "Balance sweeps"],
    year: "2026",
    kind: "game",
    label: "Narrative systems",
    status: "playable",
    image: "/previews/the-merciful.webp",
    video: null,
    links: [{ label: "Download on itch.io", href: "https://sprite123.itch.io/the-merciful" }],
  },
  {
    id: "oddlings-studio",
    name: "Oddlings Studio",
    tagline: "Procedural 3D assets you review and sign off on like code.",
    description:
      "The asset pipeline both of my Godot games run on. Agents write JSON specs, the studio builds them into rigged meshes, and you review the result in an outliner with notes and draw-marks before you edit it or sign off. It is deterministic: the same seed produces the same bytes, so you can regenerate an asset and diff it like code. Two mesh backends: parts as separate closed solids, or fused as a signed distance field into one manifold mesh under a triangle budget.",
    tags: ["TypeScript", "Procedural generation", "Rigging", "MCP", "Tooling"],
    year: "2026",
    kind: "game",
    label: "Art pipeline",
    status: "shipped",
    image: "/previews/oddlings-studio.jpg",
    video: null,
    links: [{ label: "Repository", href: "https://github.com/AbhiPoluri/oddlings-studio" }],
  },
  {
    id: "fly-balatro",
    name: "fly-balatro",
    tagline: "A fruit fly's connectome plays Balatro and never beats a shuffled control.",
    description:
      "I wired the MaleCNS fly connectome up as a frozen spiking reservoir, fed it encoded Balatro hand state, and put decoders on top to see whether real neural wiring beat a shuffled control. It did not. I documented a string of null and negative findings with their controls, including a retraction of my own earlier claim once I found a bug in the shuffled baseline.",
    tags: ["Python", "Connectomics", "Reservoir computing", "Experiment design"],
    year: "2026",
    kind: "game",
    label: "Game AI research",
    status: "research",
    image: "/previews/fly-balatro.jpg",
    video: null,
    links: [{ label: "Repository", href: "https://github.com/AbhiPoluri/fly-balatro" }],
  },
  {
    id: "propking",
    name: "PropKing",
    tagline: "Scores player props across two pick'em books.",
    description:
      "A research tool for player props. It ingests lines from two pick'em books, pairs them, and scores every prop by cross-book value and calibrated probability. A parlay slip de-vigs prices and grades legs, PropKing grades saved slips against ingested box scores, and an insights page shows the model's own Brier score and ROI.",
    tags: ["Next.js", "TypeScript", "Supabase", "Edge functions", "Calibration"],
    year: "2026",
    kind: "product",
    label: "Sports data",
    status: "live",
    image: "/previews/propking.jpg",
    video: null,
    links: [{ label: "Open PropKing", href: "https://propking.vercel.app" }],
  },
  {
    id: "errand",
    name: "Errand",
    tagline: "A calm AI agent for people who have never heard of agents.",
    description:
      "A from-scratch agent harness with a consumer-grade UI. Errand tidies folders, reads and explains documents, researches the web, and drives your real Chrome, but asks in plain language before anything changes and ships a structural Undo. The loop, tools, sessions, streaming, memory, and crash-safe resume are hand-written TypeScript; the model SDK is transport only.",
    tags: ["TypeScript", "Electron", "SQLite", "Chrome extension", "Agent harness"],
    year: "2026",
    kind: "ai",
    label: "Agent harness",
    status: "shipped",
    image: "/previews/errand.jpg",
    video: null,
    links: [{ label: "Read the code", href: "https://github.com/AbhiPoluri/errand" }],
  },
  {
    id: "wandr",
    name: "Wandr",
    tagline: "Find your people. Anywhere.",
    description:
      "A travel-social app that matches you with people heading to the same city on overlapping dates. Co-founded with Parth Shah; I am the CTO and built most of it: a ranked discovery deck, matches and group chat, trips, Sign in with Apple, a transactional email system on Resend, and an iOS build through Capacitor. Live on the App Store since September 2026.",
    tags: ["Next.js", "Supabase", "Capacitor", "Resend", "iOS"],
    year: "2026",
    kind: "product",
    label: "Travel social",
    status: "live",
    image: "/previews/wandr-lockup.png",
    video: null,
    links: [
      { label: "App Store", href: "https://apps.apple.com/ca/app/wandr-find-your-people/id6804356314" },
      { label: "Visit wandrapp.ca", href: "https://www.wandrapp.ca" },
    ],
    with: "Parth Shah",
  },
  {
    id: "github-boardroom",
    name: "Boardroom",
    tagline: "Spawns, watches and coordinates a team of Claude Code agents.",
    description:
      "An orchestration platform for spawning, monitoring, and coordinating fleets of Claude Code agents. Named personas run in isolated Git worktrees, plans execute sequentially or in parallel, finished work lands in a push-request queue, and a nine-tool MCP server exposes the whole thing to any MCP client.",
    tags: ["TypeScript", "Next.js", "MCP", "node-pty", "Git worktrees"],
    year: "2026",
    kind: "ai",
    label: "Agent infrastructure",
    status: "shipped",
    image: "/previews/boardroom.jpg",
    video: null,
    links: [
      { label: "Live dashboard", href: "https://boardroomapp.vercel.app" },
      { label: "Repository", href: "https://github.com/AbhiPoluri/boardroom" },
      { label: "Case study", href: "#boardroom-case-study" },
    ],
  },
  {
    id: "feature-par0",
    name: "par0: Prompt Golf",
    tagline: "The shortest prompt that passes every hidden test wins.",
    description:
      "A browser game where players compress prompts for gpt-oss-20b across 19 holes. Deterministic code checks grade most holes, an LLM judge grades the fuzzy ones, and players compete on a live leaderboard.",
    tags: ["gpt-oss-20b", "LLM evaluation", "Prompt design", "Leaderboards"],
    year: "2026",
    kind: "ai",
    label: "AI game",
    status: "live",
    image: "/previews/par0.gif",
    video: null,
    links: [{ label: "Play par0", href: "https://par0.vercel.app" }],
  },
  {
    id: "project-1",
    name: "abhimem",
    tagline: "Persistent memory for Claude Code that never leaves your machine.",
    description:
      "Extracts facts from each Claude Code session with a local LLM, embeds them with nomic-embed-text, and recalls them by meaning in the next session. It runs as an MCP server with no cloud and no API keys.",
    tags: ["Python", "FastMCP", "SQLite", "Ollama", "Claude Code"],
    year: "2026",
    kind: "ai",
    label: "MCP server",
    status: "shipped",
    image: "/previews/abhimem.jpg",
    video: null,
    links: [
      { label: "Repository", href: "https://github.com/AbhiPoluri/abhimem" },
      { label: "Site", href: "https://abhimem.vercel.app" },
    ],
  },
  {
    id: "feature-claude-quant-lab",
    name: "Claude Quant Lab",
    tagline: "Six weeks building a trading stack with Claude, outside my field.",
    description:
      "A six-week experiment in unfamiliar territory: a Python walk-forward backtester, a six-account paper-trading engine, and a live dashboard. I wrote up where Claude sped up the build and where I still needed an expert's skepticism.",
    tags: ["Python", "Claude", "Backtesting", "TradingView"],
    year: "2026",
    kind: "research",
    label: "Research build",
    status: "research",
    image: "/previews/claude-quant-lab.jpg",
    video: null,
    links: [
      {
        label: "Read the write-up",
        href: "https://www.linkedin.com/pulse/im-quant-can-claude-make-me-one-abhiram-poluri-clsxc/",
      },
    ],
  },
  {
    id: "github-sql-r1",
    name: "SQL-R1",
    tagline: "A $5.83 text-to-SQL distillation experiment.",
    description:
      "Distilled DeepSeek-V4-Pro into Qwen2.5-Coder-7B on Apple Silicon with LoRA and scored every checkpoint on BIRD with deterministic execution match. Accuracy went from 47.5% to 55%, DPO made it worse, and the best checkpoint turned up at iteration fifty.",
    tags: ["Python", "MLX-LM", "LoRA", "Distillation", "BIRD"],
    year: "2026",
    kind: "research",
    label: "Model distillation",
    status: "research",
    image: "/previews/sql-r1.png",
    video: null,
    links: [
      { label: "Experiment log", href: "https://github.com/AbhiPoluri/sql-r1" },
      {
        label: "Write-up",
        href: "https://www.linkedin.com/pulse/distilling-deepseek-7b-model-apple-silicon-abhiram-poluri-gv2uc/",
      },
      { label: "Case study", href: "#sql-r1-case-study" },
    ],
  },
  {
    id: "github-cleanup-app",
    name: "Cleanup",
    tagline: "Highlight text in any Mac app and rewrite it with one hotkey.",
    description:
      "A native macOS menu bar app: highlight text anywhere, hit one hotkey, get rewrites from a local model or your ChatGPT subscription in a popup. Mono theme, a one-to-five variant slider, and a Windows tray version on the roadmap.",
    tags: ["Swift", "macOS", "Local models", "Native app"],
    year: "2026",
    kind: "tool",
    label: "Native utility",
    status: "shipped",
    image: "/previews/cleanup.jpg",
    video: null,
    links: [{ label: "Repository", href: "https://github.com/AbhiPoluri/cleanup-app" }],
  },
  {
    id: "github-seatline",
    name: "Seatline",
    tagline: "Alerts you when the Cineplex seats you picked free up.",
    description:
      "A seat-availability watcher for Cineplex screenings. Pick the seats you care about and it polls the seat map, then alerts you when someone cancels and one opens up.",
    tags: ["JavaScript", "React", "Node.js", "Seat maps"],
    year: "2026",
    kind: "product",
    label: "Watcher",
    status: "shipped",
    image: "/previews/seatline.png",
    video: null,
    links: [{ label: "Repository", href: "https://github.com/AbhiPoluri/seatline" }],
  },
  {
    id: "github-llmcost",
    name: "llmcost",
    tagline: "A local proxy that logs what each LLM call costs.",
    description:
      "A local API proxy that forwards and logs requests across Anthropic, OpenAI, Groq, and Google AI, with a dashboard for spend by model, project, and day.",
    tags: ["Python", "API proxy", "Analytics", "Local-first"],
    year: "2026",
    kind: "tool",
    label: "Developer tool",
    status: "shipped",
    image: "/previews/llmcost.jpg",
    video: null,
    links: [{ label: "Repository", href: "https://github.com/AbhiPoluri/llmcost" }],
  },
  {
    id: "product-1",
    name: "PocketLog",
    tagline: "Scan receipts, set budgets and share them with family.",
    description:
      "A mobile-first expense tracker with receipt scanning, budgets, and family sharing. Scan a receipt and PocketLog fills in the amount, category and merchant, then updates the shared budget.",
    tags: ["React Native", "AI", "Finance", "Mobile"],
    year: "2025",
    kind: "product",
    label: "Consumer finance",
    status: "live",
    image: null,
    video: "/videos/pocketlog-ad.mp4",
    links: [
      { label: "Open PocketLog", href: "https://pocket-log.vercel.app" },
      { label: "Case study", href: "#pocketlog-case-study" },
    ],
  },
  {
    id: "project-3",
    name: "NotesGraph",
    tagline: "A notes app that links related notes for you.",
    description:
      "A local-first notes app with a live knowledge graph. It links notes by semantic similarity, so you can watch related ideas cluster as you write.",
    tags: ["React", "TypeScript", "D3.js", "Vector search"],
    year: "2025",
    kind: "product",
    label: "Knowledge tool",
    status: "live",
    image: "/previews/notesgraph.jpg",
    video: null,
    links: [
      { label: "Open NotesGraph", href: "https://notesgraph.vercel.app" },
      { label: "Repository", href: "https://github.com/AbhiPoluri/notesgraph" },
    ],
  },
  {
    id: "project-4",
    name: "Nexus Planner",
    tagline: "Breaks a goal into a plan with risk and critical-path checks.",
    description:
      "AI-assisted project planning for engineering teams. Decomposes high-level goals into executable plans with Monte Carlo risk simulation, critical-path analysis, and circular-dependency detection across Agile, Shape Up, Waterfall, and Kanban.",
    tags: ["React", "TypeScript", "Zustand", "IndexedDB"],
    year: "2025",
    kind: "product",
    label: "Planning tool",
    status: "live",
    image: "/previews/nexus-planner.jpg",
    video: null,
    links: [
      { label: "Open Nexus", href: "https://nexus-planner-lemon.vercel.app" },
      { label: "Repository", href: "https://github.com/AbhiPoluri/nexus-planner" },
    ],
  },
  {
    id: "product-3",
    name: "Ollama Router",
    tagline: "Send each prompt to the right local model.",
    description:
      "A lightweight inference router that dispatches prompts to different Ollama models by task: code to a coder model, reasoning to a larger one, quick answers to a small one. Everything runs on your machine.",
    tags: ["Node.js", "Ollama", "Local LLM", "Routing"],
    year: "2025",
    kind: "tool",
    label: "Local inference",
    status: "shipped",
    image: null,
    video: "/videos/ollama-router-ad.mp4",
    links: [{ label: "Repository", href: "https://github.com/AbhiPoluri/Ollama-router" }],
  },
  {
    id: "project-5",
    name: "ClaudeInOne",
    tagline: "213 skills, 37 agents, 95 commands for Claude Code.",
    description:
      "A development framework for Claude Code that covers the software lifecycle, from architecture and testing to deployment, with skills, specialist agents and slash commands.",
    tags: ["Prompt engineering", "Framework design", "DevOps", "Claude Code"],
    year: "2025",
    kind: "ai",
    label: "Framework",
    status: "shipped",
    image: "/previews/claudeinone.jpg",
    video: null,
    links: [{ label: "Repository", href: "https://github.com/AbhiPoluri/ClaudeInOne" }],
  },
];

export const workCounts = work.reduce<Record<WorkFilter, number>>(
  (counts, item) => {
    counts.all += 1;
    counts[item.kind] += 1;
    return counts;
  },
  { all: 0, game: 0, product: 0, ai: 0, research: 0, tool: 0 },
);
