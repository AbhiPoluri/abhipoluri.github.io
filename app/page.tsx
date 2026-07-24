import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import PlayLayer from "@/components/PlayLayer";
import DeskPlayground from "@/components/DeskPlayground";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#work">Skip to selected work</a>
      <PlayLayer />
      <DeskPlayground />
      <Nav />
      <main className="site-main">
        <Hero />
        <Projects />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
