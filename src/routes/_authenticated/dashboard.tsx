import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

import {
  FolderKanban,
  ListChecks,
  Clock,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {

  const role = localStorage.getItem("role");

  const stats = [
    {
      label: "Projects",
      value: 4,
      icon: FolderKanban,
      link: "/projects",
    },

    {
      label: "Tasks",
      value: 18,
      icon: ListChecks,
      link: "/tasks",
    },

    {
      label: "In Progress",
      value: 6,
      icon: Clock,
      link: "/tasks",
    },

    {
      label: "Completed",
      value: 12,
      icon: CheckCircle2,
      link: "/tasks",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="mt-2 text-muted-foreground">
          Welcome {role === "admin" ? "Admin" : "Member"} 🚀
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        {stats.map((item) => (
          <Link
            key={item.label}
            to={item.link}
          >
            <Card className="cursor-pointer p-5 transition-all hover:scale-[1.02] hover:shadow-lg">

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {item.label}
                </p>

                <item.icon className="h-5 w-5 text-primary" />
              </div>

              <h2 className="mt-4 text-3xl font-bold">
                {item.value}
              </h2>

            </Card>
          </Link>
        ))}

      </div>

      {/* Bottom Section */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        {/* Recent Projects */}
        <Card className="p-5">

          <div className="mb-4 flex items-center justify-between">

            <h2 className="text-xl font-semibold">
              Recent Projects
            </h2>

            <Link
              to="/projects"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>

          </div>

          <ul className="space-y-3">

            <li className="rounded-lg border p-3 transition hover:bg-muted">
              E-Commerce Website
            </li>

            <li className="rounded-lg border p-3 transition hover:bg-muted">
              College ERP System
            </li>

            <li className="rounded-lg border p-3 transition hover:bg-muted">
              AI Resume Analyzer
            </li>

          </ul>

        </Card>

        {/* Active Tasks */}
        <Card className="p-5">

          <div className="mb-4 flex items-center justify-between">

            <h2 className="text-xl font-semibold">
              Active Tasks
            </h2>

            <Link
              to="/tasks"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>

          </div>

          <ul className="space-y-3">

            <li className="rounded-lg border p-3 transition hover:bg-muted">
              Design dashboard UI
            </li>

            <li className="rounded-lg border p-3 transition hover:bg-muted">
              Add authentication
            </li>

            <li className="rounded-lg border p-3 transition hover:bg-muted">
              Deploy on Railway
            </li>

          </ul>

        </Card>

      </div>

      {/* Admin Controls */}
      {role === "admin" && (

        <Card className="mt-8 p-5">

          <h2 className="mb-4 text-xl font-semibold">
            Admin Controls
          </h2>

          <div className="grid gap-3 md:grid-cols-3">

            <div className="rounded-lg border p-4">
              Manage Users
            </div>

            <div className="rounded-lg border p-4">
              Assign Tasks
            </div>

            <div className="rounded-lg border p-4">
              Track Team Progress
            </div>

          </div>

        </Card>

      )}

    </div>
  );
}