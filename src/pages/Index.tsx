import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Collaborators from "@/components/Collaborators";
import Workshops from "@/components/Workshops";
import Sponsors from "@/components/Sponsors";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <About />
      <Projects />
      <Collaborators />
      <Workshops />
      <Sponsors />
      <Footer />
    </div>
  );
};

export default Index;
