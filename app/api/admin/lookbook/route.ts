import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const images = await prisma.lookbookImage.findMany({ orderBy: { sort_order: "asc" } });
    return NextResponse.json({ images });
  } catch (error) {
    console.error("[LOOKBOOK_GET]", error);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    if (!body.url) return NextResponse.json({ error: "Image URL is required" }, { status: 400 });

    const image = await prisma.lookbookImage.create({
      data: {
        url: body.url,
        alt: body.alt || null,
        category: body.category || null,
        sort_order: Number(body.sort_order) || 0,
        is_active: body.is_active !== false,
      },
    });
    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    console.error("[LOOKBOOK_POST]", error);
    return NextResponse.json({ error: "Failed to create image" }, { status: 500 });
  }
}
