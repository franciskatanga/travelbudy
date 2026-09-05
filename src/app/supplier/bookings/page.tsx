import { prisma } from "@/lib/prisma";
import { requireSupplierId } from "@/lib/current-org";
import { Card, CardContent } from "@/components/ui/card";
import { BookingStatusPill } from "@/components/ui/status-pill";
import { formatMoney } from "@/lib/utils";

export default async function SupplierBookingsPage() {
  const { supplierId } = await requireSupplierId();

  const items = await prisma.bookingItem.findMany({
    where: { product: { supplierId } },
    include: { booking: { include: { customer: true } }, product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-ink">Bookings</h1>
      <p className="text-sm text-ink-muted">{items.length} booking items across your products.</p>

      <Card className="mt-6">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-ink-muted">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">{item.booking.reference}</td>
                  <td className="px-5 py-3 text-ink-muted">{item.booking.customer.fullName}</td>
                  <td className="px-5 py-3 text-ink-muted">{item.product?.title ?? item.description}</td>
                  <td className="px-5 py-3 text-ink-muted">{formatMoney(item.subtotal.toString())}</td>
                  <td className="px-5 py-3">
                    <BookingStatusPill status={item.booking.status} />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-ink-muted">
                    No bookings yet.
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
