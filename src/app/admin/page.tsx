import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/current-org";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingStatusPill } from "@/components/ui/status-pill";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [bookings, customerCount, agentOrgCount, supplierCount, pendingVerification, disputeCount] = await Promise.all([
    prisma.booking.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.customer.count(),
    prisma.organization.count({ where: { type: "AGENCY" } }),
    prisma.supplier.count(),
    prisma.supplier.count({ where: { verificationStatus: { in: ["SUBMITTED", "UNDER_REVIEW", "INFORMATION_REQUIRED"] } } }),
    prisma.dispute.count({ where: { status: { in: ["open", "investigating", "escalated"] } } }),
  ]);

  const allBookingAmounts = await prisma.booking.aggregate({ _sum: { totalAmount: true } });
  const gmv = Number(allBookingAmounts._sum.totalAmount ?? 0);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-ink">Control Tower</h1>
      <p className="text-sm text-ink-muted">Platform-wide operations at a glance.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="GMV" value={formatMoney(gmv)} />
        <KpiCard label="Bookings" value={String(bookings.length)} />
        <KpiCard label="Customers" value={String(customerCount)} />
        <KpiCard label="Agencies" value={String(agentOrgCount)} />
        <KpiCard label="Suppliers" value={String(supplierCount)} />
        <KpiCard label="Pending verification" value={String(pendingVerification)} />
        <KpiCard label="Open disputes" value={String(disputeCount)} />
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
                    <td className="px-5 py-3"><BookingStatusPill status={b.status} /></td>
                    <td className="px-5 py-3 text-ink">{formatMoney(b.totalAmount.toString(), b.currencyCode)}</td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-6 text-center text-ink-muted">No bookings yet.</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {pendingVerification > 0 && (
        <div className="mt-6">
          <Badge tone="warning">{pendingVerification} supplier(s) awaiting verification review</Badge>
        </div>
      )}
    </div>
  );
}
