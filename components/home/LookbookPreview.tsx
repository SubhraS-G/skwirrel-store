"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface LookbookPreviewImage {
  id: string;
  url: string;
  alt?: string | null;
  category?: string | null;
}

interface LookbookPreviewProps {
  images?: LookbookPreviewImage[];
}

const FALLBACK_TILES = [
  { id: "fb-1", label: "SS 2025 Collection", bg: "from-[#1a1208] to-[#3d2010]" },
  { id: "fb-2", label: "Konark Series", bg: "from-[#0d1a1a] to-[#0f2a2a]" },
  { id: "fb-3", label: "Odissi Movement", bg: "from-[#1e1208] to-[#2d1e0f]" },
  { id: "fb-4", label: "Sambalpuri Edit", bg: "from-[#141414] to-[#2a1a0a]" },
  { id: "fb-5", label: "Root Stories", bg: "from-[#1a0d08] to-[#2d1208]" },
];

interface Tile {
  key: string;
  label: string;
  url?: string;
  bg: string;
}

export function LookbookPreview({ images = [] }: LookbookPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeModal, setActiveModal] = useState<number | null>(null);

  const tiles = useMemo<Tile[]>(() => {
    if (images.length > 0) {
      return images.slice(0, 5).map((img, i) => ({
        key: img.id,
        label: img.alt || img.category || `Lookbook ${i + 1}`,
        url: img.url,
        bg: FALLBACK_TILES[i % FALLBACK_TILES.length].bg,
      }));
    }
    return FALLBACK_TILES.map((t) => ({ key: t.id, label: t.label, bg: t.bg }));
  }, [images]);

  const tileClass = (i: number) =>
    i === 0
      ? "lg:row-span-2 overflow-hidden group cursor-pointer relative min-h-[300px] lg:min-h-[500px]"
      : "overflow-hidden group cursor-pointer relative min-h-[140px] lg:min-h-[245px]";

  return (
    <section className="bg-brand-black py-20 px-6 lg:px-12">
      <div className="max-w-screen-2xl mx-auto">
        <div ref={ref} className="flex justify-between items-end mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
          >
            <p className="text-brand-orange text-[0.65rem] tracking-[0.4em] uppercase mb-2">Visual Stories</p>
            <h2 className="font-bebas text-5xl lg:text-6xl text-brand-ivory leading-none">
              THE <span className="text-brand-orange">LOOKBOOK</span>
            </h2>
          </motion.div>
          <Link href="/lookbook" className="text-[0.65rem] tracking-[0.25em] text-brand-orange uppercase border-b border-brand-orange pb-0.5 hover:opacity-70 transition-opacity hidden sm:block">
            View All →
          </Link>
        </div>

        {/* Masonry grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 lg:gap-1.5">
          {tiles.map((tile, i) => (
            <div key={tile.key} className={tileClass(i)} onClick={() => setActiveModal(i)}>
              <div
                className={`w-full h-full bg-gradient-to-br ${tile.bg} flex items-end transition-transform duration-700 ${
                  i === 0 ? "group-hover:scale-[1.02]" : "group-hover:scale-[1.03]"
                }`}
              >
                {tile.url && (
                  <Image
                    src={tile.url}
                    alt={tile.label}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                )}
                <span className="relative z-10 text-[0.6rem] tracking-[0.2em] text-brand-ivory/70 uppercase p-3 lg:p-4 group-hover:text-brand-orange transition-colors bg-gradient-to-t from-black/60 to-transparent w-full pt-10">
                  {tile.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeModal !== null && tiles[activeModal] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
            onClick={() => setActiveModal(null)}
          >
            <button
              className="absolute top-6 right-6 text-brand-ivory hover:text-brand-orange transition-colors"
              aria-label="Close lookbook preview"
            >
              <X size={28} />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={`w-full max-w-lg aspect-[3/4] bg-gradient-to-br ${tiles[activeModal].bg} relative overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              {tiles[activeModal].url && (
                <Image
                  src={tiles[activeModal].url!}
                  alt={tiles[activeModal].label}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-[0.6rem] tracking-[0.3em] text-brand-orange uppercase">{tiles[activeModal].label}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
