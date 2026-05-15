import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

export type Priority = Database["public"]["Enums"]["task_priority"];
export type Status = Database["public"]["Enums"]["task_status"];

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    low: "bg-priority-low/15 text-priority-low border-priority-low/30",
    medium: "bg-priority-medium/15 text-priority-medium border-priority-medium/30",
    high: "bg-priority-high/15 text-priority-high border-priority-high/30",
    urgent: "bg-priority-urgent/15 text-priority-urgent border-priority-urgent/40",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize", map[priority])}>
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; cls: string }> = {
    todo: { label: "To do", cls: "bg-muted text-muted-foreground border-border" },
    in_progress: { label: "In progress", cls: "bg-primary/15 text-primary border-primary/30" },
    done: { label: "Done", cls: "bg-success/15 text-success border-success/30" },
  };
  const { label, cls } = map[status];
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", cls)}>
      {label}
    </span>
  );
}
