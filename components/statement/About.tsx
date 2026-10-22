export default function About() {
  return (
    <section className="st-about st-px" id="about" aria-labelledby="about-title">
      <h2 className="st-big" id="about-title">
        I&apos;m in SFU&apos;s BBA program,{" "}
        <span className="st-dim">concentrating in management information systems.</span>
      </h2>
      <p className="st-mid" style={{ marginTop: 40, maxWidth: 1100 }}>
        Before I wrote any software, I started a retail-arbitrage business{" "}
        <span className="st-accent">with no money</span>. It turned a profit.
      </p>
      <div className="st-facts">
        <span>SFU BBA</span>
        <span>MIS concentration</span>
        <span>Vancouver, BC</span>
        <span>Looking for product &amp; tech internships</span>
      </div>
    </section>
  );
}
