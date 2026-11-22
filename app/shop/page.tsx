import { Metadata } from "next";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ShopSearch } from "@/components/shop/ShopSearch";
import { getProducts } from "@/lib/supabase/products";

export const metadata: Metadata = {
  title: "Shop — Premium Cultural Streetwear",
  description:
    "Browse SKWIRREL's full collection of premium streetwear inspired by Odisha's rich culture.",
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    color?: string;
    size?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    q?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams;
  const { products, total, pages } = await getProducts({
    category: resolvedSearchParams.category,
    sort: resolvedSearchParams.sort ?? "newest",
    color: resolvedSearchParams.color,
    size: resolvedSearchParams.size,
    minPrice: resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : undefined,
    maxPrice: resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : undefined,
    page: resolvedSearchParams.page ? Number(resolvedSearchParams.page) : 1,
    query: resolvedSearchParams.q,
  });

  return (
    <div className="min-h-screen bg-brand-black pt-20">
      <ShopHeader total={total} />
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-10">
        <ShopSearch />
        <div className="flex flex-col lg:flex-row gap-10 mt-8">
          <aside className="lg:w-64 flex-shrink-0">
            <ShopFilters searchParams={resolvedSearchParams} />
          </aside>
          <main className="flex-1">
            <ProductGrid
              products={products}
              total={total}
              pages={pages}
              currentPage={resolvedSearchParams.page ? Number(resolvedSearchParams.page) : 1}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
