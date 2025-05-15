export function validateTaskTitle(title: string): string {
  return title.trim() || "New Task";
}
