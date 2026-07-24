"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { DeskToyShape, type DeskToyKind } from "@/components/DeskToys";

type LooseDeskToyProps = {
  kind: DeskToyKind;
  onPaint: (x: number, y: number, phase: "start" | "move" | "end") => void;
  onRemove: () => void;
  onSound: (kind: "click" | "paper" | "impact" | "success") => void;
  onStamp: (x: number, y: number) => void;
  onUse: (
    kind: DeskToyKind,
    x: number,
    y: number,
    element: HTMLButtonElement,
  ) => void;
  x: number;
  y: number;
};

export default function LooseDeskToy({
  kind,
  onPaint,
  onRemove,
  onSound,
  onStamp,
  onUse,
  x,
  y,
}: LooseDeskToyProps) {
  const [initialPosition] = useState(() => ({ x: x - 34, y: y - 30 }));
  const position = useRef(initialPosition);
  const start = useRef({
    pointerX: 0,
    pointerY: 0,
    x: initialPosition.x,
    y: initialPosition.y,
  });
  const dragged = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const lastPaint = useRef({ x: -100, y: -100 });
  const rotation = useRef(kind === "roller" ? -5 : 0);

  const rollerContact = (element: HTMLButtonElement) => {
    const foam = element.querySelector<HTMLElement>(".roller-foam");
    const bounds = foam?.getBoundingClientRect();
    return bounds
      ? {
          x: bounds.left + bounds.width / 2 + window.scrollX,
          y: bounds.top + bounds.height / 2 + window.scrollY,
        }
      : {
          x: position.current.x + 34,
          y: position.current.y + 14,
        };
  };

  const press = (event: React.PointerEvent<HTMLButtonElement>) => {
    start.current = {
      pointerX: event.pageX,
      pointerY: event.pageY,
      x: position.current.x,
      y: position.current.y,
    };
    dragged.current = false;
    lastPointer.current = { x: event.pageX, y: event.pageY };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-held");
    if (kind === "roller") {
      const contact = rollerContact(event.currentTarget);
      lastPaint.current = contact;
      onPaint(contact.x, contact.y, "start");
    }
    onSound("click");
  };

  const drag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const dx = event.pageX - start.current.pointerX;
    const dy = event.pageY - start.current.pointerY;
    if (Math.hypot(dx, dy) > 6) dragged.current = true;
    position.current = {
      x: gsap.utils.clamp(4, document.documentElement.scrollWidth - 72, start.current.x + dx),
      y: gsap.utils.clamp(70, document.documentElement.scrollHeight - 72, start.current.y + dy),
    };
    event.currentTarget.style.left = `${position.current.x}px`;
    event.currentTarget.style.top = `${position.current.y}px`;

    const stepX = event.pageX - lastPointer.current.x;
    const stepY = event.pageY - lastPointer.current.y;
    if (kind === "roller" && Math.hypot(stepX, stepY) > 1.5) {
      const desiredRotation = Math.atan2(stepY, stepX) * 180 / Math.PI + 90;
      const shortestTurn = ((desiredRotation - rotation.current + 540) % 360) - 180;
      rotation.current += shortestTurn;
      gsap.to(event.currentTarget, {
        rotation: rotation.current,
        duration: .16,
        ease: "power2.out",
        overwrite: "auto",
      });
      lastPointer.current = { x: event.pageX, y: event.pageY };

      const contact = rollerContact(event.currentTarget);
      if (Math.hypot(contact.x - lastPaint.current.x, contact.y - lastPaint.current.y) > 3) {
        lastPaint.current = contact;
        onPaint(contact.x, contact.y, "move");
      }
    } else if (kind !== "roller") {
      event.currentTarget.style.transform = `rotate(${gsap.utils.clamp(-10, 10, dx * .045)}deg)`;
    }
  };

  const release = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.classList.remove("is-held");
    if (kind === "roller") {
      const contact = rollerContact(event.currentTarget);
      onPaint(contact.x, contact.y, "end");
    } else {
      event.currentTarget.style.transform = "";
    }
    if (!dragged.current && kind === "stamp") {
      onStamp(event.clientX, event.clientY);
    } else if (!dragged.current && kind !== "roller") {
      const bounds = event.currentTarget.getBoundingClientRect();
      onUse(
        kind,
        bounds.left + bounds.width / 2 + window.scrollX,
        bounds.top + bounds.height / 2 + window.scrollY,
        event.currentTarget,
      );
    }
    if (kind === "spring" || kind === "trampoline") {
      gsap.fromTo(
        event.currentTarget,
        { scaleX: 1.22, scaleY: .72 },
        { scaleX: 1, scaleY: 1, duration: .82, ease: "elastic.out(1, .25)" },
      );
      onSound("impact");
    } else {
      gsap.fromTo(
        event.currentTarget,
        { scale: .92 },
        { scale: 1, duration: .46, ease: "back.out(2.2)" },
      );
    }
  };

  return (
    <button
      className={`loose-desk-toy is-${kind}`}
      style={{
        left: initialPosition.x,
        top: initialPosition.y,
        transform: kind === "roller" ? "rotate(-5deg)" : undefined,
      }}
      type="button"
      onDoubleClick={onRemove}
      onPointerDown={press}
      onPointerMove={drag}
      onPointerUp={release}
      onPointerCancel={release}
      aria-label={`${kind} toy. Drag around the page. Double-click to return it to the drawer.`}
    >
      <DeskToyShape kind={kind} />
    </button>
  );
}
