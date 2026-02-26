"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
}

export default function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 1800,
  decimals = 0,
}: Props) {
  const [count,   setCount]   = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!started) return;
    const start    = performance.now();
    const easeOut  = (t: number) => 1 - Math.pow(1 - t, 3);

    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(target * easeOut(progress));
      if (progress < 1) requestAnimationFrame(frame);
      else setCount(target);
    };
    requestAnimationFrame(frame);
  }, [started, target, duration]);

  const formatted = count.toFixed(decimals);

  return (
    <span ref={ref} className="counter-val">
      {prefix}{formatted}{suffix}
    </span>
  );
}
