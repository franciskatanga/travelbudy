import { prisma } from "@/lib/prisma";
import { requireAgentOrganizationId } from "@/lib/current-org";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

export default async function LeadsPage() {
  const { organizationId } = await requireAgentOrganizationId();

  const leads = await prisma.lead.findMany({
    where: { organizationId },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Leads</h1>
          <p className="text-sm text-ink-muted">{leads.length} leads in your agency CRM.</p>
        </div>
        <Button size="sm">New lead</Button>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-ink-muted">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Destination</th>
                <th className="px-5 py-3">Travellers</th>
                <th className="px-5 py-3">Budget</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">{lead.name}</td>
                  <td className="px-5 py-3 text-ink-muted">{lead.destination ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-muted">{lead.travellerCount ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-muted">
                    {lead.budget ? formatMoney(lead.budget.toString()) : "—"}
                  </td>
                  <td className="px-5 py-3 text-ink-muted capitalize">{lead.source ?? "—"}</td>
                  <td className="px-5 py-3">
                    <Badge tone="brand">{lead.status.replaceAll("_", " ")}</Badge>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-ink-muted">
                    No leads yet — create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
