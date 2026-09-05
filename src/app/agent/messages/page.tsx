import { prisma } from "@/lib/prisma";
import { requireAgentOrganizationId } from "@/lib/current-org";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AgentMessagesPage() {
  const { organizationId } = await requireAgentOrganizationId();

  const memberUserIds = (
    await prisma.organizationMember.findMany({ where: { organizationId }, select: { userId: true } })
  ).map((m) => m.userId);

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: { in: memberUserIds } } } },
    include: { participants: { include: { user: true } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-ink">Messages</h1>
      <p className="text-sm text-ink-muted">Unified inbox across platform chat, WhatsApp, email and SMS.</p>

      <Card className="mt-6">
        <CardContent className="divide-y divide-border p-0">
          {conversations.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-ink">
                  {c.subject ?? c.participants.map((p) => p.user.name).join(", ")}
                </p>
                <p className="text-xs text-ink-muted">{c.messages[0]?.body ?? "No messages yet"}</p>
              </div>
              <Badge tone={c.status === "open" ? "brand" : "neutral"}>{c.channel}</Badge>
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-ink-muted">
              No conversations yet. Messages from customers and suppliers will appear here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
