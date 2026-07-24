"use client";

import { useEffect, useRef, useState } from "react";

const secrets = {
  ship: "SHIP MODE: everything wants to move.",
  abhi: "ABHI MODE: builder frequency unlocked.",
};

export default function PlayLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const typed = useRef("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let frame = 0;
    let points: Array<{ x: number; y: number; life: number }> = [];
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const pointer = (event: PointerEvent) => {
      if (
        event.pointerType === "touch" ||
        document.body.classList.contains("is-cursor-stolen")
      ) {
        points = [];
        return;
      }
      points.push({ x: event.clientX, y: event.clientY, life: 1 });
      if (points.length > 26) points.shift();
    };
    const draw = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (document.body.classList.contains("is-cursor-stolen")) points = [];
      const pins = Array.from(document.querySelectorAll<HTMLElement>(".fallen-letter.is-nailed"))
        .map((letter) => {
          const bounds = letter.getBoundingClientRect();
          return {
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2,
          };
        })
        .filter((pin) => pin.y > -80 && pin.y < window.innerHeight + 80);
      for (let first = 0; first < pins.length; first += 1) {
        for (let second = first + 1; second < pins.length; second += 1) {
          const distance = Math.hypot(
            pins[first].x - pins[second].x,
            pins[first].y - pins[second].y,
          );
          if (distance > 260) continue;
          context.beginPath();
          context.moveTo(pins[first].x, pins[first].y);
          context.lineTo(pins[second].x, pins[second].y);
          context.strokeStyle = `rgba(201, 74, 45, ${(1 - distance / 260) * 0.34})`;
          context.lineWidth = 1.15;
          context.setLineDash([2, 6]);
          context.stroke();
        }
      }
      context.setLineDash([]);
      pins.forEach((pin) => {
        context.beginPath();
        context.arc(pin.x, pin.y, 2.2, 0, Math.PI * 2);
        context.fillStyle = "rgba(201, 74, 45, .72)";
        context.fill();
      });
      if (points.length > 1) {
        context.lineCap = "round";
        context.lineJoin = "round";
        for (let index = 1; index < points.length; index += 1) {
          const previous = points[index - 1];
          const point = points[index];
          context.beginPath();
          context.moveTo(previous.x, previous.y);
          context.lineTo(point.x, point.y);
          context.strokeStyle = `rgba(207, 74, 45, ${point.life * 0.42})`;
          context.lineWidth = point.life * 5;
          context.stroke();
          point.life -= 0.035;
        }
        points = points.filter((point) => point.life > 0);
      }
      frame = requestAnimationFrame(draw);
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.key.length !== 1) return;
      typed.current = `${typed.current}${event.key.toLowerCase()}`.slice(-8);
      const match = Object.keys(secrets).find((word) => typed.current.endsWith(word));
      if (!match) return;
      document.body.dataset.secret = match;
      setMessage(secrets[match as keyof typeof secrets]);
      window.setTimeout(() => setMessage(""), 2800);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("keydown", keydown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", pointer);
      window.removeEventListener("keydown", keydown);
    };
  }, []);

  return (
    <>
      <canvas className="cursor-canvas" ref={canvasRef} aria-hidden="true" />
      <div className={`secret-toast ${message ? "is-visible" : ""}`} role="status">
        {message}
      </div>
    </>
  );
}
