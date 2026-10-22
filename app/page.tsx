import PlayLayer from "@/components/PlayLayer";
import DeskPlayground from "@/components/DeskPlayground";
import Bar from "@/components/statement/Bar";
import Hero from "@/components/statement/Hero";
import GamesBand from "@/components/statement/GamesBand";
import WorkIndex from "@/components/statement/WorkIndex";
import DeepDives from "@/components/statement/DeepDives";
import About from "@/components/statement/About";
import Contact from "@/components/statement/Contact";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#work">Skip to the work</a>
      <PlayLayer />
      <DeskPlayground />
      <Bar />
      <main>
        <Hero />
        <DeepDives />
        <GamesBand />
        <WorkIndex />
        <About />
        <Contact />
      </main>
    </>
  );
}
