export type ProductMedia = {
  type: "image" | "video";
  url: string;
};

export function getProductMedia(media: unknown): ProductMedia[] {
  if (!Array.isArray(media)) return [];

  return media.flatMap((item) => {
    if (typeof item === "string") return [{ type: "image", url: item }];
    if (!item || typeof item !== "object") return [];

    const value = item as { type?: unknown; url?: unknown };
    if (typeof value.url !== "string") return [];
    return [{ type: value.type === "video" ? "video" : "image", url: value.url }];
  });
}
