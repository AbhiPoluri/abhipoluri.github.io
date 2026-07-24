"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "@/data/projects";
import { products } from "@/data/products";
import { githubProjects } from "@/data/githubProjects";
import { linkedInProjects } from "@/data/linkedInProjects";

gsap.registerPlugin(useGSAP, Draggable, ScrollTrigger);

const allWork = [
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
];

export default function Projects() {
  const root = useRef<HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [rejected, setRejected] = useState<number[]>([]);
  const [xrayActive, setXrayActive] = useState(false);
  const selected = selectedIndex === null ? null : allWork[selectedIndex];
  const catalogue = allWork
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter((item) => {
      const search = query.trim().toLowerCase();
      if (!search) return true;
      return [item.name, item.tagline, item.description, item.kind, ...item.tags]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });

  useEffect(() => {
    const loadRequestedProject = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      const index = allWork.findIndex((item) => item.id === id);
      if (index < 0) return;
      setLoading(true);
      window.setTimeout(() => {
        setSelectedIndex(index);
        setLoading(false);
      }, 310);
    };

    window.addEventListener("portfolio:load-project", loadRequestedProject);
    return () => window.removeEventListener("portfolio:load-project", loadRequestedProject);
  }, []);

  useEffect(() => {
    setXrayActive(false);
  }, [selectedIndex]);

  const loadSlide = (index: number) => {
    if (index === selectedIndex && !loading) return;
    setLoading(true);
    window.setTimeout(() => {
      setSelectedIndex(index);
      setLoading(false);
    }, 310);
  };

  useGSAP(
    () => {
      const slides = gsap.utils.toArray<HTMLElement>(".catalogue-slide");
      const viewer = root.current?.querySelector<HTMLElement>(".project-viewer");
      const instances = slides.flatMap((slide) =>
        Draggable.create(slide, {
          type: "x,y",
          edgeResistance: 0.72,
          cursor: "grab",
          activeCursor: "grabbing",
          onPress() {
            slide.classList.add("is-dragging");
            gsap.to(slide, {
              scale: 1.075,
              rotation: 0,
              zIndex: 12,
              duration: 0.18,
              ease: "power2.out",
            });
          },
          onDrag() {
            if (!viewer) return;
            const ready = Draggable.hitTest(slide, viewer, "12%");
            viewer.classList.toggle("is-ready", ready);
            gsap.to(slide, {
              rotation: gsap.utils.clamp(-7, 7, this.deltaX * 0.65),
              duration: 0.12,
              overwrite: "auto",
            });
          },
          onRelease() {
            slide.classList.remove("is-dragging");
            viewer?.classList.remove("is-ready");
            const accepted = viewer && Draggable.hitTest(slide, viewer, "12%");
            if (accepted) {
              viewer.classList.add("is-receiving");
              if ("vibrate" in navigator) navigator.vibrate(18);
              const slideBounds = slide.getBoundingClientRect();
              const viewerBounds = viewer.getBoundingClientRect();
              const currentX = Number(gsap.getProperty(slide, "x")) || 0;
              const currentY = Number(gsap.getProperty(slide, "y")) || 0;
              const workIndex = Number(slide.dataset.workIndex);
              gsap.to(slide, {
                x: currentX + viewerBounds.left + viewerBounds.width / 2 - (slideBounds.left + slideBounds.width / 2),
                y: currentY + viewerBounds.top + viewerBounds.height / 2 - (slideBounds.top + slideBounds.height / 2),
                scale: 0.28,
                rotation: 0,
                opacity: 0,
                duration: 0.46,
                ease: "back.in(1.5)",
                onComplete: () => {
                  loadSlide(workIndex);
                  window.setTimeout(() => viewer.classList.remove("is-receiving"), 480);
                  gsap.set(slide, { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 1 });
                },
              });
            } else {
              const tossed = Math.abs(this.x) > Math.max(125, slide.offsetWidth * .72);
              const workIndex = Number(slide.dataset.workIndex);
              if (tossed) {
                setRejected((current) =>
                  current.includes(workIndex) ? current : [...current, workIndex].slice(-6),
                );
                window.dispatchEvent(new CustomEvent("desk:stamp", {
                  detail: {
                    label: "MAYBE LATER",
                    x: this.pointerX,
                    y: this.pointerY,
                  },
                }));
                window.dispatchEvent(new CustomEvent("desk:sound", { detail: { kind: "paper" } }));
              }
              gsap.timeline()
                .to(slide, tossed
                  ? {
                      scale: .56,
                      rotation: this.x > 0 ? 18 : -18,
                      opacity: 0,
                      duration: .28,
                      ease: "back.in(1.8)",
                    }
                  : {
                      x: `+=${this.deltaX > 0 ? -10 : 10}`,
                      duration: 0.08,
                      repeat: 1,
                      yoyo: true,
                    })
                .to(slide, {
                  x: 0,
                  y: 0,
                  scale: 1,
                  rotation: 0,
                  zIndex: 1,
                  duration: 0.72,
                  ease: "elastic.out(1, .42)",
                });
            }
          },
        }),
      );

      gsap.from(".work-browser", {
        y: 90,
        scale: 0.94,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".work-browser",
          start: "top 82%",
        },
      });

      return () => instances.forEach((instance) => instance.kill());
    },
    { scope: root, dependencies: [query] },
  );

  useGSAP(
    () => {
      if (selectedIndex === null) return;
      gsap.fromTo(
        ".project-detail-copy > *",
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.62, stagger: 0.07, ease: "power3.out" },
      );
      gsap.fromTo(
        ".project-media-plate",
        { scale: 1.08, opacity: 0.45 },
        { scale: 1, opacity: 1, duration: 0.9, ease: "power3.out" },
      );
    },
    { scope: root, dependencies: [selectedIndex] },
  );

  const stepViewer = (direction: number) => {
    const current = selectedIndex ?? 0;
    loadSlide((current + direction + allWork.length) % allWork.length);
  };

  const tossSelected = () => {
    if (selectedIndex === null) return;
    const tossedIndex = selectedIndex;
    setRejected((current) =>
      current.includes(tossedIndex) ? current : [...current, tossedIndex].slice(-6),
    );
    window.dispatchEvent(new CustomEvent("desk:stamp", {
      detail: {
        label: "MAYBE LATER",
        x: window.innerWidth * .68,
        y: window.innerHeight * .48,
      },
    }));
    window.dispatchEvent(new CustomEvent("desk:sound", { detail: { kind: "paper" } }));
    const next = allWork.findIndex((_, index) => index !== tossedIndex && !rejected.includes(index));
    setLoading(true);
    window.setTimeout(() => {
      setSelectedIndex(next >= 0 ? next : null);
      setLoading(false);
    }, 310);
  };

  return (
    <section className="work-section" id="work" ref={root}>
      <div className="projector-intro shell">
        <p className="chapter-line">Selected work</p>
        <h2>
          Pick a slide.
          <span>Load the whole story.</span>
        </h2>
        <p>
          Pull a project into the light table or switch on X-ray to see the thinking underneath.
        </p>
      </div>

      <div className="projector-shell shell">
        <div className={`work-browser ${loading ? "is-changing" : ""}`}>
          <aside className="project-catalogue">
            <div className="catalogue-heading">
              <span aria-hidden="true">✳</span>
              <strong>Slide library</strong>
            </div>

            <label className="catalogue-search">
              <span className="search-icon" aria-hidden="true" />
              <span className="sr-only">Search projects</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, tool, or problem"
              />
              <small>{catalogue.length}</small>
            </label>

            <div className="catalogue-list" aria-label="Project slides">
              {catalogue.length ? (
                catalogue.map((item) => (
                  <button
                    className={`catalogue-slide ${
                      selectedIndex === item.originalIndex ? "is-loaded" : ""
                    } ${rejected.includes(item.originalIndex) ? "is-rejected" : ""}`}
                    data-work-index={item.originalIndex}
                    key={item.id}
                    type="button"
                    onClick={(event) => {
                      if (event.detail === 0) loadSlide(item.originalIndex);
                    }}
                    aria-pressed={selectedIndex === item.originalIndex}
                    aria-label={`Drag ${item.name} into the viewer`}
                  >
                    <span className="catalogue-number">
                      {String(item.originalIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="catalogue-thumb">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt="" />
                      ) : item.video ? (
                        <video src={item.video} muted playsInline preload="metadata" />
                      ) : (
                        <span>{item.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </span>
                    <span className="catalogue-copy">
                      <strong>{item.name}</strong>
                      <small>{item.year} · {item.kind}</small>
                      <em>{item.tags.slice(0, 2).join(" / ")}</em>
                    </span>
                    <span className="drag-grip" aria-hidden="true">⠿</span>
                  </button>
                ))
              ) : (
                <div className="catalogue-empty">
                  <strong>No matching slides.</strong>
                  <button type="button" onClick={() => setQuery("")}>Clear search</button>
                </div>
              )}
            </div>
          </aside>

          <section
            className={`project-viewer ${selected ? "has-project" : "is-empty"}`}
            aria-live="polite"
          >
            <div className="project-viewer-status">
              <span>Viewer</span>
              <i aria-hidden="true">/</i>
              <strong>
                {loading ? "Loading project" : selected ? selected.name : "Waiting for a project"}
              </strong>
              {selected ? (
                <div className="viewer-status-actions">
                  <button type="button" onClick={() => stepViewer(-1)} aria-label="Previous project">←</button>
                  <span>{String(selectedIndex! + 1).padStart(2, "0")} / {String(allWork.length).padStart(2, "0")}</span>
                  <button type="button" onClick={() => stepViewer(1)} aria-label="Next project">→</button>
                  <button
                    className={xrayActive ? "is-active" : ""}
                    type="button"
                    onClick={() => setXrayActive((active) => !active)}
                    aria-pressed={xrayActive}
                  >
                    X-ray
                  </button>
                  <button type="button" onClick={tossSelected}>Toss</button>
                  <button type="button" onClick={() => setSelectedIndex(null)}>Eject ×</button>
                </div>
              ) : null}
            </div>

            {!selected ? (
              <div className="viewer-empty-state">
                <span className="viewer-ready-copy">Release to view</span>
                <h3>Drop into the light</h3>
                <span className="viewer-target" aria-hidden="true"><i /></span>
                <p>Pick up any slide from the library and release it anywhere inside this frame.</p>
                <small>✳ &nbsp; The whole frame accepts a drop</small>
              </div>
            ) : (
              <div className={`project-detail ${loading ? "is-loading" : ""}`}>
                <div
                  className={`project-detail-media ${xrayActive ? "is-xray" : ""}`}
                >
                  <div className="project-media-plate">
                    {selected.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selected.image} alt={`${selected.name} interface`} />
                    ) : selected.video ? (
                      <video src={selected.video} muted loop playsInline autoPlay />
                    ) : (
                      <span className="detail-text-preview">
                        <small>Public GitHub project</small>
                        <strong>{selected.name}</strong>
                        <em>{selected.kind}</em>
                      </span>
                    )}
                  </div>
                  <div className="project-xray-sheet" aria-hidden={!xrayActive}>
                    <small>Hold it up to the light</small>
                    <dl>
                      <div><dt>Problem</dt><dd>{selected.tagline}</dd></div>
                      <div><dt>Material</dt><dd>{selected.tags.slice(0, 4).join(" · ")}</dd></div>
                      <div><dt>Working belief</dt><dd>{selected.description}</dd></div>
                    </dl>
                  </div>
                </div>
                <article className="project-detail-copy">
                  <div className="project-detail-meta">
                    <span>{selected.year} · {selected.kind}</span>
                    <span>{String(selectedIndex! + 1).padStart(2, "0")}</span>
                  </div>
                  <p>{selected.tagline}</p>
                  <h3>{selected.name}</h3>
                  <p>{selected.description}</p>
                  <div className="project-detail-tags">{selected.tags.slice(0, 5).join(" · ")}</div>
                  {selected.link ? (
                    <a href={selected.link} target="_blank" rel="noopener noreferrer">
                      Open project ↗
                    </a>
                  ) : null}
                </article>
              </div>
            )}
            {rejected.length ? (
              <div className="reject-pile" aria-label="Tossed project slides">
                <span>Tossed pile</span>
                {rejected.slice(-4).map((index, pileIndex) => (
                  <button
                    type="button"
                    key={allWork[index].id}
                    style={{ "--pile-index": pileIndex } as React.CSSProperties}
                    onClick={() => {
                      setRejected((current) => current.filter((item) => item !== index));
                      loadSlide(index);
                    }}
                  >
                    {allWork[index].name}
                  </button>
                ))}
              </div>
            ) : null}
            <span className="viewer-corner viewer-corner-one" aria-hidden="true" />
            <span className="viewer-corner viewer-corner-two" aria-hidden="true" />
          </section>
          </div>
      </div>
    </section>
  );
}
