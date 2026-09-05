import { prisma } from "@/lib/prisma";
import { requireAgentOrganizationId } from "@/lib/current-org";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";

export default async function AgentFinancePage() {
  const { organizationId } = await requireAgentOrganizationId();

  const [bookings, commissions] = await Promise.all([
    prisma.booking.findMany({ where: { organizationId } }),
    prisma.commission.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" } }),
  ]);

  const revenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
  const pending = commissions.filter((c) => c.status === "pending").reduce((s, c) => s + Number(c.amount), 0);
  const available = commissions.filter((c) => c.status === "available").reduce((s, c) => s + Number(c.amount), 0);
  const paid = commissions.filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.amount), 0);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-ink">Finance</h1>
      <p className="text-sm text-ink-muted">Revenue and commission earned through your agency.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Revenue" value={formatMoney(revenue)} />
        <KpiCard label="Pending commission" value={formatMoney(pending)} />
        <KpiCard label="Available commission" value={formatMoney(available)} />
        <KpiCard label="Paid commission" value={formatMoney(paid)} />
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Commission history</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase text-ink-muted">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-ink-muted">{c.createdAt.toLocaleDateString()}</td>
                    <td className="px-5 py-3 font-medium text-ink">{formatMoney(c.amount.toString())}</td>
                    <td className="px-5 py-3">
                      <Badge tone={c.status === "paid" ? "success" : c.status === "available" ? "brand" : "warning"}>
                        {c.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {commissions.length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-6 text-center text-ink-muted">No commission earned yet.</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
