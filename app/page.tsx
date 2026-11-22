import { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { TickerBanner } from "@/components/home/TickerBanner";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { BrandStory } from "@/components/home/BrandStory";
import { FromNature } from "@/components/home/FromNature";
import { LookbookPreview } from "@/components/home/LookbookPreview";
import { CultureSection } from "@/components/home/CultureSection";
import { JournalPreview } from "@/components/home/JournalPreview";
import { Testimonials } from "@/components/home/Testimonials";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { getFeaturedProducts } from "@/lib/supabase/products";
import { getLookbookImages } from "@/lib/supabase/lookbook";
import { getBlogPosts } from "@/lib/supabase/blog";
import { getApprovedTestimonials } from "@/lib/supabase/testimonials";

export const metadata: Metadata = {
  title: "SKWIRREL — Born From Odisha. Made For The World.",
  description:
    "Premium cultural streetwear from Odisha, India. Every stitch tells a story of memory, music, language, and pride.",
};

export default async function HomePage() {
  const [featuredProducts, lookbookImages, journalPosts, testimonials] =
    await Promise.all([
      getFeaturedProducts(),
      getLookbookImages(),
      getBlogPosts(3),
      getApprovedTestimonials(6),
    ]);

  return (
    <>
      <HeroSection />
      <TickerBanner />
      <FeaturedCollection products={featuredProducts} />
      <BrandStory />
      <FromNature />
      <LookbookPreview images={lookbookImages} />
      <CultureSection />
      <JournalPreview posts={journalPosts} />
      <Testimonials testimonials={testimonials} />
      <NewsletterSection />
    </>
  );
}
