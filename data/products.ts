export interface Product {
  id: number;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  link: string | null;
  videoSrc: string | null;
  accent: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "PocketLog",
    tagline: "Expense tracking with receipt scanning",
    description:
      "A mobile-first expense tracker with AI-powered receipt scanning, budget tracking, and family sharing. Scan a receipt and it auto-fills the amount, category, and merchant.",
    tags: ["React Native", "AI", "Finance", "Mobile"],
    link: "https://pocket-log.vercel.app",
    videoSrc: "/videos/pocketlog-ad.mp4",
    accent: "#FF8400",
  },
  {
    id: 2,
    name: "abhimem",
    tagline: "Persistent memory for Claude Code",
    description:
      "Automatic memory extraction and semantic recall for Claude Code sessions. Runs fully local — no cloud, no API keys. Embeds facts with nomic-embed-text and retrieves them across sessions.",
    tags: ["CLI", "AI", "Local LLM", "TypeScript"],
    link: null,
    videoSrc: null,
    accent: "#7c3aed",
  },
];
