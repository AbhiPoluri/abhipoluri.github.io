"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { projects } from "@/data/projects";
import { products } from "@/data/products";

gsap.registerPlugin(useGSAP);

const archive = [
  ...projects.map((project, index) => ({
    name: project.title,
    subtitle: project.impact,
    media: project.screenshot,
    link: project.link,
    status: index < 2 ? "recent" : "notable",
  })),
  ...products.map((product) => ({
    name: product.name,
    subtitle: product.tagline,
    media: null,
    link: product.link,
    status: "experiment",
  })),
];

export default function ProjectTunnel() {
  const root = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<"recent" | "notable" | "all">("all");

  useGSAP(
    () => {
      const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });

      timeline
        .from(".tunnel-title-line > span", {
          yPercent: 120,
          skewY: 8,
          duration: 1,
          stagger: 0.12,
        })
        .from(".tunnel-subcopy > *", { y: 24, opacity: 0, duration: 0.65, stagger: 0.08 }, "-=0.45")
        .from(".tunnel-window", { clipPath: "inset(50% 0 50% 0)", duration: 1.15 }, "-=0.7");

      gsap.to(".tunnel-track", {
        xPercent: -50,
        duration: 34,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".tunnel-ghost-one", {
        xPercent: -14,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".tunnel-ghost-two", {
        xPercent: 12,
        duration: 13,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      const skew = gsap.quickTo(".tunnel-track", "skewX", { duration: 0.4, ease: "power3" });
      let previousX = 0;
      const move = (event: PointerEvent) => {
        const velocity = Math.max(-8, Math.min(8, (event.clientX - previousX) * 0.16));
        previousX = event.clientX;
        skew(velocity);
      };

      const element = root.current;
      element?.addEventListener("pointermove", move);
      return () => element?.removeEventListener("pointermove", move);
    },
    { scope: root, dependencies: [filter], revertOnUpdate: true },
  );

  const visibleArchive = filter === "all" ? archive : archive.filter((project) => project.status === filter);
  const repeatedArchive = [...visibleArchive, ...visibleArchive];

  return (
    <section className="tunnel-concept" ref={root}>
      <div className="tunnel-noise" aria-hidden="true" />
      <div className="tunnel-ghost tunnel-ghost-one" aria-hidden="true">MAKE</div>
      <div className="tunnel-ghost tunnel-ghost-two" aria-hidden="true">MOVE</div>

      <div className="concept-nav tunnel-nav">
        <span>Abhi Poluri</span>
        <span>Selected / Recent / Everything</span>
        <a href="mailto:abhiram.poluri@gmail.com">Make contact</a>
      </div>

      <div className="tunnel-hero">
        <div className="tunnel-headline">
          <h1>
            <span className="tunnel-title-line"><span>Make it</span></span>
            <span className="tunnel-title-line tunnel-title-accent"><span>real.</span></span>
          </h1>
          <div className="tunnel-subcopy">
            <p>Product thinking with enough technical range to build the proof.</p>
            <div>
              <button
                className={filter === "recent" ? "is-active" : ""}
                aria-pressed={filter === "recent"}
                onClick={() => setFilter("recent")}
                type="button"
              >
                Recent
              </button>
              <button
                className={filter === "notable" ? "is-active" : ""}
                aria-pressed={filter === "notable"}
                onClick={() => setFilter("notable")}
                type="button"
              >
                Notable
              </button>
              <button
                className={filter === "all" ? "is-active" : ""}
                aria-pressed={filter === "all"}
                onClick={() => setFilter("all")}
                type="button"
              >
                All projects
              </button>
            </div>
          </div>
        </div>

        <div className="tunnel-window">
          <div className="tunnel-track">
            {repeatedArchive.map((project, index) => (
              <a
                className="tunnel-card"
                href={project.link ?? undefined}
                target={project.link ? "_blank" : undefined}
                rel={project.link ? "noopener noreferrer" : undefined}
                key={`${project.name}-${index}`}
              >
                <div className="tunnel-card-media">
                  {project.media ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.media} alt={`${project.name} interface`} />
                  ) : (
                    <span>{project.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="tunnel-card-copy">
                  <span>{project.status}</span>
                  <strong>{project.name}</strong>
                  <p>{project.subtitle}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="tunnel-footer">
        <span>Move sideways through the archive</span>
        <span>Seven projects and counting</span>
      </div>
    </section>
  );
}
