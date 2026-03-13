"use client";

import ScrollReveal from "./ScrollReveal";
import { projects } from "@/data/projects";
import { Zap, Lightbulb } from "./Icons";
import type { ComponentType } from "react";

type IconComp = ComponentType<{ size?: number; className?: string }>;

const typeMeta: Record<string, { label: string; color: string; bg: string }> = {
  tech:      { label: "Technical", color: "#2563eb", bg: "rgba(37,99,235,0.08)"  },
  business:  { label: "Business",  color: "#15803d", bg: "rgba(21,128,61,0.08)"  },
  framework: { label: "Framework", color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
};

const impactIcons: Record<string, IconComp> = {
  tech:      Zap,
  business:  Zap,
  framework: Lightbulb,
};

const previewThemes: Record<number, { bg: string; accent: string; dots: string }> = {
  1: { bg: "linear-gradient(135deg, #0a0a14 0%, #0f1a2e 60%, #0a1628 100%)", accent: "#60a5fa", dots: "rgba(96,165,250,0.12)" },
  3: { bg: "linear-gradient(135deg, #060f0a 0%, #0a1f12 60%, #081a10 100%)", accent: "#4ade80", dots: "rgba(74,222,128,0.12)" },
  4: { bg: "linear-gradient(135deg, #0a0a0a 0%, #0f1a0a 60%, #0c1a08 100%)", accent: "#a3f050", dots: "rgba(163,240,80,0.12)" },
  5: { bg: "linear-gradient(135deg, #0f0a1e 0%, #1a0f2e 60%, #140a24 100%)", accent: "#a78bfa", dots: "rgba(167,139,250,0.12)" },
};

function BrowserPreview({ previewUrl, title, projectId, screenshot }: { previewUrl: string | null; title: string; projectId: number; screenshot: string | null }) {
  const displayUrl = previewUrl ? previewUrl.replace("https://", "") : title.toLowerCase().replace(/\s+/g, "-");
  const theme = previewThemes[projectId] ?? { bg: "linear-gradient(135deg, #0a0a0a 0%, #141428 100%)", accent: "#888", dots: "rgba(255,255,255,0.06)" };
  const initial = title[0].toUpperCase();

  return (
    <div style={{
      borderRadius: "10px 10px 0 0",
      overflow: "hidden",
      border: "1px solid var(--border)",
      borderBottom: "none",
      background: "#111",
    }}>
      {/* Browser chrome */}
      <div style={{
        background: "#1a1a1a",
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderBottom: "1px solid #2a2a2a",
      }}>
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <span key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, display: "block" }} />
          ))}
        </div>
        <div style={{
          flex: 1,
          background: "#2a2a2a",
          borderRadius: 5,
          padding: "3px 10px",
          fontSize: 11,
          color: "#888",
          fontFamily: "var(--font-mono, monospace)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {displayUrl}
        </div>
      </div>

      {/* Preview */}
      <div style={{ height: 200, overflow: "hidden", position: "relative", background: theme.bg }}>
        {screenshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={screenshot}
            alt={`${title} preview`}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
            loading="lazy"
          />
        ) : (
          <>
            <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, ${theme.dots} 1px, transparent 1px)`, backgroundSize: "18px 18px" }} />
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 30%, ${theme.dots.replace("0.12", "0.25")} 0%, transparent 70%)` }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${theme.accent}22`, border: `1.5px solid ${theme.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: theme.accent }}>
                {initial}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: theme.accent, opacity: 0.6, letterSpacing: "0.06em" }}>{displayUrl}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <section
      id="work"
      style={{ paddingTop: 96, borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <ScrollReveal>
          <div style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between",
            paddingBottom: 24, borderBottom: "1px solid var(--border)",
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>
              Things I&apos;ve Built
            </span>
            <a
              href="https://github.com/AbhiPoluri"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-warm)", textDecoration: "none", transition: "opacity .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              GitHub ↗
            </a>
          </div>
        </ScrollReveal>

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{
          gap: 24,
          paddingTop: 40,
          paddingBottom: 48,
        }}>
          {projects.map((project, i) => {
            const meta = typeMeta[project.type] ?? typeMeta.tech;
            const ImpactIcon: IconComp = impactIcons[project.type] ?? Zap;
            return (
              <ScrollReveal key={project.id} delay={i * 70}>
                <div
                  className="project-card"
                  style={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    overflow: "hidden",
                    cursor: project.link ? "pointer" : "default",
                    background: "var(--bg)",
                  }}
                  onClick={() => { if (project.link) window.open(project.link, "_blank"); }}
                >
                  {/* Browser preview */}
                  <BrowserPreview previewUrl={project.previewUrl} title={project.title} projectId={project.id} screenshot={project.screenshot ?? null} />

                  {/* Info */}
                  <div style={{ padding: "20px 22px 22px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: "clamp(16px, 1.8vw, 20px)",
                          fontWeight: 700,
                          letterSpacing: "-0.015em",
                          color: "var(--ink)",
                        }}
                      >
                        {project.title}
                      </span>
                      <span
                        style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: ".06em",
                          textTransform: "uppercase",
                          background: meta.bg, color: meta.color,
                          padding: "3px 7px", borderRadius: 5, flexShrink: 0, marginLeft: 8,
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 12px" }}>
                      {project.description.split(".")[0]}.
                    </p>

                    {/* Impact */}
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      background: "var(--accent-warm-muted)",
                      border: "1px solid var(--accent-warm)",
                      padding: "3px 9px", borderRadius: 99,
                      fontSize: 11, fontWeight: 600,
                      color: "var(--accent-warm)",
                      marginBottom: 12,
                    }}>
                      <ImpactIcon size={11} /> {project.impact}
                    </div>

                    {/* Tags */}
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {project.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: 11, background: "var(--surface)",
                            border: "1px solid var(--border)",
                            color: "var(--muted)", padding: "2px 8px",
                            borderRadius: 99, fontWeight: 500,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* CTA */}
        <ScrollReveal delay={200}>
          <div style={{
            paddingBottom: 48,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16,
            borderTop: "1px solid var(--border)", paddingTop: 32,
          }}>
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
