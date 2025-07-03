import type { Task } from "@/types/project";

export function filterCompleted(tasks: Task[]) {
  return tasks.filter((t) => t.isCompleted);
}

export function filterIncomplete(tasks: Task[]) {
  return tasks.filter((t) => !t.isCompleted);
}
