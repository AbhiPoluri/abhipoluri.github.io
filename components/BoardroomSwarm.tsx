"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type OpsPhase = "assigning" | "running" | "review" | "merged";
type TaskStatus = "loose" | "assigned" | "working" | "done" | "trashed";

type Agent = {
  id: string;
  name: string;
  runtime: string;
  specialty: string;
  x: number;
  y: number;
  color: string;
};

type OpsTask = {
  id: string;
  title: string;
  kind: string;
  preferred: string;
  agentId?: string;
  status: TaskStatus;
};

type Handoff = {
  taskId: string;
  from: string;
  to: string;
  note: string;
};

const agents: Agent[] = [
  { id: "research", name: "Researcher", runtime: "Claude", specialty: "Maps the system", x: 17, y: 37, color: "#f4bd43" },
  { id: "build", name: "Builder", runtime: "Codex", specialty: "Writes the change", x: 39, y: 58, color: "#e77558" },
  { id: "interface", name: "Interface", runtime: "OpenCode", specialty: "Shapes the product", x: 64, y: 57, color: "#efe5d6" },
  { id: "review", name: "Reviewer", runtime: "Hermes", specialty: "Tries to break it", x: 84, y: 36, color: "#f4bd43" },
];

const starterTasks: OpsTask[] = [
  { id: "surface", title: "Map auth surface", kind: "RESEARCH", preferred: "research", status: "loose" },
  { id: "schema", title: "Write session schema", kind: "BACKEND", preferred: "build", status: "loose" },
  { id: "magic-link", title: "Build magic-link UI", kind: "INTERFACE", preferred: "interface", status: "loose" },
  { id: "middleware", title: "Wire middleware", kind: "BACKEND", preferred: "build", status: "loose" },
  { id: "tests", title: "Attack expiry edge cases", kind: "REVIEW", preferred: "review", status: "loose" },
];

const agentById = new Map(agents.map((agent) => [agent.id, agent]));

export default function BoardroomSwarm() {
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const pausedRef = useRef(new Set<string>());
  const duplicateId = useRef(0);
  const taskDrag = useRef({ id: "", startX: 0, startY: 0, x: 0, y: 0, moved: false });
  const stampDrag = useRef({ startX: 0, startY: 0, x: 0, y: 0 });
  const [mission, setMission] = useState("Ship passwordless auth");
  const [phase, setPhase] = useState<OpsPhase>("assigning");
  const [tasks, setTasks] = useState<OpsTask[]>(starterTasks);
  const [pausedAgents, setPausedAgents] = useState<string[]>([]);
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [selectedTask, setSelectedTask] = useState<OpsTask | null>(null);
  const [metrics, setMetrics] = useState({ tokens: 0, spend: 0, tests: 0 });

  const activeTasks = useMemo(
    () => tasks.filter((task) => task.status !== "trashed"),
    [tasks],
  );
  const assignedCount = activeTasks.filter((task) => task.agentId).length;
  const doneCount = activeTasks.filter((task) => task.status === "done").length;

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  useGSAP(
    () => {
      gsap.from(".ops-agent", {
        scale: .45,
        opacity: 0,
        rotation: () => gsap.utils.random(-10, 10),
        stagger: .08,
        duration: .65,
        ease: "back.out(2.2)",
      });
      gsap.from(".ops-task-card", {
        y: 60,
        opacity: 0,
        rotation: () => gsap.utils.random(-8, 8),
        stagger: .06,
        duration: .7,
        ease: "back.out(1.7)",
      });
    },
    { scope: root },
  );

  useEffect(() => {
    if (!handoff || !root.current) return;
    const stage = root.current.querySelector<HTMLElement>(".ops-stage");
    const artifact = root.current.querySelector<HTMLElement>(".ops-handoff-artifact");
    const from = root.current.querySelector<HTMLElement>(`[data-agent="${handoff.from}"]`);
    const to = root.current.querySelector<HTMLElement>(`[data-agent="${handoff.to}"]`);
    if (!stage || !artifact || !from || !to) return;

    const stageBounds = stage.getBoundingClientRect();
    const fromBounds = from.getBoundingClientRect();
    const toBounds = to.getBoundingClientRect();
    const fromX = fromBounds.left + fromBounds.width / 2 - stageBounds.left;
    const fromY = fromBounds.top + fromBounds.height / 2 - stageBounds.top;
    const toX = toBounds.left + toBounds.width / 2 - stageBounds.left;
    const toY = toBounds.top + toBounds.height / 2 - stageBounds.top;

    gsap.fromTo(
      artifact,
      { x: fromX, y: fromY, scale: .45, rotation: -12, opacity: 0 },
      {
        x: toX,
        y: toY,
        scale: 1,
        rotation: 3,
        opacity: 1,
        duration: .82,
        ease: "back.out(1.45)",
      },
    );
  }, [handoff]);

  const resetBoard = () => {
    clearTimers();
    pausedRef.current.clear();
    setPausedAgents([]);
    setTasks(starterTasks);
    setPhase("assigning");
    setHandoff(null);
    setSelectedTask(null);
    setMetrics({ tokens: 0, spend: 0, tests: 0 });
    requestAnimationFrame(() => {
      gsap.set(".ops-task-card, .ops-merge-stamp", { clearProps: "transform,opacity" });
    });
  };

  const assignTask = (taskId: string, agentId?: string) => {
    setTasks((current) => current.map((task) => (
      task.id === taskId
        ? {
            ...task,
            agentId,
            status: agentId ? (phase === "running" ? "working" : "assigned") : "loose",
          }
        : task
    )));
  };

  const taskDown = (event: React.PointerEvent<HTMLButtonElement>, taskId: string) => {
    if (phase === "review" || phase === "merged") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    taskDrag.current = {
      id: taskId,
      startX: event.clientX,
      startY: event.clientY,
      x: Number(gsap.getProperty(event.currentTarget, "x")) || 0,
      y: Number(gsap.getProperty(event.currentTarget, "y")) || 0,
      moved: false,
    };
    event.currentTarget.classList.add("is-dragging");
    gsap.to(event.currentTarget, { scale: 1.08, rotation: -2, duration: .16 });
  };

  const taskMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const x = taskDrag.current.x + event.clientX - taskDrag.current.startX;
    const y = taskDrag.current.y + event.clientY - taskDrag.current.startY;
    if (Math.hypot(x - taskDrag.current.x, y - taskDrag.current.y) > 6) {
      taskDrag.current.moved = true;
    }
    gsap.set(event.currentTarget, { x, y });

    root.current?.querySelectorAll<HTMLElement>("[data-agent-drop], .ops-trash").forEach((target) => {
      const bounds = target.getBoundingClientRect();
      const over = event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      target.classList.toggle("is-armed", over);
    });
  };

  const taskUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    event.currentTarget.classList.remove("is-dragging");

    const trash = root.current?.querySelector<HTMLElement>(".ops-trash");
    const trashBounds = trash?.getBoundingClientRect();
    const inTrash = trashBounds
      && event.clientX >= trashBounds.left && event.clientX <= trashBounds.right
      && event.clientY >= trashBounds.top && event.clientY <= trashBounds.bottom;

    let agentTarget: HTMLElement | undefined;
    root.current?.querySelectorAll<HTMLElement>("[data-agent-drop]").forEach((target) => {
      const bounds = target.getBoundingClientRect();
      if (
        event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom
      ) agentTarget = target;
      target.classList.remove("is-armed");
    });
    trash?.classList.remove("is-armed");

    if (inTrash) {
      setTasks((current) => current.map((task) => (
        task.id === taskDrag.current.id ? { ...task, status: "trashed", agentId: undefined } : task
      )));
      gsap.to(event.currentTarget, {
        scale: .1,
        opacity: 0,
        rotation: 65,
        duration: .35,
        ease: "back.in(2)",
      });
      return;
    }

    const agentId = agentTarget?.dataset.agentDrop;
    if (agentId) {
      assignTask(taskDrag.current.id, agentId);
      const targetAgent = agentById.get(agentId);
      if (targetAgent && phase === "running") {
        setHandoff({
          taskId: taskDrag.current.id,
          from: "research",
          to: agentId,
          note: `Reassigned live to ${targetAgent.runtime}. Context moved with the task.`,
        });
      }
      gsap.to(event.currentTarget, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: .5,
        ease: "back.out(1.8)",
      });
      return;
    }

    gsap.to(event.currentTarget, {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      duration: .65,
      ease: "elastic.out(1, .45)",
    });
  };

  const duplicateTask = (task: OpsTask) => {
    if (phase === "review" || phase === "merged") return;
    duplicateId.current += 1;
    const duplicate: OpsTask = {
      ...task,
      id: `${task.id}-copy-${duplicateId.current}`,
      title: `${task.title} copy`,
      agentId: undefined,
      status: "loose",
    };
    setTasks((current) => [...current, duplicate]);
  };

  const togglePause = (agentId: string) => {
    if (phase !== "running") return;
    const next = new Set(pausedRef.current);
    if (next.has(agentId)) next.delete(agentId);
    else next.add(agentId);
    pausedRef.current = next;
    setPausedAgents([...next]);
    const agent = root.current?.querySelector<HTMLElement>(`[data-agent="${agentId}"]`);
    if (agent) {
      gsap.fromTo(agent, { scale: .82, rotation: -7 }, { scale: 1, rotation: 0, duration: .55, ease: "elastic.out(1, .35)" });
    }
  };

  const completeTask = (taskId: string, agentId: string, index: number) => {
    if (pausedRef.current.has(agentId)) {
      timers.current.push(window.setTimeout(() => completeTask(taskId, agentId, index), 500));
      return;
    }
    setTasks((current) => current.map((task) => (
      task.id === taskId ? { ...task, status: "done" } : task
    )));
    const target = index === agents.length - 1 ? agents[0] : agents[index % agents.length];
    const task = tasks.find((candidate) => candidate.id === taskId);
    setHandoff({
      taskId,
      from: agentId,
      to: target.id,
      note: task?.preferred === agentId
        ? "Clean handoff. Context, diff, and test state included."
        : "The agent adapted, but left a note about the unusual assignment.",
    });
    setMetrics((current) => ({
      tokens: current.tokens + 11743 + index * 1803,
      spend: Number((current.spend + .19 + index * .07).toFixed(2)),
      tests: Math.min(145, current.tests + 29 + index * 4),
    }));
  };

  const runPlan = () => {
    const queue = tasks.filter((task) => task.agentId && task.status !== "trashed");
    if (queue.length < 3) return;
    clearTimers();
    setPhase("running");
    setSelectedTask(null);
    setMetrics({ tokens: 0, spend: 0, tests: 0 });
    setTasks((current) => current.map((task) => (
      task.agentId && task.status !== "trashed" ? { ...task, status: "working" } : task
    )));

    queue.forEach((task, index) => {
      timers.current.push(window.setTimeout(
        () => completeTask(task.id, task.agentId as string, index),
        850 + index * 980,
      ));
    });
    timers.current.push(window.setTimeout(() => {
      setHandoff(null);
      setMetrics((current) => ({ ...current, tests: 145 }));
      setPhase("review");
    }, 1350 + queue.length * 980));
  };

  const stampDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    stampDrag.current = {
      startX: event.clientX,
      startY: event.clientY,
      x: Number(gsap.getProperty(event.currentTarget, "x")) || 0,
      y: Number(gsap.getProperty(event.currentTarget, "y")) || 0,
    };
    gsap.to(event.currentTarget, { scale: 1.08, rotation: -8, duration: .16 });
  };

  const stampMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const x = stampDrag.current.x + event.clientX - stampDrag.current.startX;
    const y = stampDrag.current.y + event.clientY - stampDrag.current.startY;
    gsap.set(event.currentTarget, { x, y });
    const pullRequest = root.current?.querySelector<HTMLElement>(".ops-pull-request");
    const bounds = pullRequest?.getBoundingClientRect();
    const over = bounds
      && event.clientX >= bounds.left && event.clientX <= bounds.right
      && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    pullRequest?.classList.toggle("is-armed", Boolean(over));
  };

  const stampUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const pullRequest = root.current?.querySelector<HTMLElement>(".ops-pull-request");
    const bounds = pullRequest?.getBoundingClientRect();
    const hit = bounds
      && event.clientX >= bounds.left && event.clientX <= bounds.right
      && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    pullRequest?.classList.remove("is-armed");
    if (!hit) {
      gsap.to(event.currentTarget, { x: 0, y: 0, scale: 1, rotation: -4, duration: .65, ease: "elastic.out(1, .4)" });
      return;
    }
    gsap.to(event.currentTarget, { scale: 1.35, rotation: -12, duration: .18, yoyo: true, repeat: 1 });
    if (pullRequest) {
      gsap.fromTo(pullRequest, { scale: 1.05 }, { scale: 1, duration: .55, ease: "elastic.out(1, .35)" });
    }
    window.setTimeout(() => setPhase("merged"), 260);
  };

  return (
    <div className={`boardroom-ops is-${phase}`} ref={root}>
      <header className="ops-toolbar">
        <label>
          <span>Mission</span>
          <input
            value={mission}
            onChange={(event) => setMission(event.target.value)}
            maxLength={42}
            aria-label="Boardroom mission"
          />
        </label>
        <div>
          <button type="button" onClick={resetBoard}>Reset table</button>
          <button type="button" onClick={runPlan} disabled={phase !== "assigning" || assignedCount < 3}>
            {assignedCount < 3 ? `Assign ${3 - assignedCount} more` : "Run this plan"}
          </button>
        </div>
      </header>

      <div className="ops-stage">
        <svg className="ops-threads" viewBox="0 0 1000 680" preserveAspectRatio="none" aria-hidden="true">
          {agents.map((agent) => (
            <path
              key={agent.id}
              d={`M500 118 C500 205 ${agent.x * 10} 190 ${agent.x * 10} ${agent.y * 6.8}`}
              className={activeTasks.some((task) => task.agentId === agent.id) ? "is-active" : ""}
            />
          ))}
        </svg>

        <section className="ops-brief">
          <span>Brief on the table</span>
          <strong>{mission || "Untitled mission"}</strong>
          <small>{assignedCount}/{activeTasks.length} tasks assigned</small>
        </section>

        {agents.map((agent) => {
          const assigned = activeTasks.filter((task) => task.agentId === agent.id);
          const paused = pausedAgents.includes(agent.id);
          return (
            <button
              className={`ops-agent ${assigned.length ? "has-work" : ""} ${paused ? "is-paused" : ""}`}
              data-agent={agent.id}
              data-agent-drop={agent.id}
              style={{ "--agent-x": `${agent.x}%`, "--agent-y": `${agent.y}%`, "--agent-color": agent.color } as React.CSSProperties}
              type="button"
              onClick={() => togglePause(agent.id)}
              key={agent.id}
            >
              <span className="ops-agent-face" aria-hidden="true"><i /><i /><b /></span>
              <strong>{agent.name}</strong>
              <small>{agent.runtime} · {agent.specialty}</small>
              <em>{paused ? "paused — click to wake" : assigned.length ? `${assigned.length} task${assigned.length > 1 ? "s" : ""}` : "drop work here"}</em>
            </button>
          );
        })}

        {activeTasks.map((task, index) => {
          const agent = task.agentId ? agentById.get(task.agentId) : undefined;
          const looseIndex = activeTasks.filter((candidate) => !candidate.agentId).findIndex((candidate) => candidate.id === task.id);
          const left = agent ? agent.x : 12 + looseIndex * 18;
          const top = agent ? agent.y + 15 : 91;
          return (
            <button
              className={`ops-task-card is-${task.status}`}
              style={{ "--task-x": `${left}%`, "--task-y": `${top}%`, "--task-order": index } as React.CSSProperties}
              type="button"
              onPointerDown={(event) => taskDown(event, task.id)}
              onPointerMove={taskMove}
              onPointerUp={taskUp}
              onPointerCancel={taskUp}
              onDoubleClick={() => duplicateTask(task)}
              onClick={() => {
                if (!taskDrag.current.moved && task.status === "done") setSelectedTask(task);
              }}
              key={task.id}
            >
              <span>{task.kind}</span>
              <strong>{task.title}</strong>
              <small>
                {task.status === "loose" && "drag to an agent"}
                {task.status === "assigned" && agent?.runtime}
                {task.status === "working" && (pausedAgents.includes(task.agentId || "") ? "waiting" : "working")}
                {task.status === "done" && "inspect diff"}
              </small>
            </button>
          );
        })}

        <div className="ops-trash" aria-label="Discard task">
          <span>Discard</span>
          <small>drop task</small>
        </div>

        {handoff && (
          <>
            <button
              className="ops-handoff-artifact"
              type="button"
              onClick={() => setSelectedTask(tasks.find((task) => task.id === handoff.taskId) || null)}
            >
              <span>HANDOFF</span>
              <strong>{tasks.find((task) => task.id === handoff.taskId)?.title}</strong>
              <small>click to inspect</small>
            </button>
            <div className="ops-handoff-note">
              <strong>{agentById.get(handoff.from)?.name} to {agentById.get(handoff.to)?.name}</strong>
              <p>{handoff.note}</p>
            </div>
          </>
        )}

        {selectedTask && (
          <aside className="ops-inspector">
            <button type="button" onClick={() => setSelectedTask(null)} aria-label="Close task inspector">Close</button>
            <span>{selectedTask.kind} · {selectedTask.status}</span>
            <h4>{selectedTask.title}</h4>
            <pre>{`+ session boundary guarded\n+ worktree isolated\n+ tests passed: ${selectedTask.status === "done" ? "yes" : "pending"}`}</pre>
          </aside>
        )}

        {phase === "assigning" && (
          <p className="ops-instruction">Drag at least three cards onto the agents. Double-click a card to duplicate it.</p>
        )}

        {phase === "running" && (
          <p className="ops-instruction">Interfere: click an agent to pause it, reassign a live card, or throw work away.</p>
        )}

        {phase === "review" && (
          <div className="ops-review">
            <section className="ops-pull-request">
              <span>Pull request ready</span>
              <strong>{mission}</strong>
              <small>{doneCount} artifacts · 145 tests · clean worktrees</small>
              <i>Awaiting your stamp</i>
            </section>
            <button
              className="ops-merge-stamp"
              type="button"
              onPointerDown={stampDown}
              onPointerMove={stampMove}
              onPointerUp={stampUp}
              onPointerCancel={stampUp}
            >
              <span>MERGE</span>
              <small>drag onto PR</small>
            </button>
          </div>
        )}

        {phase === "merged" && (
          <section className="ops-shipped">
            <span>Shipped from the table</span>
            <strong>{mission}</strong>
            <p>One reviewed branch. {doneCount} agent artifacts. The table is clean.</p>
            <button type="button" onClick={resetBoard}>Run another mission</button>
          </section>
        )}
      </div>

      <footer className="ops-metrics">
        <span><i>assigned</i><strong>{assignedCount}</strong></span>
        <span><i>finished</i><strong>{doneCount}</strong></span>
        <span><i>tokens</i><strong>{metrics.tokens.toLocaleString()}</strong></span>
        <span><i>spend</i><strong>${metrics.spend.toFixed(2)}</strong></span>
        <span><i>tests</i><strong>{metrics.tests}</strong></span>
      </footer>
    </div>
  );
}
