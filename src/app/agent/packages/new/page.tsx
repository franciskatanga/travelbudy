import { prisma } from "@/lib/prisma";
import { requireAgentOrganizationId } from "@/lib/current-org";
import { createAgentPackage } from "@/lib/actions/package-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function NewAgentPackagePage() {
  await requireAgentOrganizationId();
  const destinations = await prisma.destination.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-ink">Post a package</h1>
      <p className="text-sm text-ink-muted">Publish a curated package directly to the marketplace under your agency.</p>

      <Card className="mt-6 max-w-2xl">
        <CardContent>
          <form action={createAgentPackage} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-ink">Title</label>
              <Input name="title" required className="mt-1" placeholder="e.g. Victoria Falls Family Adventure — 4 Days" />
            </div>

            <div>
              <label className="text-sm font-medium text-ink">Destination</label>
              <select
                name="destinationId"
                className="mt-1 h-11 w-full rounded-md border border-border bg-surface-raised px-3.5 text-sm text-ink"
              >
                <option value="">No specific destination</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-ink">Short summary</label>
              <Input name="summary" required className="mt-1" placeholder="One-line description shown on cards" />
            </div>

            <div>
              <label className="text-sm font-medium text-ink">Full description</label>
              <textarea
                name="description"
                rows={4}
                className="mt-1 w-full rounded-md border border-border bg-surface-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                placeholder="Itinerary highlights, inclusions, what makes this trip special..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-ink">Price (ZMW)</label>
                <Input name="basePrice" type="number" min="0" step="0.01" required className="mt-1" placeholder="1850" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">Duration (days)</label>
                <Input name="durationDays" type="number" min="1" step="1" className="mt-1" placeholder="4" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-ink">Categories</label>
              <Input name="categories" className="mt-1" placeholder="safari, luxury, honeymoon (comma-separated)" />
            </div>

            <div className="rounded-lg border border-border bg-surface p-4">
              <h2 className="text-sm font-semibold text-ink">Media</h2>
              <p className="mt-1 text-xs text-ink-muted">Add one URL per line. Images appear in package cards; videos appear in the package gallery.</p>
              <label className="mt-4 block text-sm font-medium text-ink">Image URLs</label>
              <textarea
                name="imageUrls"
                rows={3}
                className="mt-1 w-full rounded-md border border-border bg-surface-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                placeholder="https://cdn.example.com/safari-cover.jpg"
              />
              <label className="mt-4 block text-sm font-medium text-ink">Video URLs</label>
              <textarea
                name="videoUrls"
                rows={2}
                className="mt-1 w-full rounded-md border border-border bg-surface-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                placeholder="https://cdn.example.com/safari-preview.mp4"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button href="/agent/packages" variant="outline" type="button">Cancel</Button>
              <Button type="submit">Publish package</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
