"use client";

import { useEffect, useRef, useState } from "react";

export default function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const mouse   = useRef({ x: -200, y: -200 });
  const ring    = useRef({ x: -200, y: -200 });
  const rafId   = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Only render on pointer-fine (mouse) devices
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) return;
    setIsMobile(false);

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onEnter = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const isClickable =
        el.closest("a, button, [role='button'], input, label, select, textarea") !== null;
      if (isClickable) {
        dotRef.current?.classList.add("hovered");
        ringRef.current?.classList.add("hovered");
      }
    };
    const onLeave = () => {
      dotRef.current?.classList.remove("hovered");
      ringRef.current?.classList.remove("hovered");
    };
    const onDown = () => dotRef.current?.classList.add("clicking");
    const onUp   = () => dotRef.current?.classList.remove("clicking");

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout",  onLeave);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup",   onUp);

    // Spring-physics ring follow
    const SPRING = 0.14;
    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * SPRING;
      ring.current.y += (mouse.current.y - ring.current.y) * SPRING;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout",  onLeave);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup",   onUp);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isMobile) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="cursor-dot"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className="cursor-ring"
        style={{ opacity: visible ? 0.5 : 0 }}
        aria-hidden="true"
      />
    </>
  );
}
