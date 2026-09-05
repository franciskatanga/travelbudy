import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/current-org";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminTravellersPage() {
  await requireAdmin();

  const customers = await prisma.customer.findMany({
    include: { _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-ink">Travellers</h1>
      <p className="text-sm text-ink-muted">{customers.length} traveller records.</p>

      <Card className="mt-6">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-ink-muted">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Nationality</th>
                <th className="px-5 py-3">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">{c.fullName}</td>
                  <td className="px-5 py-3 text-ink-muted">{c.email ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-muted">{c.nationality ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-muted">{c._count.bookings}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-ink-muted">No travellers yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
