"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAgentOrganizationId } from "@/lib/current-org";
import { getOrCreateAgencySupplier } from "@/lib/agency-supplier";

const packageSchema = z.object({
  title: z.string().min(3, "Title is too short"),
  destinationId: z.string().optional(),
  summary: z.string().min(10, "Add a short summary"),
  description: z.string().optional(),
  basePrice: z.coerce.number().positive("Price must be greater than 0"),
  durationDays: z.coerce.number().int().positive().optional(),
  categories: z.string().optional(),
  imageUrls: z.string().optional(),
  videoUrls: z.string().optional(),
});

export async function createAgentPackage(formData: FormData) {
  const { organizationId } = await requireAgentOrganizationId();

  const parsed = packageSchema.safeParse({
    title: formData.get("title"),
    destinationId: formData.get("destinationId") || undefined,
    summary: formData.get("summary"),
    description: formData.get("description") || undefined,
    basePrice: formData.get("basePrice"),
    durationDays: formData.get("durationDays") || undefined,
    categories: formData.get("categories") || undefined,
    imageUrls: formData.get("imageUrls") || undefined,
    videoUrls: formData.get("videoUrls") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const mediaUrls = [parsed.data.imageUrls, parsed.data.videoUrls]
    .filter(Boolean)
    .flatMap((value) => (value ?? "").split(/\r?\n|,/).map((url) => url.trim()).filter(Boolean));
  if (mediaUrls.some((url) => !URL.canParse(url))) {
    throw new Error("Every image and video link must be a valid URL");
  }

  const supplier = await getOrCreateAgencySupplier(organizationId);
  const data = parsed.data;
  const media = [
    ...(data.imageUrls ?? "").split(/\r?\n|,/).map((url) => url.trim()).filter(Boolean).map((url) => ({ type: "image", url })),
    ...(data.videoUrls ?? "").split(/\r?\n|,/).map((url) => url.trim()).filter(Boolean).map((url) => ({ type: "video", url })),
  ];
  const slug = `${data.title}-${Date.now()}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  await prisma.product.create({
    data: {
      supplierId: supplier.id,
      destinationId: data.destinationId || null,
      type: "PACKAGE",
      title: data.title,
      slug,
      summary: data.summary,
      description: data.description,
      categories: data.categories ? data.categories.split(",").map((c) => c.trim().toLowerCase()) : [],
      media,
      basePrice: data.basePrice,
      durationDays: data.durationDays,
      status: "PUBLISHED",
    },
  });

  revalidatePath("/agent/packages");
  redirect("/agent/packages");
}
