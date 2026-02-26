"use client";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--dark-bg)",
        borderTop: "1px solid var(--dark-border)",
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1080, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, flexWrap: "wrap",
        }}
      >
        <p style={{ fontSize: 12, color: "#353533" }}>
          Designed &amp; coded by Abhi · Vancouver, BC
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "LinkedIn", href: "https://www.linkedin.com/in/abhiram-poluri-306347270/" },
            { label: "GitHub",   href: "https://github.com/AbhiPoluri" },
            { label: "Email",    href: "mailto:abhiram.poluri@gmail.com" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.label !== "Email" ? "_blank" : undefined}
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: "#4b4b47", textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-warm)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#4b4b47")}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
