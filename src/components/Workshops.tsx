import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { dataService, Event } from "@/lib/dataService";

const Workshops = () => {
  const [workshops, setWorkshops] = useState<Event[]>([]);

  useEffect(() => {
    setWorkshops(dataService.getEvents());
  }, []);

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
          {workshops.map((workshop) => (
            <Card key={workshop.id} className="hover:shadow-lg transition-shadow">
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

