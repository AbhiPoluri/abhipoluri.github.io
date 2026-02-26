"use client";

import ScrollReveal from "./ScrollReveal";
import {
  BarChart, Rocket, Search, TrendingUp, Lightbulb,
  ShoppingBag, Clipboard, Users,
  Terminal, Zap, Database, Cpu, Eye, LineChart, Link,
} from "./Icons";
import type { ComponentType, ReactNode } from "react";

type IconComp = ComponentType<{ size?: number; className?: string }>;

const business: { icon: IconComp; label: string; hot?: boolean }[] = [
  { icon: BarChart,    label: "Business Strategy",    hot: true },
  { icon: Rocket,      label: "Entrepreneurship",     hot: true },
  { icon: Search,      label: "Market Research" },
  { icon: TrendingUp,  label: "Financial Analysis" },
  { icon: Lightbulb,   label: "Product Thinking",     hot: true },
  { icon: ShoppingBag, label: "E-commerce" },
  { icon: Clipboard,   label: "Project Management" },
  { icon: Users,       label: "Business Development" },
];

const ai: { icon: IconComp; label: string; hot?: boolean }[] = [
  { icon: Lightbulb, label: "Prompt Engineering",   hot: true },
  { icon: Cpu,       label: "LLM Integration",      hot: true },
  { icon: Zap,       label: "AI Agents",            hot: true },
  { icon: Eye,       label: "Computer Vision" },
  { icon: LineChart, label: "Machine Learning" },
  { icon: Terminal,  label: "Python",               hot: true },
  { icon: Link,      label: "FastAPI" },
  { icon: Database,  label: "RAG / Vector DBs",     hot: true },
  { icon: BarChart,  label: "Data Analysis" },
  { icon: Rocket,    label: "Agentic Workflows",    hot: true },
];

function Panel({
  title,
  headerIcon,
  desc,
  color,
  chips,
}: {
  title: string;
  headerIcon: ReactNode;
  desc: string;
  color: string;
  chips: { icon: IconComp; label: string; hot?: boolean }[];
}) {
  return (
    <div
      style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: 16, padding: 28,
        transition: "border-color .2s, box-shadow .2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = color;
        (e.currentTarget as HTMLElement).style.boxShadow  = `0 0 0 1px ${color}22`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.boxShadow  = "none";
      }}
    >
      {/* Panel header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: `${color}14`, border: `1px solid ${color}33`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: color, flexShrink: 0,
            }}
          >
            {headerIcon}
          </span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{title}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{desc}</div>
          </div>
        </div>
        <span style={{ fontSize: 11, color: color, fontWeight: 700, letterSpacing: ".04em", background: `${color}14`, padding: "3px 8px", borderRadius: 6 }}>
          {chips.length} skills
        </span>
      </div>

      {/* Chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {chips.map(({ icon: Icon, label, hot }) => (
          <span
            key={label}
            className="skill-chip"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, fontWeight: 500, color: "var(--muted)",
              border: `1px solid ${hot ? `${color}44` : "var(--border)"}`,
              padding: "6px 14px",
              borderRadius: 99,
              background: hot ? `${color}0a` : "var(--bg)",
              cursor: "default",
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
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingBottom: 24, borderBottom: "1px solid var(--border)", marginBottom: 40 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>
                Skills
              </span>
              <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>
                What I actually know — not just what sounds good on a resume.
              </p>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: ".04em", color: "var(--muted)", background: "var(--bg)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-warm)", display: "inline-block", flexShrink: 0 }} />
              heavily used
            </span>
          </div>
        </ScrollReveal>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
          className="skills-grid-responsive"
        >
          <ScrollReveal direction="left" delay={80}>
            <Panel
              title="Business"
              headerIcon={<BarChart size={16} />}
              desc="How I think about building"
              color="var(--green)"
              chips={business}
            />
          </ScrollReveal>
          <ScrollReveal direction="right" delay={140}>
            <Panel
              title="AI & Tools"
              headerIcon={<Cpu size={16} />}
              desc="What I use to ship faster"
              color="var(--accent)"
              chips={ai}
            />
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
