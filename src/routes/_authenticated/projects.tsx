import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/projects")({
  component: ProjectsPage,
});

type Project = {
  _id: string;
  title: string;
  description: string;
};

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  const role = localStorage.getItem("role");

  // Fetch Projects
  const getProjects = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/projects"
      );

      const data = await res.json();

      setProjects(data);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load projects");
    }
  };

  useEffect(() => {
    getProjects();
  }, []);

  // Create Project
  const createProject = async () => {
    if (!title.trim()) {
      toast.error("Please enter project title");

      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/projects",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title,
            description,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Project creation failed");
      }

      const data = await res.json();

      console.log(data);

      toast.success("Project created successfully");

      // Clear inputs
      setTitle("");
      setDescription("");

      // Refresh projects
      getProjects();
    } catch (error) {
      console.log(error);

      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Projects
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your projects
        </p>
      </div>

      {/* Create Project Form */}
      {role === "admin" && (
        <Card className="mb-6 p-6">
          <div className="flex flex-col gap-4">
            <input
              className="rounded-lg border bg-background p-3 outline-none"
              placeholder="Project title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

            <input
              className="rounded-lg border bg-background p-3 outline-none"
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />

            <Button
              onClick={createProject}
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Project"}
            </Button>
          </div>
        </Card>
      )}

      {/* Project List */}
      <div className="grid gap-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <Card
              key={project._id}
              className="p-5 transition hover:shadow-md"
            >
              <h2 className="mb-2 text-xl font-bold">
                {project.title}
              </h2>

              <p className="text-muted-foreground">
                {project.description}
              </p>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-center text-muted-foreground">
            No projects found
          </Card>
        )}
      </div>
    </div>
  );
}