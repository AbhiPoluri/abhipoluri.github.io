"use client";

import ScrollReveal from "./ScrollReveal";
import AnimatedCounter from "./AnimatedCounter";
import { GradCap, Lightbulb, Cpu, Zap, Terminal, Search } from "./Icons";
import type { ComponentType } from "react";

type IconComp = ComponentType<{ size?: number; className?: string }>;

const stats: { val: number | string; prefix?: string; suffix?: string; lbl: string; isText?: boolean }[] = [
  { val: 5000,     prefix: "$",  suffix: "+", lbl: "Revenue from zero startup capital" },
  { val: 10,       suffix: "+",              lbl: "Products shipped across web, AI & CV" },
  { val: 213,                                lbl: "Skills in AI framework I co-authored" },
  { val: "∞",      isText: true,             lbl: "Curiosity. Still going." },
];

const highlights: { icon: IconComp; title: string; sub: string }[] = [
  { icon: GradCap,   title: "Simon Fraser University",    sub: "BBA · Strategy, analytics, entrepreneurship" },
  { icon: Lightbulb, title: "Entrepreneur by nature",     sub: "$5k side business, zero startup capital" },
  { icon: Cpu,       title: "Building with AI",           sub: "Co-authored a 213-skill AI development framework" },
];

const timeline = [
  { year: "2020", event: "First robotics award — core values & sportsmanship." },
  { year: "2021", event: "LearnX Python certification. Started writing code seriously." },
  { year: "2023", event: "Built first AI dashboard. 50+ users. Realized I love this." },
  { year: "2024", event: "Hit $5k in retail arbitrage. Zero capital, just hustle." },
  { year: "Now",  event: "Studying business at SFU. Building everything I can." },
];

export default function About() {
  return (
    <section
      id="about"
      style={{ padding: "96px 0", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
    >
      <div
        style={{
          maxWidth: 1080, margin: "0 auto", padding: "0 32px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start",
        }}
        className="about-grid-responsive"
      >
        {/* Left — bio */}
        <ScrollReveal direction="left">
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>
            About
          </p>
          <h2
            style={{
              fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800,
              letterSpacing: "-0.025em", lineHeight: 1.05,
              color: "var(--ink)", marginBottom: 28,
            }}
          >
            Always building<br />
            <em style={{ fontStyle: "italic", fontWeight: 300, color: "var(--accent-warm)" }}>
              something.
            </em>
          </h2>
          <div style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.75 }}>
            <p>
              I&apos;m Abhi — business student at SFU, chronic builder. I&apos;ve shipped game engines,
              AI dashboards, computer vision tools, and a side hustle that actually turned a profit.
              SFU gave me the business framework to pair with all of it.
            </p>
            <p style={{ marginTop: 16 }}>
              I want to be where product and strategy overlap — using both analytical thinking
              and technical depth to make better decisions. Still learning a ton, but that&apos;s the
              whole point.
            </p>
          </div>

          {/* Timeline */}
          <div style={{ marginTop: 32 }}>
            {timeline.map((t, i) => (
              <div
                key={t.year}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 16,
                  paddingBottom: i < timeline.length - 1 ? 16 : 0,
                  position: "relative",
                }}
              >
                {/* Line connector */}
                {i < timeline.length - 1 && (
                  <div style={{
                    position: "absolute", left: 34, top: 22,
                    width: 1, height: "calc(100% - 6px)",
                    background: "var(--border)",
                  }} />
                )}
                {/* Year bubble */}
                <span
                  style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: ".06em",
                    padding: "4px 8px", borderRadius: 6,
                    background: t.year === "Now" ? "var(--accent-warm)" : "var(--surface)",
                    border: `1px solid ${t.year === "Now" ? "var(--accent-warm)" : "var(--border)"}`,
                    color: t.year === "Now" ? "#fff" : "var(--muted)",
                    flexShrink: 0, minWidth: 40, textAlign: "center",
                    lineHeight: 1.6,
                    zIndex: 1,
                  }}
                >
                  {t.year}
                </span>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, paddingTop: 3 }}>
                  {t.event}
                </p>
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 2 }}>
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <div
                  key={h.title}
                  className="hl-row"
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", cursor: "default" }}
                >
                  <span
                    className="hl-icon"
                    style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: "var(--surface)", border: "1px solid var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, color: "var(--muted)",
                    }}
                  >
                    <Icon size={16} />
                  </span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{h.title}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>{h.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 20, marginTop: 32 }}>
            {[
              { label: "LinkedIn", href: "https://www.linkedin.com/in/abhiram-poluri-306347270/" },
              { label: "GitHub",   href: "https://github.com/AbhiPoluri" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 13, fontWeight: 600, color: "var(--muted)",
                  textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4,
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-warm)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        </ScrollReveal>

        {/* Right — animated stats grid */}
        <ScrollReveal direction="right">
          <div
            style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 1, background: "var(--border)",
              border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden",
            }}
          >
            {stats.map((s) => (
              <div
                key={String(s.val)}
                className="stat-card"
                style={{ background: "var(--bg)", padding: "28px 20px", cursor: "default" }}
              >
                <div
                  className="stat-val"
                  style={{
                    fontSize: 36, fontWeight: 800, letterSpacing: "-0.025em",
                    color: "var(--ink)", lineHeight: 1,
                    transition: "color .2s",
                  }}
                >
                  {s.isText ? (
                    s.val
                  ) : (
                    <AnimatedCounter
                      target={s.val as number}
                      prefix={s.prefix}
                      suffix={s.suffix}
                      duration={1600}
                    />
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, fontWeight: 500, lineHeight: 1.4 }}>
                  {s.lbl}
                </div>
              </div>
            ))}
          </div>

          {/* Currently reading / building card */}
          <div
            style={{
              marginTop: 16,
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "20px 20px",
              background: "var(--surface)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
              Currently
            </div>
            {[
              { icon: Zap,      text: "Building: AI-powered planning tools" },
              { icon: Terminal, text: "Learning: Advanced ML pipelines" },
              { icon: Search,   text: "Looking for: Summer 2026 internships" },
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.text}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "6px 0",
                    borderBottom: "1px solid var(--border)",
                    fontSize: 13, color: "var(--muted)",
                  }}
                >
                  <span style={{ flexShrink: 0, color: "var(--accent-warm)" }}>
                    <ItemIcon size={14} />
                  </span>
                  {item.text}
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .about-grid-responsive { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}
