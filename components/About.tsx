"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const statement =
  "Business school taught me to ask why. Building taught me to finish. I work best where product judgment, technical curiosity, and a bias toward shipping overlap.";

export default function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const words = gsap.utils.toArray<HTMLElement>(".story-word");
      gsap.fromTo(
        words,
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.06,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 72%",
            end: "bottom 72%",
            scrub: 1,
          },
        },
      );
      gsap.to(".story-rail", {
        xPercent: -18,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    },
    { scope: root },
  );

  return (
    <section className="about-section" id="about" ref={root}>
      <div className="story-rail" aria-hidden="true">
        PROBLEM → TRADE-OFF → PROOF → SHIP → LEARN → REPEAT
      </div>
      <div className="shell story-grid">
        <p className="chapter-line">The operating system</p>
        <p className="story-statement">
          {statement.split(" ").map((word, index) => (
            <span className="story-word" key={`${word}-${index}`}>{word} </span>
          ))}
        </p>
        <div className="story-details">
          <p>
            I&apos;m Abhi Poluri, an SFU BBA student in Vancouver. My projects range from
            local-first AI tools to planning products and mobile apps.
          </p>
          <p>
            I also built a profitable retail-arbitrage operation from zero startup capital.
            Different medium, same instinct: understand what matters and close the loop.
          </p>
          <dl>
            <div><dt>Based in</dt><dd>Vancouver, Canada</dd></div>
            <div><dt>Studying</dt><dd>Strategy &amp; entrepreneurship</dd></div>
            <div><dt>Looking for</dt><dd>Product and technology internships</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
