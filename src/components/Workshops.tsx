import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const workshops = [
  {
    title: "AR/VR MEETUP",
    description: "Augmented Reality Education for Engineering Labs - Introducing AR/VR to SSE Engineering Curriculum",
    date: "January 22-23, 2023",
    location: "New Cairo, Egypt",
    type: "International Conference",
  },
  {
    title: "Immersive Technologies: AR/VR Foundations",
    description: "Special Topics course covering AR/VR fundamentals for engineering students",
    date: "Fall 2025",
    location: "Al Akhawayn University",
    type: "Special Topics Course",
    schedule: "Tuesday 7:30 PM - 8:50 PM",
  },
  {
    title: "3D Scanning & Reverse Engineering Workshop",
    description: "From Reality to Virtual Intelligence: 3D Scanning, Reverse Engineering, AR/VR, and AI Integration by ENGIMA Experts",
    date: "TBA 2025",
    location: "SSE, Al Akhawayn University",
    type: "Industry Workshop",
  },
  {
    title: "Invisible Festival Brussels",
    description: "EMSI Casablanca students represented Morocco with a pioneering project merging AI, history, and immersive technology",
    date: "April 5, 2025",
    location: "Brussels, Belgium",
    type: "Student Showcase",
  },
  {
    title: "Mixed Reality MATLAB Workshop",
    description: "Hands-on training for Mixed Reality Object Placement for Factory Layout using MATLAB",
    date: "Academic Year 2025-2026",
    location: "Engineering Lab, AUI",
    type: "Technical Workshop",
  },
];

const Workshops = () => {
  return (
    <section id="workshops" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">Workshops & Events</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hands-on training, conferences, and collaborative events advancing immersive learning
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {workshops.map((workshop, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <Badge className="mb-2">{workshop.type}</Badge>
                    <CardTitle className="text-2xl mb-2">{workshop.title}</CardTitle>
                    <CardDescription className="text-base">
                      {workshop.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{workshop.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{workshop.location}</span>
                  </div>
                </div>
                {workshop.schedule && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Schedule: {workshop.schedule}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Workshops;
