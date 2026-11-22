import { prisma } from "@/lib/prisma";

export interface Testimonial {
  quote: string;
  author: string;
  context: string;
  rating: number;
}

/**
 * Approved customer reviews for the homepage testimonial rail.
 * Returns [] when the database is unavailable so callers can fall back
 * to curated copy instead of failing the page render.
 */
export async function getApprovedTestimonials(limit = 6): Promise<Testimonial[]> {
  try {
    const reviews = await prisma.review.findMany({
      where: { is_approved: true },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true } },
      },
      orderBy: { created_at: "desc" },
      take: limit,
    });

    return reviews.map((review) => ({
      quote: review.title ? `${review.title}. ${review.body}` : review.body,
      author: review.user.name ?? "Verified Buyer",
      context: review.product?.name ?? "SKWIRREL",
      rating: review.rating,
    }));
  } catch (error) {
    console.warn("Database unavailable, using fallback data:", error);
    return [];
  }
}
