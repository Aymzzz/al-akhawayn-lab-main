import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { dataService, Person } from "@/lib/dataService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const Collaborators = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  useEffect(() => {
    const loadPeople = async () => {
      try {
        const data = await dataService.getPeople();
        setPeople(data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      } catch (error) {
        console.error("Failed to load people:", error);
      }
    };
    loadPeople();
  }, []);

  const coreTeam = people.filter((p) => p.type === "core");
  const externalPartners = people.filter((p) => p.type === "external");

  const PersonCard = ({ member }: { member: Person }) => (
    <div
      key={member.id}
      className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted font-normal cursor-pointer transition-colors"
      onClick={() => setSelectedPerson(member)}
    >
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold overflow-hidden">
        {member.image ? (
          <img
            src={member.image}
            alt={member.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = ""; // Clear if error to show fallback
              (e.target as HTMLImageElement).className = "hidden";
            }}
          />
        ) : null}
        <span className={member.image ? "hidden" : ""}>
          {(member.name || "")
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </span>
      </div>
      <div>
        <h4 className="font-medium text-foreground">{member.name}</h4>
        <p className="text-sm text-muted-foreground">{member.role}</p>
      </div>
    </div>
  );

  return (
    <section id="collaborators" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Our Collaborative Network</h2>
          <p className="text-muted-foreground">
            A diverse group of experts, researchers, and students working together
            to push the boundaries of immersive technology.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Core Team
            </h3>
            <div className="space-y-2">
              {coreTeam.map((member) => (
                <PersonCard key={member.id} member={member} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              External Partners
            </h3>
            <div className="space-y-2">
              {externalPartners.map((member) => (
                <PersonCard key={member.id} member={member} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedPerson} onOpenChange={(open) => !open && setSelectedPerson(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold overflow-hidden">
                {selectedPerson?.image ? (
                  <img
                    src={selectedPerson.image}
                    alt={selectedPerson.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (selectedPerson?.name || "")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                )}
              </div>
              <div className="text-center">
                <DialogTitle className="text-2xl font-bold">{selectedPerson?.name}</DialogTitle>
                <p className="text-primary font-medium mt-1">{selectedPerson?.role}</p>
              </div>
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedPerson?.email && (
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <a href={`mailto:${selectedPerson.email}`} className="text-sm font-medium hover:text-primary transition-colors">
                    {selectedPerson.email}
                  </a>
                </div>
              </div>
            )}
            {selectedPerson?.phone && (
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <a href={`tel:${selectedPerson.phone}`} className="text-sm font-medium hover:text-primary transition-colors">
                    {selectedPerson.phone}
                  </a>
                </div>
              </div>
            )}
            <div className="pt-2 text-center">
              <Button variant="outline" className="w-full" onClick={() => setSelectedPerson(null)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Collaborators;
