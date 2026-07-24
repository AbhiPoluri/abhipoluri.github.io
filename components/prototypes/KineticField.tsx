"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { projects } from "@/data/projects";
import { products } from "@/data/products";

gsap.registerPlugin(useGSAP);

const wavePaths = [
  "M-80 80 C 180 5, 390 165, 650 80 S 1120 5, 1420 80",
  "M-80 135 C 210 50, 370 225, 690 125 S 1110 55, 1420 135",
  "M-80 195 C 150 105, 430 285, 700 185 S 1080 95, 1420 195",
  "M-80 260 C 220 160, 420 340, 720 245 S 1120 165, 1420 260",
  "M-80 330 C 190 225, 430 410, 735 315 S 1090 230, 1420 330",
  "M-80 405 C 170 290, 460 495, 750 390 S 1120 300, 1420 405",
  "M-80 485 C 220 365, 440 560, 760 470 S 1100 375, 1420 485",
  "M-80 570 C 180 450, 480 645, 780 550 S 1110 460, 1420 570",
  "M-80 660 C 220 530, 440 730, 800 640 S 1110 555, 1420 660",
  "M-80 750 C 180 630, 500 825, 810 730 S 1120 650, 1420 750",
];

const projectNames = [...projects.map((project) => project.title), ...products.map((product) => product.name)];

export default function KineticField() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });

      timeline
        .from(".kinetic-word span", {
          yPercent: 125,
          rotation: 5,
          opacity: 0,
          duration: 1.15,
          stagger: 0.09,
        })
        .from(".kinetic-intro > *", { y: 24, opacity: 0, duration: 0.75, stagger: 0.1 }, "-=0.65")
        .from(".kinetic-rail", { y: 30, opacity: 0, duration: 0.7 }, "-=0.45");

      gsap.to(".wave-line", {
        strokeDashoffset: -240,
        duration: 7,
        stagger: { each: 0.12, from: "random" },
        repeat: -1,
        ease: "none",
      });

      gsap.to(".kinetic-blob-a", {
        xPercent: 28,
        yPercent: -18,
        scale: 1.2,
        duration: 8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      gsap.to(".kinetic-blob-b", {
        xPercent: -24,
        yPercent: 20,
        scale: 0.82,
        duration: 10,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      gsap.to(".kinetic-rail-track", {
        xPercent: -50,
        duration: 26,
        repeat: -1,
        ease: "none",
      });

      const orbX = gsap.quickTo(".kinetic-orb", "x", { duration: 0.75, ease: "power3" });
      const orbY = gsap.quickTo(".kinetic-orb", "y", { duration: 0.75, ease: "power3" });
      const titleX = gsap.quickTo(".kinetic-title", "x", { duration: 1.2, ease: "power3" });
      const titleY = gsap.quickTo(".kinetic-title", "y", { duration: 1.2, ease: "power3" });

      const move = (event: PointerEvent) => {
        const bounds = root.current?.getBoundingClientRect();
        if (!bounds) return;
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        orbX(x);
        orbY(y);
        titleX((x / bounds.width - 0.5) * 18);
        titleY((y / bounds.height - 0.5) * 12);
      };

      const element = root.current;
      element?.addEventListener("pointermove", move);
      return () => element?.removeEventListener("pointermove", move);
    },
    { scope: root },
  );

  return (
    <section className="kinetic-concept" ref={root}>
      <div className="kinetic-orb" aria-hidden="true" />
      <div className="kinetic-blob kinetic-blob-a" aria-hidden="true" />
      <div className="kinetic-blob kinetic-blob-b" aria-hidden="true" />

      <svg className="kinetic-waves" viewBox="0 0 1360 820" preserveAspectRatio="none" aria-hidden="true">
        {wavePaths.map((path) => (
          <path className="wave-line" d={path} key={path} />
        ))}
      </svg>

      <div className="concept-nav">
        <span>Abhi Poluri</span>
        <span>Product / Strategy / Code</span>
        <a href="mailto:abhiram.poluri@gmail.com">Let&apos;s talk</a>
      </div>

      <div className="kinetic-center">
        <p className="kinetic-overline">Builder by practice. Strategist by training.</p>
        <h1 className="kinetic-title" aria-label="Ideas should move">
          <span className="kinetic-word"><span>Ideas</span></span>
          <span className="kinetic-word kinetic-word-outline"><span>should</span></span>
          <span className="kinetic-word"><span>move.</span></span>
        </h1>
        <div className="kinetic-intro">
          <p>I turn rough problems into useful products across AI, planning, and new ventures.</p>
          <a href="#kinetic-projects">Enter the work <span>↘</span></a>
        </div>
      </div>

      <div className="kinetic-rail" id="kinetic-projects">
        <div className="kinetic-rail-track">
          {[...projectNames, ...projectNames].map((name, index) => (
            <span key={`${name}-${index}`}>
              {name}
              <i aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>

      <p className="kinetic-hint">Move your cursor through the field</p>
    </section>
  );
}
