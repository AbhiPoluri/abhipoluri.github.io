import { deepDives, wandr } from "@/data/statement";
import SkyVideo from "./SkyVideo";

const isExternal = (href: string) => /^https?:/.test(href);

export default function DeepDives() {
  const site = wandr.item.links.find((link) => link.href.includes("wandrapp"));

  return (
    <section className="st-dives st-px" id="case-studies" aria-labelledby="dives-title">
      <h2 className="st-big" id="dives-title">
        My top three. <span className="st-dim">I&apos;d walk you through any of them in an interview.</span>
      </h2>

      <article className="st-feature" aria-labelledby="wandr-title">
        <SkyVideo className="st-feature-sky" src={wandr.sky.video} poster={wandr.sky.poster} />
        <div className="st-feature-shade" aria-hidden="true" />
        <p className="st-feature-kicker">01 · On the App Store since September 2026</p>
        <div className="st-feature-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="st-feature-mark" src={wandr.mark} alt="" width={56} height={56} />
          <h3 className="st-feature-wordmark" id="wandr-title">wandr</h3>
          <p className="st-feature-tagline">
            Find your people. <em>Anywhere.</em>
          </p>
          <p className="st-feature-lede">Put down your dates and see who else booked them.</p>
          <div className="st-feature-links">
            <a className="st-store" href={wandr.appStore} target="_blank" rel="noreferrer">
              Download on the App Store
            </a>
            {site ? (
              <a className="st-site" href={site.href} target="_blank" rel="noreferrer">
                wandrapp.ca
              </a>
            ) : null}
          </div>
        </div>
        <dl className="st-feature-facts">
          {wandr.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </article>

      {deepDives.map(({ item, headline, facts }, index) => (
        <article className={`st-dive${index % 2 ? " is-flipped" : ""}`} key={item.id}>
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image} alt={`${item.name} screenshot`} loading="lazy" />
          ) : (
            <div className="st-dive-blank">{item.name}: no screenshot yet</div>
          )}
          <div>
            <p className="st-kicker">
              {String(index + 2).padStart(2, "0")} · {item.name} · {item.label.toLowerCase()}
            </p>
            <h3 className="st-mid">{headline}</h3>
            <dl>
              {facts.map((fact) => (
                <div key={fact.label} style={{ display: "contents" }}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            <div className="st-card-links">
              {item.links
                .filter((link) => isExternal(link.href))
                .map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                    {link.label} ↗
                  </a>
                ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
