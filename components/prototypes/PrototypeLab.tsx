"use client";

import { useState } from "react";
import Link from "next/link";
import KineticField from "./KineticField";
import OrbitArchive from "./OrbitArchive";
import ProjectTunnel from "./ProjectTunnel";
import TypePlayground from "./TypePlayground";

const concepts = [
  { id: "kinetic", number: "A", title: "Kinetic Field", tone: "Fluid / editorial" },
  { id: "orbit", number: "B", title: "Orbit Archive", tone: "Playful / spatial" },
  { id: "tunnel", number: "C", title: "Project Tunnel", tone: "Fast / graphic" },
  { id: "playground", number: "D", title: "Type Playground", tone: "Physical / chaotic" },
] as const;

type ConceptId = (typeof concepts)[number]["id"];

export default function PrototypeLab() {
  const [active, setActive] = useState<ConceptId>("kinetic");

  return (
    <main className={`prototype-lab prototype-${active}`}>
      <header className="lab-header">
        <Link href="/" className="lab-back">AP / Portfolio</Link>
        <p>Motion direction lab</p>
        <nav aria-label="Prototype concepts">
          {concepts.map((concept) => (
            <button
              className={active === concept.id ? "is-active" : ""}
              key={concept.id}
              onClick={() => setActive(concept.id)}
              type="button"
            >
              <span>{concept.number}</span>
              <strong>{concept.title}</strong>
              <small>{concept.tone}</small>
            </button>
          ))}
        </nav>
      </header>

      <div className="prototype-stage" key={active}>
        {active === "kinetic" ? <KineticField /> : null}
        {active === "orbit" ? <OrbitArchive /> : null}
        {active === "tunnel" ? <ProjectTunnel /> : null}
        {active === "playground" ? <TypePlayground /> : null}
      </div>
    </main>
  );
}
