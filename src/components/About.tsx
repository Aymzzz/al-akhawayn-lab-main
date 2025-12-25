import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">What is it?</h2>
            <p className="text-xl text-muted-foreground">
              Pioneering the future of education through immersive technology
            </p>
          </div>

          <Card className="border-2">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-primary">Vision</h3>
                <p className="text-lg leading-relaxed">
                  "To become a leading university in immersive learning and innovation, leveraging AR/VR 
                  technologies to transform education, research, and community engagement."
                </p>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-2xl font-bold text-primary">Mission</h3>
                <ul className="space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Enhance Learning:</strong> Provide students with interactive, experiential learning opportunities beyond traditional classrooms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Empower Faculty:</strong> Equip educators with cutting-edge AR/VR tools for teaching, research, and collaboration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Promote Equity & Access:</strong> Ensure all students have access to immersive learning experiences</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Strengthen Industry Links:</strong> Collaborate with partners to integrate real-world AR/VR applications</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Drive Innovation:</strong> Foster creativity, entrepreneurship, and applied research through immersive technologies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Support Lifelong Learning:</strong> Extend AR/VR opportunities to alumni, professionals, and the wider community</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default About;
