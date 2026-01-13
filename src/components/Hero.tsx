import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image using standard img tag for highest compatibility */}
      <img
        src="/campus.webp"
        alt="AUI Campus"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-60"
      />

      {/* Subtle Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/30 z-[1]" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block mb-4">
            <span className="text-white bg-primary/40 backdrop-blur-md px-4 py-1.5 rounded-full font-bold text-sm uppercase tracking-wider border border-white/10">
              Al Akhawayn University
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white drop-shadow-2xl">
            Immersive Learning Lab
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-xl font-medium">
            Transforming education through AR/VR technologies — where reality meets virtual intelligence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              className="text-lg bg-primary hover:bg-primary/90 text-white border-none shadow-2xl transition-all hover:scale-105"
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Projects
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg bg-white/10 backdrop-blur-md text-white border-white/30 hover:bg-white/20 shadow-xl transition-all hover:scale-105"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
