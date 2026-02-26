// Lightweight inline SVG icons — 16×16, 1.5px stroke, Lucide-style

type IconProps = { size?: number; className?: string; style?: React.CSSProperties };

const icon =
  (paths: React.ReactNode) =>
  ({ size = 14, className = "", style }: IconProps) =>
    (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ flexShrink: 0, ...style }}
      >
        {paths}
      </svg>
    );

// ── Business ────────────────────────────────────────
export const BarChart    = icon(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>);
export const Rocket      = icon(<><path d="M4.5 16.5c-1.5 1.5-1.5 5.5-1.5 5.5s4 0 5.5-1.5l4.5-4.5-4-4z"/><path d="M12 15L9 12c1.5-3 4-5.5 7.5-7.5 0 0 2 0 3 1-2 3.5-4.5 6-7.5 7.5z"/><circle cx="18" cy="6" r="1.5"/></>);
export const Search      = icon(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>);
export const TrendingUp  = icon(<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>);
export const Lightbulb   = icon(<><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.3 6l-.7.5V18H9v-2.5l-.7-.5A7 7 0 0112 2z"/></>);
export const ShoppingBag = icon(<><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>);
export const Clipboard   = icon(<><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><path d="M15 2H9a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1z"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></>);
export const Users       = icon(<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>);

// ── Technical ───────────────────────────────────────
export const Code        = icon(<><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>);
export const Terminal    = icon(<><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></>);
export const Zap         = icon(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>);
export const Database    = icon(<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>);
export const Box         = icon(<><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>);
export const Cpu         = icon(<><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></>);
export const Eye         = icon(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>);
export const LineChart   = icon(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><polyline points="1 20 5 16 9 20 15 14 19 18 23 14"/></>);
export const Link        = icon(<><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></>);
export const GradCap     = icon(<><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>);
export const Atom        = icon(<><circle cx="12" cy="12" r="1"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10"/><path d="M4.93 4.93l14.14 14.14"/></>);
