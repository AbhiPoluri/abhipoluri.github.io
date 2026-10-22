"use client";

import { Fragment, useEffect, useState } from "react";
import { indexTag } from "@/data/statement";
import { work } from "@/data/work";

const isExternal = (href: string) => /^https?:/.test(href);

export default function WorkIndex() {
  const [activeId, setActiveId] = useState(work[0].id);
  const active = work.find((item) => item.id === activeId) ?? work[0];

  useEffect(() => {
    const load = (event: Event) => {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (id && work.some((item) => item.id === id)) setActiveId(id);
    };
    window.addEventListener("portfolio:load-project", load);
    return () => window.removeEventListener("portfolio:load-project", load);
  }, []);

  return (
    <section className="st-index st-px" id="work" aria-labelledby="work-title">
      <p className="st-small" id="work-title" style={{ margin: 0 }}>
        All {work.length}, newest first. Hover a name.
      </p>
      <div className="st-ix">
        <p className="st-names">
          {work.map((item, index) => {
            const href = item.links[0]?.href ?? "#work";
            return (
              <Fragment key={item.id}>
                {index > 0 ? <span className="st-sl" aria-hidden="true">/</span> : null}
                <a
                  href={href}
                  className={[
                    item.year !== "2026" ? "is-old" : "",
                    item.id === activeId ? "is-active" : "",
                  ].join(" ").trim() || undefined}
                  onPointerEnter={() => setActiveId(item.id)}
                  onFocus={() => setActiveId(item.id)}
                  {...(isExternal(href) ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  {item.name}
                  <sup>{indexTag(item)}</sup>
                </a>
              </Fragment>
            );
          })}
        </p>
        <aside className="st-card" aria-live="polite">
          {active.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={active.image} alt={`${active.name} screenshot`} />
          ) : (
            <div className="st-card-blank">No screenshot yet</div>
          )}
          <b>
            {active.name} · {active.year}
          </b>
          <span>{active.tagline}</span>
          <div className="st-card-links">
            {active.links
              .filter((link) => isExternal(link.href))
              .map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                  {link.label} ↗
                </a>
              ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
