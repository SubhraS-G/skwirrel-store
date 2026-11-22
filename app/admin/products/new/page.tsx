import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "New Product — Admin" };

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/");

  const categories = await prisma.category.findMany({ orderBy: { sort_order: "asc" } });

  return (
    <div className="min-h-screen bg-[#080808] flex">
      <AdminSidebar />
      <main className="flex-1 p-8 lg:ml-64 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-bebas text-4xl text-brand-ivory tracking-wide">NEW PRODUCT</h1>
          <p className="text-brand-gray text-sm mt-1">Add a piece to the catalogue</p>
        </div>
        <ProductForm categories={categories} />
      </main>
    </div>
  );
}
