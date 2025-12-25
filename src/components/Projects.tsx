import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const projects = [
  {
    title: "AI-Driven AR Textbooks",
    description: "Revolutionary integration of AI and AR in education using knowledge graphs and generative AI to create adaptive learning experiences.",
    category: "Education Technology",
    students: ["Imane Guessous"],
    supervisors: ["Dr. Amine Abouaomar", "Rachid Lghoul"],
  },
  {
    title: "AI-Powered AR Tutoring System",
    description: "Adaptive learning system for primary education combining augmented reality with personalized AI tutoring.",
    category: "Adaptive Learning",
    students: ["Aymane Sbai"],
    supervisors: ["Dr. Amine Abouaomar", "Rachid Lghoul"],
  },
  {
    title: "VR-Based Robotic Manipulation",
    description: "VR simulation and control system for robotic manipulators, enabling training and design validation in virtual environments.",
    category: "Robotics & Engineering",
    students: ["Ahlam Mousa"],
    supervisors: ["Rachid Lghoul"],
  },
  {
    title: "Immersive Supply Chain Learning",
    description: "Digital twin implementation of water distribution game using AR/VR to teach complex supply chain concepts through gamification.",
    category: "Business & Logistics",
    students: ["Souhail El Bidaoui"],
    supervisors: ["Rachid Lghoul"],
  },
  {
    title: "AR Education for Engineering Labs",
    description: "Integration of augmented reality into engineering curriculum and laboratory experiences at SSE.",
    category: "Engineering Education",
    students: ["Oumaima Elhazzat", "Hassan Amharech"],
    supervisors: ["Dr. Hassan Darhmaoui", "Rachid Lghoul"],
  },
  {
    title: "Mixed Reality Factory Layout",
    description: "MATLAB-based MR application for overlaying virtual 3D objects on real-world scenes for Industry 4.0 factory planning.",
    category: "Industry 4.0",
    students: [],
    supervisors: [],
  },
];

const Projects = () => {
  return (
    <section id="projects" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">Research Projects</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cutting-edge research combining AR/VR with AI, robotics, and education
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Badge className="w-fit mb-2">{project.category}</Badge>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription className="text-base">
                  {project.description}
                </CardDescription>
              </CardHeader>
              {(project.students.length > 0 || project.supervisors.length > 0) && (
                <CardContent className="space-y-3">
                  {project.students.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Students:</p>
                      <p className="text-sm">{project.students.join(", ")}</p>
                    </div>
                  )}
                  {project.supervisors.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Supervisors:</p>
                      <p className="text-sm">{project.supervisors.join(", ")}</p>
                    </div>
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

export default Projects;
