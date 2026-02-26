// Replaced scrolling ticker with a clean editorial info strip

const infoItems = [
  { label: "Location", value: "Vancouver, BC" },
  { label: "Studying", value: "BBA · Simon Fraser University" },
  { label: "Status",   value: "Open to internships" },
  { label: "Focus",    value: "Product · Strategy · AI" },
];

export default function InfoStrip() {
  return (
    <div
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 32px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
        className="info-strip-grid"
      >
        {infoItems.map((item, i) => (
          <div
            key={item.label}
            style={{
              padding: "14px 0",
              borderRight: i < infoItems.length - 1 ? "1px solid var(--border)" : "none",
              paddingRight: i < infoItems.length - 1 ? 24 : 0,
              paddingLeft: i > 0 ? 24 : 0,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 3 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .info-strip-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
