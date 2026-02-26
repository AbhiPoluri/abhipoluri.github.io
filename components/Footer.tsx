export default function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 px-6 py-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-zinc-600">
          © {new Date().getFullYear()} Abhi Poluri — Built with Next.js & Tailwind CSS.
        </p>
        <div className="flex gap-6">
          <a href="https://www.linkedin.com/in/abhiram-poluri-306347270/" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors">LinkedIn</a>
          <a href="https://github.com/AbhiPoluri" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors">GitHub</a>
          <a href="mailto:abhiram.poluri@gmail.com" className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors">Email</a>
        </div>
      </div>
    </footer>
  );
}
