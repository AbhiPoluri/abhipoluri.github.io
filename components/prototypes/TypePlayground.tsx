"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(useGSAP, Draggable);

const phrase = "MAKEITREAL";
const projectBlocks = ["abhimem", "NotesGraph", "Nexus", "PocketLog"];

export default function TypePlayground() {
  const root = useRef<HTMLElement>(null);
  const hitCounts = useRef(new Map<number, number>());
  const draggables = useRef<Draggable[]>([]);
  const [released, setReleased] = useState(0);
  const [mode, setMode] = useState("Gravity armed");

  useGSAP(
    () => {
      const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });

      timeline
        .from(".play-letter", {
          yPercent: -150,
          rotation: () => gsap.utils.random(-18, 18),
          opacity: 0,
          duration: 1.1,
          stagger: { each: 0.055, from: "random" },
        })
        .from(".play-instructions > *", { y: 22, opacity: 0, duration: 0.65, stagger: 0.08 }, "-=0.55")
        .from(".play-controls button", { scale: 0.7, opacity: 0, duration: 0.5, stagger: 0.06 }, "-=0.35")
        .from(".play-project-block", { y: 70, opacity: 0, duration: 0.65, stagger: 0.07 }, "-=0.45");

      gsap.to(".play-background-word", {
        xPercent: -16,
        duration: 14,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      let lastSpark = 0;
      const spark = (event: PointerEvent) => {
        if (!root.current || Date.now() - lastSpark < 45) return;
        lastSpark = Date.now();
        const bounds = root.current.getBoundingClientRect();
        const dot = document.createElement("span");
        dot.className = "play-pointer-spark";
        dot.style.left = `${event.clientX - bounds.left}px`;
        dot.style.top = `${event.clientY - bounds.top}px`;
        root.current.appendChild(dot);
        gsap.fromTo(
          dot,
          { scale: 1, opacity: 0.75 },
          {
            x: gsap.utils.random(-18, 18),
            y: gsap.utils.random(-18, 18),
            scale: 0,
            opacity: 0,
            duration: 0.55,
            ease: "power2.out",
            onComplete: () => dot.remove(),
          },
        );
      };

      const element = root.current;
      element?.addEventListener("pointermove", spark);
      return () => element?.removeEventListener("pointermove", spark);
    },
    { scope: root },
  );

  const impact = (
    event: React.PointerEvent<HTMLElement> | React.MouseEvent<HTMLElement>,
  ) => {
    if (!root.current) return;
    const bounds = root.current.getBoundingClientRect();
    const ring = document.createElement("span");
    ring.className = "play-impact";
    ring.style.left = `${event.clientX - bounds.left}px`;
    ring.style.top = `${event.clientY - bounds.top}px`;
    root.current.appendChild(ring);
    gsap.fromTo(
      ring,
      { scale: 0.15, opacity: 0.9 },
      { scale: 2.8, opacity: 0, duration: 0.6, ease: "power3.out", onComplete: () => ring.remove() },
    );
  };

  const makeDraggable = (element: HTMLElement) => {
    const instance = Draggable.create(element, {
      type: "x,y",
      bounds: root.current ?? undefined,
      edgeResistance: 0.72,
      cursor: "grab",
      activeCursor: "grabbing",
      onPress() {
        gsap.to(element, { scale: 1.08, duration: 0.18 });
      },
      onRelease() {
        gsap.to(element, { scale: 1, duration: 0.35, ease: "elastic.out(1, 0.45)" });
      },
    })[0];
    draggables.current.push(instance);
  };

  const dropLetter = (element: HTMLElement, index: number, delay = 0) => {
    if (element.dataset.fallen === "true" || !root.current) return;
    element.dataset.fallen = "true";
    hitCounts.current.set(index, 3);

    const stageBounds = root.current.getBoundingClientRect();
    const letterBounds = element.getBoundingClientRect();
    const floorY = stageBounds.bottom - letterBounds.bottom - 58;
    const horizontalKick = gsap.utils.random(-150, 150);

    gsap.timeline({ delay })
      .to(element, {
        x: `+=${horizontalKick}`,
        y: `+=${Math.max(40, floorY)}`,
        rotation: `+=${gsap.utils.random(-220, 220)}`,
        duration: gsap.utils.random(1.15, 1.8),
        ease: "bounce.out",
      })
      .to(element, {
        y: "-=8",
        duration: 0.18,
        repeat: 1,
        yoyo: true,
        ease: "power1.out",
        onComplete: () => makeDraggable(element),
      });

    setReleased((count) => count + 1);
  };

  const hitLetter = (event: React.PointerEvent<HTMLButtonElement>, index: number) => {
    impact(event);
    const element = event.currentTarget;
    if (element.dataset.fallen === "true") return;

    const hits = (hitCounts.current.get(index) ?? 0) + 1;
    hitCounts.current.set(index, hits);
    element.dataset.hits = String(hits);

    if (hits >= 3) {
      dropLetter(element, index);
      setMode("Letter released");
      return;
    }

    gsap.timeline()
      .to(element, {
        x: `+=${gsap.utils.random(-10, 10)}`,
        y: `-=${gsap.utils.random(7, 16)}`,
        rotation: `+=${gsap.utils.random(-9, 9)}`,
        scale: 0.93,
        duration: 0.09,
      })
      .to(element, { x: "-=2", y: "+=10", scale: 1, duration: 0.38, ease: "elastic.out(1, 0.25)" });
  };

  const dropAll = () => {
    const letters = gsap.utils.toArray<HTMLElement>(".play-letter");
    letters.forEach((letter, index) => dropLetter(letter, index, index * 0.055));
    setMode("Gravity released");
  };

  const shake = () => {
    gsap.to(".play-letter, .play-project-block", {
      x: `+=${gsap.utils.random(-14, 14)}`,
      y: `+=${gsap.utils.random(-10, 10)}`,
      rotation: `+=${gsap.utils.random(-7, 7)}`,
      duration: 0.07,
      repeat: 9,
      yoyo: true,
      ease: "none",
    });
    setMode("Earthquake");
  };

  const magnetize = () => {
    if (!root.current) return;
    const stage = root.current.getBoundingClientRect();
    const fallen = gsap.utils.toArray<HTMLElement>('.play-letter[data-fallen="true"]');

    fallen.forEach((letter, index) => {
      const bounds = letter.getBoundingClientRect();
      const angle = (Math.PI * 2 * index) / Math.max(1, fallen.length);
      const radius = Math.min(stage.width, stage.height) * 0.16;
      const targetX = stage.left + stage.width / 2 + Math.cos(angle) * radius;
      const targetY = stage.top + stage.height / 2 + Math.sin(angle) * radius;
      const currentX = Number(gsap.getProperty(letter, "x")) || 0;
      const currentY = Number(gsap.getProperty(letter, "y")) || 0;
      gsap.to(letter, {
        x: currentX + targetX - (bounds.left + bounds.width / 2),
        y: currentY + targetY - (bounds.top + bounds.height / 2),
        rotation: index * 36,
        duration: 1.1,
        delay: index * 0.035,
        ease: "back.out(1.8)",
      });
    });
    setMode(fallen.length ? "Magnetic field" : "Release letters first");
  };

  const reset = () => {
    draggables.current.forEach((instance) => instance.kill());
    draggables.current = [];
    hitCounts.current.clear();
    const letters = gsap.utils.toArray<HTMLElement>(".play-letter");
    gsap.killTweensOf(letters);
    letters.forEach((letter) => {
      delete letter.dataset.fallen;
      delete letter.dataset.hits;
    });
    gsap.to(letters, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      duration: 0.9,
      stagger: { each: 0.035, from: "random" },
      ease: "elastic.out(1, 0.45)",
    });
    setReleased(0);
    setMode("Gravity armed");
  };

  return (
    <section className="playground-concept" ref={root}>
      <div className="play-noise" aria-hidden="true" />
      <div className="play-background-word" aria-hidden="true">BREAK</div>

      <div className="concept-nav play-nav">
        <span>Abhi Poluri</span>
        <span>Interactive typography test chamber</span>
        <span>{mode}</span>
      </div>

      <div className="play-stage">
        <div className="play-instructions">
          <p>Hit a letter three times.</p>
          <p>When it falls, drag it anywhere.</p>
        </div>

        <h1 className="play-title" aria-label="Make it real">
          {phrase.split("").map((letter, index) => (
            <button
              className={`play-letter ${index >= 6 ? "play-letter-serif" : ""}`}
              key={`${letter}-${index}`}
              onPointerDown={(event) => hitLetter(event, index)}
              type="button"
            >
              {letter}
            </button>
          ))}
        </h1>

        <div className="play-controls" aria-label="Playground controls">
          <button onClick={shake} type="button">Shake</button>
          <button onClick={dropAll} type="button">Drop all</button>
          <button onClick={magnetize} type="button">Magnetize</button>
          <button onClick={reset} type="button">Reset</button>
        </div>

        <div className="play-project-shelf">
          {projectBlocks.map((project, index) => (
            <button
              className="play-project-block"
              key={project}
              onClick={(event) => {
                impact(event);
                gsap.to(event.currentTarget, {
                  y: `-=${gsap.utils.random(35, 85)}`,
                  rotation: `+=${gsap.utils.random(-20, 20)}`,
                  duration: 0.55,
                  repeat: 1,
                  yoyo: true,
                  ease: "power2.out",
                });
              }}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {project}
            </button>
          ))}
        </div>
      </div>

      <div className="play-hud">
        <span>{released} / {phrase.length} letters released</span>
        <span>Nothing here is decorative</span>
      </div>
    </section>
  );
}
