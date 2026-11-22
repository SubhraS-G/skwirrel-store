import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ProductReviews } from "@/components/product/ProductReviews";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { SizeChartModal } from "@/components/product/SizeChartModal";
import { getProductBySlug, getRelatedProducts } from "@/lib/supabase/products";
import { generateProductSchema } from "@/lib/seo/schema";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} — SKWIRREL`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.images[0], alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.id, product.category_id);
  const schema = generateProductSchema(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="min-h-screen bg-brand-black pt-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
            <ProductGallery images={product.images} name={product.name} />
            <ProductInfo product={product} />
          </div>
          <ProductDescription product={product} />
          <ProductReviews productId={product.id} />
          <RelatedProducts products={relatedProducts} />
        </div>
        <SizeChartModal />
      </div>
    </>
  );
}
