"use client";

import { useEffect, useRef, useState } from "react";

export default function Nav() {
  const [progress, setProgress] = useState(0);
  const resumeStart = useRef<{ x: number; y: number } | null>(null);
  const resumeDistance = useRef(0);

  useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? window.scrollY / total : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const tearResume = (event: React.PointerEvent<HTMLButtonElement>) => {
    resumeStart.current = { x: event.clientX, y: event.clientY };
    resumeDistance.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pullResume = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!resumeStart.current) return;
    const x = event.clientX - resumeStart.current.x;
    const y = event.clientY - resumeStart.current.y;
    resumeDistance.current = Math.hypot(x, y);
    event.currentTarget.style.transform = `translate(${x * 0.34}px, ${y * 0.34}px) rotate(${x * 0.025}deg)`;
    event.currentTarget.style.setProperty("--tear-progress", String(Math.min(1, resumeDistance.current / 90)));
  };

  const releaseResume = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!resumeStart.current) return;
    const torn = resumeDistance.current > 72;
    resumeStart.current = null;
    event.currentTarget.style.transform = "";
    event.currentTarget.style.removeProperty("--tear-progress");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (torn) {
      const download = document.createElement("a");
      download.href = "/resume.pdf";
      download.download = "Abhi-Poluri-Resume.pdf";
      download.click();
      window.dispatchEvent(new CustomEvent("desk:stamp", {
        detail: { label: "TEAR HERE", x: event.clientX, y: event.clientY },
      }));
      window.dispatchEvent(new CustomEvent("desk:sound", { detail: { kind: "paper" } }));
    }
  };

  return (
    <header className="site-header">
      <nav className="shell nav-shell" aria-label="Primary navigation">
        <a className="wordmark" href="#top" aria-label="Abhi Poluri, back to top">
          <span className="wordmark-mark">AP</span>
          <span>Abhi Poluri</span>
        </a>

        <div className="nav-links">
          <a href="#work">Selected work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-external" aria-label="External profiles and résumé">
          <a href="https://github.com/AbhiPoluri" target="_blank" rel="noopener noreferrer">
            <span className="external-full">GitHub</span>
            <span className="external-short">GH</span>
            <span aria-hidden="true">↗</span>
          </a>
          <a
            href="https://www.linkedin.com/in/abhiram-poluri/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="external-full">LinkedIn</span>
            <span className="external-short">IN</span>
            <span aria-hidden="true">↗</span>
          </a>
          <button
            className="tear-resume"
            type="button"
            onPointerDown={tearResume}
            onPointerMove={pullResume}
            onPointerUp={releaseResume}
            onPointerCancel={releaseResume}
            onClick={() => {
              if (resumeDistance.current <= 4) window.open("/resume.pdf", "_blank", "noopener,noreferrer");
            }}
            aria-label="Drag to tear off and download the résumé, or click to open it"
          >
            <span className="external-full">Résumé</span>
            <span className="external-short">CV</span>
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </nav>
      <span className="nav-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
    </header>
  );
}
