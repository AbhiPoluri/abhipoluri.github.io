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
];
