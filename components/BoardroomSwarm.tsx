"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type SwarmPhase = "idle" | "running" | "conflict" | "merged";

const swarmTasks = [
  { name: "map auth", runtime: "CLAUDE", x: 17, y: 42 },
  { name: "write schema", runtime: "CODEX", x: 35, y: 68 },
  { name: "build UI", runtime: "OPENCODE", x: 64, y: 66 },
  { name: "wire API", runtime: "CODEX", x: 83, y: 41 },
  { name: "run tests", runtime: "HERMES", x: 50, y: 84 },
];

const branchPaths = Array.from(
  { length: swarmTasks.length },
  (_, index) => `M500 150 C500 250 500 350 ${swarmTasks[index].x * 10} ${swarmTasks[index].y * 6.2}`,
);

const agentConversation = [
  {
    speaker: "Researcher",
    recipient: "Builder",
    text: "Auth surface mapped. Three middleware files and one session edge case.",
    x: 16,
    y: 29,
  },
  {
    speaker: "Builder",
    recipient: "Reviewer",
    text: "Implementation committed. Passing the diff and test context now.",
    x: 69,
    y: 51,
  },
  {
    speaker: "Reviewer",
    recipient: "Builder",
    text: "Refresh-token regression on expiry. Sending the failing assertion back.",
    x: 43,
    y: 69,
  },
  {
    speaker: "Builder",
    recipient: "Reviewer",
    text: "Patched the boundary condition. All 145 tests are green.",
    x: 68,
    y: 47,
  },
  {
    speaker: "Reviewer",
    recipient: "Orchestrator",
    text: "Verified. Clean diff, clean tree, ready to merge.",
    x: 44,
    y: 65,
  },
];

export default function BoardroomSwarm() {
  const root = useRef<HTMLDivElement>(null);
  const conflict = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const resolverDrag = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const [phase, setPhase] = useState<SwarmPhase>("idle");
  const [messageIndex, setMessageIndex] = useState(-1);
  const [mission, setMission] = useState("Ship passwordless auth");
  const [metrics, setMetrics] = useState({ tokens: 0, cost: 0, tests: 0 });

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    const lab = root.current;
    const stage = lab?.querySelector<HTMLElement>(".swarm-stage");
    if (!stage) return;

    const syncBranches = () => {
      const stageBounds = stage.getBoundingClientRect();
      const hub = stage.querySelector<HTMLElement>(".swarm-hub");
      const agents = Array.from(stage.querySelectorAll<HTMLElement>(".swarm-agent"));
      const paths = Array.from(stage.querySelectorAll<SVGPathElement>(".swarm-branch"));
      if (!hub || stageBounds.width === 0 || stageBounds.height === 0) return;

      const hubBounds = hub.getBoundingClientRect();
      const startX = ((hubBounds.left + hubBounds.width / 2 - stageBounds.left) / stageBounds.width) * 1000;
      const startY = ((hubBounds.bottom - stageBounds.top) / stageBounds.height) * 620;

      paths.forEach((path, index) => {
        const agent = agents[index];
        if (!agent) return;
        const agentBounds = agent.getBoundingClientRect();
        const endX = ((agentBounds.left + agentBounds.width / 2 - stageBounds.left) / stageBounds.width) * 1000;
        const endY = ((agentBounds.top + agentBounds.height / 2 - stageBounds.top) / stageBounds.height) * 620;
        const bendX = startX + (endX - startX) * .55;
        const bendY = startY + (endY - startY) * .58;
        path.setAttribute(
          "d",
          `M ${startX} ${startY} C ${startX} ${bendY}, ${bendX} ${bendY}, ${endX} ${endY}`,
        );
      });
    };

    const frame = window.requestAnimationFrame(syncBranches);
    const observer = new ResizeObserver(syncBranches);
    observer.observe(stage);
    window.addEventListener("resize", syncBranches);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", syncBranches);
    };
  }, []);

  useGSAP(
    () => {
      gsap.set(".swarm-branch", { strokeDasharray: 900, strokeDashoffset: 900 });
      gsap.set(".swarm-task", { scale: 0, opacity: 0 });
      gsap.set(".swarm-agent", { scale: 1, opacity: 1 });
    },
    { scope: root },
  );

  const runMission = () => {
    clearTimers();
    setPhase("running");
    setMessageIndex(-1);
    setMetrics({ tokens: 0, cost: 0, tests: 0 });
    resolverDrag.current = { x: 0, y: 0, startX: 0, startY: 0 };

    requestAnimationFrame(() => {
      const stage = root.current;
      if (!stage) return;
      const stageBounds = stage.getBoundingClientRect();
      const centerX = stageBounds.width * .5;
      const centerY = stageBounds.height * .23;
      const tasks = gsap.utils.toArray<HTMLElement>(".swarm-task", stage);
      const agents = gsap.utils.toArray<HTMLElement>(".swarm-agent", stage);

      gsap.killTweensOf([...tasks, ...agents]);
      gsap.set(".swarm-resolution, .swarm-conflict", { clearProps: "transform,opacity" });
      gsap.set(".swarm-resolver", { x: 0, y: 0, opacity: 1 });

      const timeline = gsap.timeline();
      timeline
        .to(".swarm-branch", {
          strokeDashoffset: 0,
          duration: 1.5,
          stagger: .09,
          ease: "power2.inOut",
        })
        .fromTo(
          agents,
          { scale: .4, opacity: 0, rotation: -20 },
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: .65,
            stagger: .12,
            ease: "back.out(2.4)",
          },
          .2,
        );

      tasks.forEach((task, index) => {
        const bounds = task.getBoundingClientRect();
        gsap.fromTo(
          task,
          {
            x: centerX - (bounds.left - stageBounds.left) - bounds.width / 2,
            y: centerY - (bounds.top - stageBounds.top) - bounds.height / 2,
            scale: .15,
            opacity: 0,
            rotation: gsap.utils.random(-18, 18),
          },
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 1,
            delay: .45 + index * .17,
            ease: "back.out(1.55)",
          },
        );
      });

      gsap.to(agents, {
        y: () => gsap.utils.random(-7, 7),
        rotation: () => gsap.utils.random(-3, 3),
        duration: .55,
        repeat: 4,
        yoyo: true,
        stagger: .08,
        ease: "sine.inOut",
      });
    });

    timers.current = [
      window.setTimeout(() => {
        setMetrics({ tokens: 18432, cost: .31, tests: 38 });
        setMessageIndex(0);
      }, 850),
      window.setTimeout(() => setMessageIndex(1), 1650),
      window.setTimeout(() => {
        setMetrics({ tokens: 46108, cost: .79, tests: 97 });
        setMessageIndex(2);
      }, 2450),
      window.setTimeout(() => setMessageIndex(3), 3350),
      window.setTimeout(() => setMessageIndex(4), 4200),
      window.setTimeout(() => {
        setMetrics({ tokens: 63841, cost: 1.14, tests: 145 });
        setPhase("conflict");
        setMessageIndex(-1);
        requestAnimationFrame(() => {
          gsap.fromTo(
            ".swarm-conflict",
            { scale: 0, rotation: -35, opacity: 0 },
            { scale: 1, rotation: 0, opacity: 1, duration: .8, ease: "elastic.out(1, .38)" },
          );
          gsap.to(".swarm-task, .swarm-agent", { opacity: .34, scale: .92, duration: .5 });
        });
      }, 5200),
    ];
  };

  const resolveConflict = () => {
    setPhase("merged");
    setMetrics((current) => ({ ...current, tests: 145 }));
    gsap.timeline()
      .to(".swarm-conflict", { scale: 0, rotation: 70, opacity: 0, duration: .45, ease: "back.in(2)" })
      .to(".swarm-task", {
        left: "50%",
        top: "54%",
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        opacity: 0,
        rotation: () => gsap.utils.random(-120, 120),
        duration: .75,
        stagger: .06,
        ease: "power3.in",
      }, 0)
      .to(".swarm-agent", { scale: .65, opacity: .2, duration: .5 }, 0)
      .fromTo(
        ".swarm-resolution",
        { scale: .25, opacity: 0, rotation: -8 },
        { scale: 1, opacity: 1, rotation: 0, duration: .8, ease: "elastic.out(1, .42)" },
        .5,
      )
      .to(".swarm-branch", { stroke: "#f0e9de", strokeDashoffset: -100, duration: .8 }, .25);
  };

  const resolverDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (phase !== "conflict") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    resolverDrag.current.startX = event.clientX;
    resolverDrag.current.startY = event.clientY;
    resolverDrag.current.x = Number(gsap.getProperty(event.currentTarget, "x")) || 0;
    resolverDrag.current.y = Number(gsap.getProperty(event.currentTarget, "y")) || 0;
    gsap.to(event.currentTarget, { scale: 1.12, duration: .18 });
  };

  const resolverMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const x = resolverDrag.current.x + event.clientX - resolverDrag.current.startX;
    const y = resolverDrag.current.y + event.clientY - resolverDrag.current.startY;
    gsap.set(event.currentTarget, { x, y });
    const target = conflict.current?.getBoundingClientRect();
    if (!target) return;
    const over = event.clientX >= target.left && event.clientX <= target.right
      && event.clientY >= target.top && event.clientY <= target.bottom;
    conflict.current?.classList.toggle("is-armed", over);
  };

  const resolverUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const target = conflict.current?.getBoundingClientRect();
    const hit = target
      && event.clientX >= target.left && event.clientX <= target.right
      && event.clientY >= target.top && event.clientY <= target.bottom;
    conflict.current?.classList.remove("is-armed");
    if (hit) {
      gsap.to(event.currentTarget, { opacity: 0, scale: .3, duration: .25 });
      resolveConflict();
    } else {
      gsap.to(event.currentTarget, { x: 0, y: 0, scale: 1, duration: .75, ease: "elastic.out(1, .4)" });
    }
  };

  return (
    <div className={`swarm-lab is-${phase}`} ref={root}>
      <header className="swarm-toolbar">
        <label>
          <span>MISSION</span>
          <input
            value={mission}
            onChange={(event) => setMission(event.target.value)}
            maxLength={42}
            aria-label="Boardroom mission"
          />
        </label>
        <button type="button" onClick={runMission} disabled={phase === "running"}>
          {phase === "idle" ? "Release the agents" : phase === "running" ? "They’re on it" : "Make more chaos"}
          <span>↗</span>
        </button>
      </header>

      <div className="swarm-stage">
        <svg viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
          {branchPaths.map((path, index) => (
            <path className="swarm-branch" d={path} key={path} data-branch={index} />
          ))}
        </svg>

        <div className="swarm-hub">
          <span>THE BRIEF</span>
          <strong>{mission || "Untitled mission"}</strong>
          <i />
        </div>

        {swarmTasks.map((task, index) => (
          <div
            className="swarm-worker"
            style={{ "--x": `${task.x}%`, "--y": `${task.y}%` } as React.CSSProperties}
            key={task.name}
          >
            <div className="swarm-agent" aria-hidden="true">
              <i /><b /><span>{task.runtime.slice(0, 1)}</span>
            </div>
            <div className="swarm-task">
              <span>{task.runtime}</span>
              <strong>{task.name}</strong>
              <small>worktree/{index + 1}</small>
            </div>
          </div>
        ))}

        {phase === "conflict" && (
          <>
            <div className="swarm-conflict" ref={conflict}>
              <i /><i /><i />
              <span>MERGE<br />CONFLICT</span>
              <small>drop resolver here</small>
            </div>
            <button
              className="swarm-resolver"
              type="button"
              onPointerDown={resolverDown}
              onPointerMove={resolverMove}
              onPointerUp={resolverUp}
              onPointerCancel={resolverUp}
            >
              <i />
              <span>CONFLICT ERASER</span>
              <small>drag onto crash</small>
            </button>
          </>
        )}

        {phase === "merged" && (
          <div className="swarm-resolution">
            <span>MERGED</span>
            <strong>codex/passwordless-auth</strong>
            <small>145 tests · clean tree · ready for review</small>
          </div>
        )}

        {phase === "running" && messageIndex >= 0 && (
          <div
            className="swarm-message"
            style={{
              "--message-x": `${agentConversation[messageIndex].x}%`,
              "--message-y": `${agentConversation[messageIndex].y}%`,
            } as React.CSSProperties}
            key={messageIndex}
          >
            <header>
              <strong>{agentConversation[messageIndex].speaker}</strong>
              <span>to {agentConversation[messageIndex].recipient} →</span>
            </header>
            <p>{agentConversation[messageIndex].text}</p>
            <i aria-hidden="true" />
          </div>
        )}

        {phase === "running" && (
          <div className="swarm-handoff-feed" aria-label="Agent handoff progress">
            {agentConversation.map((message, index) => (
              <span className={index <= messageIndex ? "is-sent" : ""} key={`${message.speaker}-${index}`}>
                <i />
                {message.speaker.slice(0, 1)}→{message.recipient.slice(0, 1)}
              </span>
            ))}
          </div>
        )}

        {phase === "idle" && (
          <p className="swarm-instruction">They’re bored. Give them something to ship.</p>
        )}
      </div>

      <footer className="swarm-metrics">
        <span><i>tokens</i><strong>{metrics.tokens.toLocaleString()}</strong></span>
        <span><i>spend</i><strong>${metrics.cost.toFixed(2)}</strong></span>
        <span><i>tests</i><strong>{metrics.tests}</strong></span>
        <span><i>state</i><strong>{phase}</strong></span>
      </footer>
    </div>
  );
}
