export type ProjectType = "tech" | "business" | "framework";

export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  impact: string;
  link: string | null;
  previewUrl: string | null;
  screenshot: string | null;
  type: ProjectType;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "abhimem",
    description:
      "Persistent memory for Claude Code. Automatically extracts facts from every session using a local LLM, embeds them with nomic-embed-text, and recalls them semantically next time — zero cloud, zero API keys.",
    tags: ["Python", "FastMCP", "SQLite", "Ollama", "Claude Code"],
    impact: "Auto memory · fully local · semantic recall",
    link: "https://abhimem.vercel.app",
    previewUrl: "https://abhimem.vercel.app",
    screenshot: "/previews/abhimem.jpg",
    type: "tech",
  },
  {
    id: 3,
    title: "NotesgGraph",
    description:
      "Local-first notes app with a live knowledge graph. Notes link automatically based on semantic similarity — see how ideas connect in real time. Built for thinking, not filing.",
    tags: ["React", "TypeScript", "D3.js", "Vector Search"],
    impact: "Local-first · semantic knowledge graph",
    link: "https://notesgraph.vercel.app",
    previewUrl: "https://notesgraph.vercel.app",
    screenshot: "/previews/notesgraph.jpg",
    type: "tech",
  },
  {
    id: 4,
    title: "Nexus Planner",
    description:
      "AI-powered project planning tool for engineering teams. Decomposes high-level goals into executable plans with Monte Carlo risk simulation, critical path analysis, and circular dependency detection.",
    tags: ["React", "TypeScript", "Zustand", "IndexedDB"],
    impact: "Supports Agile, Shape Up, Waterfall & Kanban",
    link: "https://nexus-planner-lemon.vercel.app",
    previewUrl: "https://nexus-planner-lemon.vercel.app",
    screenshot: "/previews/nexus-planner.jpg",
    type: "tech",
  },
  {
    id: 5,
    title: "ClaudeInOne",
    description:
      "Production-grade AI development framework with 213 skills, 37 specialist agents, and 95 commands covering the full software development lifecycle — from architecture and testing to deployment.",
    tags: ["AI/ML", "Prompt Engineering", "Framework Design", "DevOps"],
    impact: "213 skills · 37 agents · 95 commands",
    link: "https://claudeinone.vercel.app",
    previewUrl: null,
    screenshot: "/previews/claudeinone.jpg",
    type: "framework",
  },
];
