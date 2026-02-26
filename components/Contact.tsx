"use client";

import ScrollReveal from "./ScrollReveal";

export default function Contact() {
  return (
    <section
      id="contact"
      style={{
        background: "var(--dark-bg)",
        padding: "120px 0 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Large background text */}
      <div className="contact-bg-text" aria-hidden="true">
        Let&apos;s build.
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px", position: "relative" }}>

        <ScrollReveal>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#4b4b47", marginBottom: 24 }}>
            Contact
          </p>
          <h2
            style={{
              fontSize: "clamp(48px, 7vw, 88px)", fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 0.95,
              color: "#ffffff", marginBottom: 16,
            }}
          >
            Let&apos;s build{" "}
            <em style={{ fontStyle: "italic", fontWeight: 300, color: "var(--accent-warm)" }}>
              something.
            </em>
          </h2>
          <p style={{ fontSize: 15, color: "#6b6b68", lineHeight: 1.65, maxWidth: 440, marginBottom: 48 }}>
            Open to internships and collabs — especially in product, strategy,
            or anything where building meets business. Fast response, I promise.
          </p>
        </ScrollReveal>

        {/* CTA buttons */}
        <ScrollReveal delay={100}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 56 }}>
            <a
              href="mailto:abhiram.poluri@gmail.com"
              className="btn-accent btn-magnetic"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "13px 26px", borderRadius: 10,
                fontSize: 14, fontWeight: 700, textDecoration: "none",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Say hello ↗
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                border: "1px solid var(--dark-border)", color: "#8a8a86",
                padding: "12px 24px", borderRadius: 10,
                fontSize: 14, fontWeight: 600, textDecoration: "none",
                transition: "border-color .2s, color .2s, background .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-warm)";
                e.currentTarget.style.color = "var(--accent-warm)";
                e.currentTarget.style.background = "var(--accent-warm-muted)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--dark-border)";
                e.currentTarget.style.color = "#8a8a86";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Resume
            </a>
          </div>
        </ScrollReveal>

        {/* Bottom bar */}
        <ScrollReveal delay={150}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16, paddingTop: 40, borderTop: "1px solid var(--dark-border)",
          }}>
            <div style={{ display: "flex", gap: 24 }}>
              {[
                { label: "LinkedIn", href: "https://www.linkedin.com/in/abhiram-poluri-306347270/" },
                { label: "GitHub",   href: "https://github.com/AbhiPoluri" },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, fontWeight: 500, color: "#4b4b47", textDecoration: "none", transition: "color .2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-warm)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#4b4b47")}
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
            <span style={{ fontSize: 12, color: "#353533" }}>
              © {new Date().getFullYear()} Abhi Poluri · Built with Next.js
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
