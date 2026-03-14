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
    name: "StriveSync",
    tagline: "Build habits that actually stick",
    description:
      "A social habit tracker built around accountability pods — small groups of friends who log workouts, study sessions, and daily habits together. Gamified with XP, streaks, and a spider chart that tracks your balance across six life dimensions.",
    tags: ["Next.js", "Supabase", "Gamification", "Social"],
    link: "https://strivesync.vercel.app",
    videoSrc: "/videos/strivesync-ad.mp4",
    accent: "#488e55",
  },
  {
    id: 3,
    name: "Ollama Router",
    tagline: "Route prompts to the right local model",
    description:
      "A lightweight local inference router that intelligently dispatches prompts to different Ollama models based on task type — code to deepseek-coder, reasoning to llama3, quick answers to phi3. Zero cloud, full control.",
    tags: ["Node.js", "Ollama", "AI", "Local LLM"],
    link: null,
    videoSrc: "/videos/ollama-router-ad.mp4",
    accent: "#f5a623",
  },
];
