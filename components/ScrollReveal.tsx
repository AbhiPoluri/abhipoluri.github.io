"use client";

import { useEffect, useRef, ReactNode } from "react";

type Dir = "up" | "left" | "right";
const cls: Record<Dir, string> = { up: "sr", left: "sr-l", right: "sr-r" };

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Dir;
}

export default function ScrollReveal({ children, className = "", delay = 0, direction = "up" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("on"), delay);
          io.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`${cls[direction]} ${className}`}>
      {children}
    </div>
  );
}
