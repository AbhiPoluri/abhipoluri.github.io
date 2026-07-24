export const linkedInProjects = [
  {
    id: "par0",
    name: "par0: Prompt Golf",
    tagline: "The shortest prompt that passes every hidden test wins.",
    description:
      "A browser game where players compress prompts for gpt-oss-20b across 19 holes. Code-first grading, an LLM judge for fuzzy cases, and a live leaderboard turn prompt design into a competitive sport.",
    tags: ["gpt-oss-20b", "LLM evaluation", "Prompt design", "Leaderboards"],
    link: "https://par0.vercel.app",
    image: "/previews/par0.gif",
    year: "2026",
    kind: "AI game",
  },
  {
    id: "claude-quant-lab",
    name: "Claude Quant Lab",
    tagline: "AI closed the building gap. The judgment gap stayed open.",
    description:
      "A six-week experiment in unfamiliar territory: a Python walk-forward backtester, a six-account paper-trading engine, and a live dashboard. The project became a study of where AI accelerates building—and where expert skepticism still matters.",
    tags: ["Python", "Claude", "Backtesting", "TradingView"],
    link: "https://www.linkedin.com/pulse/im-quant-can-claude-make-me-one-abhiram-poluri-clsxc/",
    image: "/previews/claude-quant-lab.jpg",
    year: "2026",
    kind: "research build",
  },
] as const;
