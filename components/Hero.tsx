export default function Hero() {
  return (
    <section
      id="hero"
      className="flex flex-col justify-end border-b"
      style={{
        minHeight: "100svh",
        paddingTop: 58,
        borderColor: "var(--hero-border)",
        background: "var(--hero-bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Aurora background — faint in light, vivid in dark */}
      <div className="aurora" aria-hidden="true">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        <div className="aurora-blob aurora-blob-4" />
        <div className="aurora-noise" />
      </div>

      {/* Hero content */}
      <div style={{ maxWidth: 1080, margin: "0 auto", width: "100%", padding: "0 32px", position: "relative", zIndex: 2 }}>
        {/* Eyebrow */}
        <div
          className="a-scale-in d1 inline-flex items-center gap-2 mb-7"
          style={{ fontSize: 12, fontWeight: 600, color: "var(--hero-muted)", letterSpacing: ".04em", textTransform: "uppercase" }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--hero-dot)", flexShrink: 0 }} />
          Simon Fraser University · Vancouver, BC
        </div>

        {/* Headline */}
        <h1
          className="a-fade-up d2"
          style={{
            fontSize: "clamp(52px, 8vw, 96px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 0.97,
            color: "var(--hero-text)",
            marginBottom: 36,
          }}
        >
          <span style={{ display: "block" }}>Business student.</span>
          <span style={{ display: "block" }}>
            <em style={{ fontStyle: "italic", fontWeight: 300 }}>Product</em> builder.
          </span>
        </h1>

        {/* Sub-row */}
        <div
          className="a-fade-up d3"
          style={{ display: "flex", alignItems: "flex-start", gap: 48, flexWrap: "wrap", paddingBottom: 32 }}
        >
          <p style={{ fontSize: 15, color: "var(--hero-muted)", lineHeight: 1.65, maxWidth: 440, flex: 1 }}>
            Studying business at Simon Fraser University, with a few years of building behind
            me — AI dashboards, planning tools, a side business that got off the ground.
            Looking for roles where product thinking and strategy overlap.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 2 }}>
            <a
              href="#work"
              style={{
                fontSize: 13, fontWeight: 600,
                background: "var(--hero-btn-bg)", color: "var(--hero-btn-text)",
                padding: "10px 22px", borderRadius: 8, textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 6,
                transition: "opacity .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = ".8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              View Work →
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13, fontWeight: 600,
                color: "var(--hero-ghost-text)",
                border: "1px solid var(--hero-ghost-border)",
                padding: "9px 20px", borderRadius: 8,
                textDecoration: "none", transition: "color .2s, border-color .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--hero-text)";
                e.currentTarget.style.borderColor = "var(--hero-muted)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--hero-ghost-text)";
                e.currentTarget.style.borderColor = "var(--hero-ghost-border)";
              }}
            >
              Download Resume
            </a>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div
        className="a-fade-in d5"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          borderTop: "1px solid var(--hero-border)",
          maxWidth: "100%",
          position: "relative",
          zIndex: 2,
        }}
      >
        {[
          { val: "$3–5k", lbl: "Revenue · Retail Arbitrage" },
          { val: "4+",    lbl: "Shipped projects" },
          { val: "SFU",   lbl: "Simon Fraser University" },
        ].map((s, i) => (
          <div
            key={s.val}
            style={{
              padding: "24px 32px",
              borderRight: i < 2 ? "1px solid var(--hero-border)" : "none",
              background: "transparent",
              transition: "background .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(128,128,128,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--hero-text)" }}>
              {s.val}
            </div>
            <div style={{ fontSize: 12, color: "var(--hero-muted)", marginTop: 2, fontWeight: 500 }}>
              {s.lbl}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
