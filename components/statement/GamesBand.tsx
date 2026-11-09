import { games, playableGames } from "@/data/statement";
import type { WorkItem } from "@/data/work";

const byId = (id: string): WorkItem | undefined => games.find((item) => item.id === id);

export default function GamesBand() {
  const oddlings = byId("oddlings-studio");
  const fly = byId("fly-balatro");

  return (
    <section className="st-band st-px" id="games" aria-labelledby="games-title">
      <h2 className="st-big" id="games-title">
        I build games in Godot. <span className="st-dim">You can download both from itch.io.</span>
      </h2>
      <div className="st-duo">
        {playableGames.map((item, index) => {
          const link = item.links[0];
          return (
            <figure key={item.id}>
              {link ? (
                <a
                  className={`st-tag${index % 2 ? " is-white" : ""}`}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label} ↗
                </a>
              ) : null}
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={`${item.name} title screen`} />
              ) : null}
              <figcaption>
                <b>{item.name}</b>
                {item.tagline}
              </figcaption>
            </figure>
          );
        })}
      </div>
      <p className="st-mid st-after">
        I made their 3D assets in Oddlings Studio{" "}
        {oddlings?.image ? (
          <a className="st-chip" href={oddlings.links[0]?.href} target="_blank" rel="noreferrer" aria-label="Oddlings Studio repository">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={oddlings.image} alt="" />
          </a>
        ) : null}
        , a pipeline I wrote to review generated art the way I review code.{" "}
        <span className="st-dim">
          I also wired a fruit fly&apos;s connectome into Balatro{" "}
          {fly?.image ? (
            <a className="st-chip" href={fly.links[0]?.href} target="_blank" rel="noreferrer" aria-label="fly-balatro repository">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fly.image} alt="" />
            </a>
          ) : null}
          , and it never beat the shuffled control.
        </span>
      </p>
    </section>
  );
}
