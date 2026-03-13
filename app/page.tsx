import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import InfoStrip from "@/components/Marquee";
import Projects from "@/components/Projects";
import Shipped from "@/components/Shipped";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <InfoStrip />
        <Projects />
        <Shipped />
        <About />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
