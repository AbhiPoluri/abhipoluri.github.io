"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  work,
  workCounts,
  workFilters,
  type WorkFilter,
  type WorkItem,
} from "@/data/work";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const pad = (value: number) => String(value).padStart(2, "0");

function Media({ item }: { item: WorkItem }) {
  if (item.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.image} alt={`${item.name} preview`} loading="lazy" draggable={false} />
    );
  }
  if (item.video) {
    return <video src={item.video} muted loop playsInline autoPlay preload="metadata" />;
  }
  return (
    <div className="work-media-type">
      <span>{item.label}</span>
      <strong>{item.name}</strong>
    </div>
  );
}

function WorkLinks({ item }: { item: WorkItem }) {
  return (
    <div className="work-links">
      {item.links.map((link) => {
        const external = !link.href.startsWith("#");
        return (
          <a
            href={link.href}
            key={link.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            {link.label}
            <span aria-hidden="true">{external ? "↗" : "↓"}</span>
          </a>
        );
      })}
    </div>
  );
}

export default function Projects() {
  const root = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<WorkFilter>("all");
  const [openId, setOpenId] = useState<string | null>(work[0].id);
  const [previewId, setPreviewId] = useState<string>(work[0].id);

  const visible = useMemo(
    () => (filter === "all" ? work : work.filter((item) => item.kind === filter)),
    [filter],
  );
  const preview = visible.find((item) => item.id === previewId) ?? visible[0] ?? work[0];

  useEffect(() => {
    const loadRequestedProject = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (!id || !work.some((item) => item.id === id)) return;
      setFilter("all");
      setOpenId(id);
      setPreviewId(id);
      window.setTimeout(() => {
        root.current
          ?.querySelector<HTMLElement>(`[data-work-id="${id}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 120);
    };

    window.addEventListener("portfolio:load-project", loadRequestedProject);
    return () => window.removeEventListener("portfolio:load-project", loadRequestedProject);
  }, []);

  useGSAP(
    () => {
      const motion = gsap.matchMedia();
      motion.add("(prefers-reduced-motion: no-preference)", () => {
        const rows = gsap.utils.toArray<HTMLElement>(".work-row");
        gsap.set(rows, { opacity: 0, y: 22 });
        ScrollTrigger.batch(rows, {
          start: "top 94%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              stagger: 0.05,
              duration: 0.7,
              ease: "power3.out",
              overwrite: true,
              clearProps: "transform",
            }),
        });
      });
      return () => motion.revert();
    },
    { scope: root, dependencies: [filter] },
  );

  useGSAP(
    () => {
      gsap.fromTo(
        ".work-preview-media",
        { opacity: 0.35, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" },
      );
      gsap.fromTo(
        ".work-preview-copy > *",
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.42, ease: "power2.out" },
      );
    },
    { scope: root, dependencies: [previewId] },
  );

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
    setPreviewId(id);
  };

  const primary = preview.links[0];
  const primaryExternal = !primary.href.startsWith("#");

  return (
    <section className="work-index-section" id="project-reel" ref={root}>
      <div className="projector-intro work-intro shell">
        <p className="chapter-line">Selected work</p>
        <h2>
          Everything I&apos;ve shipped,
          <span>on one page.</span>
        </h2>
        <p>
          {work.length} products, tools, and experiments, newest first. Skim the list and
          open any row for the story, the stack, and the links.
        </p>
      </div>

      <div className="work-index shell">
        <div className="work-toolbar">
          <div className="work-filters" role="group" aria-label="Filter projects">
            {workFilters.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={filter === option.id}
                onClick={() => setFilter(option.id)}
              >
                {option.label}
                <small>{pad(workCounts[option.id])}</small>
              </button>
            ))}
          </div>
          <p className="work-toolbar-hint">
            {visible.length === work.length
              ? `${pad(work.length)} projects`
              : `${pad(visible.length)} of ${pad(work.length)}`}
            <i aria-hidden="true">·</i>
            newest first
          </p>
        </div>

        <div className="work-layout">
          <ol className="work-list" aria-label="Projects">
            {visible.map((item, index) => {
              const open = item.id === openId;
              return (
                <li
                  className={`work-row ${open ? "is-open" : ""} ${item.id === previewId ? "is-previewing" : ""}`}
                  data-work-id={item.id}
                  data-status={item.status}
                  key={item.id}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== "touch") setPreviewId(item.id);
                  }}
                  onFocus={() => setPreviewId(item.id)}
                >
                  <button
                    type="button"
                    className="work-row-head"
                    onClick={() => toggle(item.id)}
                    aria-expanded={open}
                    aria-controls={`work-detail-${item.id}`}
                  >
                    <span className="work-row-index">{pad(index + 1)}</span>
                    <span className="work-row-title">
                      <strong>{item.name}</strong>
                      <span>{item.tagline}</span>
                    </span>
                    <span className="work-row-meta">
                      <span>{item.label}</span>
                      <span>{item.year}</span>
                    </span>
                    <span className="work-row-toggle" aria-hidden="true">
                      <i />
                      <i />
                    </span>
                  </button>

                  <div
                    className="work-row-detail"
                    id={`work-detail-${item.id}`}
                    inert={!open}
                  >
                    <div className="work-row-detail-inner">
                      <div className="work-row-detail-content">
                        {open ? (
                          <div className="work-row-media" aria-hidden="true">
                            <Media item={item} />
                          </div>
                        ) : null}
                        <p>{item.description}</p>
                        {item.with ? <p className="work-row-with">Built with {item.with}</p> : null}
                        <ul className="work-tags" aria-label={`${item.name} stack`}>
                          {item.tags.map((tag) => <li key={tag}>{tag}</li>)}
                        </ul>
                        <WorkLinks item={item} />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <aside className="work-preview" aria-label="Project preview">
            <div className="work-preview-frame">
              <div className="work-preview-media" key={preview.id}>
                <Media item={preview} />
              </div>
              <span className="work-preview-index" aria-hidden="true">
                {pad(work.indexOf(preview) + 1)} / {pad(work.length)}
              </span>
            </div>
            <div className="work-preview-copy">
              <span className="work-preview-kind">
                {preview.label} · {preview.year}
              </span>
              <strong>{preview.name}</strong>
              <p>{preview.tagline}</p>
              <a
                href={primary.href}
                target={primaryExternal ? "_blank" : undefined}
                rel={primaryExternal ? "noopener noreferrer" : undefined}
              >
                {primary.label} <span aria-hidden="true">{primaryExternal ? "↗" : "↓"}</span>
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
