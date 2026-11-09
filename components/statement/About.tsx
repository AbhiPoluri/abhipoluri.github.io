export default function About() {
  return (
    <section className="st-about st-px" id="about" aria-labelledby="about-title">
      <h2 className="st-big" id="about-title">
        I&apos;m in SFU&apos;s BBA program,{" "}
        <span className="st-dim">concentrating in management information systems.</span>
      </h2>
      <p className="st-mid">
        I started a retail-arbitrage business{" "}
        <span className="st-accent">with no money</span> before I wrote any software, and it turned a
        profit.
      </p>
      <p className="st-facts">
        <span>SFU BBA</span>
        <span>MIS concentration</span>
        <span>Vancouver, BC</span>
        <span>Open to product and tech internships</span>
      </p>
    </section>
  );
}
