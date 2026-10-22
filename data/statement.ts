import { work, type WorkItem } from "./work";

const byId = (id: string): WorkItem => {
  const item = work.find((entry) => entry.id === id);
  if (!item) throw new Error(`data/statement: no work item with id "${id}"`);
  return item;
};

/** Projects shown as image chips inside the hero sentence, in reading order. */
export const heroChips = {
  games: byId("gleipnir"),
  tools: byId("feature-par0"),
  apps: byId("wandr"),
};

/** Wandr is the centerpiece: a co-founded app that shipped to the App Store. */
export const wandr = {
  item: byId("wandr"),
  appStore: "https://apps.apple.com/ca/app/wandr-find-your-people/id6804356314",
  /** The sky loop from wandrapp.ca's landing page, re-encoded at 720p. */
  sky: { video: "/videos/wandr-sky.mp4", poster: "/previews/wandr-sky-poster.jpg" },
  /** Wandr's Upstroke bird, copied from the app's brand folder. */
  mark: "/previews/wandr-mark.svg",
  facts: [
    { label: "Role", value: "Co-founder and CTO, with Parth Shah. I built most of it." },
    { label: "Built", value: "Ranked discovery deck, matches and group chat, trips, Sign in with Apple, transactional email" },
    { label: "Stack", value: "Next.js, Supabase, Capacitor, Resend, iOS" },
  ],
};

export const liveCount = work.filter((item) => item.status === "live").length;

export const games = work.filter((item) => item.kind === "game");
export const playableGames = games.filter((item) => item.status === "playable");

export interface DeepDive {
  item: WorkItem;
  headline: string;
  facts: Array<{ label: string; value: string }>;
}

/** Projects two and three of the top three, after the Wandr feature. */
export const deepDives: DeepDive[] = [
  {
    item: byId("propking"),
    headline: "Two books, one honest board.",
    facts: [
      { label: "What it does", value: "Pairs lines from two pick'em books and scores every prop by cross-book value and calibrated probability" },
      { label: "Proof", value: "Slips auto-grade against box scores; the insights page publishes the model's own Brier score and ROI" },
      { label: "Stack", value: "Next.js, TypeScript, Supabase, edge functions" },
    ],
  },
  {
    item: byId("github-boardroom"),
    headline: "One desk for an entire agent team.",
    facts: [
      { label: "Role", value: "Product, interaction, architecture, full-stack build" },
      { label: "Stack", value: "Next.js, TypeScript, SQLite, node-pty, SSE, Git worktrees" },
    ],
  },
];

/** Short lowercase tag shown next to each name in the running index. */
export const indexTag = (item: WorkItem): string => {
  if (item.year !== "2026") return item.year;
  if (item.id === "github-sql-r1") return "$5.83";
  return item.label.toLowerCase();
};
