"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import DeskToys, { type DeskToyKind } from "@/components/DeskToys";
import LooseDeskToy from "@/components/LooseDeskToy";

type Stamp = {
  id: number;
  label: string;
  x: number;
  y: number;
  rotation: number;
};

type DeskSound = "click" | "paper" | "impact" | "success";

type LooseToy = {
  id: number;
  kind: DeskToyKind;
  x: number;
  y: number;
};

type PaintPoint = {
  x: number;
  y: number;
};

type PagePaint = {
  id: number;
  points: PaintPoint[];
};

type ToyArtifact = {
  id: number;
  kind: "ink" | "photo" | "label" | "tape" | "confetti" | "shred";
  x: number;
  y: number;
  rotation: number;
  text?: string;
};

const titleWords = ["product", "chaos", "code", "judgment", "AI", "planning"];
const defaultTitleWords = ["product", "code", "judgment"];

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  (target instanceof HTMLElement && target.isContentEditable);

export default function DeskPlayground() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [chaosActive, setChaosActive] = useState(false);
  const [titleMix, setTitleMix] = useState<string[]>(defaultTitleWords);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [creatureMood, setCreatureMood] = useState<"awake" | "watching" | "asleep" | "braced">("awake");
  const [cursorStolen, setCursorStolen] = useState(false);
  const [petJailed, setPetJailed] = useState(false);
  const [looseToys, setLooseToys] = useState<LooseToy[]>([]);
  const [pagePaint, setPagePaint] = useState<PagePaint[]>([]);
  const [toyArtifacts, setToyArtifacts] = useState<ToyArtifact[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const stampId = useRef(0);
  const inactivityTimer = useRef<number | null>(null);
  const pet = useRef<HTMLDivElement>(null);
  const petJail = useRef<HTMLDivElement>(null);
  const petFrame = useRef(0);
  const petPosition = useRef({ x: 18, y: 90 });
  const petTarget = useRef({ x: 18, y: 90 });
  const pointerPosition = useRef({ x: 320, y: 240 });
  const stealingCursor = useRef(false);
  const petJailedRef = useRef(false);
  const petDragging = useRef(false);
  const petMoved = useRef(false);
  const petDragOffset = useRef({ x: 0, y: 0 });
  const petPointerSample = useRef({ x: 0, y: 0, time: 0 });
  const petVelocity = useRef({ x: 0, y: 0 });
  const petThrow = useRef({ active: false, x: 0, y: 0, lastTime: 0 });
  const petSpringCooldownUntil = useRef(0);
  const petFrozenUntil = useRef(0);
  const lastSteal = useRef(Date.now());
  const looseToyId = useRef(0);
  const pagePaintId = useRef(0);
  const toyArtifactId = useRef(0);
  const activePaintStroke = useRef(new Map<number, number>());
  const jackWinds = useRef(new WeakMap<HTMLElement, number>());
  const labelIndex = useRef(0);
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
      petJailedRef.current ||
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
        !petJailedRef.current &&
        Date.now() >= petFrozenUntil.current &&
        !petDragging.current &&
        !petThrow.current.active &&
        !petHop.current.active &&
        now >= nextHopAt.current
      ) beginHop(now);
      const hop = petHop.current;
      let rotation = 0;
      let descending = false;
      if (
        petThrow.current.active &&
        !petDragging.current &&
        !petJailedRef.current &&
        Date.now() >= petFrozenUntil.current
      ) {
        const elapsed = Math.min(34, Math.max(1, now - petThrow.current.lastTime)) / 1000;
        petThrow.current.lastTime = now;
        petThrow.current.y += 1320 * elapsed;
        petPosition.current.x += petThrow.current.x * elapsed;
        petPosition.current.y += petThrow.current.y * elapsed;
        petThrow.current.x *= Math.pow(.12, elapsed);
        petThrow.current.y *= Math.pow(.44, elapsed);
        descending = petThrow.current.y > 0;

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
      } else if (hop.active && !petDragging.current && !petJailedRef.current) {
        const progress = gsap.utils.clamp(0, 1, (now - hop.startedAt) / hop.duration);
        descending = progress > .52;
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

      if (
        descending &&
        !petDragging.current &&
        !petJailedRef.current &&
        now >= petSpringCooldownUntil.current
      ) {
        const petCenterX = petPosition.current.x + 23;
        const petFeetY = petPosition.current.y + 40;
        const spring = gsap.utils
          .toArray<HTMLElement>(".loose-desk-toy:is(.is-spring, .is-trampoline)")
          .find((candidate) => {
            const bounds = candidate.getBoundingClientRect();
            const springTop = bounds.top + window.scrollY;
            const springBottom = bounds.bottom + window.scrollY;
            return (
              petCenterX >= bounds.left - 8 &&
              petCenterX <= bounds.right + 8 &&
              petFeetY >= springTop - 24 &&
              petFeetY <= springBottom + 18
            );
          });
        if (spring) {
          const springBounds = spring.getBoundingClientRect();
          petSpringCooldownUntil.current = now + 950;
          petPosition.current.y = springBounds.top + window.scrollY - 39;
          petHop.current.active = false;
          pet.current?.classList.remove("is-hopping");
          pet.current?.classList.add("is-springing");
          window.setTimeout(() => pet.current?.classList.remove("is-springing"), 360);
          petThrow.current = {
            active: true,
            x: gsap.utils.clamp(
              -720,
              720,
              petThrow.current.x * .62 + gsap.utils.random(-210, 210),
            ),
            y: gsap.utils.random(-760, -610),
            lastTime: now,
          };
          gsap.timeline()
            .to(spring, {
              scaleX: 1.24,
              scaleY: .5,
              duration: .09,
              ease: "power2.in",
            })
            .to(spring, {
              scaleX: 1,
              scaleY: 1,
              duration: .72,
              ease: "elastic.out(1, .22)",
            });
          window.dispatchEvent(new CustomEvent("desk:sound", { detail: { kind: "impact" } }));
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
    if (petJailedRef.current) {
      petPosition.current.y += window.scrollY;
      petJailedRef.current = false;
      setPetJailed(false);
    }
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
      if (petJailedRef.current) {
        petJailedRef.current = false;
        setPetJailed(false);
      }
    }
    petPosition.current = {
      x: gsap.utils.clamp(8, window.innerWidth - 62, nextX),
      y: gsap.utils.clamp(2, petHabitatBottom.current - 62, nextY),
    };

    const jailBounds = petJail.current?.getBoundingClientRect();
    if (petJail.current && jailBounds) {
      const petCenterX = petPosition.current.x + 30;
      const petCenterY = petPosition.current.y - window.scrollY + 27;
      petJail.current.classList.toggle(
        "is-armed",
        petCenterX >= jailBounds.left &&
        petCenterX <= jailBounds.right &&
        petCenterY >= jailBounds.top &&
        petCenterY <= jailBounds.bottom,
      );
    }
  };

  const dropPet = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!petDragging.current) return;
    petDragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pet.current?.classList.remove("is-dragging");

    const jailBounds = petJail.current?.getBoundingClientRect();
    const petCenterX = petPosition.current.x + 30;
    const petCenterY = petPosition.current.y - window.scrollY + 27;
    const insideJail = Boolean(
      jailBounds &&
      petCenterX >= jailBounds.left &&
      petCenterX <= jailBounds.right &&
      petCenterY >= jailBounds.top &&
      petCenterY <= jailBounds.bottom
    );
    petJail.current?.classList.remove("is-armed");

    if (insideJail && jailBounds) {
      petJailedRef.current = true;
      setPetJailed(true);
      petThrow.current.active = false;
      petHop.current.active = false;
      petPosition.current = {
        x: jailBounds.left + jailBounds.width / 2 - 30,
        y: jailBounds.top + jailBounds.height / 2 - 27,
      };
      setCreatureMood("braced");
      playSound("success");
      gsap.fromTo(
        event.currentTarget,
        { scaleX: 1.28, scaleY: .7 },
        { scaleX: 1, scaleY: 1, duration: .72, ease: "elastic.out(1, .32)" },
      );
      return;
    }

    if (!petMoved.current) {
      setCreatureMood("awake");
      nextHopAt.current = performance.now() + 300;
      return;
    }

    petJailedRef.current = false;
    setPetJailed(false);
    petThrow.current = {
      active: true,
      x: gsap.utils.clamp(-1150, 1150, petVelocity.current.x * 1000),
      y: gsap.utils.clamp(-980, 980, petVelocity.current.y * 1000),
      lastTime: performance.now(),
    };
    setCreatureMood("awake");
  };

  const freePet = () => {
    if (!petJailedRef.current) return;
    petPosition.current.y += window.scrollY;
    petJailedRef.current = false;
    setPetJailed(false);
    setCreatureMood("awake");
    petThrow.current = {
      active: true,
      x: -430,
      y: -510,
      lastTime: performance.now(),
    };
    makeStamp(
      "JAILBREAK",
      petPosition.current.x + 28,
      petPosition.current.y - window.scrollY,
    );
  };

  const clickPet = () => {
    if (petMoved.current) {
      petMoved.current = false;
      return;
    }
    stealCursor();
  };

  const toggleWord = (word: string) => {
    const next = titleMix.includes(word)
      ? titleMix.filter((item) => item !== word)
      : [...titleMix, word].slice(-3);
    setTitleMix(next);
    window.dispatchEvent(new CustomEvent("desk:title", { detail: { words: next } }));
    playSound("paper");
  };

  const resetTitle = () => {
    setTitleMix(defaultTitleWords);
    window.dispatchEvent(new CustomEvent("desk:title", {
      detail: { words: defaultTitleWords },
    }));
    playSound("paper");
  };

  const deployToy = (kind: DeskToyKind, clientX: number, clientY: number) => {
    setLooseToys((current) => [
      ...current,
      {
        id: looseToyId.current++,
        kind,
        x: clientX,
        y: clientY + window.scrollY,
      },
    ]);
    setDrawerOpen(false);
    makeStamp("TOY RELEASED", clientX, clientY);
  };

  const addPagePaint = (
    toyId: number,
    x: number,
    y: number,
    phase: "start" | "move" | "end",
  ) => {
    if (phase === "start") {
      const strokeId = pagePaintId.current++;
      activePaintStroke.current.set(toyId, strokeId);
      setPagePaint((current) => [
        ...current.slice(-24),
        { id: strokeId, points: [{ x, y }] },
      ]);
      return;
    }

    const strokeId = activePaintStroke.current.get(toyId);
    if (strokeId === undefined) return;
    setPagePaint((current) => current.map((stroke) => (
      stroke.id === strokeId
        ? { ...stroke, points: [...stroke.points.slice(-700), { x, y }] }
        : stroke
    )));
    if (phase === "end") activePaintStroke.current.delete(toyId);
  };

  const paintPath = (points: PaintPoint[]) => {
    if (points.length === 0) return "";
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y} L ${points[0].x + .01} ${points[0].y}`;
    }
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let index = 1; index < points.length - 1; index += 1) {
      const point = points[index];
      const next = points[index + 1];
      path += ` Q ${point.x} ${point.y} ${(point.x + next.x) / 2} ${(point.y + next.y) / 2}`;
    }
    const last = points[points.length - 1];
    path += ` T ${last.x} ${last.y}`;
    return path;
  };

  const addToyArtifact = (
    kind: ToyArtifact["kind"],
    x: number,
    y: number,
    text?: string,
    rotation = gsap.utils.random(-8, 8),
  ) => {
    setToyArtifacts((current) => [
      ...current.slice(-90),
      {
        id: toyArtifactId.current++,
        kind,
        x,
        y,
        text,
        rotation,
      },
    ]);
  };

  const useToy = (
    kind: DeskToyKind,
    x: number,
    y: number,
    element: HTMLButtonElement,
  ) => {
    const letters = gsap.utils.toArray<HTMLElement>(
      ".fallen-letter:not(.is-nailed):not(.is-resolving)",
    );
    const centerOf = (target: HTMLElement) => {
      const bounds = target.getBoundingClientRect();
      return {
        x: bounds.left + bounds.width / 2 + window.scrollX,
        y: bounds.top + bounds.height / 2 + window.scrollY,
      };
    };
    const nearestLetter = letters
      .map((letter) => ({
        letter,
        center: centerOf(letter),
      }))
      .sort((first, second) => (
        Math.hypot(first.center.x - x, first.center.y - y) -
        Math.hypot(second.center.x - x, second.center.y - y)
      ))[0];
    const petCenter = {
      x: petPosition.current.x + 23,
      y: petPosition.current.y + 22,
    };
    const petDistance = Math.hypot(petCenter.x - x, petCenter.y - y);
    const nearestLetterDistance = nearestLetter
      ? Math.hypot(nearestLetter.center.x - x, nearestLetter.center.y - y)
      : Number.POSITIVE_INFINITY;
    const moveLetterTo = (
      letter: HTMLElement,
      targetX: number,
      targetY: number,
      duration = .7,
    ) => {
      const center = centerOf(letter);
      const currentX = Number(gsap.getProperty(letter, "x")) || 0;
      const currentY = Number(gsap.getProperty(letter, "y")) || 0;
      gsap.to(letter, {
        x: currentX + targetX - center.x,
        y: currentY + targetY - center.y,
        duration,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    };

    playSound("click");

    if (kind === "magnet") {
      element.classList.toggle("is-active");
      letters.forEach((letter, index) => {
        const angle = (index / Math.max(letters.length, 1)) * Math.PI * 2;
        moveLetterTo(letter, x + Math.cos(angle) * 54, y + Math.sin(angle) * 36, .72);
      });
      if (!petJailedRef.current) {
        petBusyUntil.current = Date.now() + 1300;
        petTarget.current = {
          x: gsap.utils.clamp(8, window.innerWidth - 62, x - 24),
          y: gsap.utils.clamp(70, petHabitatBottom.current - 62, y - 22),
        };
        nextHopAt.current = 0;
        setCreatureMood("watching");
      }
      makeStamp("MAGNETIC", x, y - window.scrollY);
      return;
    }

    if (kind === "fan") {
      element.classList.toggle("is-active");
      letters.forEach((letter) => {
        const center = centerOf(letter);
        const direction = center.x >= x ? 1 : -1;
        gsap.to(letter, {
          x: `+=${direction * gsap.utils.random(120, 260)}`,
          y: `-=${gsap.utils.random(18, 90)}`,
          rotation: `+=${gsap.utils.random(-150, 150)}`,
          duration: .8,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
      if (!petJailedRef.current) {
        petThrow.current = {
          active: true,
          x: (petPosition.current.x >= x ? 1 : -1) * 460,
          y: -260,
          lastTime: performance.now(),
        };
      }
      return;
    }

    if (kind === "mouse") {
      element.classList.add("is-active");
      const runRight = x < window.innerWidth / 2;
      gsap.to(element, {
        x: `+=${runRight ? window.innerWidth * .58 : -window.innerWidth * .58}`,
        rotation: `+=${runRight ? 18 : -18}`,
        duration: 1.25,
        ease: "power1.inOut",
        onComplete: () => element.classList.remove("is-active"),
      });
      window.dispatchEvent(new CustomEvent("desk:pet-fetch", {
        detail: {
          x: gsap.utils.clamp(40, window.innerWidth - 50, runRight ? x + 360 : x - 360),
          y: y - window.scrollY,
        },
      }));
      return;
    }

    if (kind === "punch") {
      for (let index = 0; index < 10; index += 1) {
        addToyArtifact(
          "confetti",
          x + gsap.utils.random(-42, 42),
          y + gsap.utils.random(-28, 36),
          undefined,
          gsap.utils.random(-180, 180),
        );
      }
      gsap.fromTo(element, { scaleY: .62 }, { scaleY: 1, duration: .48, ease: "elastic.out(1, .3)" });
      return;
    }

    if (kind === "tape") {
      addToyArtifact("tape", x, y, "HOLD");
      if (petDistance < 92 && petDistance < nearestLetterDistance && !petJailedRef.current) {
        petHop.current.active = false;
        petThrow.current.active = false;
        petFrozenUntil.current = Date.now() + 1250;
        setCreatureMood("braced");
        window.setTimeout(() => setCreatureMood("awake"), 1300);
      } else if (nearestLetter) {
        nearestLetter.letter.dataset.nailed = "true";
        nearestLetter.letter.classList.add("is-nailed");
        moveLetterTo(nearestLetter.letter, x, y, .42);
      }
      return;
    }

    if (kind === "crane" && petDistance < nearestLetterDistance && !petJailedRef.current) {
      petThrow.current = {
        active: true,
        x: gsap.utils.random(-130, 130),
        y: -610,
        lastTime: performance.now(),
      };
      element.classList.toggle("is-active");
      return;
    }

    if (kind === "crane" && nearestLetter) {
      const letter = nearestLetter.letter;
      gsap.timeline()
        .to(letter, {
          y: "-=150",
          rotation: 0,
          duration: .7,
          ease: "power2.inOut",
        })
        .to(letter, {
          x: `+=${gsap.utils.random(-110, 110)}`,
          duration: .5,
          ease: "sine.inOut",
        })
        .to(letter, {
          y: "+=150",
          duration: .62,
          ease: "bounce.out",
        });
      element.classList.toggle("is-active");
      return;
    }

    if (kind === "dropper") {
      addToyArtifact("ink", x, y + 18);
      gsap.fromTo(element, { scaleY: .8 }, { scaleY: 1, duration: .52, ease: "elastic.out(1, .3)" });
      return;
    }

    if (kind === "trampoline" || kind === "spring") {
      gsap.fromTo(
        element,
        { scaleX: 1.25, scaleY: .48 },
        { scaleX: 1, scaleY: 1, duration: .8, ease: "elastic.out(1, .22)" },
      );
      return;
    }

    if (kind === "vacuum") {
      element.classList.toggle("is-active");
      letters.forEach((letter, index) => {
        moveLetterTo(letter, x + gsap.utils.random(-12, 12), y + gsap.utils.random(-10, 10), .5 + index * .025);
        gsap.fromTo(
          letter,
          { scale: 1 },
          { scale: .28, duration: .5, yoyo: true, repeat: 1, ease: "power2.inOut" },
        );
      });
      if (!petJailedRef.current) {
        petBusyUntil.current = Date.now() + 1500;
        petTarget.current = {
          x: gsap.utils.clamp(8, window.innerWidth - 62, x - 24),
          y: gsap.utils.clamp(70, petHabitatBottom.current - 62, y - 22),
        };
        nextHopAt.current = 0;
        setCreatureMood("braced");
      }
      return;
    }

    if (kind === "camera") {
      addToyArtifact("photo", x, y + 34, `${letters.length} loose ideas`);
      gsap.fromTo(
        document.documentElement,
        { filter: "brightness(2.2)" },
        { filter: "brightness(1)", duration: .34, ease: "power2.out" },
      );
      return;
    }

    if (kind === "rubberband" && nearestLetter) {
      const direction = nearestLetter.center.x < window.innerWidth / 2 ? 1 : -1;
      gsap.timeline()
        .to(nearestLetter.letter, {
          x: `-=${direction * 34}`,
          scaleX: 1.2,
          duration: .22,
          ease: "power2.in",
        })
        .to(nearestLetter.letter, {
          x: `+=${direction * gsap.utils.random(260, 420)}`,
          y: `-=${gsap.utils.random(130, 240)}`,
          rotation: `+=${gsap.utils.random(-360, 360)}`,
          scaleX: 1,
          duration: .72,
          ease: "power3.out",
        })
        .to(nearestLetter.letter, {
          y: "+=180",
          duration: .68,
          ease: "bounce.out",
        });
      return;
    }

    if (kind === "domino") {
      gsap.to(".loose-desk-toy.is-domino", {
        rotation: 78,
        x: "+=18",
        transformOrigin: "center bottom",
        duration: .3,
        stagger: .12,
        ease: "power2.in",
      });
      letters.forEach((letter) => {
        const center = centerOf(letter);
        if (Math.hypot(center.x - x, center.y - y) < 170) {
          gsap.to(letter, { x: "+=90", rotation: "+=80", duration: .5, ease: "power2.out" });
        }
      });
      return;
    }

    if (kind === "prism") {
      document.body.classList.toggle("is-prismatic");
      element.classList.toggle("is-active");
      return;
    }

    if (kind === "labeler") {
      const phrases = ["GOOD QUESTION", "MAKE IT REAL", "SHIP THE WEIRD", "STILL THINKING"];
      addToyArtifact("label", x, y + 28, phrases[labelIndex.current++ % phrases.length]);
      return;
    }

    if (kind === "shredder") {
      const labels = toyArtifacts.filter((artifact) => artifact.kind === "label");
      const latest = labels[labels.length - 1];
      if (latest) setToyArtifacts((current) => current.filter((artifact) => artifact.id !== latest.id));
      for (let index = 0; index < 7; index += 1) {
        addToyArtifact("shred", x + (index - 3) * 7, y + 34 + gsap.utils.random(0, 20));
      }
      return;
    }

    if (kind === "etch") {
      element.classList.toggle("is-active");
      gsap.fromTo(element, { rotation: -6 }, { rotation: 4, duration: .5, ease: "steps(4)", yoyo: true, repeat: 1 });
      return;
    }

    if (kind === "jack") {
      const wind = (jackWinds.current.get(element) ?? 0) + 1;
      jackWinds.current.set(element, wind);
      gsap.to(element, { rotation: `+=${120}`, duration: .28, ease: "back.out(1.8)" });
      if (wind < 3) return;
      jackWinds.current.set(element, 0);
      element.classList.add("is-active");
      window.setTimeout(() => element.classList.remove("is-active"), 780);
      letters.forEach((letter) => {
        const center = centerOf(letter);
        const distance = Math.max(50, Math.hypot(center.x - x, center.y - y));
        gsap.to(letter, {
          x: `+=${((center.x - x) / distance) * 180}`,
          y: `-=${gsap.utils.random(100, 220)}`,
          rotation: `+=${gsap.utils.random(-240, 240)}`,
          duration: .65,
          ease: "power3.out",
        });
      });
      petThrow.current = {
        active: true,
        x: (petPosition.current.x >= x ? 1 : -1) * 520,
        y: -520,
        lastTime: performance.now(),
      };
      return;
    }

    if (kind === "portal") {
      const portals = gsap.utils
        .toArray<HTMLButtonElement>(".loose-desk-toy.is-portal")
        .filter((portal) => portal !== element);
      const destination = portals[0];
      if (
        destination &&
        petDistance < nearestLetterDistance &&
        !petJailedRef.current
      ) {
        const target = centerOf(destination);
        petHop.current.active = false;
        petThrow.current.active = false;
        petPosition.current = {
          x: gsap.utils.clamp(8, window.innerWidth - 62, target.x - 23),
          y: gsap.utils.clamp(70, petHabitatBottom.current - 62, target.y - 22),
        };
        petThrow.current = {
          active: true,
          x: gsap.utils.random(-220, 220),
          y: -280,
          lastTime: performance.now(),
        };
        pet.current?.classList.add("is-teleporting");
        window.setTimeout(() => pet.current?.classList.remove("is-teleporting"), 520);
      } else if (destination && nearestLetter) {
        const target = centerOf(destination);
        nearestLetter.letter.classList.add("is-teleporting");
        gsap.timeline()
          .to(nearestLetter.letter, { scale: 0, duration: .22, ease: "power2.in" })
          .add(() => moveLetterTo(nearestLetter.letter, target.x, target.y, 0))
          .to(nearestLetter.letter, {
            scale: 1,
            duration: .42,
            ease: "back.out(2.3)",
            onComplete: () => nearestLetter.letter.classList.remove("is-teleporting"),
          });
      } else {
        gsap.fromTo(element, { scale: .75 }, { scale: 1, duration: .62, ease: "elastic.out(1, .25)" });
      }
      return;
    }

    if (kind === "freeze") {
      const frozen = letters.filter((letter) => letter.classList.contains("is-frozen"));
      if (frozen.length) {
        frozen.forEach((letter) => {
          letter.classList.remove("is-frozen");
          gsap.to(letter, {
            y: "+=120",
            rotation: `+=${gsap.utils.random(-90, 90)}`,
            duration: .72,
            ease: "bounce.out",
          });
        });
        petFrozenUntil.current = 0;
        setCreatureMood("awake");
        element.classList.remove("is-active");
      } else {
        letters.forEach((letter) => {
          const center = centerOf(letter);
          if (Math.hypot(center.x - x, center.y - y) < 280) {
            gsap.killTweensOf(letter);
            letter.classList.add("is-frozen");
          }
        });
        if (petDistance < 280 && !petJailedRef.current) {
          petHop.current.active = false;
          petThrow.current.active = false;
          petFrozenUntil.current = Date.now() + 4200;
          setCreatureMood("braced");
          window.setTimeout(() => {
            if (Date.now() >= petFrozenUntil.current) setCreatureMood("awake");
          }, 4250);
        }
        element.classList.add("is-active");
      }
      return;
    }

    if (kind === "scale") {
      const weight = [...letters, ...gsap.utils.toArray<HTMLElement>(".loose-desk-toy")]
        .filter((item) => {
          const center = centerOf(item);
          return Math.hypot(center.x - x, center.y - y) < 190;
        }).length + (petDistance < 190 ? 2 : 0);
      element.dataset.weight = String(weight);
      element.style.setProperty("--scale-tip", `${gsap.utils.clamp(-12, 12, (weight - 3) * 3)}deg`);
      element.classList.toggle("is-active");
    }
  };

  const clearLooseToys = () => {
    setLooseToys([]);
    setPagePaint([]);
    setToyArtifacts([]);
    document.body.classList.remove("is-prismatic");
    playSound("paper");
  };

  const pullChaosLever = () => {
    if (chaosActive || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setChaosActive(true);
    setCreatureMood("braced");
    document.body.classList.add("is-desk-chaos");
    const targets = gsap.utils.toArray<HTMLElement>(
      ".hero-scrap-slot, .catalogue-slide, .projector-intro > *, .forge-materials button",
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

      <svg className="page-paint-layer" aria-hidden="true">
        {pagePaint.map((stroke) => (
          <path
            className="page-paint-stroke"
            d={paintPath(stroke.points)}
            key={stroke.id}
          />
        ))}
      </svg>

      {toyArtifacts.map((artifact) => (
        <span
          className={`toy-artifact is-${artifact.kind}`}
          key={artifact.id}
          style={{
            left: artifact.x,
            top: artifact.y,
            transform: `translate(-50%, -50%) rotate(${artifact.rotation}deg)`,
          }}
          aria-hidden="true"
        >
          {artifact.text ? <b>{artifact.text}</b> : null}
        </span>
      ))}

      {looseToys.map((toy) => (
        <LooseDeskToy
          key={toy.id}
          kind={toy.kind}
          x={toy.x}
          y={toy.y}
          onPaint={(x, y, phase) => addPagePaint(toy.id, x, y, phase)}
          onRemove={() => setLooseToys((current) => current.filter((item) => item.id !== toy.id))}
          onSound={playSound}
          onStamp={(x, y) => makeStamp("GOOD IDEA", x, y)}
          onUse={useToy}
        />
      ))}

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

      <aside
        className={`desk-drawer ${drawerOpen ? "is-open" : ""}`}
        aria-label="Abhi's desk drawer"
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
      >
        <div className="desk-drawer-heading">
          <div>
            <small>Play table</small>
            <strong>The drawer where nothing has to be useful</strong>
          </div>
          <button type="button" onClick={() => setDrawerOpen(false)}>Close</button>
        </div>

        <DeskToys
          onClear={clearLooseToys}
          onDeploy={deployToy}
          onSound={playSound}
        />

        <div className="title-mixer">
          <div>
            <small>Rewrite the hero</small>
            <p>
              Abhi works where{" "}
              <strong>{titleMix.length ? titleMix.join(" + ") : "curiosity"}</strong>{" "}
              overlap.
            </p>
            <button className="title-mixer-reset" type="button" onClick={resetTitle}>
              Restore my version
            </button>
          </div>
          <div className="title-mixer-words">
            {titleWords.map((word) => (
              <button
                className={titleMix.includes(word) ? "is-selected" : ""}
                type="button"
                key={word}
                onClick={() => toggleWord(word)}
                aria-pressed={titleMix.includes(word)}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
        <div className="desk-legend" aria-label="Hidden interaction hints">
          <span><kbd>Space</kbd> inspect with the desk light</span>
          <span><kbd>Shift</kbd> attract loose letters</span>
          <span><kbd>drag CV</kbd> tear off a copy</span>
        </div>
        <div className="desk-drawer-tools">
          <button
            type="button"
            className={soundOn ? "is-active" : ""}
            onClick={() => setSoundOn((enabled) => !enabled)}
            aria-pressed={soundOn}
          >
            Sound {soundOn ? "on" : "off"}
          </button>
          <button type="button" onClick={pullChaosLever} disabled={chaosActive}>
            {chaosActive ? "Rebuilding the desk" : "Pull the chaos lever"}
          </button>
        </div>
      </aside>

      <div className="desk-rail" aria-label="Play controls">
        <button type="button" onClick={() => setDrawerOpen((open) => !open)}>
          {drawerOpen ? "Hide drawer" : "Desk drawer"}
        </button>
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
        className={`desk-jail ${petJailed ? "has-prisoner" : ""}`}
        ref={petJail}
        aria-label="Desk creature time-out"
      >
        <span className="desk-jail-sign">TIME-OUT</span>
        <span className="desk-jail-cell" aria-hidden="true">
          <i /><i /><i /><i />
        </span>
        <button type="button" onClick={freePet} disabled={!petJailed}>
          {petJailed ? "Spring the lock" : "Drop creature here"}
        </button>
      </div>

      <div
        className={`desk-pet ${cursorStolen ? "has-cursor" : ""} ${petJailed ? "is-jailed" : ""}`}
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
          aria-label={`Desk creature is ${petJailed ? "in time-out" : creatureMood}. Drag and throw it, or click to let it steal the cursor.`}
        >
          <span className="desk-creature-eyes" aria-hidden="true"><i /><i /></span>
          <span className="desk-creature-mouth" aria-hidden="true" />
        </button>
        <span className="pet-stolen-cursor" aria-hidden="true" />
      </div>
    </>
  );
}
