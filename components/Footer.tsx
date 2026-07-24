export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-shell">
        <p>© {new Date().getFullYear()} Abhi Poluri</p>
        <div>
          <a href="https://github.com/AbhiPoluri" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          <a href="https://www.linkedin.com/in/abhiram-poluri-306347270/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">Résumé ↗</a>
        </div>
        <a href="#top">Rebuild from the top ↑</a>
      </div>
    </footer>
  );
}
