import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({ orderBy: { created_at: "desc" } });
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[BLOG_GET]", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json({ error: "Title, slug and content are required" }, { status: 400 });
    }

    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt ?? "",
        content: body.content,
        cover_image: body.cover_image ?? "",
        author_name: body.author_name ?? "SKWIRREL Team",
        tags: Array.isArray(body.tags) ? body.tags : [],
        category: body.category || null,
        meta_title: body.meta_title || null,
        meta_desc: body.meta_desc || null,
        is_published: Boolean(body.is_published),
        published_at: body.is_published ? new Date() : null,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[BLOG_POST]", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
