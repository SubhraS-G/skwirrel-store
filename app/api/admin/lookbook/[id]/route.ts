import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return null;
  return session;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json();
    const image = await prisma.lookbookImage.update({ where: { id }, data: body });
    return NextResponse.json({ image });
  } catch (error) {
    console.error("[LOOKBOOK_PATCH]", error);
    return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    await prisma.lookbookImage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[LOOKBOOK_DELETE]", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
