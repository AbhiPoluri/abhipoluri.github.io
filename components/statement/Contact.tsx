"use client";

import { useState } from "react";

const materials = ["Product", "Strategy", "Code"];

export default function Contact() {
  const [loaded, setLoaded] = useState<string[]>([]);
  const complete = loaded.length === materials.length;

  const toggle = (material: string) => {
    setLoaded((current) =>
      current.includes(material)
        ? current.filter((item) => item !== material)
        : [...current, material],
    );
    window.dispatchEvent(new CustomEvent("desk:sound", { detail: { kind: "impact" } }));
  };

  const pill = (material: string) => (
    <button
      type="button"
      className="st-pill"
      aria-pressed={loaded.includes(material)}
      onClick={() => toggle(material)}
    >
      {material}
      {loaded.includes(material) ? " ✓" : ""}
    </button>
  );

  return (
    <section
      className={`st-contact st-px${complete ? " is-forged" : ""}`}
      id="contact"
      aria-labelledby="contact-title"
    >
      <h2 className="st-big" id="contact-title">
        Hiring an intern? Email me, or load {pill("Product")} {pill("Strategy")} and{" "}
        {pill("Code")} first and see what happens.
      </h2>
      <p className="st-forged" role="status">
        {complete ? "Ready to ship. The invitation is below." : `${loaded.length} / 3 loaded`}
      </p>
      <a className="st-mail" href="mailto:abhiram.poluri@gmail.com">
        abhiram.poluri@gmail.com
      </a>
      <footer className="st-foot">
        <span>© 2026 Abhi Poluri. This page hides two keyboard secrets.</span>
        <nav aria-label="Elsewhere">
          <a href="https://github.com/AbhiPoluri" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/abhiram-poluri/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://sprite123.itch.io" target="_blank" rel="noreferrer">itch.io</a>
          <a href="/resume.pdf">Résumé</a>
        </nav>
      </footer>
    </section>
  );
}
