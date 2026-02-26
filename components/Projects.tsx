import ScrollReveal from "./ScrollReveal";
import { projects } from "@/data/projects";

const typeLabel: Record<string, string> = {
  tech: "Technical",
  business: "Business",
};
const typeStyle: Record<string, React.CSSProperties> = {
  tech:     { color: "#1d4ed8" },
  business: { color: "#15803d" },
  framework:{ color: "#7c3aed" },
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
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>
              Selected Work
            </span>
            <a
              href="https://github.com/AbhiPoluri"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, fontWeight: 500, color: "var(--accent)", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              All projects ↗
            </a>
          </div>
        </ScrollReveal>

        {/* Project rows */}
        <ul style={{ listStyle: "none" }}>
          {projects.map((project, i) => (
            <ScrollReveal key={project.id} delay={i * 80}>
              <li
                className="project-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr auto",
                  alignItems: "center",
                  gap: 24,
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                }}
              >
                {/* Number */}
                <span
                  style={{
                    fontSize: 12, fontWeight: 700, color: "var(--faint)",
                    fontVariantNumeric: "tabular-nums", padding: "28px 0",
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
                      marginBottom: 6,
                      transition: "color .2s",
                    }}
                  >
                    {project.title}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, maxWidth: 520 }}>
                    {project.description.split(".")[0]}.
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                    {project.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 11, background: "var(--surface)", border: "1px solid var(--border)",
                          color: "var(--muted)", padding: "3px 10px", borderRadius: 99, fontWeight: 500,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Meta */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, padding: "28px 0" }}>
                  <span
                    style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase",
                      ...(typeStyle[project.type] ?? typeStyle.tech),
                    }}
                  >
                    {typeLabel[project.type] ?? "Framework"}
                  </span>
                  <span className="project-arrow" style={{ fontSize: 18 }}>↗</span>
                </div>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
