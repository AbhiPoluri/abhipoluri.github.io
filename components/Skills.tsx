import ScrollReveal from "./ScrollReveal";
import {
  BarChart, Rocket, Search, TrendingUp, Lightbulb,
  ShoppingBag, Clipboard, Users,
  Terminal, Zap, Database, Cpu, Eye, LineChart, Link,
} from "./Icons";
import type { ComponentType } from "react";

type IconComp = ComponentType<{ size?: number; className?: string }>;

const business: { icon: IconComp; label: string }[] = [
  { icon: BarChart,   label: "Business Strategy" },
  { icon: Rocket,     label: "Entrepreneurship" },
  { icon: Search,     label: "Market Research" },
  { icon: TrendingUp, label: "Financial Analysis" },
  { icon: Lightbulb,  label: "Product Thinking" },
  { icon: ShoppingBag,label: "E-commerce" },
  { icon: Clipboard,  label: "Project Management" },
  { icon: Users,      label: "Business Development" },
];

const ai: { icon: IconComp; label: string }[] = [
  { icon: Lightbulb, label: "Prompt Engineering" },
  { icon: Cpu,       label: "LLM Integration" },
  { icon: Zap,       label: "AI Agents" },
  { icon: Eye,       label: "Computer Vision" },
  { icon: LineChart, label: "Machine Learning" },
  { icon: Terminal,  label: "Python" },
  { icon: Link,      label: "FastAPI" },
  { icon: Database,  label: "RAG / Vector DBs" },
  { icon: BarChart,  label: "Data Analysis" },
  { icon: Rocket,    label: "Agentic Workflows" },
];

function Panel({
  title,
  color,
  chips,
}: {
  title: string;
  color: string;
  chips: { icon: IconComp; label: string }[];
}) {
  return (
    <div
      style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: 16, padding: 28,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink)" }}>
          {title}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {chips.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="skill-chip"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, fontWeight: 500, color: "var(--muted)",
              border: "1px solid var(--border)", padding: "6px 14px",
              borderRadius: 99, background: "var(--bg)", cursor: "default",
            }}
          >
            <Icon size={13} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section
      id="skills"
      style={{ padding: "96px 0", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px" }}>

        <ScrollReveal>
          <div style={{ display: "flex", alignItems: "baseline", paddingBottom: 24, borderBottom: "1px solid var(--border)", marginBottom: 40 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>
              Skills
            </span>
          </div>
        </ScrollReveal>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
          className="skills-grid-responsive"
        >
          <ScrollReveal direction="left" delay={80}>
            <Panel title="Business" color="var(--green)" chips={business} />
          </ScrollReveal>
          <ScrollReveal direction="right" delay={140}>
            <Panel title="AI & Tools" color="var(--accent)" chips={ai} />
          </ScrollReveal>
        </div>

      </div>

      <style>{`
        @media (max-width: 640px) {
          .skills-grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
