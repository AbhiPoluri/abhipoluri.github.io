"use client";

import { useState } from "react";
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

// Gradient placeholders for projects without a live URL
const placeholderGradients: Record<number, string> = {
  4: "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0c4a6e 100%)",
  5: "linear-gradient(135deg, #0f0a1e 0%, #1e1040 40%, #2d1b69 100%)",
};

function BrowserPreview({ previewUrl, title, projectId }: { previewUrl: string | null; title: string; projectId: number }) {
  const [iframeErr, setIframeErr] = useState(false);
  const [visible, setVisible] = useState(false);
  const displayUrl = previewUrl ? previewUrl.replace("https://", "") : null;

  // Only load iframe when card enters viewport
  const refCallback = (node: HTMLDivElement | null) => {
    if (!node) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(node);
  };

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
          {displayUrl ?? title.toLowerCase().replace(/\s+/g, "-")}
        </div>
      </div>

      {/* Preview area */}
      <div ref={refCallback} style={{ height: 200, overflow: "hidden", position: "relative", background: "#0a0a0a" }}>
        {previewUrl && !iframeErr && visible ? (
          <>
            <iframe
              src={previewUrl}
              title={title}
              loading="lazy"
              style={{
                width: "200%",
                height: "200%",
                transform: "scale(0.5)",
                transformOrigin: "top left",
                border: "none",
                pointerEvents: "none",
              }}
              onError={() => setIframeErr(true)}
              sandbox="allow-scripts allow-same-origin"
            />
            {/* Click overlay — prevent iframe interaction, let card handle click */}
            <div style={{ position: "absolute", inset: 0 }} />
          </>
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            background: placeholderGradients[projectId] ?? "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "#fff", opacity: 0.3 }}>
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", opacity: 0.25, letterSpacing: "0.08em" }}>GitHub</span>
          </div>
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
                  <BrowserPreview previewUrl={project.previewUrl} title={project.title} projectId={project.id} />

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
