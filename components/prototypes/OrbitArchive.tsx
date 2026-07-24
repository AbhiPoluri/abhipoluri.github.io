"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { projects } from "@/data/projects";
import { products } from "@/data/products";

gsap.registerPlugin(useGSAP);

const orbitProjects = [
  ...projects.map((project) => ({ name: project.title, link: project.link, type: project.type })),
  ...products.map((product) => ({ name: product.name, link: product.link, type: "product" })),
];

export default function OrbitArchive() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const timeline = gsap.timeline({ defaults: { ease: "expo.out" } });

      timeline
        .from(".orbit-title-char", {
          yPercent: 110,
          rotateX: -80,
          opacity: 0,
          duration: 1.25,
          stagger: 0.035,
          transformOrigin: "50% 100%",
        })
        .from(".orbit-copy > *", { x: -24, opacity: 0, duration: 0.7, stagger: 0.1 }, "-=0.6")
        .from(".orbit-ring, .orbit-node", { scale: 0.7, opacity: 0, duration: 1, stagger: 0.05 }, "-=0.75");

      gsap.to(".orbit-system", { rotation: 360, duration: 46, repeat: -1, ease: "none" });
      gsap.to(".orbit-node", { rotation: -360, duration: 46, repeat: -1, ease: "none" });
      gsap.to(".orbit-pulse", { scale: 1.45, opacity: 0, duration: 2.4, repeat: -1, stagger: 0.8 });

      const rotateY = gsap.quickTo(".orbit-stage-inner", "rotationY", { duration: 0.8, ease: "power3" });
      const rotateX = gsap.quickTo(".orbit-stage-inner", "rotationX", { duration: 0.8, ease: "power3" });

      const move = (event: PointerEvent) => {
        const bounds = root.current?.getBoundingClientRect();
        if (!bounds) return;
        rotateY((event.clientX / bounds.width - 0.5) * 10);
        rotateX((event.clientY / bounds.height - 0.5) * -8);
      };

      const element = root.current;
      element?.addEventListener("pointermove", move);
      return () => element?.removeEventListener("pointermove", move);
    },
    { scope: root },
  );

  const headline = "Ideas in orbit.";
  const headlineLines = ["Ideas in", "orbit."];

  return (
    <section className="orbit-concept" ref={root}>
      <div className="orbit-grid" aria-hidden="true" />
      <div className="concept-nav orbit-nav">
        <span>Abhi Poluri</span>
        <span>Seven shipped objects / one evolving practice</span>
        <a href="mailto:abhiram.poluri@gmail.com">Open channel</a>
      </div>

      <div className="orbit-layout">
        <div className="orbit-copy">
          <p>Every project changes the trajectory.</p>
          <h1 aria-label={headline}>
            {headlineLines.map((line, lineIndex) => (
              <span className="orbit-title-line" key={line}>
                {line.split("").map((character, index) => (
                  <span className="orbit-title-clip" key={`${character}-${lineIndex}-${index}`}>
                    <span className="orbit-title-char">{character === " " ? "\u00A0" : character}</span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <p className="orbit-intro">
            Explore a living archive of AI tools, mobile products, planning systems, and experiments.
          </p>
          <div className="orbit-legend">
            <span><i /> Recent</span>
            <span><i /> Notable</span>
            <span><i /> Experimental</span>
          </div>
        </div>

        <div className="orbit-stage">
          <div className="orbit-stage-inner">
            <div className="orbit-core">
              <span className="orbit-pulse" />
              <span className="orbit-pulse" />
              <span className="orbit-pulse" />
              <strong>AP</strong>
              <small>building<br />now</small>
            </div>
            <div className="orbit-system">
              <span className="orbit-ring orbit-ring-one" />
              <span className="orbit-ring orbit-ring-two" />
              <span className="orbit-ring orbit-ring-three" />
              {orbitProjects.map((project, index) => (
                <a
                  className={`orbit-node orbit-node-${index + 1}`}
                  href={project.link ?? undefined}
                  target={project.link ? "_blank" : undefined}
                  rel={project.link ? "noopener noreferrer" : undefined}
                  key={project.name}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{project.name}</strong>
                  <small>{project.type}</small>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="orbit-hint">Hover an object to interrupt its path</p>
    </section>
  );
}
