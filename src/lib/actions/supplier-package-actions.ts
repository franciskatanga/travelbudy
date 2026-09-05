"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSupplierId } from "@/lib/current-org";

const supplierPackageSchema = z.object({
  title: z.string().trim().min(3, "Title is too short"),
  destinationId: z.string().optional(),
  summary: z.string().trim().min(10, "Add a short summary"),
  description: z.string().optional(),
  basePrice: z.coerce.number().positive("Price must be greater than 0"),
  durationDays: z.coerce.number().int().positive().optional(),
  categories: z.string().optional(),
  imageUrls: z.string().optional(),
  videoUrls: z.string().optional(),
});

function splitUrls(value: string | undefined) {
  return (value ?? "").split(/\r?\n|,/).map((url) => url.trim()).filter(Boolean);
}

export async function createSupplierPackage(formData: FormData) {
  const { supplierId } = await requireSupplierId();
  const parsed = supplierPackageSchema.safeParse({
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
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }

  const imageUrls = splitUrls(parsed.data.imageUrls);
  const videoUrls = splitUrls(parsed.data.videoUrls);
  if ([...imageUrls, ...videoUrls].some((url) => !URL.canParse(url))) {
    throw new Error("Every image and video link must be a valid URL");
  }

  const slug = `${parsed.data.title}-${Date.now()}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  await prisma.product.create({
    data: {
      supplierId,
      destinationId: parsed.data.destinationId || null,
      type: "PACKAGE",
      title: parsed.data.title,
      slug,
      summary: parsed.data.summary,
      description: parsed.data.description,
      categories: splitUrls(parsed.data.categories).map((category) => category.toLowerCase()),
      media: [
        ...imageUrls.map((url) => ({ type: "image", url })),
        ...videoUrls.map((url) => ({ type: "video", url })),
      ],
      basePrice: parsed.data.basePrice,
      durationDays: parsed.data.durationDays,
      status: "IN_REVIEW",
    },
  });

  revalidatePath("/supplier/products");
  revalidatePath("/supplier/packages");
  redirect("/supplier/products");
}
