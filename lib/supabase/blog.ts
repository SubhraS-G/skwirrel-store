import { prisma } from "@/lib/prisma";

async function withDbFallback<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.warn("Database unavailable, using fallback data:", error);
    return fallback;
  }
}

export async function getBlogPosts(limit = 12) {
  return withDbFallback(
    () =>
      prisma.blogPost.findMany({
        where: { is_published: true },
        orderBy: { published_at: "desc" },
        take: limit,
      }),
    []
  );
}

export async function getBlogPostBySlug(slug: string) {
  return withDbFallback(() => prisma.blogPost.findUnique({ where: { slug } }), null);
}

export async function getRelatedPosts(postId: string, tags: string[]) {
  return withDbFallback(
    () =>
      prisma.blogPost.findMany({
        where: {
          id: { not: postId },
          is_published: true,
          tags: { hasSome: tags },
        },
        take: 3,
        orderBy: { published_at: "desc" },
      }),
    []
  );
}
