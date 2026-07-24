export interface GitHubProject {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  link: string;
  image: string;
  year: string;
  language: string;
}

export const githubProjects: GitHubProject[] = [
  {
    id: "seatline",
    name: "Seatline",
    tagline: "Find the Cineplex seats you actually want",
    description:
      "A local Cineplex seat-availability watcher that monitors screenings for cancellations in preferred seats.",
    tags: ["JavaScript", "React", "Node.js", "Seat maps"],
    link: "https://github.com/AbhiPoluri/seatline",
    image: "/previews/seatline.png",
    year: "2026",
    language: "JavaScript",
  },
  {
    id: "cleanup-app",
    name: "Cleanup",
    tagline: "Rewrite text without leaving your flow",
    description:
      "A native macOS menu bar and Windows tray app for rewriting selected text, working with coding agents, and brainstorming from a physical whiteboard.",
    tags: ["Swift", "Windows", "Local models", "Native app"],
    link: "https://github.com/AbhiPoluri/cleanup-app",
    image: "/previews/cleanup.jpg",
    year: "2026",
    language: "Swift",
  },
  {
    id: "boardroom",
    name: "Boardroom",
    tagline: "Coordinate fleets of coding agents",
    description:
      "An AI agent orchestration platform for spawning, monitoring, and coordinating multiple Claude Code agents.",
    tags: ["TypeScript", "Agents", "Orchestration", "Claude Code"],
    link: "https://github.com/AbhiPoluri/boardroom",
    image: "/previews/boardroom.jpg",
    year: "2026",
    language: "TypeScript",
  },
  {
    id: "sql-r1",
    name: "SQL-R1",
    tagline: "A $5.83 text-to-SQL distillation experiment",
    description:
      "Distilled DeepSeek-V4-Pro into Qwen2.5-Coder-7B on Apple Silicon, improving BIRD text-to-SQL accuracy from 47.5% to 55%.",
    tags: ["Python", "Model distillation", "Apple Silicon", "BIRD"],
    link: "https://github.com/AbhiPoluri/sql-r1",
    image: "/previews/sql-r1.png",
    year: "2026",
    language: "Python",
  },
  {
    id: "llmcost",
    name: "llmcost",
    tagline: "Track local LLM API spend automatically",
    description:
      "A local API proxy that forwards and logs requests across Anthropic, OpenAI, Groq, and Google AI, with a dashboard for spend tracking.",
    tags: ["Python", "API proxy", "Analytics", "Local-first"],
    link: "https://github.com/AbhiPoluri/llmcost",
    image: "/previews/llmcost.jpg",
    year: "2026",
    language: "Python",
  },
];
