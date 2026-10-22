"use client";

import { useEffect, useState } from "react";

const vancouverTime = () =>
  new Intl.DateTimeFormat("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Vancouver",
  }).format(new Date());

type Theme = "light" | "dark";

const currentTheme = (): Theme => {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export default function Bar() {
  // Rendered empty on the server so the static export never ships a stale time.
  const [time, setTime] = useState("");
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const tick = () => setTime(vancouverTime());
    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const sync = () => setTheme(currentTheme());
    sync();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", sync);
    window.addEventListener("theme:change", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("theme:change", sync);
    };
  }, []);

  const toggleTheme = () => {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode or blocked storage: the toggle still works for this visit.
    }
    window.dispatchEvent(new Event("theme:change"));
  };

  return (
    <header className="st-bar st-px">
      <b>Abhi Poluri</b>
      <span className="st-live">
        Vancouver{time ? ` · ${time}` : ""} · open to internships
      </span>
      <nav aria-label="Primary">
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="mailto:abhiram.poluri@gmail.com">Email</a>
        <a href="/resume.pdf">Résumé</a>
        <button
          type="button"
          className="st-theme"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </nav>
    </header>
  );
}
