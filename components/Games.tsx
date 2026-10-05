"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { work } from "@/data/work";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const games = work.filter((item) => item.kind === "game");

const statusLabel: Record<string, string> = {
  playable: "Free on itch.io",
  shipped: "Open source",
  research: "Research",
  live: "Live",
  private: "Private",
};

export default function Games() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const motion = gsap.matchMedia();
      motion.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".game-card");
        gsap.set(cards, { opacity: 0, y: 26 });
        ScrollTrigger.batch(cards, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              stagger: 0.07,
              duration: 0.7,
              ease: "power3.out",
              overwrite: true,
              clearProps: "transform",
            }),
        });
      });
      return () => motion.revert();
    },
    { scope: root },
  );

  return (
    <section className="games-section" id="games" ref={root}>
      <div className="shell games-intro">
        <p className="chapter-line">Games</p>
        <h2>
          Four things I built
          <span>and kept playing.</span>
        </h2>
        <p>
          Two Godot games you can download and play, the asset pipeline they both run on, and
          one experiment that failed honestly. Design decisions, and what changed after I played them.
        </p>
      </div>

      <div className="shell games-grid">
        {games.map((game) => {
          const link = game.links[0];
          const external = !link.href.startsWith("#");
          return (
            <article className="game-card" key={game.id} data-status={game.status}>
              {game.image ? (
                <div className="game-card-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={game.image} alt={`${game.name} screenshot`} loading="lazy" draggable={false} />
                </div>
              ) : null}
              <header className="game-card-head">
                <span className="game-card-kind">{game.label}</span>
                <span className="game-card-status">{statusLabel[game.status] ?? game.status}</span>
              </header>
              <h3>{game.name}</h3>
              <p className="game-card-tagline">{game.tagline}</p>
              <p className="game-card-body">{game.description}</p>
              <ul className="game-card-tags" aria-label={`${game.name} stack`}>
                {game.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <a
                className="game-card-link"
                href={link.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
              >
                {link.label}
                <span aria-hidden="true">{external ? "↗" : "↓"}</span>
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
