"use client";

import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "Work",    href: "#work" },
  { label: "About",   href: "#about" },
  { label: "Skills",  href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b"
      style={
        scrolled
          ? { background: "var(--bg)", borderColor: "var(--border)" }
          : { background: "transparent", borderColor: "transparent" }
      }
    >
      <nav
        className="flex items-center justify-between px-8 h-[58px]"
        style={{ maxWidth: 1080, margin: "0 auto" }}
      >
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="text-sm font-bold tracking-tight"
          style={{ color: "var(--ink)", textDecoration: "none", transition: "color .2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-warm)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink)")}
        >
          Abhi Poluri
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <button
              key={l.href}
              onClick={() => go(l.href)}
              className="nav-link text-[13px] font-medium"
              style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer", transition: "color .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              {l.label}
            </button>
          ))}

          <ThemeToggle />

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent text-xs font-semibold px-4 py-[7px] rounded-md"
            style={{ textDecoration: "none" }}
          >
            Resume ↗
          </a>
        </div>

        {/* Mobile row */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <button
            className="p-1"
            style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden px-8 py-5 flex flex-col gap-4 border-t"
          style={{ background: "var(--bg)", borderColor: "var(--border)" }}
        >
          {links.map((l) => (
            <button
              key={l.href}
              onClick={() => go(l.href)}
              className="text-left text-sm font-medium"
              style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer", transition: "color .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-warm)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              {l.label}
            </button>
          ))}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent text-xs font-semibold px-4 py-2 rounded-md text-center"
            style={{ textDecoration: "none" }}
          >
            Resume ↗
          </a>
        </div>
      )}
    </header>
  );
}
