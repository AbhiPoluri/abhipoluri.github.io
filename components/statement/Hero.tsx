"use client";

import type { ReactNode } from "react";
import { heroChips, wandr } from "@/data/statement";
import type { WorkItem } from "@/data/work";
import { useLetterPhysics } from "./useLetterPhysics";

const sentence = "I'm Abhi. I make games, AI tools and apps. I also study business at SFU.";

/** The hero sentence: every letter is hittable, and each chip pops a preview on hover. */
export default function Hero() {
  const { hit } = useLetterPhysics();
  let letterIndex = 0;

  /** Splits text into hittable letters, keeping each word on one line. */
  const letters = (text: string, looseLetter?: number): ReactNode =>
    text.split(/(\s+)/).map((word, wordIndex) => {
      if (!word.trim()) return word;
      return (
        <span className="st-word" key={`${word}-${wordIndex}`}>
          {word.split("").map((character, characterIndex) => {
            if (!/[a-z]/i.test(character)) return character;
            const index = letterIndex++;
            const glyph = (
              <span
                className={`hero-letter${looseLetter === characterIndex ? " is-loose" : ""}`}
                data-letter={character.toUpperCase()}
                key={index}
                onPointerDown={(event) => hit(event, index)}
              >
                <span className="hero-letter-glyph">{character}</span>
              </span>
            );
            if (looseLetter !== characterIndex) return glyph;
            return (
              <span className="st-ghost" key={`ghost-${index}`}>
                <i aria-hidden="true">{character}</i>
                <i aria-hidden="true">{character}</i>
                {glyph}
              </span>
            );
          })}
        </span>
      );
    });

  /** Pops downward when there isn't room above the chip (first line, under the bar). */
  const aimPop = (event: React.SyntheticEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const popHeight = bounds.height * 3;
    event.currentTarget.parentElement?.toggleAttribute("data-pop-down", bounds.top - popHeight < 72);
  };

  /** `face` replaces the chip's image, e.g. Wandr's bird-and-wordmark lockup. */
  const chip = (item: WorkItem, face?: ReactNode) => {
    const image = item.image ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.image} alt="" />
    ) : null;
    return (
      <span className="st-chipwrap">
        <button
          type="button"
          className="st-chip"
          aria-label={`${item.name}: ${item.tagline}`}
          onPointerEnter={aimPop}
          onFocus={aimPop}
          onClick={() => {
            window.dispatchEvent(new CustomEvent("portfolio:load-project", { detail: { id: item.id } }));
            document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span className="st-chip-face">{face ?? image}</span>
        </button>
        <span className="st-chip-pop" aria-hidden="true">
          {image}
          <b>{item.name}</b>
        </span>
      </span>
    );
  };

  return (
    <section className="st-hero st-px" id="top">
      <h1 className="st-big" aria-label={sentence}>
        {letters("I'm Abhi. I ")}
        {letters("make", 2)}
        {letters(" games")} {chip(heroChips.games)}
        <span className="st-tag" aria-hidden="true">playable</span>
        {", "}
        {letters("AI tools")} {chip(heroChips.tools)}
        {letters(" and apps")}{" "}
        {chip(
          heroChips.apps,
          <span className="st-chip-lockup">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={wandr.mark} alt="" />
            <span>wandr</span>
          </span>,
        )}
        <span className="st-tag is-white" aria-hidden="true">on the App Store</span>
        {". "}
        <span className="st-dim">{letters("I also study business at SFU.")}</span>
      </h1>
      <p className="st-small st-hint">
        ↑ That k came loose. Hit any letter three times, or hold Shift to pull them all back.
      </p>
    </section>
  );
}
