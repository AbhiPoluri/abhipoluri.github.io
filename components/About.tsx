import ScrollReveal from "./ScrollReveal";
import { GradCap, Lightbulb, Cpu } from "./Icons";
import type { ComponentType } from "react";

type IconComp = ComponentType<{ size?: number; className?: string }>;

const stats = [
  { val: "$3–5k", lbl: "Revenue from retail arbitrage side business" },
  { val: "10+",   lbl: "Projects shipped across web, AI, and CV" },
  { val: "213",   lbl: "Skills in AI framework contributed to" },
  { val: "∞",     lbl: "Curiosity. Still going." },
];

const highlights: { icon: IconComp; title: string; sub: string }[] = [
  { icon: GradCap,   title: "Simon Fraser University",        sub: "Strategy, analytics, entrepreneurship" },
  { icon: Lightbulb, title: "Entrepreneur by nature",         sub: "$3–5k side business, zero capital" },
  { icon: Cpu,       title: "Building with AI",                sub: "Co-authored a 213-skill AI development framework" },
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
            Always building<br />something.
          </h2>
          <div style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.75 }}>
            <p>
              I&apos;m Abhi — a business student at Simon Fraser University. I&apos;ve been building
              things for a while: game engines, AI dashboards, computer vision tools, a small
              resale operation that turned a profit. SFU felt like the right place to develop
              the business side of that.
            </p>
            <p style={{ marginTop: 16 }}>
              I&apos;m most interested in where product and strategy overlap — decisions that
              benefit from both analytical thinking and some technical grounding. Lots still
              to learn, but that&apos;s the space I want to be in.
            </p>
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
                style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, transition: "color .2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        </ScrollReveal>

        {/* Right — stats grid */}
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
                key={s.val}
                className="stat-card"
                style={{ background: "var(--bg)", padding: "24px 20px" }}
              >
                <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.025em", color: "var(--ink)", lineHeight: 1 }}>
                  {s.val}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, fontWeight: 500, lineHeight: 1.4 }}>
                  {s.lbl}
                </div>
              </div>
            ))}
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
