"use client";

import { useEffect, useRef } from "react";

interface SkyVideoProps {
  src: string;
  poster: string;
  className?: string;
}

/**
 * Wandr's landing-page sky loop. It plays only while on screen and never for
 * people who ask for reduced motion; they get the poster frame instead.
 */
export default function SkyVideo({ src, poster, className }: SkyVideoProps) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reducedMotion.matches) {
          element.play().catch(() => {
            // Autoplay blocked (e.g. low-power mode): the poster stays up.
          });
        } else {
          element.pause();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={video}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
