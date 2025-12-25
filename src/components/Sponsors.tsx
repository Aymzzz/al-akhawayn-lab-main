import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

const sponsors = [
  {
    name: "XRVIVE",
    description: "Leading AR/VR equipment provider supporting the lab with Meta Quest 3 headsets, Magic Leap 2, and immersive technology infrastructure",
    website: "https://xrvive.ma",
    email: "contact@xrvive.ma",
    phone: "0671054242",
    type: "Technology Partner",
  },
  {
    name: "AFRETEC Project",
    description: "Supporting AR/VR initiatives and digital transformation in higher education across Africa and MENA region",
    type: "Research Partnership",
  },
  {
    name: "Curio XR",
    description: "Collaborative partner providing immersive AR/VR platform integration for enhanced teaching, learning, and research",
    type: "Platform Partner",
  },
  {
    name: "GIAC",
    description: "Financial support mechanism providing 1.6 Million MAD annually for faculty development, research projects, and student employability programs",
    type: "Funding Partner",
  },
  {
    name: "ENGIMA",
    description: "Industry experts delivering workshops on 3D scanning, reverse engineering, AR/VR applications, and AI integration",
    type: "Training Partner",
  },
];

const Sponsors = () => {
  return (
    <section id="sponsors" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">Partners & Sponsors</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Collaborating with industry leaders and institutions to advance immersive learning
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {sponsors.map((sponsor, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{sponsor.name}</CardTitle>
                    <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3">
                      {sponsor.type}
                    </div>
                  </div>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  {sponsor.description}
                </CardDescription>
              </CardHeader>
              {(sponsor.website || sponsor.email || sponsor.phone) && (
                <CardContent className="space-y-2">
                  {sponsor.website && (
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{sponsor.website}</span>
                    </a>
                  )}
                  {sponsor.email && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Email:</strong> {sponsor.email}
                    </p>
                  )}
                  {sponsor.phone && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Phone:</strong> {sponsor.phone}
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
