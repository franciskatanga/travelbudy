import { prisma } from "@/lib/prisma";
import { requireSupplierId } from "@/lib/current-org";
import { createSupplierPackage } from "@/lib/actions/supplier-package-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function NewSupplierPackagePage() {
  await requireSupplierId();
  const destinations = await prisma.destination.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-ink">Create a package</h1>
      <p className="text-sm text-ink-muted">Submit your package for marketplace review. Approved packages become visible to travellers and agents.</p>

      <Card className="mt-6 max-w-2xl">
        <CardContent>
          <form action={createSupplierPackage} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-ink">Package title</label>
              <Input name="title" required className="mt-1" placeholder="e.g. South Luangwa Walking Safari — 5 Days" />
            </div>

            <div>
              <label className="text-sm font-medium text-ink">Destination</label>
              <select name="destinationId" className="mt-1 h-11 w-full rounded-md border border-border bg-surface-raised px-3.5 text-sm text-ink">
                <option value="">No specific destination</option>
                {destinations.map((destination) => (
                  <option key={destination.id} value={destination.id}>{destination.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-ink">Short summary</label>
              <Input name="summary" required className="mt-1" placeholder="What makes this experience special?" />
            </div>

            <div>
              <label className="text-sm font-medium text-ink">Description</label>
              <textarea name="description" rows={4} className="mt-1 w-full rounded-md border border-border bg-surface-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500/40" placeholder="Itinerary highlights, inclusions and important details" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-ink">Price (ZMW)</label>
                <Input name="basePrice" type="number" min="0" step="0.01" required className="mt-1" placeholder="2400" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">Duration (days)</label>
                <Input name="durationDays" type="number" min="1" step="1" className="mt-1" placeholder="5" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-ink">Categories</label>
              <Input name="categories" className="mt-1" placeholder="safari, wildlife, adventure" />
            </div>

            <div className="rounded-lg border border-border bg-surface p-4">
              <h2 className="text-sm font-semibold text-ink">Media</h2>
              <p className="mt-1 text-xs text-ink-muted">Add one URL per line. Use hosted image and video URLs.</p>
              <label className="mt-4 block text-sm font-medium text-ink">Image URLs</label>
              <textarea name="imageUrls" rows={3} className="mt-1 w-full rounded-md border border-border bg-surface-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500/40" placeholder="https://cdn.example.com/package-cover.jpg" />
              <label className="mt-4 block text-sm font-medium text-ink">Video URLs</label>
              <textarea name="videoUrls" rows={2} className="mt-1 w-full rounded-md border border-border bg-surface-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500/40" placeholder="https://cdn.example.com/package-preview.mp4" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button href="/supplier/products" variant="outline" type="button">Cancel</Button>
              <Button type="submit">Submit for review</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
