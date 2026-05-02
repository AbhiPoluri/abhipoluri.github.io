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
  {
    id: 6,
    title: "Distilling DeepSeek into Qwen-7B",
    description:
      "A weekend distillation experiment to learn how SFT and DPO actually behave at small scale. Distilled DeepSeek-V3.1 and DeepSeek-V4-Pro into Qwen2.5-Coder-7B on Apple Silicon, scored on the BIRD text-to-SQL benchmark with deterministic execution match. Full writeup on LinkedIn; code on GitHub.",
    tags: ["MLX-LM", "LoRA", "DPO", "Distillation", "Apple Silicon"],
    impact: "47.5% → 55% pass@1 on BIRD · $5.83 total spend",
    link: "https://www.linkedin.com/pulse/distilling-deepseek-7b-model-apple-silicon-abhiram-poluri-gv2uc/",
    previewUrl: null,
    screenshot: "/previews/sql-r1.jpg",
    type: "tech",
  },
  {
    id: 7,
    title: "Boardroom",
    description:
      "AI agent orchestration platform for spawning, monitoring, and coordinating fleets of Claude Code agents. REST API plus an MCP server exposing nine tools for agent lifecycle, token usage, and orchestrator messaging from any MCP-compatible client.",
    tags: ["TypeScript", "Next.js", "MCP", "Claude Code", "Orchestration"],
    impact: "Multi-agent control plane · live dashboard · MCP-native",
    link: "https://boardroomapp.vercel.app",
    previewUrl: "https://boardroomapp.vercel.app",
    screenshot: "/previews/boardroom.jpg",
    type: "tech",
  },
];
