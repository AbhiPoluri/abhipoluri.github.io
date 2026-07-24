"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BoardroomSwarm from "@/components/BoardroomSwarm";
import PocketReceiptMachine from "@/components/PocketReceiptMachine";
import SqlTrainingLandscape from "@/components/SqlTrainingLandscape";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function SplitTitle({ children }: { children: string }) {
  return (
    <>
      {children.split(" ").map((word, index) => (
        <span className="deep-word" key={`${word}-${index}`}>{word}&nbsp;</span>
      ))}
    </>
  );
}

export default function ProjectDeepDives() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const motion = gsap.matchMedia();

      motion.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".deep-dive-chapter").forEach((chapter) => {
          const words = chapter.querySelectorAll(".deep-word");
          const media = chapter.querySelector(".deep-dive-media");
          const facts = chapter.querySelectorAll(".deep-fact");

          gsap.fromTo(
            words,
            { opacity: .12, y: 34 },
            {
              opacity: 1,
              y: 0,
              stagger: .08,
              ease: "none",
              scrollTrigger: {
                trigger: chapter,
                start: "top 72%",
                end: "top 28%",
                scrub: .7,
              },
            },
          );

          if (media) {
            gsap.fromTo(
              media,
              { scale: .86, opacity: .32, clipPath: "inset(9% 7% 9% 7%)" },
              {
                scale: 1,
                opacity: 1,
                clipPath: "inset(0% 0% 0% 0%)",
                ease: "none",
                scrollTrigger: {
                  trigger: chapter,
                  start: "top 82%",
                  end: "center 48%",
                  scrub: 1,
                },
              },
            );
          }

          gsap.from(facts, {
            y: 28,
            opacity: 0,
            stagger: .08,
            duration: .7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: chapter.querySelector(".deep-facts"),
              start: "top 82%",
            },
          });
        });
      });

      return () => motion.revert();
    },
    { scope: root },
  );

  return (
    <section className="deep-dives" id="work" ref={root} aria-label="Featured project case studies">
      <div className="deep-dives-intro shell">
        <p>Three projects, opened up</p>
        <h2>The work behind<br /><i>the work.</i></h2>
        <span>Scroll slowly. Each chapter has something to operate.</span>
      </div>

      <article className="deep-dive-chapter deep-boardroom" id="boardroom-case-study">
        <div className="deep-dive-shell shell">
          <header className="deep-dive-heading">
            <div>
              <span className="deep-kicker">Boardroom · agent infrastructure</span>
              <span className="deep-counter">01 / 03</span>
            </div>
            <h2><SplitTitle>One desk for an entire agent team.</SplitTitle></h2>
            <p>
              Boardroom turns parallel coding agents into an operating system: assign work,
              isolate it, watch it run, resolve conflicts, and review the result without
              stitching together terminal windows by hand.
            </p>
          </header>

          <dl className="deep-brief">
            <div><dt>My role</dt><dd>Product, interaction, architecture, full-stack build</dd></div>
            <div><dt>Core stack</dt><dd>Next.js, TypeScript, SQLite, node-pty, SSE, Git worktrees</dd></div>
            <div><dt>What shipped</dt><dd>Self-hosted agent OS, review queue, plan engine, nine-tool MCP server</dd></div>
          </dl>

          <div className="deep-dive-layout">
            <section
              className="deep-dive-media boardroom-swarm-wrap"
              aria-label="Interactive Boardroom plan simulation"
            >
              <div className="deep-media-inner"><BoardroomSwarm /></div>
            </section>

            <div className="deep-dive-copy">
              <section>
                <h3>The problem</h3>
                <p>
                  More agents create more coordination work. Parallel branches collide,
                  context disappears between sessions, and “done” still needs a human to
                  find the diff, test it, and decide what ships.
                </p>
              </section>
              <section>
                <h3>The system</h3>
                <p>
                  Named personas run Claude, Codex, Hermes, or OpenCode inside isolated Git
                  worktrees. Plans can run sequentially or in parallel; completed work enters
                  a push-request queue, and a resolver agent handles merge conflicts.
                </p>
              </section>
              <section>
                <h3>The hard part</h3>
                <p>
                  The UI is only the surface. Underneath it are persistent sessions, PTY
                  process control, live SSE logs, a four-second dispatcher, branch lifecycle
                  management, and enough recovery state to survive an agent failing halfway.
                </p>
              </section>
              <a href="https://github.com/AbhiPoluri/boardroom" target="_blank" rel="noopener noreferrer">
                Explore the repository <span>↗</span>
              </a>
            </div>
          </div>

          <div className="deep-facts">
            <div className="deep-fact"><strong>145</strong><span>passing tests</span></div>
            <div className="deep-fact"><strong>4</strong><span>agent runtimes</span></div>
            <div className="deep-fact"><strong>30+</strong><span>REST endpoints</span></div>
            <div className="deep-fact"><strong>9</strong><span>MCP tools</span></div>
          </div>
        </div>
      </article>

      <article className="deep-dive-chapter deep-pocketlog" id="pocketlog-case-study">
        <div className="deep-dive-shell shell">
          <header className="deep-dive-heading">
            <div>
              <span className="deep-kicker">PocketLog · consumer finance</span>
              <span className="deep-counter">02 / 03</span>
            </div>
            <h2><SplitTitle>Receipts in. Clarity out.</SplitTitle></h2>
            <p>
              PocketLog removes the tiny decisions that make expense tracking fall apart.
              Scan the thing already in your pocket; the product turns it into useful,
              shared financial context.
            </p>
          </header>

          <dl className="deep-brief">
            <div><dt>My role</dt><dd>Product direction, experience design, application build</dd></div>
            <div><dt>Core loop</dt><dd>Scan receipt, verify extraction, update budget, share the picture</dd></div>
            <div><dt>What shipped</dt><dd>Mobile-first expense tracker with receipt scanning and family budgets</dd></div>
          </dl>

          <div className="deep-dive-layout deep-layout-reversed">
            <section
              className="deep-dive-media pocket-receipt-wrap"
              aria-label="Interactive PocketLog receipt scanner"
            >
              <div className="deep-media-inner"><PocketReceiptMachine /></div>
            </section>

            <div className="deep-dive-copy">
              <section>
                <h3>The behavior problem</h3>
                <p>
                  Budget tools fail when logging costs more attention than the purchase.
                  PocketLog starts from the receipt, then extracts merchant, amount, and
                  category so the useful habit takes one action instead of six.
                </p>
              </section>
              <section>
                <h3>The product loop</h3>
                <p>
                  Capture feeds a live budget, the budget reveals spending patterns, and
                  family sharing turns private bookkeeping into a shared picture. The value
                  arrives immediately, then compounds with every scan.
                </p>
              </section>
              <section>
                <h3>The design judgment</h3>
                <p>
                  AI stays backstage. People see an editable result rather than a chatbot:
                  a faster default, clear confidence, and an obvious place to correct the
                  machine when it guesses wrong.
                </p>
              </section>
              <a href="https://pocket-log.vercel.app" target="_blank" rel="noopener noreferrer">
                Open PocketLog <span>↗</span>
              </a>
            </div>
          </div>

          <div className="deep-facts">
            <div className="deep-fact"><strong>1 scan</strong><span>from paper to entry</span></div>
            <div className="deep-fact"><strong>3 fields</strong><span>filled automatically</span></div>
            <div className="deep-fact"><strong>live</strong><span>budget feedback</span></div>
            <div className="deep-fact"><strong>shared</strong><span>family context</span></div>
          </div>
        </div>
      </article>

      <article className="deep-dive-chapter deep-sql" id="sql-r1-case-study">
        <div className="deep-dive-shell shell">
          <header className="deep-dive-heading">
            <div>
              <span className="deep-kicker">SQL-R1 · model distillation</span>
              <span className="deep-counter">03 / 03</span>
            </div>
            <h2><SplitTitle>The best model was hiding at iteration fifty.</SplitTitle></h2>
            <p>
              A weekend experiment became a lesson in evaluation: more data was not always
              better, DPO actively hurt, and the default final checkpoint concealed the
              strongest result.
            </p>
          </header>

          <dl className="deep-brief">
            <div><dt>My role</dt><dd>Experiment design, trace pipeline, training, evaluation, write-up</dd></div>
            <div><dt>Core stack</dt><dd>Python, MLX-LM, LoRA, DeepSeek-V4-Pro, Qwen2.5-Coder-7B</dd></div>
            <div><dt>Proof standard</dt><dd>200 held-out BIRD questions, deterministic SQL execution match</dd></div>
          </dl>

          <div className="deep-dive-layout">
            <section
              className="deep-dive-media sql-landscape-wrap"
              aria-label="Interactive SQL-R1 checkpoint comparison"
            >
              <div className="deep-media-inner"><SqlTrainingLandscape /></div>
            </section>

            <div className="deep-dive-copy">
              <section>
                <h3>The question</h3>
                <p>
                  Can a seven-billion-parameter local model absorb SQL reasoning from a much
                  stronger teacher cheaply enough to make the experiment reproducible on
                  Apple Silicon?
                </p>
              </section>
              <section>
                <h3>The pipeline</h3>
                <p>
                  DeepSeek-V4-Pro generated traces for BIRD questions. Only execution-correct
                  SQL survived. A rank-16 LoRA adapter trained on 708 accepted traces, then
                  every checkpoint was scored by deterministic execution match.
                </p>
              </section>
              <section>
                <h3>What the failures taught</h3>
                <p>
                  Combining a weaker teacher doubled the data but underperformed. DPO fell to
                  24–27.5%. The winning iteration-50 checkpoint reached 55%; the automatic
                  last save had already overfit back to 49%.
                </p>
              </section>
              <a href="https://github.com/AbhiPoluri/sql-r1" target="_blank" rel="noopener noreferrer">
                Read the experiment log <span>↗</span>
              </a>
            </div>
          </div>

          <div className="deep-facts">
            <div className="deep-fact"><strong>+7.5 pp</strong><span>execution accuracy</span></div>
            <div className="deep-fact"><strong>$5.83</strong><span>teacher-model spend</span></div>
            <div className="deep-fact"><strong>708</strong><span>accepted traces</span></div>
            <div className="deep-fact"><strong>14 h</strong><span>local GPU time</span></div>
          </div>
        </div>
      </article>
    </section>
  );
}
