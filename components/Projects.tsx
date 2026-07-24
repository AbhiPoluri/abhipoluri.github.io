"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "@/data/projects";
import { products } from "@/data/products";
import { githubProjects } from "@/data/githubProjects";
import { linkedInProjects } from "@/data/linkedInProjects";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const workCollection = [
  ...projects.map((project, index) => ({
    id: `project-${project.id}`,
    name: project.title,
    tagline: project.impact,
    description: project.description,
    tags: project.tags,
    link: project.link,
    image: project.screenshot,
    video: null,
    year: index < 2 ? "2026" : "2025",
    kind: project.type,
  })),
  ...products.map((product, index) => ({
    id: `product-${product.id}`,
    name: product.name,
    tagline: product.tagline,
    description: product.description,
    tags: product.tags,
    link: product.link,
    image: null,
    video: product.videoSrc,
    year: index === 0 ? "2026" : "2025",
    kind: "product",
  })),
  ...githubProjects.map((project) => ({
    id: `github-${project.id}`,
    name: project.name,
    tagline: project.tagline,
    description: project.description,
    tags: project.tags,
    link: project.link,
    image: project.image,
    video: null,
    year: project.year,
    kind: project.language,
  })),
  ...linkedInProjects.map((project) => ({
    id: `feature-${project.id}`,
    name: project.name,
    tagline: project.tagline,
    description: project.description,
    tags: [...project.tags],
    link: project.link,
    image: project.image,
    video: null,
    year: project.year,
    kind: project.kind,
  })),
].filter((item, index, collection) => (
  collection.findIndex((candidate) => candidate.name.toLowerCase() === item.name.toLowerCase()) === index
));

export default function Projects() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const direction = useRef(1);
  const pointer = useRef({ id: -1, startX: 0, moved: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = workCollection[selectedIndex];

  const selectProject = (index: number) => {
    const normalized = (index + workCollection.length) % workCollection.length;
    if (normalized === selectedIndex) return;
    direction.current = normalized > selectedIndex ? 1 : -1;
    if (
      selectedIndex === 0 &&
      normalized === workCollection.length - 1
    ) direction.current = -1;
    if (
      selectedIndex === workCollection.length - 1 &&
      normalized === 0
    ) direction.current = 1;
    setSelectedIndex(normalized);
  };

  useEffect(() => {
    const loadRequestedProject = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      const index = workCollection.findIndex((item) => item.id === id);
      if (index >= 0) selectProject(index);
    };

    window.addEventListener("portfolio:load-project", loadRequestedProject);
    return () => window.removeEventListener("portfolio:load-project", loadRequestedProject);
  });

  useEffect(() => {
    root.current
      ?.querySelector<HTMLElement>(`[data-carousel-index="${selectedIndex}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selectedIndex]);

  useGSAP(
    () => {
      gsap.from(".work-carousel", {
        y: 72,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".work-carousel",
          start: "top 84%",
        },
      });
    },
    { scope: root },
  );

  useGSAP(
    () => {
      const travel = direction.current * 54;
      gsap.timeline()
        .fromTo(
          ".carousel-media-frame",
          { x: travel, opacity: .35, clipPath: direction.current > 0
            ? "inset(0 0 0 18%)"
            : "inset(0 18% 0 0)" },
          {
            x: 0,
            opacity: 1,
            clipPath: "inset(0 0 0 0)",
            duration: .82,
            ease: "power3.out",
          },
        )
        .fromTo(
          ".carousel-project-copy > *",
          { x: direction.current * 28, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: .58,
            stagger: .055,
            ease: "power3.out",
          },
          .12,
        );
    },
    { scope: root, dependencies: [selectedIndex] },
  );

  const pointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointer.current = { id: event.pointerId, startX: event.clientX, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-dragging");
  };

  const pointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const delta = event.clientX - pointer.current.startX;
    if (Math.abs(delta) > 5) pointer.current.moved = true;
    gsap.set(stage.current, {
      x: gsap.utils.clamp(-46, 46, delta * .18),
    });
  };

  const pointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const delta = event.clientX - pointer.current.startX;
    event.currentTarget.releasePointerCapture(event.pointerId);
    event.currentTarget.classList.remove("is-dragging");
    gsap.to(stage.current, { x: 0, duration: .48, ease: "back.out(2)" });
    if (Math.abs(delta) > 54) selectProject(selectedIndex + (delta < 0 ? 1 : -1));
  };

  const keyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectProject(selectedIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectProject(selectedIndex + 1);
    }
  };

  return (
    <section
      className="work-section work-carousel-section"
      id="project-reel"
      ref={root}
      tabIndex={0}
      onKeyDown={keyDown}
    >
      <div className="projector-intro carousel-intro shell">
        <p className="chapter-line">Selected work</p>
        <h2>
          Built things,
          <span>not case-study theatre.</span>
        </h2>
        <p>
          A moving shelf of products, experiments, and systems. Swipe the image or pick
          anything from the reel.
        </p>
      </div>

      <div className="work-carousel shell" aria-roledescription="carousel">
        <header className="carousel-toolbar">
          <div>
            <span>Project reel</span>
            <strong>{selected.name}</strong>
          </div>
          <div className="carousel-controls">
            <span>
              {String(selectedIndex + 1).padStart(2, "0")}
              <i>/</i>
              {String(workCollection.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => selectProject(selectedIndex - 1)}
              aria-label="Previous project"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => selectProject(selectedIndex + 1)}
              aria-label="Next project"
            >
              →
            </button>
          </div>
        </header>

        <div
          className="carousel-active-slide"
          key={selected.id}
          aria-live="polite"
        >
          <div
            className="carousel-media-frame"
            ref={stage}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={pointerUp}
            onPointerCancel={pointerUp}
          >
            {selected.image || selected.video ? (
              <div className="carousel-media-mat">
                {selected.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.image} alt={`${selected.name} project preview`} draggable={false} />
                ) : (
                  <video
                    src={selected.video!}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                  />
                )}
              </div>
            ) : (
              <div className="carousel-type-preview">
                <span>{selected.kind}</span>
                <strong>{selected.name}</strong>
              </div>
            )}
            <span className="carousel-media-index">
              {String(selectedIndex + 1).padStart(2, "0")}
            </span>
            <span className="carousel-swipe-note">drag to browse</span>
          </div>

          <article className="carousel-project-copy">
            <div className="carousel-project-meta">
              <span>{selected.year}</span>
              <span>{selected.kind}</span>
            </div>
            <p className="carousel-project-tagline">{selected.tagline}</p>
            <h3>{selected.name}</h3>
            <p className="carousel-project-description">{selected.description}</p>
            <ul aria-label={`${selected.name} technologies`}>
              {selected.tags.slice(0, 5).map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
            {selected.link ? (
              <a href={selected.link} target="_blank" rel="noopener noreferrer">
                View the project <span>↗</span>
              </a>
            ) : (
              <span className="carousel-private-note">Private working project</span>
            )}
          </article>
        </div>

        <div className="carousel-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${(selectedIndex + 1) / workCollection.length})` }} />
        </div>

        <nav className="carousel-reel" aria-label="Choose a project">
          {workCollection.map((item, index) => (
            <button
              className={index === selectedIndex ? "is-active" : ""}
              data-carousel-index={index}
              key={item.id}
              type="button"
              onClick={() => selectProject(index)}
              aria-current={index === selectedIndex ? "true" : undefined}
            >
              <span className="carousel-reel-thumb">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" loading="lazy" />
                ) : item.video ? (
                  <video src={item.video} muted playsInline preload="metadata" />
                ) : (
                  <i>{item.name.slice(0, 2).toUpperCase()}</i>
                )}
              </span>
              <span>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{item.name}</strong>
              </span>
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
