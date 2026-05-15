import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, ListChecks, Trash2, Pencil } from "lucide-react";
import { PriorityBadge, StatusBadge, type Priority, type Status } from "@/components/badges";
import { toast } from "sonner";
import { format, isPast, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  due_date: string | null;
  assignee_id: string | null;
  created_by: string;
  created_at: string;
};

export function TaskList({ projectId }: { projectId?: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", projectId ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("tasks")
        .select("*, projects(name, color), assignee:profiles!tasks_assignee_id_fkey_profiles(id, full_name, email)")
        .order("created_at", { ascending: false });
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: projects } = useQuery({
    queryKey: ["projects-lite"],
    queryFn: async () => (await supabase.from("projects").select("id, name")).data ?? [],
  });

  const { data: members } = useQuery({
    queryKey: ["members-lite"],
    queryFn: async () => (await supabase.from("profiles").select("id, full_name, email")).data ?? [],
  });

  const upsertMut = useMutation({
    mutationFn: async (input: Partial<Task> & { title: string; project_id: string }) => {
      if (!user) throw new Error("Not authenticated");
      if (editing) {
        const { error } = await supabase.from("tasks").update({
          title: input.title,
          description: input.description ?? null,
          status: input.status,
          priority: input.priority,
          due_date: input.due_date || null,
          assignee_id: input.assignee_id || null,
          project_id: input.project_id,
        }).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tasks").insert({
          title: input.title,
          description: input.description ?? null,
          status: input.status ?? "todo",
          priority: input.priority ?? "medium",
          due_date: input.due_date || null,
          assignee_id: input.assignee_id || null,
          project_id: input.project_id,
          created_by: user.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Task updated" : "Task created");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setOpen(false);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task deleted");
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const quickStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (tasks ?? []).filter((t) => statusFilter === "all" || t.status === statusFilter);

  const canCreate = !!projects && projects.length > 0;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="todo">To do</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button disabled={!canCreate} title={canCreate ? "" : "Create a project first"}>
                <Plus className="mr-1.5 h-4 w-4" /> New task
              </Button>
            </DialogTrigger>
            <TaskFormDialog
              key={editing?.id ?? "new"}
              initial={editing}
              defaultProjectId={projectId}
              projects={projects ?? []}
              members={members ?? []}
              loading={upsertMut.isPending}
              onSubmit={(v) => upsertMut.mutate(v)}
            />
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <ListChecks className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No tasks</p>
          <p className="text-sm text-muted-foreground">{canCreate ? "Create your first task to get started." : "Create a project first."}</p>
        </Card>
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {filtered.map((t) => {
            const overdue = t.due_date && t.status !== "done" && isPast(parseISO(t.due_date));
            return (
              <div key={t.id} className="flex flex-wrap items-center gap-3 p-4 transition hover:bg-muted/40">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={cn("font-medium", t.status === "done" && "text-muted-foreground line-through")}>{t.title}</p>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {!projectId && t.projects?.name && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.projects.color }} />
                        {t.projects.name}
                      </span>
                    )}
                    {t.assignee && (
                      <span>{t.assignee.full_name ?? t.assignee.email}</span>
                    )}
                    {t.due_date && (
                      <span className={cn(overdue && "font-medium text-destructive")}>
                        Due {format(parseISO(t.due_date), "MMM d")}
                      </span>
                    )}
                  </div>
                </div>
                <Select value={t.status} onValueChange={(v) => quickStatus.mutate({ id: t.id, status: v as Status })}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To do</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => { setEditing(t as Task); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { if (confirm("Delete this task?")) deleteMut.mutate(t.id); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );

  void StatusBadge;
}

function TaskFormDialog({
  initial,
  defaultProjectId,
  projects,
  members,
  loading,
  onSubmit,
}: {
  initial: Task | null;
  defaultProjectId?: string;
  projects: { id: string; name: string }[];
  members: { id: string; full_name: string | null; email: string | null }[];
  loading: boolean;
  onSubmit: (v: Partial<Task> & { title: string; project_id: string }) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [projectIdState, setProjectIdState] = useState(initial?.project_id ?? defaultProjectId ?? projects[0]?.id ?? "");
  const [status, setStatus] = useState<Status>(initial?.status ?? "todo");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(initial?.due_date ?? "");
  const [assignee, setAssignee] = useState(initial?.assignee_id ?? "");

  const handle = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectIdState) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      project_id: projectIdState,
      status,
      priority,
      due_date: dueDate || null,
      assignee_id: assignee || null,
    });
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>{initial ? "Edit task" : "New task"}</DialogTitle></DialogHeader>
      <form onSubmit={handle} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ttitle">Title</Label>
          <Input id="ttitle" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ship onboarding flow" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tdesc">Description</Label>
          <Textarea id="tdesc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={projectIdState} onValueChange={setProjectIdState}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select value={assignee || "unassigned"} onValueChange={(v) => setAssignee(v === "unassigned" ? "" : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.full_name ?? m.email}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To do</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="due">Due date</Label>
            <Input id="due" type="date" value={dueDate ?? ""} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initial ? "Save changes" : "Create task"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
