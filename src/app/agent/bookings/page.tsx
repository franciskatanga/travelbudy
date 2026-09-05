import { prisma } from "@/lib/prisma";
import { requireAgentOrganizationId } from "@/lib/current-org";
import { Card, CardContent } from "@/components/ui/card";
import { BookingStatusPill } from "@/components/ui/status-pill";
import { formatMoney } from "@/lib/utils";

export default async function AgentBookingsPage() {
  const { organizationId } = await requireAgentOrganizationId();

  const bookings = await prisma.booking.findMany({
    where: { organizationId },
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-ink">Bookings</h1>
      <p className="text-sm text-ink-muted">{bookings.length} bookings managed by your agency.</p>

      <Card className="mt-6">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-ink-muted">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Paid / Total</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">{b.reference}</td>
                  <td className="px-5 py-3 text-ink-muted">{b.customer.fullName}</td>
                  <td className="px-5 py-3 text-ink-muted">{b.items.length}</td>
                  <td className="px-5 py-3 text-ink-muted">
                    {formatMoney(b.paidAmount.toString(), b.currencyCode)} / {formatMoney(b.totalAmount.toString(), b.currencyCode)}
                  </td>
                  <td className="px-5 py-3"><BookingStatusPill status={b.status} /></td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-6 text-center text-ink-muted">No bookings yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
