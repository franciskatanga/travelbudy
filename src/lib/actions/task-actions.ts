"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAgentOrganizationId } from "@/lib/current-org";

const taskSchema = z.object({
  title: z.string().min(2, "Task title is required"),
  dueAt: z.string().optional(),
});

export async function createAgentTask(formData: FormData) {
  const { organizationId, userId } = await requireAgentOrganizationId();

  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    dueAt: formData.get("dueAt") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues.map((i) => i.message).join(", "));

  await prisma.task.create({
    data: {
      organizationId,
      assigneeId: userId,
      title: parsed.data.title,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
    },
  });

  revalidatePath("/agent/tasks");
}

export async function completeAgentTask(taskId: string) {
  await requireAgentOrganizationId();
  await prisma.task.update({ where: { id: taskId }, data: { status: "done" } });
  revalidatePath("/agent/tasks");
}
