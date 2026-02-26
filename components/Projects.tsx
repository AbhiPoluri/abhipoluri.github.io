"use client";

import ScrollReveal from "./ScrollReveal";
import { projects } from "@/data/projects";
import { Zap, TrendingUp, Lightbulb } from "./Icons";
import type { ComponentType } from "react";

type IconComp = ComponentType<{ size?: number; className?: string }>;

const typeMeta: Record<string, { label: string; color: string; bg: string }> = {
  tech:     { label: "Technical",    color: "#2563eb", bg: "rgba(37,99,235,0.08)"  },
  business: { label: "Business",     color: "#15803d", bg: "rgba(21,128,61,0.08)"  },
  framework:{ label: "Framework",    color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
};

const impactIcons: Record<string, IconComp> = {
  tech:      Zap,
  business:  TrendingUp,
  framework: Lightbulb,
};

export default function Projects() {
  return (
    <section
      id="work"
      style={{ paddingTop: 96, borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <ScrollReveal>
          <div
            style={{
              display: "flex", alignItems: "baseline", justifyContent: "space-between",
              paddingBottom: 24, borderBottom: "1px solid var(--border)",
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>
                Things I&apos;ve Built
              </span>
            </div>
            <a
              href="https://github.com/AbhiPoluri"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-warm)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: "opacity .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              GitHub ↗
            </a>
          </div>
        </ScrollReveal>

        {/* Project rows */}
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {projects.map((project, i) => {
            const meta = typeMeta[project.type] ?? typeMeta.tech;
            const ImpactIcon: IconComp = impactIcons[project.type] ?? Zap;
            return (
              <ScrollReveal key={project.id} delay={i * 80}>
                <li
                  className="project-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "52px 1fr auto",
                    alignItems: "start",
                    gap: 24,
                    borderBottom: "1px solid var(--border)",
                    cursor: "pointer",
                    borderRadius: 4,
                  }}
                  onClick={() => { if (project.link) window.open(project.link, "_blank"); }}
                >
                  {/* Number */}
                  <span
                    className="project-number"
                    style={{
                      fontSize: 12, fontWeight: 700, color: "var(--faint)",
                      fontVariantNumeric: "tabular-nums", paddingTop: 30,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Main */}
                  <div style={{ padding: "28px 0" }}>
                    <div
                      className="project-title-text"
                      style={{
                        fontSize: "clamp(18px, 2.2vw, 24px)",
                        fontWeight: 700,
                        letterSpacing: "-0.015em",
                        color: "var(--ink)",
                        marginBottom: 8,
                        transition: "color .2s",
                      }}
                    >
                      {project.title}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, maxWidth: 520 }}>
                      {project.description.split(".")[0]}.
                    </div>

                    {/* Impact badge */}
                    <div
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        marginTop: 12,
                        background: "var(--accent-warm-muted)",
                        border: "1px solid var(--accent-warm)",
                        padding: "4px 10px", borderRadius: 99,
                        fontSize: 11, fontWeight: 600,
                        color: "var(--accent-warm)",
                      }}
                    >
                      <ImpactIcon size={11} /> {project.impact}
                    </div>

                    {/* Tags */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                      {project.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="tag-pill"
                          style={{
                            fontSize: 11, background: "var(--surface)",
                            border: "1px solid var(--border)",
                            color: "var(--muted)", padding: "3px 10px",
                            borderRadius: 99, fontWeight: 500,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Meta */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, paddingTop: 28 }}>
                    <span
                      style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: ".06em",
                        textTransform: "uppercase",
                        background: meta.bg, color: meta.color,
                        padding: "3px 8px", borderRadius: 6,
                      }}
                    >
                      {meta.label}
                    </span>
                    <span className="project-arrow" style={{ fontSize: 18, paddingTop: 4 }}>↗</span>
                  </div>
                </li>
              </ScrollReveal>
            );
          })}
        </ul>

        {/* Call to action below projects */}
        <ScrollReveal delay={200}>
          <div
            style={{
              padding: "36px 0",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 16,
            }}
          >
            <p style={{ fontSize: 14, color: "var(--muted)" }}>
              More in progress — always building.
            </p>
            <a
              href="https://github.com/AbhiPoluri"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent"
              style={{
                fontSize: 13, fontWeight: 700,
                padding: "9px 20px", borderRadius: 8,
                textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              View on GitHub ↗
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
