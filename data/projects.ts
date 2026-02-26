export type ProjectType = "tech" | "business" | "framework";

export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  impact: string;
  link: string | null;
  type: ProjectType;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "AI Insight Dashboard",
    description:
      "A business intelligence MVP that lets you query 10,000+ sales records in plain English. Powered by FastAPI, Prophet time-series forecasting, and an interactive React dashboard with 90-day confidence intervals.",
    tags: ["FastAPI", "React", "Python", "Scikit-learn", "Docker"],
    impact: "90-day sales forecasting · Natural language queries",
    link: "https://github.com/AbhiPoluri",
    type: "tech",
  },
  {
    id: 2,
    title: "Nexus Planner",
    description:
      "An AI-powered project planning tool for engineering teams. Decomposes high-level goals into executable plans with Monte Carlo risk simulation, critical path analysis, and circular dependency detection.",
    tags: ["React", "TypeScript", "Zustand", "IndexedDB"],
    impact: "Supports Agile, Shape Up, Waterfall & Kanban",
    link: "https://github.com/AbhiPoluri",
    type: "tech",
  },
  {
    id: 3,
    title: "Retail Arbitrage",
    description:
      "Built and scaled a resale business from scratch — sourcing Amazon liquidation inventory and flipping on eBay and Facebook Marketplace. First sale netted a 12× return. Scaled to consistent profit within months.",
    tags: ["Entrepreneurship", "E-commerce", "eBay", "Market Research"],
    impact: "$3–5k revenue · under 10 months · zero startup capital",
    link: null,
    type: "business",
  },
  {
    id: 4,
    title: "ClaudeInOne",
    description:
      "A production-grade AI development framework with 213 skills, 37 specialist agents, and 95 commands covering the full software development lifecycle — from architecture and testing to deployment and documentation.",
    tags: ["AI/ML", "Prompt Engineering", "Framework Design", "DevOps"],
    impact: "213 skills · 37 agents · 95 commands",
    link: "https://github.com/AbhiPoluri",
    type: "framework",
  },
];
