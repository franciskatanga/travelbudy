import { prisma } from "@/lib/prisma";
import { requireAgentOrganizationId } from "@/lib/current-org";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";

const PIPELINE_STAGES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "QUOTED",
  "NEGOTIATION",
  "BOOKED",
  "COMPLETED",
  "LOST",
] as const;

export default async function AgentDashboardPage() {
  const { organizationId } = await requireAgentOrganizationId();

  const [bookings, leads, quotes, commissions, leadsByStage] = await Promise.all([
    prisma.booking.findMany({ where: { organizationId }, include: { customer: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.lead.findMany({ where: { organizationId } }),
    prisma.quote.findMany({ where: { organizationId, status: { in: ["draft", "sent"] } } }),
    prisma.commission.findMany({ where: { organizationId } }),
    prisma.lead.groupBy({ by: ["status"], where: { organizationId }, _count: true }),
  ]);

  const revenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
  const pendingCommission = commissions.filter((c) => c.status === "pending").reduce((s, c) => s + Number(c.amount), 0);
  const availableCommission = commissions.filter((c) => c.status === "available").reduce((s, c) => s + Number(c.amount), 0);
  const stageCounts = Object.fromEntries(leadsByStage.map((g) => [g.status, g._count]));

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-ink">Agent Dashboard</h1>
      <p className="text-sm text-ink-muted">Welcome back — here&apos;s what&apos;s happening with your pipeline.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Revenue" value={formatMoney(revenue)} helpText={`${bookings.length} recent bookings`} />
        <KpiCard label="New Leads" value={String(leads.filter((l) => l.status === "NEW").length)} />
        <KpiCard label="Pending Quotes" value={String(quotes.length)} />
        <KpiCard
          label="Commission"
          value={formatMoney(availableCommission)}
          helpText={`${formatMoney(pendingCommission)} pending`}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-ink">Sales pipeline</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 overflow-x-auto sm:grid-cols-4 lg:grid-cols-8">
          {PIPELINE_STAGES.map((stage) => (
            <Card key={stage} className="p-3 text-center">
              <p className="text-xs font-medium text-ink-muted">{stage}</p>
              <p className="mt-1 text-xl font-semibold text-ink">{stageCounts[stage] ?? 0}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase text-ink-muted">
                <tr>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">{b.reference}</td>
                    <td className="px-5 py-3 text-ink-muted">{b.customer.fullName}</td>
                    <td className="px-5 py-3">
                      <Badge tone="success">{b.status.replaceAll("_", " ")}</Badge>
                    </td>
                    <td className="px-5 py-3 text-ink">{formatMoney(b.totalAmount.toString(), b.currencyCode)}</td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-ink-muted">
                      No bookings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
