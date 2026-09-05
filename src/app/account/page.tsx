import { prisma } from "@/lib/prisma";
import { requireTravellerCustomer } from "@/lib/current-org";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingStatusPill } from "@/components/ui/status-pill";
import { formatMoney } from "@/lib/utils";

export default async function AccountDashboardPage() {
  const customer = await requireTravellerCustomer();

  const bookings = await prisma.booking.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
  });

  const upcoming = bookings.find((b) => b.status === "CONFIRMED" || b.status === "TRAVEL_IN_PROGRESS");

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-ink">Welcome back, {customer.fullName.split(" ")[0]}</h1>
      <p className="text-sm text-ink-muted">Here&apos;s what&apos;s happening with your travel plans.</p>

      {upcoming && (
        <Card className="mt-6 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Upcoming trip</p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-ink">{upcoming.reference}</p>
              <p className="text-sm text-ink-muted">{formatMoney(upcoming.totalAmount.toString(), upcoming.currencyCode)} total</p>
            </div>
            <BookingStatusPill status={upcoming.status} />
          </div>
        </Card>
      )}

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>All bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-ink">{b.reference}</p>
                  <p className="text-xs text-ink-muted">{formatMoney(b.totalAmount.toString(), b.currencyCode)}</p>
                </div>
                <BookingStatusPill status={b.status} />
              </div>
            ))}
            {bookings.length === 0 && <p className="text-sm text-ink-muted">No bookings yet — start exploring the marketplace.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
