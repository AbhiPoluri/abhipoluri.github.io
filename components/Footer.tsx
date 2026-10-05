"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { work } from "@/data/work";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Roof = "flat" | "spire" | "dome" | "antenna" | "tank";
type Windows = "grid" | "bands" | "none";

interface Building {
  x: number;
  w: number;
  h: number;
  d: number;
  color: string;
  roof: Roof;
  windows: Windows;
}

interface Row {
  id: string;
  z: number;
  parallax: number;
  buildings: Building[];
}

const STAGE = 1600;

const palette = [
  "#b7c2ad",
  "#a5b8c8",
  "#d8a48f",
  "#e2c486",
  "#ebdfc8",
  "#d9b3ad",
  "#9ea9b4",
  "#c4d4bf",
  "#cf8b74",
];

/** Small seeded PRNG so the skyline is identical on the server and the client. */
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildRow(
  seed: number,
  height: [number, number],
  width: [number, number],
  haze: number,
): Building[] {
  const random = mulberry32(seed);
  const buildings: Building[] = [];
  let x = -60 + random() * 50;

  while (x < STAGE + 40) {
    const w = Math.round(width[0] + random() * (width[1] - width[0]));
    const h = Math.round(height[0] + random() * (height[1] - height[0]));
    const d = Math.round(w * (0.6 + random() * 0.4));
    const base = palette[Math.floor(random() * palette.length)];
    const color = haze > 0 ? `color-mix(in oklab, ${base}, #f0e9de ${haze}%)` : base;
    const roofRoll = random();
    const roof: Roof =
      roofRoll < 0.13 ? "spire"
        : roofRoll < 0.24 ? "dome"
          : roofRoll < 0.38 ? "antenna"
            : roofRoll < 0.5 ? "tank"
              : "flat";
    const windowRoll = random();
    const windows: Windows = windowRoll < 0.1 ? "none" : windowRoll < 0.38 ? "bands" : "grid";

    buildings.push({ x, w, h, d, color, roof, windows });
    x += w + 10 + random() * 46;
  }

  return buildings;
}

const rows: Row[] = [
  { id: "far", z: -360, parallax: 8, buildings: buildRow(11, [130, 270], [48, 88], 40) },
  { id: "mid", z: -180, parallax: 18, buildings: buildRow(23, [80, 200], [58, 118], 16) },
  { id: "near", z: 0, parallax: 32, buildings: buildRow(37, [40, 130], [66, 136], 0) },
];

const latest = work.slice(0, 3);

const vancouverTime = () =>
  new Intl.DateTimeFormat("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Vancouver",
  }).format(new Date());

const vancouverHour = () =>
  Number(
    new Intl.DateTimeFormat("en-CA", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Vancouver",
    }).format(new Date()),
  );

export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const diorama = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState("");
  const [night, setNight] = useState(false);

  useEffect(() => {
    const tick = () => {
      setClock(vancouverTime());
      const hour = vancouverHour();
      setNight(hour >= 19 || hour < 6);
    };
    tick();
    const interval = window.setInterval(tick, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  useGSAP(
    () => {
      const stage = scene.current;
      const footer = root.current;
      if (!stage || !footer) return;

      const layers = gsap.utils.toArray<HTMLElement>(".diorama-row", stage);
      layers.forEach((layer) => gsap.set(layer, { z: Number(layer.dataset.z) }));
      gsap.set(stage, { transformOrigin: "50% 100%" });

      const motion = gsap.matchMedia();
      motion.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".bld", { scaleY: 0, transformOrigin: "50% 100%" });
        gsap.set(".cloud, .diorama-sun", { y: 40, opacity: 0 });

        const rise = gsap.timeline({
          scrollTrigger: {
            trigger: diorama.current,
            start: "top 90%",
            once: true,
          },
        });
        rise
          .to(".cloud, .diorama-sun", {
            y: 0,
            opacity: 1,
            duration: 1.4,
            ease: "power2.out",
          })
          .to(
            ".bld",
            {
              scaleY: 1,
              duration: 1.15,
              ease: "back.out(1.3)",
              stagger: { each: 0.028, from: "random" },
            },
            0.1,
          );

        const rotateY = gsap.quickTo(stage, "rotationY", { duration: 0.9, ease: "power3.out" });
        const rotateX = gsap.quickTo(stage, "rotationX", { duration: 0.9, ease: "power3.out" });
        const shifts = layers.map((layer) =>
          gsap.quickTo(layer, "x", { duration: 0.9, ease: "power3.out" }),
        );

        const move = (event: PointerEvent) => {
          if (event.pointerType === "touch") return;
          const bounds = footer.getBoundingClientRect();
          const nx = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
          const ny = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
          rotateY(nx * 7);
          rotateX(-ny * 3);
          layers.forEach((layer, index) => shifts[index](nx * Number(layer.dataset.parallax)));
        };
        const leave = () => {
          rotateY(0);
          rotateX(0);
          shifts.forEach((shift) => shift(0));
        };

        footer.addEventListener("pointermove", move, { passive: true });
        footer.addEventListener("pointerleave", leave);
        return () => {
          footer.removeEventListener("pointermove", move);
          footer.removeEventListener("pointerleave", leave);
        };
      });

      return () => motion.revert();
    },
    { scope: root },
  );

  const year = new Date().getFullYear();

  return (
    <footer className={`site-footer ${night ? "is-night" : ""}`} ref={root}>
      <div className="shell footer-top">
        <div className="footer-brand">
          <strong>Abhi Poluri</strong>
          <p>
            Product, strategy, and code, made at a desk in Vancouver. Business student at
            SFU, builder the rest of the time.
          </p>
          <span className="footer-clock" aria-live="off">
            Vancouver {clock ? `· ${clock}` : ""}
          </span>
        </div>

        <nav className="footer-col" aria-label="Work">
          <h3>Work</h3>
          <ul>
            <li><a href="#work">Case studies<i aria-hidden="true">↓</i></a></li>
            <li><a href="#project-reel">Project index<i aria-hidden="true">↓</i></a></li>
            {latest.map((item) => {
              const link = item.links[0];
              const external = !link.href.startsWith("#");
              return (
                <li key={item.id}>
                  <a
                    href={link.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                  >
                    {item.name}<i aria-hidden="true">↗</i>
                  </a>
                  <small>{item.label}</small>
                </li>
              );
            })}
          </ul>
        </nav>

        <nav className="footer-col" aria-label="Elsewhere">
          <h3>Elsewhere</h3>
          <ul>
            <li>
              <a href="https://github.com/AbhiPoluri" target="_blank" rel="noopener noreferrer">
                GitHub<i aria-hidden="true">↗</i>
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/abhiram-poluri/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn<i aria-hidden="true">↗</i>
              </a>
            </li>
            <li>
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
                Résumé<i aria-hidden="true">↗</i>
              </a>
            </li>
            <li>
              <a href="mailto:abhiram.poluri@gmail.com">
                Email<i aria-hidden="true">↗</i>
              </a>
              <small>abhiram.poluri@gmail.com</small>
            </li>
          </ul>
        </nav>

        <div className="footer-col">
          <h3>Colophon</h3>
          <ul>
            <li><span>Next.js and GSAP</span></li>
            <li><span>Geist and Instrument Serif</span></li>
            <li><span>Static, hosted on GitHub Pages</span></li>
            <li><span>No analytics, no cookies</span></li>
          </ul>
        </div>
      </div>

      <div className="shell footer-sign">
        <h2>
          Thanks for scrolling
          <br />
          <i>all the way down.</i>
        </h2>
        <p>
          The city below is paper and CSS. On a desktop, your cursor tilts it.
        </p>
      </div>

      <div className="diorama" ref={diorama} aria-hidden="true">
        <div className="diorama-scene" ref={scene}>
          <div className="diorama-sky">
            <span className="diorama-sun" />
            <span className="cloud cloud-a" />
            <span className="cloud cloud-b" />
            <span className="cloud cloud-c" />
          </div>
          <div className="diorama-ground" />
          {rows.map((row) => (
            <div
              className={`diorama-row diorama-row-${row.id}`}
              data-z={row.z}
              data-parallax={row.parallax}
              key={row.id}
              style={{ "--z": `${row.z}px` } as CSSProperties}
            >
              {row.buildings.map((building, index) => (
                <div
                  className="bld"
                  data-roof={building.roof}
                  data-windows={building.windows}
                  key={`${row.id}-${index}`}
                  style={
                    {
                      "--x": `${building.x}px`,
                      "--w": `${building.w}px`,
                      "--h": `${building.h}px`,
                      "--d": `${building.d}px`,
                      "--c": building.color,
                    } as CSSProperties
                  }
                >
                  <i className="bld-face bld-front" />
                  <i className="bld-face bld-left" />
                  <i className="bld-face bld-right" />
                  <i className="bld-face bld-top" />
                  <i className="bld-roof" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="shell footer-bottom-shell">
          <p>© {year} Abhi Poluri</p>
          <p>Built in Vancouver, BC. Deployed from a single push.</p>
          <a href="#top">Rebuild from the top ↑</a>
        </div>
      </div>
    </footer>
  );
}
