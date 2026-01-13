import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dataService, Project } from "@/lib/dataService";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await dataService.getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };
    loadProjects();
  }, []);

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
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Badge className="w-fit mb-2">{project.category}</Badge>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription className="text-base">
                  {project.description}
                </CardDescription>
              </CardHeader>
              {(project.students?.length > 0 || project.supervisors?.length > 0) && (
                <CardContent className="space-y-3">
                  {project.students?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Students:</p>
                      <p className="text-sm">{project.students.join(", ")}</p>
                    </div>
                  )}
                  {project.supervisors?.length > 0 && (
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
