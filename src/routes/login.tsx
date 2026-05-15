import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

import { toast } from "sonner";
import { CheckSquare, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);

    // Get stored user from signup
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {

      toast.error("No account found");

      setLoading(false);

      return;
    }

    const parsedUser = JSON.parse(storedUser);

    // Check email
    if (parsedUser.email !== email) {

      toast.error("Invalid email");

      setLoading(false);

      return;
    }

    // Save logged in user
    localStorage.setItem(
      "user",
      JSON.stringify(parsedUser)
    );

    // Save role
    localStorage.setItem(
      "role",
      parsedUser.role
    );

    setTimeout(() => {

      setLoading(false);

      toast.success("Welcome back!");

      window.location.href = "/dashboard";

    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">

      <div className="w-full max-w-md">

        <div className="mb-8 flex flex-col items-center text-center">

          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CheckSquare className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Sign in to Tasker
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Coordinate work with your team.
          </p>

        </div>

        <Card className="p-6">

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <div className="space-y-2">

              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@team.com"
              />

            </div>

            <div className="space-y-2">

              <Label htmlFor="password">
                Password
              </Label>

              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >

              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              Sign in

            </Button>

          </form>

        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">

          No account?{" "}

          <Link
            to="/signup"
            className="font-medium text-primary hover:underline"
          >
            Create one
          </Link>

        </p>

      </div>

    </div>
  );
}