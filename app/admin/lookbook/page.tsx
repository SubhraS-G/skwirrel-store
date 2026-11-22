import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminLookbookManager } from "@/components/admin/AdminLookbookManager";

export const metadata: Metadata = { title: "Lookbook — Admin" };

export default async function AdminLookbookPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/");

  const images = await prisma.lookbookImage.findMany({ orderBy: { sort_order: "asc" } });

  return (
    <div className="min-h-screen bg-[#080808] flex">
      <AdminSidebar />
      <main className="flex-1 p-8 lg:ml-64">
        <div className="mb-8">
          <h1 className="font-bebas text-4xl text-brand-ivory tracking-wide">LOOKBOOK</h1>
          <p className="text-brand-gray text-sm mt-1">{images.length} images</p>
        </div>
        <AdminLookbookManager initialImages={images} />
      </main>
    </div>
  );
}
