import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tasks")({
  component: TasksPage,
});

function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);

  const role = localStorage.getItem("role");

  // Fetch Tasks
  const getTasks = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/tasks"
      );

      const data = await res.json();

      setTasks(data);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  // Add Task
  const addTask = async () => {
    const task = prompt("Enter task name");

    if (!task) return;

    try {
      const res = await fetch(
        "http://localhost:5000/api/tasks",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: task,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Task creation failed");
      }

      toast.success("Task added successfully");

      getTasks();
    } catch (error) {
      console.log(error);

      toast.error("Something went wrong");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            All Tasks
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your tasks
          </p>
        </div>

        {/* Admin Only Button */}
        {role === "admin" && (
          <Button onClick={addTask}>
            New Task
          </Button>
        )}
      </div>

      {/* Task List */}
      <div className="grid gap-4">
        {tasks.length > 0 ? (
          tasks.map((task: any) => (
            <Card
              key={task._id}
              className="p-4 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
  <h2 className="font-semibold">
    {task.title}
  </h2>

  <span className="text-sm text-green-500">
    Pending
  </span>
</div>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-center text-muted-foreground">
            No tasks found
          </Card>
        )}
      </div>
    </div>
  );
}