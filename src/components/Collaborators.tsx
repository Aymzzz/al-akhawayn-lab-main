import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const teamMembers = [
  { name: "Dr. Hassan Darhmaoui", role: "Project Initiator" },
  { name: "Rachid Lghoul", role: "Project Manager / Coordinator" },
  { name: "Dr. Amine Abouaomar", role: "Research Supervisor" },
  { name: "Dr. Paul Love", role: "Collaborator" },
  { name: "Dr. Said Ennahid", role: "Collaborator" },
  { name: "Ms. Hannen Duprat", role: "Collaborator" },
  { name: "Samir Hajjaji", role: "Collaborator" },
  { name: "Karim Moustagfir", role: "Collaborator" },
];

const externalCollaborators = [
  { name: "Houssam Octave", role: "External Partner" },
  { name: "Aloui Mountasir", role: "External Partner" },
  { name: "Omar Diouri", role: "External Partner" },
  { name: "Yassin EMSI", role: "External Partner" },
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const Collaborators = () => {
  return (
    <section id="collaborators" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">Our Team</h2>
          <p className="text-xl text-muted-foreground">
            Dedicated researchers and educators driving innovation in immersive learning
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Core Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">External Collaborators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {externalCollaborators.map((member, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Collaborators;
