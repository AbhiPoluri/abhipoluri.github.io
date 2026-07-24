"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { wordEasterEggs, type WordEasterEgg } from "@/data/wordEasterEggs";

gsap.registerPlugin(useGSAP, Draggable, ScrollTrigger);

const words = [
  { text: "MAKE", serif: false },
  { text: "IT", serif: true },
  { text: "REAL", serif: false },
];

const photoSearchOverrides: Record<string, string> = {
  AI: "small robot",
  ART: "classic painting",
  ARM: "human arm",
  ATM: "cash machine",
  IRE: "angry face",
  KARMA: "buddhist wheel",
  KART: "go kart racing",
  MAR: "scratched surface",
  MATERIEL: "field equipment",
  METIER: "artisan workshop",
  RAM: "computer memory",
  REALIA: "museum objects",
  RIME: "frost ice",
};

interface OpenversePhoto {
  attribution?: string;
  creator?: string;
  license?: string;
  thumbnail?: string;
  title?: string;
  url?: string;
}

const loadWordPhoto = async (
  egg: WordEasterEgg,
  photo: HTMLImageElement,
  label: HTMLElement,
) => {
  const search = photoSearchOverrides[egg.word] ?? egg.word.toLowerCase();
  try {
    const response = await fetch(
      `https://api.openverse.org/v1/images/?q=${encodeURIComponent(search)}&categories=photograph&page_size=1`,
    );
    if (!response.ok) return;
    const payload = (await response.json()) as { results?: OpenversePhoto[] };
    const result = payload.results?.[0];
    if (!result || !photo.isConnected) return;
    const source = result.thumbnail ?? result.url;
    if (!source) return;
    photo.src = source;
    photo.alt = result.title || egg.label;
    photo.title = result.attribution || `${result.title ?? egg.word} · ${result.license ?? "open license"}`;
    const credit = result.creator ? `photo by ${result.creator}` : "open photo";
    label.textContent = `${egg.word} · ${credit}`;
  } catch {
    // The local analogue image is already in place as a deliberate fallback.
  }
};

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const hits = useRef(new Map<number, number>());
  const draggables = useRef<Draggable[]>([]);
  const scrapDraggables = useRef<Draggable[]>([]);
  const fallenLetters = useRef<HTMLElement[]>([]);
  const wordCooldown = useRef(new Set<string>());
  const pendingWord = useRef<{
    prompt: HTMLButtonElement;
    letters: HTMLElement[];
  } | null>(null);
  const gyroActive = useRef(false);
  const gyroRequested = useRef(false);
  const [released, setReleased] = useState(0);
  const [customTitle, setCustomTitle] = useState(["product", "code", "judgment"]);

  useEffect(() => {
    const updateTitle = (event: Event) => {
      const words = (event as CustomEvent<{ words?: string[] }>).detail?.words ?? [];
      setCustomTitle(words.length ? words : ["curiosity"]);
    };
    window.addEventListener("desk:title", updateTitle);
    return () => window.removeEventListener("desk:title", updateTitle);
  }, []);

  useEffect(() => {
    gsap.fromTo(
      ".hero-custom-title strong",
      { y: 8, opacity: 0, rotation: -1.5 },
      { y: 0, opacity: 1, rotation: 0, duration: .42, ease: "back.out(1.8)" },
    );
  }, [customTitle]);

  useEffect(() => {
    let magnetActive = false;
    let lastMove = 0;
    const keydown = (event: KeyboardEvent) => {
      if (event.key !== "Shift") return;
      magnetActive = true;
      document.body.dataset.letterMagnet = "on";
    };
    const releaseMagnet = () => {
      magnetActive = false;
      delete document.body.dataset.letterMagnet;
    };
    const keyup = (event: KeyboardEvent) => {
      if (event.key === "Shift") releaseMagnet();
    };
    const attract = (event: PointerEvent) => {
      if (!magnetActive || Date.now() - lastMove < 28) return;
      lastMove = Date.now();
      gsap.utils
        .toArray<HTMLElement>(".fallen-letter:not(.is-nailed):not(.is-caught)")
        .forEach((letter) => {
          const bounds = letter.getBoundingClientRect();
          const centerX = bounds.left + bounds.width / 2;
          const centerY = bounds.top + bounds.height / 2;
          const dx = event.clientX - centerX;
          const dy = event.clientY - centerY;
          const distance = Math.max(1, Math.hypot(dx, dy));
          if (distance > 260) return;
          const pull = (1 - distance / 260) * 22;
          const currentX = Number(gsap.getProperty(letter, "x")) || 0;
          const currentY = Number(gsap.getProperty(letter, "y")) || 0;
          gsap.to(letter, {
            x: currentX + (dx / distance) * pull,
            y: currentY + (dy / distance) * pull,
            rotation: `+=${(dx / distance) * 2.4}`,
            duration: .18,
            overwrite: "auto",
            ease: "power2.out",
          });
        });
    };

    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", releaseMagnet);
    window.addEventListener("pointermove", attract, { passive: true });
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", releaseMagnet);
      window.removeEventListener("pointermove", attract);
      delete document.body.dataset.letterMagnet;
    };
  }, []);

  useEffect(() => {
    const orientationApi = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    if (!orientationApi.requestPermission) gyroActive.current = true;

    let lastMove = 0;
    const tilt = (event: DeviceOrientationEvent) => {
      if (!gyroActive.current || Date.now() - lastMove < 55) return;
      lastMove = Date.now();
      const xForce = gsap.utils.clamp(-3.2, 3.2, (event.gamma ?? 0) * 0.14);
      const yForce = gsap.utils.clamp(-3.2, 3.2, ((event.beta ?? 0) - 35) * 0.08);

      gsap.utils.toArray<HTMLElement>(".fallen-letter:not(.is-nailed)").forEach((letter) => {
        const bounds = letter.getBoundingClientRect();
        const pageTop = bounds.top + window.scrollY;
        const pageBottom = bounds.bottom + window.scrollY;
        const currentX = Number(gsap.getProperty(letter, "x")) || 0;
        const currentY = Number(gsap.getProperty(letter, "y")) || 0;
        const nextX = bounds.left + xForce < 0 || bounds.right + xForce > window.innerWidth
          ? -xForce * 1.8
          : xForce;
        const nextY =
          pageTop + yForce < 0 ||
          pageBottom + yForce > document.documentElement.scrollHeight
          ? -yForce * 1.8
          : yForce;
        gsap.to(letter, {
          x: currentX + nextX,
          y: currentY + nextY,
          rotation: `+=${nextX * 0.35}`,
          duration: 0.22,
          overwrite: "auto",
          ease: "power1.out",
        });
      });
    };

    window.addEventListener("deviceorientation", tilt, { passive: true });
    return () => window.removeEventListener("deviceorientation", tilt);
  }, []);

  const armGyroscope = () => {
    if (gyroRequested.current) return;
    gyroRequested.current = true;
    const orientationApi = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    if (orientationApi.requestPermission) {
      void orientationApi.requestPermission().then((permission) => {
        gyroActive.current = permission === "granted";
      });
    } else {
      gyroActive.current = true;
    }
  };

  const clearPendingWord = () => {
    pendingWord.current?.letters.forEach((letter) => {
      letter.classList.remove("is-word-candidate");
    });
    pendingWord.current?.prompt.remove();
    pendingWord.current = null;
  };

  const spawnWordArtifact = (egg: WordEasterEgg, letters: HTMLElement[]) => {
    const bounds = letters.map((letter) => letter.getBoundingClientRect());
    const left = Math.min(...bounds.map((item) => item.left)) + window.scrollX;
    const right = Math.max(...bounds.map((item) => item.right)) + window.scrollX;
    const top = Math.min(...bounds.map((item) => item.top)) + window.scrollY;
    const bottom = Math.max(...bounds.map((item) => item.bottom)) + window.scrollY;
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;

    const artifact = document.createElement("button");
    artifact.type = "button";
    artifact.className = "word-artifact";
    artifact.dataset.word = egg.word;
    artifact.setAttribute("aria-label", `${egg.word}: ${egg.label}. Tap the photo three times to break it.`);
    artifact.style.left = `${centerX}px`;
    artifact.style.top = `${centerY}px`;

    const photo = document.createElement("img");
    photo.className = "word-artifact-photo";
    photo.src = "/images/word-photo-fallback.png";
    photo.alt = egg.label;
    photo.width = 480;
    photo.height = 360;
    photo.addEventListener(
      "error",
      () => {
        photo.src = "/images/word-photo-fallback.png";
      },
      { once: true },
    );
    const label = document.createElement("small");
    label.textContent = `${egg.word} · finding a photo…`;
    artifact.append(photo, label);
    document.body.appendChild(artifact);
    void loadWordPhoto(egg, photo, label);

    for (let index = 0; index < 14; index += 1) {
      const particle = document.createElement("i");
      particle.className = "word-poof-particle";
      particle.style.setProperty("--poof-x", `${gsap.utils.random(-110, 110)}px`);
      particle.style.setProperty("--poof-y", `${gsap.utils.random(-90, 90)}px`);
      artifact.appendChild(particle);
    }

    letters.forEach((letter, index) => {
      letter.classList.add("is-resolving");
      gsap.killTweensOf(letter);
      gsap.to(letter, {
        x: `+=${gsap.utils.random(-45, 45)}`,
        y: `+=${gsap.utils.random(-35, 35)}`,
        scale: 0,
        rotation: `+=${gsap.utils.random(-160, 160)}`,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.42,
        delay: index * 0.035,
        ease: "back.in(2.4)",
        onComplete: () => letter.remove(),
      });
    });

    gsap.fromTo(
      artifact,
      { scale: 0, rotation: gsap.utils.random(-22, 22), opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 0.72, delay: 0.22, ease: "elastic.out(1, .42)" },
    );
    gsap.fromTo(
      artifact.querySelectorAll(".word-poof-particle"),
      { x: 0, y: 0, scale: 1, opacity: 1 },
      {
        x: (index, target) => getComputedStyle(target).getPropertyValue("--poof-x"),
        y: (index, target) => getComputedStyle(target).getPropertyValue("--poof-y"),
        scale: 0,
        opacity: 0,
        duration: 0.75,
        stagger: 0.018,
        ease: "power3.out",
      },
    );
    artifact.addEventListener("click", (event) => {
      if (event.target !== photo || artifact.classList.contains("is-shattering")) return;
      armGyroscope();
      const hits = Number(artifact.dataset.photoHits ?? 0) + 1;
      artifact.dataset.photoHits = String(hits);
      artifact.setAttribute(
        "aria-label",
        hits < 3
          ? `${egg.word}: ${3 - hits} more ${hits === 2 ? "tap" : "taps"} to break it.`
          : `${egg.word} is breaking into letters.`,
      );

      if (hits < 3) {
        gsap.fromTo(
          artifact,
          { x: -5, rotation: -2.5 },
          {
            x: 5,
            rotation: 2.5,
            duration: 0.075,
            repeat: 3,
            yoyo: true,
            ease: "none",
            onComplete: () => gsap.to(artifact, { x: 0, rotation: 0, duration: 0.12 }),
          },
        );
        return;
      }

      artifact.classList.add("is-shattering");
      const photoBounds = photo.getBoundingClientRect();
      const letterSize = gsap.utils.clamp(28, 58, photoBounds.width / egg.word.length);
      egg.word.split("").forEach((letter, index) => {
        const clone = document.createElement("button");
        clone.type = "button";
        clone.className = "hero-letter fallen-letter artifact-letter";
        clone.tabIndex = -1;
        clone.setAttribute("aria-hidden", "true");
        clone.textContent = letter;
        Object.assign(clone.style, {
          left: `${photoBounds.left + window.scrollX + (photoBounds.width * (index + 0.5)) / egg.word.length - letterSize / 2}px`,
          top: `${photoBounds.top + window.scrollY + photoBounds.height / 2 - letterSize / 2}px`,
          width: `${letterSize}px`,
          height: `${letterSize}px`,
          fontSize: `${letterSize}px`,
          lineHeight: "1",
        });
        document.body.appendChild(clone);
        fallenLetters.current.push(clone);
        makeDraggable(clone);
        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.28, delay: index * 0.035, ease: "back.out(2.4)" },
        );
        fallToFloor(clone, index * 0.055);
      });

      gsap.to(artifact, {
        scale: 1.18,
        rotation: gsap.utils.random(-12, 12),
        opacity: 0,
        filter: "blur(12px)",
        duration: 0.38,
        ease: "power3.out",
        onComplete: () => artifact.remove(),
      });
    });
  };

  const stageWordCandidate = (egg: WordEasterEgg, letters: HTMLElement[]) => {
    clearPendingWord();
    const bounds = letters.map((letter) => letter.getBoundingClientRect());
    const left = Math.min(...bounds.map((item) => item.left)) + window.scrollX;
    const right = Math.max(...bounds.map((item) => item.right)) + window.scrollX;
    const top = Math.min(...bounds.map((item) => item.top)) + window.scrollY;

    const prompt = document.createElement("button");
    prompt.type = "button";
    prompt.className = "word-match-prompt";
    prompt.style.left = `${(left + right) / 2}px`;
    prompt.style.top = `${Math.max(12, top - 18)}px`;
    prompt.setAttribute("aria-label", `Ignite ${egg.word}`);
    prompt.innerHTML = `<strong>${egg.word}?</strong><span>ignite&nbsp;↗</span>`;
    letters.forEach((letter) => letter.classList.add("is-word-candidate"));
    document.body.appendChild(prompt);
    pendingWord.current = { prompt, letters };

    prompt.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!letters.every((letter) => letter.isConnected)) {
        clearPendingWord();
        return;
      }
      clearPendingWord();
      wordCooldown.current.add(egg.word);
      window.setTimeout(() => wordCooldown.current.delete(egg.word), 1800);
      spawnWordArtifact(egg, letters);
    });

    gsap.fromTo(
      prompt,
      { y: 7, scale: 0.78, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.38, ease: "back.out(2.2)" },
    );
  };

  const checkForWords = () => {
    const letters = gsap.utils
      .toArray<HTMLElement>(".fallen-letter:not(.is-resolving)")
      .filter((letter) => letter.isConnected)
      .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    if (letters.length < 2) {
      clearPendingWord();
      return;
    }
    const eggs = [...wordEasterEggs].sort((a, b) => b.word.length - a.word.length);

    for (const egg of eggs) {
      if (wordCooldown.current.has(egg.word)) continue;
      for (let start = 0; start <= letters.length - egg.word.length; start += 1) {
        const group = letters.slice(start, start + egg.word.length);
        const rectangles = group.map((letter) => letter.getBoundingClientRect());
        const word = group.map((letter) => letter.textContent?.trim().toUpperCase()).join("");
        if (word !== egg.word) continue;
        const averageHeight =
          rectangles.reduce((total, rectangle) => total + rectangle.height, 0) / rectangles.length;
        const yCenters = rectangles.map((rectangle) => rectangle.top + rectangle.height / 2);
        if (Math.max(...yCenters) - Math.min(...yCenters) > averageHeight * 0.55) continue;
        const gapsAreTight = rectangles.slice(1).every((rectangle, index) => {
          const previous = rectangles[index];
          const gap = rectangle.left - previous.right;
          return gap < averageHeight * 0.52 && gap > -averageHeight * 0.62;
        });
        if (!gapsAreTight) continue;
        stageWordCandidate(egg, group);
        return;
      }
    }
    clearPendingWord();
  };

  useGSAP(
    () => {
      gsap.from(".hero-letter-glyph", {
        yPercent: 125,
        rotation: () => gsap.utils.random(-14, 14),
        opacity: 0,
        duration: 1.25,
        stagger: { each: 0.045, from: "random" },
        ease: "power4.out",
      });
      gsap.from(".hero-support", {
        y: 24,
        opacity: 0,
        duration: 0.8,
        delay: 0.55,
        ease: "power3.out",
      });
      gsap.from(".hero-scrap-slot", {
        y: 34,
        rotation: () => gsap.utils.random(-12, 12),
        opacity: 0,
        duration: 0.9,
        delay: 0.65,
        stagger: 0.11,
        ease: "back.out(1.7)",
      });

      const scrapSlots = gsap.utils.toArray<HTMLElement>(".hero-scrap-slot");
      scrapSlots.forEach((slot, index) => {
        gsap.to(slot, {
          y: index % 2 ? -9 : 8,
          duration: 2.8 + index * 0.55,
          delay: 1.6 + index * 0.18,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      const scraps = gsap.utils.toArray<HTMLElement>(".hero-scrap");
      const scrapInstances = scraps.flatMap((scrap) =>
        Draggable.create(scrap, {
          type: "x,y",
          edgeResistance: 0.68,
          cursor: "grab",
          activeCursor: "grabbing",
          onPress() {
            delete scrap.dataset.dragged;
            scrap.classList.add("is-held");
            gsap.to(scrap, { scale: 1.055, duration: 0.16, ease: "power2.out" });
          },
          onDrag() {
            if (Math.hypot(this.x, this.y) > 7) scrap.dataset.dragged = "true";
          },
          onRelease() {
            scrap.classList.remove("is-held");
            gsap.to(scrap, {
              x: 0,
              y: 0,
              scale: 1,
              duration: 0.85,
              ease: "elastic.out(1, .42)",
            });
            window.setTimeout(() => delete scrap.dataset.dragged, 0);
          },
        }),
      );
      scrapDraggables.current = scrapInstances;

      const letters = gsap.utils.toArray<HTMLElement>(".hero-letter");
      const scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=110%",
          pin: ".hero-pin",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      scrollTimeline
        .to(".hero-hint", { opacity: 0, y: -20, duration: 0.15 }, 0)
        .to(".hero-desk-scraps", { opacity: 0, y: -80, scale: 0.92, duration: 0.3 }, 0.03)
        .to(letters, {
          y: (index) => (index % 2 ? "34vh" : "-28vh"),
          x: (index) => `${(index - letters.length / 2) * 4.5}vw`,
          rotation: (index) => (index % 2 ? 32 : -28),
          opacity: 0.08,
          stagger: 0.012,
          duration: 0.9,
          ease: "none",
        }, 0.08)
        .to(".hero-exit-line", { scaleX: 1, duration: 0.7, ease: "none" }, 0.2);

      return () => {
        scrapInstances.forEach((instance) => instance.kill());
        scrapDraggables.current = [];
      };
    },
    { scope: root },
  );

  const fallToFloor = (element: HTMLElement, delay = 0, preferredX?: number) => {
    if (!element.isConnected || element.dataset.nailed === "true") return;
    const bounds = element.getBoundingClientRect();
    const distance = Math.max(
      0,
      document.documentElement.scrollHeight - (bounds.bottom + window.scrollY) - 28,
    );
    if (distance < 2) return;
    const currentX = Number(gsap.getProperty(element, "x")) || 0;
    const currentY = Number(gsap.getProperty(element, "y")) || 0;
    const xNudge = gsap.utils.clamp(
      -bounds.left + 12,
      window.innerWidth - bounds.right - 12,
      gsap.utils.random(-110, 110),
    );

    const falling = gsap.timeline({ delay });
    falling
      .to(element, {
        x: preferredX ?? currentX + xNudge,
        y: currentY + distance,
        rotation: `+=${gsap.utils.random(-420, 420)}`,
        duration: gsap.utils.clamp(1.4, 10, distance / 760),
        ease: "power1.in",
        onUpdate: () => {
          if (bounceFromSpring(element)) falling.kill();
        },
      })
      .to(element, {
        y: `-=${gsap.utils.random(22, 48)}`,
        rotation: `+=${gsap.utils.random(-28, 28)}`,
        duration: 0.22,
        ease: "power2.out",
      })
      .to(element, { y: "+=36", duration: 0.38, ease: "bounce.out" });
  };

  const setNailPoint = (
    element: HTMLElement,
    clientPoint: { x: number; y: number },
  ) => {
    const boxElement = element as HTMLElement & {
      getBoxQuads?: () => Array<{
        p1: { x: number; y: number };
        p2: { x: number; y: number };
        p4: { x: number; y: number };
      }>;
    };
    const quad = boxElement.getBoxQuads?.()[0];
    let xPercent = 50;
    let yPercent = 14;

    if (quad) {
      const horizontal = {
        x: quad.p2.x - quad.p1.x,
        y: quad.p2.y - quad.p1.y,
      };
      const vertical = {
        x: quad.p4.x - quad.p1.x,
        y: quad.p4.y - quad.p1.y,
      };
      const offset = {
        x: clientPoint.x - quad.p1.x,
        y: clientPoint.y - quad.p1.y,
      };
      const determinant = horizontal.x * vertical.y - horizontal.y * vertical.x;
      if (Math.abs(determinant) > 0.001) {
        xPercent = (
          (offset.x * vertical.y - offset.y * vertical.x) /
          determinant
        ) * 100;
        yPercent = (
          (horizontal.x * offset.y - horizontal.y * offset.x) /
          determinant
        ) * 100;
      }
    } else {
      const bounds = element.getBoundingClientRect();
      xPercent = ((clientPoint.x - bounds.left) / Math.max(bounds.width, 1)) * 100;
      yPercent = ((clientPoint.y - bounds.top) / Math.max(bounds.height, 1)) * 100;
    }

    element.style.setProperty("--nail-x", `${gsap.utils.clamp(10, 90, xPercent)}%`);
    element.style.setProperty("--nail-y", `${gsap.utils.clamp(8, 92, yPercent)}%`);
  };

  const toggleNail = (
    element: HTMLElement,
    clientPoint?: { x: number; y: number },
  ) => {
    if (element.dataset.dragged === "true") {
      delete element.dataset.dragged;
      return;
    }
    gsap.killTweensOf(element);
    if (element.dataset.nailed === "true") {
      delete element.dataset.nailed;
      element.classList.remove("is-nailed");
      gsap.to(element, {
        scale: 1,
        duration: 0.18,
        onComplete: () => fallToFloor(element),
      });
      window.setTimeout(checkForWords, 40);
      return;
    }
    if (clientPoint) setNailPoint(element, clientPoint);
    element.dataset.nailed = "true";
    element.classList.add("is-nailed");
    window.dispatchEvent(new CustomEvent("desk:sound", { detail: { kind: "impact" } }));
    gsap.to(element, {
      scale: 1.02,
      duration: 0.32,
      ease: "back.out(2.2)",
    });
    window.setTimeout(checkForWords, 80);
  };

  const bounceFromSpring = (element: HTMLElement) => {
    if (
      element.dataset.bouncing === "true" ||
      Number(element.dataset.springCooldownUntil ?? 0) > Date.now()
    ) return false;
    const letterBounds = element.getBoundingClientRect();
    const letterCenterX = letterBounds.left + letterBounds.width / 2;
    const spring = gsap.utils
      .toArray<HTMLElement>(".loose-desk-toy:is(.is-spring, .is-trampoline)")
      .find((candidate) => {
        const bounds = candidate.getBoundingClientRect();
        return (
          letterCenterX >= bounds.left - 10 &&
          letterCenterX <= bounds.right + 10 &&
          letterBounds.bottom >= bounds.top - 18 &&
          letterBounds.top <= bounds.bottom + 18
        );
      });
    if (!spring) return false;

    const currentX = Number(gsap.getProperty(element, "x")) || 0;
    const currentY = Number(gsap.getProperty(element, "y")) || 0;
    const availableLift = letterBounds.top + window.scrollY - 72;
    const lift = Math.max(58, Math.min(gsap.utils.random(145, 225), availableLift));

    element.dataset.bouncing = "true";
    element.dataset.springCooldownUntil = String(Date.now() + 2500);
    window.dispatchEvent(new CustomEvent("desk:sound", { detail: { kind: "impact" } }));
    gsap.timeline()
      .to(spring, {
        scaleX: 1.2,
        scaleY: .56,
        duration: .1,
        ease: "power2.in",
      })
      .to(spring, {
        scaleX: 1,
        scaleY: 1,
        duration: .68,
        ease: "elastic.out(1, .24)",
      });
    gsap.timeline()
      .to(element, {
        x: currentX + gsap.utils.random(-72, 72),
        y: currentY - lift,
        rotation: `+=${gsap.utils.random(-210, 210)}`,
        scale: 1.12,
        duration: .42,
        ease: "power2.out",
      })
      .to(element, {
        y: currentY - 8,
        scale: 1,
        duration: .62,
        ease: "bounce.out",
        onComplete: () => {
          delete element.dataset.bouncing;
          fallToFloor(element);
        },
      });
    return true;
  };

  const makeDraggable = (element: HTMLElement) => {
    const dragOrigin = { x: 0, y: 0 };
    const nailPoint = { x: 0, y: 0 };
    const instance = Draggable.create(element, {
      type: "x,y",
      edgeResistance: 0.7,
      cursor: "grab",
      activeCursor: "grabbing",
      onPress() {
        clearPendingWord();
        delete element.dataset.dragged;
        gsap.killTweensOf(element);
        const pointer = this.pointerEvent as MouseEvent | TouchEvent | undefined;
        const touch = pointer && "touches" in pointer
          ? pointer.touches[0] ?? pointer.changedTouches[0]
          : undefined;
        nailPoint.x = touch?.clientX ?? (pointer as MouseEvent | undefined)?.clientX ?? 0;
        nailPoint.y = touch?.clientY ?? (pointer as MouseEvent | undefined)?.clientY ?? 0;
        dragOrigin.x = Number(gsap.getProperty(element, "x")) || 0;
        dragOrigin.y = Number(gsap.getProperty(element, "y")) || 0;
        element.classList.add("is-caught");
        gsap.to(element, { scale: 1.08, duration: 0.15 });
      },
      onDrag: () => {
        const currentX = Number(gsap.getProperty(element, "x")) || 0;
        const currentY = Number(gsap.getProperty(element, "y")) || 0;
        if (Math.hypot(currentX - dragOrigin.x, currentY - dragOrigin.y) > 8) {
          element.dataset.dragged = "true";
        }
      },
      onRelease: () => {
        element.classList.remove("is-caught");
        if (element.dataset.dragged !== "true") {
          toggleNail(element, nailPoint);
          return;
        }
        const bounds = element.getBoundingClientRect();
        const edge = bounds.left < 8
          ? "left"
          : bounds.right > window.innerWidth - 8
            ? "right"
            : null;
        if (edge) {
          document.body.dataset.edgeImpact = edge;
          window.dispatchEvent(new CustomEvent("desk:stamp", {
            detail: {
              label: "PAGE DENTED",
              x: edge === "left" ? 58 : window.innerWidth - 58,
              y: gsap.utils.clamp(80, window.innerHeight - 80, bounds.top),
            },
          }));
          window.dispatchEvent(new CustomEvent("desk:creature", { detail: { mood: "braced" } }));
          window.setTimeout(() => {
            delete document.body.dataset.edgeImpact;
            window.dispatchEvent(new CustomEvent("desk:creature", { detail: { mood: "awake" } }));
          }, 1350);
        }
        if (bounceFromSpring(element)) {
          window.setTimeout(checkForWords, 80);
          return;
        }
        gsap.to(element, {
          scale: 1,
          duration: 0.28,
          ease: "elastic.out(1, .4)",
          onComplete: () => {
            if (element.dataset.nailed !== "true") fallToFloor(element);
          },
        });
        window.setTimeout(checkForWords, 60);
      },
    })[0];
    draggables.current.push(instance);
  };

  const release = (element: HTMLElement, index: number, delay = 0) => {
    if (element.dataset.released === "true" || !root.current) return;
    element.dataset.released = "true";
    hits.current.set(index, 3);
    const bounds = element.getBoundingClientRect();
    const computed = window.getComputedStyle(element);
    const clone = element.cloneNode(true) as HTMLButtonElement;
    const startTop = bounds.top + window.scrollY;
    const xTravel = gsap.utils.clamp(
      -bounds.left + 12,
      window.innerWidth - bounds.right - 12,
      gsap.utils.random(-240, 240),
    );
    clone.classList.add("fallen-letter");
    clone.tabIndex = -1;
    clone.setAttribute("aria-hidden", "true");
    Object.assign(clone.style, {
      left: `${bounds.left + window.scrollX}px`,
      top: `${startTop}px`,
      width: `${bounds.width}px`,
      height: `${bounds.height}px`,
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      lineHeight: computed.lineHeight,
    });
    document.body.appendChild(clone);
    fallenLetters.current.push(clone);
    window.dispatchEvent(new CustomEvent("desk:pet-fetch", {
      detail: {
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
      },
    }));
    gsap.set(element, { opacity: 0, pointerEvents: "none" });
    makeDraggable(clone);
    fallToFloor(clone, delay, xTravel);
    setReleased((value) => value + 1);
  };

  const hit = (event: React.PointerEvent<HTMLButtonElement>, index: number) => {
    armGyroscope();
    const element = event.currentTarget;
    if (element.dataset.released === "true") return;
    const count = (hits.current.get(index) ?? 0) + 1;
    hits.current.set(index, count);
    element.dataset.hits = String(count);
    if (count >= 3) {
      release(element, index);
      return;
    }
    gsap.timeline()
      .to(element, {
        x: `+=${gsap.utils.random(-9, 9)}`,
        y: `-=${gsap.utils.random(7, 14)}`,
        rotation: `+=${gsap.utils.random(-8, 8)}`,
        scale: 0.94,
        duration: 0.08,
      })
      .to(element, { y: "+=10", scale: 1, duration: 0.35, ease: "elastic.out(1, .28)" });
  };

  const dropAll = () => {
    gsap.utils.toArray<HTMLElement>(".hero-letter").forEach((letter, index) => {
      release(letter, index, index * 0.045);
    });
  };

  const reset = () => {
    draggables.current.forEach((item) => item.kill());
    draggables.current = [];
    gsap.killTweensOf(fallenLetters.current);
    fallenLetters.current.forEach((letter) => letter.remove());
    fallenLetters.current = [];
    gsap.utils.toArray<HTMLElement>(".word-artifact").forEach((artifact) => artifact.remove());
    clearPendingWord();
    wordCooldown.current.clear();
    hits.current.clear();
    const letters = gsap.utils.toArray<HTMLElement>(".hero-letter");
    gsap.killTweensOf(letters);
    letters.forEach((letter) => {
      delete letter.dataset.released;
      delete letter.dataset.hits;
      letter.style.pointerEvents = "";
    });
    gsap.to(letters, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      duration: 0.9,
      stagger: { each: 0.025, from: "random" },
      ease: "elastic.out(1, .4)",
    });
    setReleased(0);
  };

  const moveHeroAtmosphere = (event: React.PointerEvent<HTMLElement>) => {
    if (!root.current) return;
    const bounds = root.current.getBoundingClientRect();
    const x = gsap.utils.clamp(0, 1, (event.clientX - bounds.left) / bounds.width);
    const y = gsap.utils.clamp(0, 1, (event.clientY - bounds.top) / bounds.height);
    root.current.style.setProperty("--paper-light-x", `${x * 100}%`);
    root.current.style.setProperty("--paper-light-y", `${y * 100}%`);
    const thread = root.current.querySelector<SVGPathElement>(".hero-scrap-thread path");
    thread?.setAttribute(
      "d",
      `M 22 252 C ${118 + x * 58} ${76 + y * 48}, ${286 + x * 82} ${246 - y * 52}, 474 62`,
    );
  };

  const resetHeroAtmosphere = () => {
    if (!root.current) return;
    root.current
      .querySelector<SVGPathElement>(".hero-scrap-thread path")
      ?.setAttribute("d", "M 22 252 C 146 108, 332 218, 474 62");
  };

  const activateScrap = (
    event: React.MouseEvent<HTMLButtonElement>,
    projectId?: string,
  ) => {
    const scrap = event.currentTarget;
    if (scrap.dataset.dragged === "true") return;
    if (!projectId) {
      scrap.classList.toggle("is-revealed");
      return;
    }
    window.dispatchEvent(
      new CustomEvent("portfolio:load-project", { detail: { id: projectId } }),
    );
    document.querySelector("#work")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  let letterIndex = 0;

  return (
    <section
      className="hero"
      id="top"
      ref={root}
      onPointerMove={moveHeroAtmosphere}
      onPointerLeave={resetHeroAtmosphere}
    >
      <div className="hero-pin">
        <div className="shell hero-inner">
          <div className="hero-support">
            <p>Vancouver, BC · Product, strategy, technology</p>
            <p className="hero-hint">Hit a letter three times. Hold Shift to attract the loose ones.</p>
          </div>
          <h1 className="hero-title" aria-label="Make it real">
            {words.map((word) => (
              <span className={`hero-word ${word.serif ? "is-serif" : ""}`} key={word.text}>
                {word.text.split("").map((letter) => {
                  const index = letterIndex++;
                  return (
                    <button
                      className="hero-letter"
                      key={`${letter}-${index}`}
                      onPointerDown={(event) => hit(event, index)}
                      type="button"
                      aria-label={`${letter}, hit three times to release`}
                    >
                      <span className="hero-letter-glyph" aria-hidden="true">
                        {letter}
                      </span>
                    </button>
                  );
                })}
              </span>
            ))}
          </h1>
          <aside className="hero-desk-scraps" aria-label="Notes from Abhi's desk">
            <svg
              className="hero-scrap-thread"
              viewBox="0 0 500 320"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M 22 252 C 146 108, 332 218, 474 62" />
            </svg>
            <span className="hero-pencil-note" aria-hidden="true">drag, toss, click ↗</span>

            <div className="hero-scrap-slot hero-scrap-slot-building">
              <button
                className="hero-scrap"
                type="button"
                onClick={(event) => activateScrap(event, "project-1")}
                aria-label="Now building: abhimem. Open it in the project viewer."
              >
                <span className="hero-scrap-face">
                  <small>Now building / 01</small>
                  <strong>abhimem</strong>
                  <span>memory that stays local</span>
                  <em>send to viewer ↘</em>
                </span>
              </button>
            </div>

            <div className="hero-scrap-slot hero-scrap-slot-shipped">
              <button
                className="hero-scrap"
                type="button"
                onClick={(event) => activateScrap(event, "feature-par0")}
                aria-label="Just shipped: par0 Prompt Golf. Open it in the project viewer."
              >
                <span className="hero-scrap-face">
                  <small>Just shipped / 02</small>
                  <strong>par0</strong>
                  <span>prompt golf for tiny prompts</span>
                  <em>send to viewer ↘</em>
                </span>
              </button>
            </div>

            <div className="hero-scrap-slot hero-scrap-slot-obsession">
              <button
                className="hero-scrap"
                type="button"
                onClick={(event) => activateScrap(event)}
                aria-label="Current obsession. Click to reveal a letter-game hint."
              >
                <span className="hero-scrap-face">
                  <small>Current obsession / 03</small>
                  <strong>judgment</strong>
                  <span>after AI closes the building gap</span>
                  <em className="hero-scrap-secret">try: KART · KARMA · ART</em>
                </span>
              </button>
            </div>
          </aside>
          <div className="hero-bottom">
            <div className="hero-intro-copy">
              <p>
                I&apos;m Abhi. I turn rough problems into useful products across AI, planning,
                and new ventures.
              </p>
              <p className="hero-custom-title" aria-live="polite">
                <span>Your desk title</span>
                <strong>{customTitle.join(" + ")}</strong>
              </p>
            </div>
            <div className="hero-actions">
              <button type="button" onClick={dropAll}>Drop all</button>
              <button type="button" onClick={reset}>Rebuild</button>
              <a href="#work">Enter the work ↓</a>
            </div>
          </div>
          <div className="hero-counter" aria-live="polite">
            <strong>{released}</strong> / 10 released
          </div>
        </div>
        <span className="hero-exit-line" aria-hidden="true" />
      </div>
    </section>
  );
}
