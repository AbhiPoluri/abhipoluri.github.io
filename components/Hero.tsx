"use client";

import { useEffect, useRef } from "react";

const CYCLE_WORDS = ["products.", "quickly.", "things that work."];
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%&";

function TypeCycler() {
  const spanRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const scramble = (target: string) => {
      let iteration = 0;
      const total = target.length * 3;
      const tick = () => {
        if (!spanRef.current) return;
        spanRef.current.textContent = target
          .split("")
          .map((char, idx) => {
            if (char === " ") return " ";
            if (idx < iteration / 3) return char;
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join("");
        iteration++;
        if (iteration <= total) timerRef.current = setTimeout(tick, 28);
      };
      tick();
    };

    const kickoff = setTimeout(() => scramble(CYCLE_WORDS[0]), 600);
    const interval = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % CYCLE_WORDS.length;
      scramble(CYCLE_WORDS[indexRef.current]);
    }, 2800);

    return () => {
      clearTimeout(kickoff);
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <span
      ref={spanRef}
      style={{
        color: "var(--accent-warm)",
        fontStyle: "italic",
        fontWeight: 300,
        fontFamily: "inherit",
        minWidth: "6ch",
        display: "inline-block",
      }}
    >
      {CYCLE_WORDS[0]}
    </span>
  );
}

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
      {/* Aurora background */}
      <div className="aurora" aria-hidden="true">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        <div className="aurora-blob aurora-blob-4" />
        <div className="aurora-noise" />
      </div>

      {/* Hero content */}
      <div style={{ maxWidth: 1080, margin: "0 auto", width: "100%", padding: "0 32px", position: "relative", zIndex: 2 }}>

        {/* Eyebrow with live indicator */}
        <div
          className="a-scale-in d1 inline-flex items-center gap-3 mb-8"
          style={{ fontSize: 12, fontWeight: 600, color: "var(--hero-muted)", letterSpacing: ".04em" }}
        >
          {/* Open to work badge */}
          <span
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "var(--accent-warm-muted)",
              border: "1px solid var(--accent-warm)",
              color: "var(--accent-warm)",
              padding: "4px 10px", borderRadius: 99,
              fontSize: 11, fontWeight: 700, letterSpacing: ".04em",
            }}
          >
            <span
              className="live-dot"
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--accent-warm)", flexShrink: 0,
              }}
            />
            Open to internships
          </span>

          <span style={{ color: "var(--hero-dot)", opacity: 0.4 }}>·</span>
          <span>Vancouver, BC</span>
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
          <span style={{ display: "block" }}>I ship</span>
          <span style={{ display: "block" }}>
            <TypeCycler />
          </span>
        </h1>

        {/* Sub-row */}
        <div
          className="a-fade-up d3"
          style={{ display: "flex", alignItems: "flex-start", gap: 48, flexWrap: "wrap", paddingBottom: 32 }}
        >
          <p style={{ fontSize: 15, color: "var(--hero-muted)", lineHeight: 1.7, maxWidth: 460, flex: 1 }}>
            Building at SFU — AI dashboards, planning tools, a side business that actually made money.
            Looking for the role where product thinking and execution meet.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 2 }}>
            <a
              href="#work"
              className="btn-accent btn-magnetic"
              style={{
                fontSize: 13, fontWeight: 700,
                padding: "11px 24px", borderRadius: 8, textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 7,
              }}
            >
              See what I&apos;ve built
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-magnetic"
              style={{
                fontSize: 13, fontWeight: 600,
                color: "var(--hero-ghost-text)",
                border: "1px solid var(--hero-ghost-border)",
                padding: "10px 20px", borderRadius: 8,
                textDecoration: "none",
                transition: "color .2s, border-color .2s, background .2s",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--hero-text)";
                e.currentTarget.style.borderColor = "var(--hero-muted)";
                e.currentTarget.style.background = "rgba(128,128,128,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--hero-ghost-text)";
                e.currentTarget.style.borderColor = "var(--hero-ghost-border)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              Resume ↗
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
          { val: "4+",    lbl: "Products shipped" },
          { val: "2028",  lbl: "SFU · BBA Expected" },
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
