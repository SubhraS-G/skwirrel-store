import Link from "next/link";
import Image from "next/image";

interface JournalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  author_name: string;
  category?: string | null;
  published_at?: Date | null;
}

interface JournalPreviewProps {
  posts: JournalPost[];
}

function formatDate(date?: Date | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function JournalPreview({ posts }: JournalPreviewProps) {
  if (!posts.length) return null;

  return (
    <section className="bg-brand-black py-20 px-6 lg:px-12 border-t border-white/5">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-brand-orange text-[0.65rem] tracking-[0.4em] uppercase mb-2">From The Journal</p>
            <h2 className="font-bebas text-5xl lg:text-6xl text-brand-ivory leading-none">
              STORIES WORTH <span className="text-brand-orange">CARRYING</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-[0.65rem] tracking-[0.25em] text-brand-orange uppercase border-b border-brand-orange pb-0.5 hover:opacity-70 transition-opacity hidden sm:block"
          >
            All Stories →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {posts.slice(0, 3).map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
              <div className="relative aspect-[16/10] bg-[#111] overflow-hidden mb-4">
                {post.cover_image && (
                  <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-600 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/20 transition-all" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                {post.category && (
                  <span className="text-[0.55rem] tracking-[0.25em] text-brand-orange uppercase">
                    {post.category}
                  </span>
                )}
                {post.published_at && (
                  <span className="text-[0.55rem] text-brand-gray">
                    {formatDate(post.published_at)}
                  </span>
                )}
              </div>
              <h3 className="font-playfair text-lg text-brand-ivory leading-snug mb-2 group-hover:text-brand-orange transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-brand-gray text-xs leading-relaxed line-clamp-2">{post.excerpt}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10 sm:hidden">
          <Link
            href="/blog"
            className="inline-block border border-brand-gray/30 text-brand-gray px-8 py-3 text-[0.65rem] tracking-[0.2em] uppercase hover:border-brand-orange hover:text-brand-orange transition-all"
          >
            All Stories
          </Link>
        </div>
      </div>
    </section>
  );
}
