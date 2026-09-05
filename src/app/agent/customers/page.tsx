import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAgentOrganizationId } from "@/lib/current-org";
import { Card, CardContent } from "@/components/ui/card";

export default async function CustomersPage() {
  const { organizationId } = await requireAgentOrganizationId();

  const customers = await prisma.customer.findMany({
    where: { organizationId },
    include: { _count: { select: { bookings: true, quotes: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-ink">Customers</h1>
      <p className="text-sm text-ink-muted">{customers.length} customers in your 360° CRM.</p>

      <Card className="mt-6">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-ink-muted">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Nationality</th>
                <th className="px-5 py-3">Bookings</th>
                <th className="px-5 py-3">Quotes</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">
                    <Link href={`/agent/customers/${c.id}`} className="hover:text-brand-600">
                      {c.fullName}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{c.email ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-muted">{c.nationality ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-muted">{c._count.bookings}</td>
                  <td className="px-5 py-3 text-ink-muted">{c._count.quotes}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-ink-muted">
                    No customers yet.
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
