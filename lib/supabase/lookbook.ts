import { prisma } from "@/lib/prisma";

export async function getLookbookImages(category?: string) {
  try {
    return await prisma.lookbookImage.findMany({
      where: {
        is_active: true,
        ...(category ? { category } : {}),
      },
      orderBy: { sort_order: "asc" },
    });
  } catch (error) {
    console.warn("Database unavailable, using fallback data:", error);
    return [];
  }
}
