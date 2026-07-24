"use client";

import { useRef, useState } from "react";
import gsap from "gsap";

export type DeskToyKind =
  | "roller"
  | "spring"
  | "stamp"
  | "magnet"
  | "fan"
  | "mouse"
  | "punch"
  | "tape"
  | "crane"
  | "dropper"
  | "trampoline"
  | "vacuum"
  | "camera"
  | "rubberband"
  | "domino"
  | "prism"
  | "labeler"
  | "shredder"
  | "etch"
  | "jack"
  | "portal"
  | "freeze"
  | "scale";

type ToyShelf = "marks" | "motion" | "tools" | "strange";

type DeskToysProps = {
  onClear: () => void;
  onDeploy: (kind: DeskToyKind, clientX: number, clientY: number) => void;
  onSound: (kind: "click" | "paper" | "impact" | "success") => void;
};

const toyCopy: Record<DeskToyKind, { name: string; note: string; shelf: ToyShelf }> = {
  roller: { name: "Paint roller", note: "Paint the page.", shelf: "marks" },
  stamp: { name: "Stamp press", note: "Leave an opinion.", shelf: "marks" },
  dropper: { name: "Ink dropper", note: "Make a spreading puddle.", shelf: "marks" },
  camera: { name: "Polaroid", note: "Capture the current mess.", shelf: "marks" },
  labeler: { name: "Label maker", note: "Print sticky thoughts.", shelf: "marks" },
  etch: { name: "Etch-a-Sketch", note: "Click to redraw it.", shelf: "marks" },
  spring: { name: "Desk spring", note: "Bounce letters and the pet.", shelf: "motion" },
  trampoline: { name: "Trampoline", note: "Launch a wider target.", shelf: "motion" },
  fan: { name: "Desk fan", note: "Blow everything away.", shelf: "motion" },
  mouse: { name: "Wind-up mouse", note: "Give the pet something to chase.", shelf: "motion" },
  rubberband: { name: "Rubber band", note: "Launch the nearest letter.", shelf: "motion" },
  jack: { name: "Jack-in-box", note: "Wind three times.", shelf: "motion" },
  magnet: { name: "Magnet wand", note: "Pull letters into orbit.", shelf: "tools" },
  vacuum: { name: "Tiny vacuum", note: "Suck in loose letters.", shelf: "tools" },
  crane: { name: "Toy crane", note: "Lift the nearest letter.", shelf: "tools" },
  tape: { name: "Tape dispenser", note: "Pin a letter in place.", shelf: "tools" },
  punch: { name: "Hole punch", note: "Punch out confetti.", shelf: "tools" },
  shredder: { name: "Shredder", note: "Destroy the latest label.", shelf: "tools" },
  domino: { name: "Domino", note: "Start a chain reaction.", shelf: "strange" },
  prism: { name: "Light prism", note: "Split the desk light.", shelf: "strange" },
  portal: { name: "Portal", note: "Use two to move letters.", shelf: "strange" },
  freeze: { name: "Freeze spray", note: "Stop or thaw loose letters.", shelf: "strange" },
  scale: { name: "Desk scale", note: "Weigh nearby chaos.", shelf: "strange" },
};

const shelves: Array<{ id: ToyShelf; label: string }> = [
  { id: "marks", label: "Make marks" },
  { id: "motion", label: "Set in motion" },
  { id: "tools", label: "Grab tools" },
  { id: "strange", label: "Odd drawer" },
];

export function DeskToyShape({ kind }: { kind: DeskToyKind }) {
  if (kind === "roller") {
    return (
      <span className="desk-toy-shape desk-toy-shape-roller" aria-hidden="true">
        <i className="roller-foam" />
        <i className="roller-bracket" />
        <i className="roller-grip" />
      </span>
    );
  }
  if (kind === "spring") {
    return (
      <span className="desk-toy-shape desk-toy-shape-spring" aria-hidden="true">
        <i /><i /><i /><i /><i /><i />
      </span>
    );
  }
  if (kind === "stamp") {
    return (
      <span className="desk-toy-shape desk-toy-shape-stamp" aria-hidden="true">
        <i className="stamp-handle" />
        <i className="stamp-neck" />
        <i className="stamp-base" />
      </span>
    );
  }
  return (
    <span
      className={`desk-toy-shape desk-toy-shape-symbol desk-toy-shape-${kind}`}
      aria-hidden="true"
    >
      <i /><i /><i /><b />
    </span>
  );
}

export default function DeskToys({ onClear, onDeploy, onSound }: DeskToysProps) {
  const [activeShelf, setActiveShelf] = useState<ToyShelf>("marks");
  const [dragging, setDragging] = useState<{
    kind: DeskToyKind;
    x: number;
    y: number;
  } | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const start = (kind: DeskToyKind, event: React.PointerEvent<HTMLButtonElement>) => {
    dragStart.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging({ kind, x: event.clientX, y: event.clientY });
    gsap.to(event.currentTarget, { scale: .94, duration: .12, ease: "power2.out" });
    onSound("click");
  };

  const move = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragging((current) => current
      ? { ...current, x: event.clientX, y: event.clientY }
      : current);
  };

  const release = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const distance = Math.hypot(
      event.clientX - dragStart.current.x,
      event.clientY - dragStart.current.y,
    );
    const drawer = event.currentTarget.closest(".desk-drawer")?.getBoundingClientRect();
    const outsideDrawer = drawer
      ? (
          event.clientX < drawer.left ||
          event.clientX > drawer.right ||
          event.clientY < drawer.top ||
          event.clientY > drawer.bottom
        )
      : true;
    if (distance > 34 && outsideDrawer) {
      onDeploy(dragging.kind, event.clientX, event.clientY);
      onSound("paper");
    } else {
      gsap.fromTo(
        event.currentTarget,
        { x: event.clientX - dragStart.current.x, y: event.clientY - dragStart.current.y },
        { x: 0, y: 0, scale: 1, duration: .62, ease: "elastic.out(1, .42)" },
      );
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(null);
  };

  const visibleToys = (Object.keys(toyCopy) as DeskToyKind[])
    .filter((kind) => toyCopy[kind].shelf === activeShelf);

  return (
    <section className="desk-toys" aria-label="Desk toys">
      <div className="desk-toys-heading">
        <div>
          <small>Toy drawer</small>
          <strong>Pull anything onto the page.</strong>
        </div>
        <button type="button" onClick={onClear}>Return everything</button>
      </div>

      <div className="desk-toy-shelves" role="tablist" aria-label="Toy shelves">
        {shelves.map((shelf) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeShelf === shelf.id}
            className={activeShelf === shelf.id ? "is-active" : ""}
            key={shelf.id}
            onClick={() => setActiveShelf(shelf.id)}
          >
            {shelf.label}
          </button>
        ))}
      </div>

      <div className="desk-toy-tray">
        {visibleToys.map((kind) => (
          <button
            className={`desk-toy-card is-${kind}`}
            type="button"
            key={kind}
            onPointerDown={(event) => start(kind, event)}
            onPointerMove={move}
            onPointerUp={release}
            onPointerCancel={release}
          >
            <DeskToyShape kind={kind} />
            <span>
              <strong>{toyCopy[kind].name}</strong>
              <small>{toyCopy[kind].note}</small>
            </span>
          </button>
        ))}
      </div>

      {dragging ? (
        <span
          className="desk-toy-drag-ghost"
          style={{ left: dragging.x, top: dragging.y }}
          aria-hidden="true"
        >
          <DeskToyShape kind={dragging.kind} />
        </span>
      ) : null}
    </section>
  );
}
