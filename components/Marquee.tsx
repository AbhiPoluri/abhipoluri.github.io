const items = [
  "AI Dashboards", "Retail Arbitrage", "Next.js", "FastAPI",
  "Simon Fraser University", "Entrepreneurship", "Python", "Business Strategy",
  "React", "Product Thinking", "Docker", "Market Research",
  "AI / ML", "Computer Vision",
];

export default function Marquee() {
  const doubled = [...items, ...items];

  return (
    <div
      className="overflow-hidden border-b select-none"
      style={{
        padding: "14px 0",
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              whiteSpace: "nowrap",
              padding: "0 24px",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--muted)",
              letterSpacing: ".06em",
              textTransform: "uppercase",
              display: "inline-flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            {item}
            <span style={{ color: "var(--faint)", fontSize: 16 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
