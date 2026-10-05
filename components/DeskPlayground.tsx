"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";

type Stamp = {
  id: number;
  label: string;
  x: number;
  y: number;
  rotation: number;
};

type DeskSound = "click" | "paper" | "impact" | "success";

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  (target instanceof HTMLElement && target.isContentEditable);

export default function DeskPlayground() {
  const [soundOn, setSoundOn] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [chaosActive, setChaosActive] = useState(false);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [creatureMood, setCreatureMood] = useState<"awake" | "watching" | "asleep" | "braced">("awake");
  const [cursorStolen, setCursorStolen] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const stampId = useRef(0);
  const inactivityTimer = useRef<number | null>(null);
  const pet = useRef<HTMLDivElement>(null);
  const petFrame = useRef(0);
  const petPosition = useRef({ x: 18, y: 90 });
  const petTarget = useRef({ x: 18, y: 90 });
  const pointerPosition = useRef({ x: 320, y: 240 });
  const stealingCursor = useRef(false);
  const petDragging = useRef(false);
  const petMoved = useRef(false);
  const petDragOffset = useRef({ x: 0, y: 0 });
  const petPointerSample = useRef({ x: 0, y: 0, time: 0 });
  const petVelocity = useRef({ x: 0, y: 0 });
  const petThrow = useRef({ active: false, x: 0, y: 0, lastTime: 0 });
  const lastSteal = useRef(Date.now());
  const petBusyUntil = useRef(0);
  const nextHopAt = useRef(0);
  const petHabitatBottom = useRef(900);
  const petHop = useRef({
    active: false,
    startedAt: 0,
    duration: 560,
    height: 34,
    fromX: 18,
    fromY: 90,
    toX: 18,
    toY: 90,
  });

  const playSound = useCallback((kind: DeskSound) => {
    if (!soundOn) return;
    const AudioContextConstructor = window.AudioContext;
    const context = audioContext.current ?? new AudioContextConstructor();
    audioContext.current = context;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const settings: Record<DeskSound, { frequency: number; duration: number; type: OscillatorType }> = {
      click: { frequency: 180, duration: 0.045, type: "square" },
      paper: { frequency: 96, duration: 0.09, type: "triangle" },
      impact: { frequency: 62, duration: 0.12, type: "sine" },
      success: { frequency: 320, duration: 0.16, type: "triangle" },
    };
    const setting = settings[kind];
    oscillator.type = setting.type;
    oscillator.frequency.setValueAtTime(setting.frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(38, setting.frequency * 0.62),
      now + setting.duration,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.055, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + setting.duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + setting.duration + 0.02);
  }, [soundOn]);

  const makeStamp = useCallback((label: string, x = window.innerWidth * 0.5, y = window.innerHeight * 0.5) => {
    const id = stampId.current++;
    setStamps((current) => [
      ...current.slice(-5),
      {
        id,
        label,
        x,
        y,
        rotation: gsap.utils.random(-12, 12),
      },
    ]);
    petBusyUntil.current = Date.now() + 950;
    petTarget.current = {
      x: gsap.utils.clamp(8, window.innerWidth - 62, x - 28),
      y: gsap.utils.clamp(70, petHabitatBottom.current - 62, y + window.scrollY + 18),
    };
    nextHopAt.current = 0;
    setCreatureMood("watching");
    playSound("impact");
    window.setTimeout(() => {
      setStamps((current) => current.filter((stamp) => stamp.id !== id));
    }, 1450);
  }, [playSound]);

  const stealCursor = useCallback(() => {
    if (
      stealingCursor.current ||
      petDragging.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;
    stealingCursor.current = true;
    lastSteal.current = Date.now();
    setCursorStolen(true);
    setCreatureMood("braced");
    document.body.classList.add("is-cursor-stolen");
    const runRight = pointerPosition.current.x < window.innerWidth / 2;
    const viewportPointerY = pointerPosition.current.y - window.scrollY;
    const runDown = viewportPointerY < window.innerHeight / 2;
    petTarget.current = {
      x: runRight ? window.innerWidth - 92 : 28,
      y: gsap.utils.clamp(
        70,
        petHabitatBottom.current - 62,
        window.scrollY + (runDown ? window.innerHeight - 110 : 82),
      ),
    };
    nextHopAt.current = 0;
    playSound("impact");
    window.setTimeout(() => {
      document.body.classList.remove("is-cursor-stolen");
      stealingCursor.current = false;
      setCursorStolen(false);
      setCreatureMood("awake");
      petTarget.current = {
        x: gsap.utils.clamp(8, window.innerWidth - 62, pointerPosition.current.x - 58),
        y: gsap.utils.clamp(70, petHabitatBottom.current - 62, pointerPosition.current.y + 24),
      };
      nextHopAt.current = 0;
      makeStamp(
        "CURSOR RETURNED",
        petPosition.current.x + 28,
        petPosition.current.y - 14,
      );
    }, 1650);
  }, [makeStamp, playSound]);

  useEffect(() => {
    const initialize = () => {
      const narrow = window.innerWidth <= 700;
      const hero = document.querySelector<HTMLElement>("#top");
      const heroBounds = hero?.getBoundingClientRect();
      petHabitatBottom.current = heroBounds
        ? Math.min(heroBounds.bottom + window.scrollY, window.innerHeight)
        : window.innerHeight;
      const start = narrow
        ? { x: window.innerWidth - 62, y: 78 }
        : { x: 18, y: window.innerHeight - 72 };
      petPosition.current = start;
      petTarget.current = start;
      pointerPosition.current = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 + window.scrollY,
      };
      petHop.current.active = false;
      nextHopAt.current = performance.now() + 550;
    };
    const beginHop = (now: number) => {
      const commanded = Date.now() < petBusyUntil.current || stealingCursor.current;
      const focus = commanded ? petTarget.current : pointerPosition.current;
      const dx = focus.x - petPosition.current.x;
      const dy = focus.y - petPosition.current.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const curious = !commanded && distance < 92;
      const deviation = curious
        ? gsap.utils.random(-1.45, 1.45)
        : gsap.utils.random(-.42, .42);
      const angle = Math.atan2(dy, dx) + deviation;
      const step = stealingCursor.current
        ? gsap.utils.random(86, 132)
        : commanded
          ? gsap.utils.random(62, 104)
          : distance > 180
            ? gsap.utils.random(52, 92)
            : gsap.utils.random(24, 54);
      const toX = gsap.utils.clamp(
        8,
        window.innerWidth - 62,
        petPosition.current.x + Math.cos(angle) * Math.min(step, distance + 28),
      );
      const toY = gsap.utils.clamp(
        70,
        petHabitatBottom.current - 62,
        petPosition.current.y + Math.sin(angle) * Math.min(step * .72, distance + 20),
      );
      const duration = stealingCursor.current
        ? gsap.utils.random(300, 390)
        : gsap.utils.random(430, 680);
      petHop.current = {
        active: true,
        startedAt: now,
        duration,
        height: stealingCursor.current
          ? gsap.utils.random(38, 56)
          : gsap.utils.random(24, 48),
        fromX: petPosition.current.x,
        fromY: petPosition.current.y,
        toX,
        toY,
      };
      pet.current?.classList.add("is-hopping");
      nextHopAt.current =
        now + duration + (
          stealingCursor.current
            ? gsap.utils.random(70, 150)
            : commanded
              ? gsap.utils.random(160, 360)
              : gsap.utils.random(480, 1250)
        );
    };
    const tick = (now: number) => {
      if (
        !petDragging.current &&
        !petThrow.current.active &&
        !petHop.current.active &&
        now >= nextHopAt.current
      ) beginHop(now);
      const hop = petHop.current;
      let rotation = 0;
      if (petThrow.current.active && !petDragging.current) {
        const elapsed = Math.min(34, Math.max(1, now - petThrow.current.lastTime)) / 1000;
        petThrow.current.lastTime = now;
        petThrow.current.y += 1320 * elapsed;
        petPosition.current.x += petThrow.current.x * elapsed;
        petPosition.current.y += petThrow.current.y * elapsed;
        petThrow.current.x *= Math.pow(.12, elapsed);
        petThrow.current.y *= Math.pow(.44, elapsed);

        const maxX = window.innerWidth - 62;
        const floor = petHabitatBottom.current - 62;
        if (petPosition.current.x <= 8 || petPosition.current.x >= maxX) {
          petPosition.current.x = gsap.utils.clamp(8, maxX, petPosition.current.x);
          petThrow.current.x *= -.58;
          window.dispatchEvent(new CustomEvent("desk:sound", { detail: { kind: "impact" } }));
        }
        if (petPosition.current.y <= 70) {
          petPosition.current.y = 70;
          petThrow.current.y = Math.abs(petThrow.current.y) * .62;
        }
        if (petPosition.current.y >= floor) {
          petPosition.current.y = floor;
          if (Math.abs(petThrow.current.y) > 110) {
            petThrow.current.y *= -.42;
            pet.current?.classList.add("is-impacting");
            window.setTimeout(() => pet.current?.classList.remove("is-impacting"), 180);
            window.dispatchEvent(new CustomEvent("desk:sound", { detail: { kind: "impact" } }));
          } else {
            petThrow.current.y = 0;
          }
        }
        rotation = gsap.utils.clamp(-18, 18, petThrow.current.x * .018);
        if (
          Math.abs(petThrow.current.x) < 12 &&
          Math.abs(petThrow.current.y) < 12 &&
          petPosition.current.y >= floor - 1
        ) {
          petThrow.current.active = false;
          nextHopAt.current = now + 650;
        }
      } else if (hop.active && !petDragging.current) {
        const progress = gsap.utils.clamp(0, 1, (now - hop.startedAt) / hop.duration);
        const travel = 1 - Math.pow(1 - progress, 2);
        const groundX = hop.fromX + (hop.toX - hop.fromX) * travel;
        const groundY = hop.fromY + (hop.toY - hop.fromY) * travel;
        petPosition.current.x = groundX;
        petPosition.current.y = groundY - Math.sin(Math.PI * progress) * hop.height;
        rotation =
          gsap.utils.clamp(-9, 9, (hop.toX - hop.fromX) * .055) *
          Math.sin(Math.PI * progress);
        if (progress >= 1) {
          petPosition.current = { x: hop.toX, y: hop.toY };
          petHop.current.active = false;
          pet.current?.classList.remove("is-hopping");
        }
      }

      if (pet.current) {
        pet.current.style.transform = `translate3d(${petPosition.current.x}px, ${petPosition.current.y}px, 0) rotate(${rotation}deg)`;
      }
      petFrame.current = requestAnimationFrame(tick);
    };
    initialize();
    petFrame.current = requestAnimationFrame(tick);
    window.addEventListener("resize", initialize);
    return () => {
      cancelAnimationFrame(petFrame.current);
      window.removeEventListener("resize", initialize);
      document.body.classList.remove("is-cursor-stolen");
    };
  }, []);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--desk-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--desk-y", `${event.clientY}px`);
      pointerPosition.current = { x: event.clientX, y: event.clientY + window.scrollY };
      const bounds = pet.current?.getBoundingClientRect();
      if (bounds) {
        pet.current?.style.setProperty(
          "--look-x",
          `${gsap.utils.clamp(-.13, .13, (event.clientX - (bounds.left + bounds.width / 2)) / 420)}rem`,
        );
        pet.current?.style.setProperty(
          "--look-y",
          `${gsap.utils.clamp(-.08, .08, (event.clientY - (bounds.top + bounds.height / 2)) / 520)}rem`,
        );
        const distance = Math.hypot(
          event.clientX - (bounds.left + bounds.width / 2),
          event.clientY - (bounds.top + bounds.height / 2),
        );
        if (distance < 120) {
          setCreatureMood("watching");
          if (Date.now() - lastSteal.current > 14000) stealCursor();
        }
      }
      if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
      inactivityTimer.current = window.setTimeout(() => setCreatureMood("asleep"), 9000);
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || isTypingTarget(event.target)) return;
      event.preventDefault();
      setFlashlightOn(true);
      setCreatureMood("watching");
    };
    const keyup = (event: KeyboardEvent) => {
      if (event.code === "Space") setFlashlightOn(false);
    };
    const sound = (event: Event) => {
      playSound((event as CustomEvent<{ kind?: DeskSound }>).detail?.kind ?? "click");
    };
    const stamp = (event: Event) => {
      const detail = (event as CustomEvent<{ label?: string; x?: number; y?: number }>).detail;
      makeStamp(detail?.label ?? "INSPECTED", detail?.x, detail?.y);
    };
    const creature = (event: Event) => {
      const mood = (event as CustomEvent<{ mood?: typeof creatureMood }>).detail?.mood;
      if (mood) setCreatureMood(mood);
    };
    const fetch = (event: Event) => {
      const detail = (event as CustomEvent<{ x?: number; y?: number }>).detail;
      if (typeof detail?.x !== "number" || typeof detail?.y !== "number") return;
      petBusyUntil.current = Date.now() + 1250;
      petTarget.current = {
        x: gsap.utils.clamp(8, window.innerWidth - 62, detail.x - 24),
        y: gsap.utils.clamp(
          70,
          petHabitatBottom.current - 62,
          detail.y + window.scrollY + 18,
        ),
      };
      nextHopAt.current = 0;
      setCreatureMood("watching");
      playSound("click");
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("desk:sound", sound);
    window.addEventListener("desk:stamp", stamp);
    window.addEventListener("desk:creature", creature);
    window.addEventListener("desk:pet-fetch", fetch);
    inactivityTimer.current = window.setTimeout(() => setCreatureMood("asleep"), 9000);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("desk:sound", sound);
      window.removeEventListener("desk:stamp", stamp);
      window.removeEventListener("desk:creature", creature);
      window.removeEventListener("desk:pet-fetch", fetch);
      if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
    };
  }, [makeStamp, playSound, stealCursor]);

  const grabPet = (event: React.PointerEvent<HTMLButtonElement>) => {
    petDragging.current = true;
    petMoved.current = false;
    petThrow.current.active = false;
    petHop.current.active = false;
    pet.current?.classList.remove("is-hopping");
    pet.current?.classList.add("is-dragging");
    petDragOffset.current = {
      x: event.pageX - petPosition.current.x,
      y: event.pageY - petPosition.current.y,
    };
    petPointerSample.current = {
      x: event.pageX,
      y: event.pageY,
      time: performance.now(),
    };
    petVelocity.current = { x: 0, y: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
    setCreatureMood("braced");
  };

  const dragPet = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!petDragging.current || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const now = performance.now();
    const elapsed = Math.max(8, now - petPointerSample.current.time);
    const instantaneousX = (event.pageX - petPointerSample.current.x) / elapsed;
    const instantaneousY = (event.pageY - petPointerSample.current.y) / elapsed;
    petVelocity.current = {
      x: petVelocity.current.x * .58 + instantaneousX * .42,
      y: petVelocity.current.y * .58 + instantaneousY * .42,
    };
    petPointerSample.current = { x: event.pageX, y: event.pageY, time: now };

    const nextX = event.pageX - petDragOffset.current.x;
    const nextY = event.pageY - petDragOffset.current.y;
    if (Math.hypot(nextX - petPosition.current.x, nextY - petPosition.current.y) > 2) {
      petMoved.current = true;
    }
    petPosition.current = {
      x: gsap.utils.clamp(8, window.innerWidth - 62, nextX),
      y: gsap.utils.clamp(2, petHabitatBottom.current - 62, nextY),
    };
  };

  const dropPet = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!petDragging.current) return;
    petDragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pet.current?.classList.remove("is-dragging");

    if (!petMoved.current) {
      setCreatureMood("awake");
      nextHopAt.current = performance.now() + 300;
      return;
    }

    petThrow.current = {
      active: true,
      x: gsap.utils.clamp(-1150, 1150, petVelocity.current.x * 1000),
      y: gsap.utils.clamp(-980, 980, petVelocity.current.y * 1000),
      lastTime: performance.now(),
    };
    setCreatureMood("awake");
  };

  const clickPet = () => {
    if (petMoved.current) {
      petMoved.current = false;
      return;
    }
    stealCursor();
  };

  const pullChaosLever = () => {
    if (chaosActive || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setChaosActive(true);
    setCreatureMood("braced");
    document.body.classList.add("is-desk-chaos");
    const targets = gsap.utils.toArray<HTMLElement>(
      ".hero-scrap-slot, .work-row, .projector-intro > *, .forge-materials button",
    );
    gsap.to(targets, {
      x: () => gsap.utils.random(-24, 24),
      y: () => gsap.utils.random(-18, 30),
      rotation: () => gsap.utils.random(-7, 7),
      duration: 0.55,
      stagger: { each: 0.012, from: "random" },
      ease: "back.out(1.8)",
    });
    makeStamp("CONTROLLED CHAOS", window.innerWidth * 0.72, window.innerHeight * 0.64);
    window.setTimeout(() => {
      gsap.to(targets, {
        x: 0,
        y: 0,
        rotation: 0,
        duration: 1.05,
        stagger: { each: 0.014, from: "random" },
        ease: "elastic.out(1, .42)",
        onComplete: () => {
          document.body.classList.remove("is-desk-chaos");
          setChaosActive(false);
          setCreatureMood("awake");
        },
      });
    }, 1150);
  };

  return (
    <>
      <div className={`desk-flashlight ${flashlightOn ? "is-on" : ""}`} aria-hidden="true" />
      <div className="page-edge-crack page-edge-crack-left" aria-hidden="true" />
      <div className="page-edge-crack page-edge-crack-right" aria-hidden="true" />

      {stamps.map((stamp) => (
        <span
          className="desk-stamp"
          key={stamp.id}
          style={{
            left: stamp.x,
            top: stamp.y,
            transform: `translate(-50%, -50%) rotate(${stamp.rotation}deg)`,
          }}
          aria-hidden="true"
        >
          {stamp.label}
        </span>
      ))}

      <div className="desk-rail" aria-label="Play controls">
        <button
          type="button"
          className={soundOn ? "is-active" : ""}
          onClick={() => setSoundOn((enabled) => !enabled)}
          aria-pressed={soundOn}
        >
          Sound {soundOn ? "on" : "off"}
        </button>
        <button type="button" onClick={pullChaosLever} disabled={chaosActive}>
          {chaosActive ? "Rebuilding" : "Pull lever"}
        </button>
      </div>

      <div
        className={`desk-pet ${cursorStolen ? "has-cursor" : ""}`}
        ref={pet}
      >
        <button
          className={`desk-creature is-${creatureMood}`}
          type="button"
          onClick={clickPet}
          onPointerDown={grabPet}
          onPointerMove={dragPet}
          onPointerUp={dropPet}
          onPointerCancel={dropPet}
          onLostPointerCapture={dropPet}
          aria-label={`Desk creature is ${creatureMood}. Drag and throw it, or click to let it steal the cursor.`}
        >
          <span className="desk-creature-eyes" aria-hidden="true"><i /><i /></span>
          <span className="desk-creature-mouth" aria-hidden="true" />
        </button>
        <span className="pet-stolen-cursor" aria-hidden="true" />
      </div>
    </>
  );
}
