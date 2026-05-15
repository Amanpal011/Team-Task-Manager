import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/team")({
  component: TeamPage,
});

function TeamPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">
        Team Members
      </h1>

      <div className="mt-6 space-y-4">
        <div className="border p-4 rounded">
          Aman Gupta
        </div>

        <div className="border p-4 rounded">
          Anushka Gupta
        </div>
      </div>
    </div>
  );
}