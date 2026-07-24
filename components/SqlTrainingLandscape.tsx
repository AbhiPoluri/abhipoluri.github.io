"use client";

import { useMemo, useState } from "react";

type TrainingRoute = "sft" | "dpo-sft" | "dpo-base";

const routeCopy = {
  "sft": {
    label: "SFT / V4-PRO",
    end: 49,
    color: "#365e43",
    note: "The useful path rises early, peaks at iteration 50, then gives accuracy back as training continues.",
  },
  "dpo-sft": {
    label: "DPO AFTER SFT",
    end: 27.5,
    color: "#9b4b29",
    note: "Preference optimization pulls the trained model off the ridge. The KL leash was not strong enough.",
  },
  "dpo-base": {
    label: "DPO FROM BASE",
    end: 24,
    color: "#171512",
    note: "Without an SFT foundation, the route collapses almost immediately and never recovers.",
  },
} as const;

function trainingPoint(route: TrainingRoute, iteration: number) {
  const progress = iteration / 300;
  if (route === "sft") {
    if (iteration <= 50) {
      const local = iteration / 50;
      return {
        score: 47.5 + 7.5 * local,
        x: 10 + progress * 80,
        y: 61 - 39 * local,
      };
    }
    const local = (iteration - 50) / 250;
    return {
      score: 55 - 6 * local,
      x: 10 + progress * 80,
      y: 22 + 25 * local,
    };
  }

  const start = route === "dpo-sft" ? 55 : 47.5;
  const end = routeCopy[route].end;
  return {
    score: start + (end - start) * progress,
    x: 10 + progress * 80,
    y: (route === "dpo-sft" ? 22 : 61) + (route === "dpo-sft" ? 58 : 25) * Math.pow(progress, .72),
  };
}

export default function SqlTrainingLandscape() {
  const [route, setRoute] = useState<TrainingRoute>("sft");
  const [iteration, setIteration] = useState(50);
  const [flag, setFlag] = useState<number | null>(50);
  const [duelOpen, setDuelOpen] = useState(false);
  const point = useMemo(() => trainingPoint(route, iteration), [route, iteration]);
  const flagPoint = flag === null ? null : trainingPoint(route, flag);
  const winningFlag = route === "sft" && flag !== null && Math.abs(flag - 50) <= 8;
  const status = route !== "sft"
    ? iteration < 45 ? "the cliff starts here" : "preference collapse"
    : iteration < 42 ? "still climbing"
      : iteration <= 65 ? "generalization peak"
        : "overfitting";

  const chooseRoute = (next: TrainingRoute) => {
    setRoute(next);
    setIteration(next === "sft" ? 50 : 180);
    setFlag(null);
    setDuelOpen(false);
  };

  return (
    <div className={`training-landscape route-${route}`}>
      <header className="training-toolbar">
        <div>
          <span>CHOOSE A TRAINING PATH</span>
          <strong>Don’t trust the last checkpoint.</strong>
        </div>
        <nav aria-label="Training method">
          {(Object.keys(routeCopy) as TrainingRoute[]).map((item) => (
            <button
              type="button"
              className={route === item ? "is-active" : ""}
              onClick={() => chooseRoute(item)}
              aria-pressed={route === item}
              key={item}
            >
              {routeCopy[item].label}
            </button>
          ))}
        </nav>
      </header>

      <div className="training-world">
        <svg viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <pattern id="topography" width="64" height="42" patternUnits="userSpaceOnUse">
              <path d="M0 21C14 5 32 4 48 21s30 15 48 0" />
            </pattern>
          </defs>
          <rect width="1000" height="520" fill="url(#topography)" className="terrain-lines" />
          <path className="terrain-route ghost-route" d="M100 318 C140 268 190 160 233 114 C400 115 670 180 900 245" />
          <path className="terrain-route dpo-one" d="M100 114 C280 190 480 346 900 416" />
          <path className="terrain-route dpo-two" d="M100 318 C240 330 450 395 900 448" />
          <path
            className="terrain-route active-route"
            d={route === "sft"
              ? "M100 318 C140 268 190 160 233 114 C400 115 670 180 900 245"
              : route === "dpo-sft"
                ? "M100 114 C280 190 480 346 900 416"
                : "M100 318 C240 330 450 395 900 448"}
          />
          <path className="terrain-ground" d="M0 474 C180 438 260 493 430 462S750 438 1000 482V520H0Z" />
        </svg>

        <div className="trace-weather" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <i
              style={{
                "--tx": `${8 + (index * 47) % 84}%`,
                "--ty": `${12 + (index * 31) % 66}%`,
                "--td": `${(index % 7) * -.23}s`,
              } as React.CSSProperties}
              key={index}
            />
          ))}
        </div>

        <div
          className="training-cart"
          style={{ "--cart-x": `${point.x}%`, "--cart-y": `${point.y}%` } as React.CSSProperties}
        >
          <i /><i />
          <span>ITER {iteration}</span>
          <strong>{point.score.toFixed(1)}%</strong>
        </div>

        {flagPoint && (
          <div
            className={`checkpoint-flag ${winningFlag ? "is-winner" : ""}`}
            style={{ "--flag-x": `${flagPoint.x}%`, "--flag-y": `${flagPoint.y}%` } as React.CSSProperties}
          >
            <i />
            <span>{winningFlag ? "THE CHECKPOINT" : `SAVED ${flag}`}</span>
          </div>
        )}

        <div className="training-peak-note">
          <span>ITER 50</span>
          <strong>55.0%</strong>
          <i>best measured checkpoint</i>
        </div>

        <div className={`training-weather-warning ${status === "overfitting" || route !== "sft" ? "is-visible" : ""}`}>
          <span>{route === "sft" ? "THE MODEL IS MEMORIZING" : "THE ROUTE IS COLLAPSING"}</span>
        </div>
      </div>

      <div className="training-controls">
        <div className="training-lever">
          <span>ITER 0</span>
          <input
            type="range"
            min="0"
            max="300"
            step="1"
            value={iteration}
            onChange={(event) => {
              setIteration(Number(event.target.value));
              setDuelOpen(false);
            }}
            aria-label="Training iteration"
          />
          <span>ITER 300</span>
        </div>
        <div className="training-readout">
          <span>{status}</span>
          <strong>{point.score.toFixed(1)}<i>% pass@1</i></strong>
          <p>{routeCopy[route].note}</p>
        </div>
        <button className="checkpoint-button" type="button" onClick={() => setFlag(iteration)}>
          Plant checkpoint here <span>↓</span>
        </button>
      </div>

      <div className={`query-duel ${duelOpen ? "is-open" : ""}`}>
        <button type="button" onClick={() => setDuelOpen((open) => !open)} disabled={!winningFlag}>
          {winningFlag ? "Run a held-out question" : "Find the winning checkpoint to unlock the query"}
          <span>{duelOpen ? "×" : "↗"}</span>
        </button>
        {duelOpen && winningFlag && (
          <div>
            <header>
              <span>BIRD / concert_singer</span>
              <strong>Which stadium hosted the most concerts?</strong>
            </header>
            <section>
              <div>
                <span>BASE · 47.5%</span>
                <code>SELECT stadium_id, COUNT(*) FROM concert GROUP BY stadium_id;</code>
                <b>wrong column returned</b>
              </div>
              <div className="is-pass">
                <span>ITER 50 · 55.0%</span>
                <code>SELECT s.name FROM stadium s JOIN concert c USING(stadium_id) GROUP BY s.name ORDER BY COUNT(*) DESC LIMIT 1;</code>
                <b>execution match</b>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
