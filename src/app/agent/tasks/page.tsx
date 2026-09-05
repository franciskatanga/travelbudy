import { prisma } from "@/lib/prisma";
import { requireAgentOrganizationId } from "@/lib/current-org";
import { createAgentTask, completeAgentTask } from "@/lib/actions/task-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AgentTasksPage() {
  const { organizationId } = await requireAgentOrganizationId();

  const tasks = await prisma.task.findMany({
    where: { organizationId },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }],
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-ink">Tasks</h1>
      <p className="text-sm text-ink-muted">Follow-ups and reminders for your pipeline.</p>

      <Card className="mt-6 max-w-xl">
        <CardContent>
          <form action={createAgentTask} className="flex gap-2">
            <Input name="title" required placeholder="e.g. Follow up with Sarah about deposit" />
            <input type="date" name="dueAt" className="h-11 rounded-md border border-border px-3 text-sm" />
            <Button type="submit" size="sm">Add</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="divide-y divide-border p-0">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className={`text-sm font-medium ${t.status === "done" ? "text-ink-muted line-through" : "text-ink"}`}>
                  {t.title}
                </p>
                {t.dueAt && <p className="text-xs text-ink-muted">Due {t.dueAt.toLocaleDateString()}</p>}
              </div>
              {t.status === "done" ? (
                <Badge tone="success">Done</Badge>
              ) : (
                <form action={completeAgentTask.bind(null, t.id)}>
                  <Button type="submit" size="sm" variant="outline">Mark done</Button>
                </form>
              )}
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-ink-muted">No tasks yet — add your first one above.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
