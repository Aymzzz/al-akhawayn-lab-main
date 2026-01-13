import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Blur/Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/image/DSC09808.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.6)'
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-background/20 to-primary/5 z-1 opacity-80"></div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block mb-4">
            <span className="text-white bg-primary/20 backdrop-blur-sm px-3 py-1 rounded-full font-bold text-sm uppercase tracking-wider">
              Al Akhawayn University
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white drop-shadow-lg">
            Immersive Learning Lab
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
            Transforming education through AR/VR technologies — where reality meets virtual intelligence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              className="text-lg bg-primary hover:bg-primary/90 text-white border-none shadow-xl"
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Projects
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20 shadow-lg"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
