"use client";

import { useEffect, useRef, useState } from "react";

const materials = ["Product", "Strategy", "Code"];
const clamp = (min: number, max: number, value: number) =>
  Math.min(max, Math.max(min, value));
const arrowPoints = [
  { x: 604, y: 27 },
  { x: 520, y: 52 },
  { x: 450, y: 76 },
  { x: 370, y: 67 },
  { x: 286, y: 81 },
  { x: 218, y: 121 },
  { x: 141, y: 157 },
  { x: 78, y: 178 },
  { x: 25, y: 207 },
];

const curveThrough = (points: Array<{ x: number; y: number }>) => {
  let path = `M${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const before = points[index - 1] ?? points[index];
    const current = points[index];
    const next = points[index + 1];
    const after = points[index + 2] ?? next;
    const controlOne = {
      x: current.x + (next.x - before.x) / 6,
      y: current.y + (next.y - before.y) / 6,
    };
    const controlTwo = {
      x: next.x - (after.x - current.x) / 6,
      y: next.y - (after.y - current.y) / 6,
    };
    path += `C${controlOne.x} ${controlOne.y} ${controlTwo.x} ${controlTwo.y} ${next.x} ${next.y}`;
  }
  return path;
};

export default function Contact() {
  const [loaded, setLoaded] = useState<string[]>([]);
  const arrow = useRef<SVGSVGElement>(null);
  const arrowPhysics = useRef({
    nodes: arrowPoints.map((point, index) => ({
      ...point,
      baseX: point.x,
      baseY: point.y,
      velocityX: 0,
      velocityY: 0,
      fixed: index === 0,
    })),
    dragIndex: -1,
    pointerId: -1,
    targetX: 0,
    targetY: 0,
    energy: 0,
  });

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const svg = arrow.current;
      const physics = arrowPhysics.current;
      physics.nodes.forEach((node, index) => {
        if (node.fixed) return;
        if (physics.dragIndex === index) {
          node.x += (physics.targetX - node.x) * 0.38;
          node.y += (physics.targetY - node.y) * 0.38;
          node.velocityX = 0;
          node.velocityY = 0;
          return;
        }
        node.velocityX += (node.baseX - node.x) * 0.045;
        node.velocityY += (node.baseY - node.y) * 0.045;
        node.velocityX *= 0.86;
        node.velocityY *= 0.86;
        node.x += node.velocityX;
        node.y += node.velocityY;
      });
      physics.energy += ((physics.dragIndex >= 0 ? 1 : 0) - physics.energy) * 0.14;

      if (svg) {
        const paths = svg.querySelectorAll("path");
        paths[0]?.setAttribute("d", curveThrough(physics.nodes));
        paths[1]?.setAttribute(
          "d",
          curveThrough(physics.nodes.map((node, index) => ({
            x: node.x - (index / physics.nodes.length) * 3,
            y: node.y + 6,
          }))),
        );
        const end = physics.nodes.at(-1)!;
        const previous = physics.nodes.at(-2)!;
        const dx = end.x - previous.x;
        const dy = end.y - previous.y;
        const length = Math.max(1, Math.hypot(dx, dy));
        const backwardX = -dx / length;
        const backwardY = -dy / length;
        const perpendicularX = -backwardY;
        const perpendicularY = backwardX;
        paths[2]?.setAttribute(
          "d",
          `M${end.x + backwardX * 50 + perpendicularX * 21} ${end.y + backwardY * 50 + perpendicularY * 21}L${end.x} ${end.y}L${end.x + backwardX * 50 - perpendicularX * 21} ${end.y + backwardY * 50 - perpendicularY * 21}`,
        );
        svg.style.setProperty("--cursor-energy", physics.energy.toFixed(3));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const pointInArrow = (event: React.PointerEvent<Element>) => {
    const svg = arrow.current;
    if (!svg) return null;
    const bounds = svg.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * 620,
      y: ((event.clientY - bounds.top) / bounds.height) * 240,
    };
  };

  const collideWithArrow = (event: React.PointerEvent<HTMLElement>) => {
    const svg = arrow.current;
    if (!svg || event.pointerType === "touch") return;
    const physics = arrowPhysics.current;
    const point = pointInArrow(event);
    if (!point) return;
    if (physics.dragIndex >= 0 && event.pointerId === physics.pointerId) {
      physics.targetX = clamp(-30, 650, point.x);
      physics.targetY = clamp(-40, 280, point.y);
      return;
    }

    const bounds = svg.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    ) return;

    let touched = false;
    physics.nodes.forEach((node) => {
      if (node.fixed) return;
      const dx = node.x - point.x;
      const dy = node.y - point.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      if (distance > 72) return;
      const force = (1 - distance / 72) * 9.5;
      node.velocityX += (dx / distance) * force;
      node.velocityY += (dy / distance) * force;
      touched = true;
    });
    if (touched) physics.energy = Math.min(1, physics.energy + 0.45);
  };

  const grabArrow = (event: React.PointerEvent<SVGSVGElement>) => {
    event.preventDefault();
    const point = pointInArrow(event);
    if (!point) return;
    const physics = arrowPhysics.current;
    let closest = 1;
    let closestDistance = Number.POSITIVE_INFINITY;
    physics.nodes.forEach((node, index) => {
      if (node.fixed) return;
      const distance = Math.hypot(node.x - point.x, node.y - point.y);
      if (distance < closestDistance) {
        closest = index;
        closestDistance = distance;
      }
    });
    physics.dragIndex = closest;
    physics.pointerId = event.pointerId;
    physics.targetX = point.x;
    physics.targetY = point.y;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const releaseArrow = (event: React.PointerEvent<SVGSVGElement>) => {
    const physics = arrowPhysics.current;
    if (physics.dragIndex < 0 || event.pointerId !== physics.pointerId) return;
    const node = physics.nodes[physics.dragIndex];
    node.velocityX = (node.baseX - node.x) * 0.12;
    node.velocityY = (node.baseY - node.y) * 0.12;
    physics.dragIndex = -1;
    physics.pointerId = -1;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const toggle = (material: string) => {
    setLoaded((current) =>
      current.includes(material)
        ? current.filter((item) => item !== material)
        : [...current, material],
    );
  };

  const complete = loaded.length === materials.length;

  return (
    <section
      className={`contact-section ${complete ? "is-forged" : ""}`}
      id="contact"
      onPointerMove={collideWithArrow}
    >
      <div className="shell forge-grid">
        <div className="forge-copy">
          <p className="chapter-line">Word forge</p>
          <h2>Build the invitation.</h2>
          <p>
            Load all three materials into the forge. They&apos;re the combination I bring to
            internships, collaborations, and hard product problems.
          </p>
          <div className="forge-materials" aria-label="Forge materials">
            {materials.map((material) => (
              <button
                className={loaded.includes(material) ? "is-loaded" : ""}
                key={material}
                type="button"
                onClick={() => toggle(material)}
                aria-pressed={loaded.includes(material)}
              >
                {material}
              </button>
            ))}
          </div>
        </div>

        <div className="forge-machine" aria-live="polite">
          {!complete ? (
            <svg
              ref={arrow}
              className="forge-hand-arrow"
              viewBox="0 0 620 240"
              fill="none"
              aria-hidden="true"
              onPointerDown={grabArrow}
              onPointerUp={releaseArrow}
              onPointerCancel={releaseArrow}
            >
              <path d="M604 27C541 34 508 70 450 76C378 83 348 53 286 81C224 109 207 145 141 157C94 166 62 177 25 207" />
              <path d="M596 35C538 43 503 79 445 84C372 91 345 63 290 88C231 115 211 151 145 165C96 175 61 185 28 211" />
              <path d="M73 215L24 208L42 163" />
            </svg>
          ) : null}
          <div className="forge-slots">
            {materials.map((material) => (
              <span className={loaded.includes(material) ? "is-loaded" : ""} key={material}>
                {loaded.includes(material) ? material : "Drop material"}
              </span>
            ))}
          </div>
          <div className="forge-output">
            <span>{complete ? "READY TO SHIP" : `${loaded.length} / 3 LOADED`}</span>
            <h3>{complete ? "Let’s make something real." : "Feed the machine."}</h3>
            {complete ? (
              <a href="mailto:abhiram.poluri@gmail.com">
                abhiram.poluri@gmail.com ↗
              </a>
            ) : (
              <p className="forge-direction">
                Use Product, Strategy, and Code
              </p>
            )}
          </div>
        </div>
      </div>
      <p className="secret-instruction">There are two keyboard secrets hidden on this page.</p>
    </section>
  );
}
