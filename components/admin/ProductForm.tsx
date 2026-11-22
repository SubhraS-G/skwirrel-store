"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import toast from "react-hot-toast";

interface CategoryOption {
  id: string;
  name: string;
}

export interface ProductFormInitial {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string | null;
  price: number | string;
  compare_price?: number | string | null;
  sku: string;
  category_id: string;
  images: string[];
  tags: string[];
  collection?: string | null;
  material?: string | null;
  care_instructions?: string | null;
  is_featured: boolean;
  is_active: boolean;
}

interface ProductFormProps {
  categories: CategoryOption[];
  initial?: ProductFormInitial;
}

const inputClass =
  "w-full bg-[#111] border border-white/10 text-brand-ivory px-3 py-2.5 text-xs outline-none focus:border-brand-orange transition-colors";
const labelClass = "block text-[0.55rem] tracking-[0.2em] text-brand-gray uppercase mb-1";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function ProductForm({ categories, initial }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slugEdited, setSlugEdited] = useState(Boolean(initial));

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    short_description: initial?.short_description ?? "",
    price: initial ? String(initial.price) : "",
    compare_price: initial?.compare_price ? String(initial.compare_price) : "",
    sku: initial?.sku ?? "",
    category_id: initial?.category_id ?? categories[0]?.id ?? "",
    images: initial?.images ?? ([] as string[]),
    tags: initial?.tags?.join(", ") ?? "",
    collection: initial?.collection ?? "",
    material: initial?.material ?? "",
    care_instructions: initial?.care_instructions ?? "",
    is_featured: initial?.is_featured ?? false,
    is_active: initial?.is_active ?? true,
  });

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "skwirrel/products");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setForm((f) => ({ ...f, images: [...f.images, data.url] }));
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.images.length) return toast.error("Add at least one image");
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        short_description: form.short_description || null,
        price: Number(form.price),
        compare_price: form.compare_price ? Number(form.compare_price) : null,
        sku: form.sku,
        category_id: form.category_id,
        images: form.images,
        tags: form.tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        collection: form.collection || null,
        material: form.material || null,
        care_instructions: form.care_instructions || null,
        is_featured: form.is_featured,
        is_active: form.is_active,
      };

      const res = await fetch(isEdit ? `/api/products/${initial!.id}` : "/api/products", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save product");
      }
      toast.success(isEdit ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (!categories.length) {
    return (
      <div className="bg-[#0d0d0d] border border-white/5 p-6 text-brand-gray text-sm">
        No categories exist yet. Seed the database first (<code className="text-brand-orange">npm run db:seed</code>)
        so products can be assigned to one.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[#0d0d0d] border border-white/5 p-6">
        <h3 className="font-bebas text-xl tracking-wider text-brand-ivory mb-5">BASICS</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input
              value={form.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!slugEdited) set("slug", slugify(e.target.value));
              }}
              className={inputClass}
              placeholder="Temple Gate Tee"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Slug *</label>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                set("slug", slugify(e.target.value));
              }}
              className={inputClass}
              placeholder="temple-gate-tee"
              required
            />
          </div>
          <div className="lg:col-span-2">
            <label className={labelClass}>Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={`${inputClass} min-h-[120px]`}
              placeholder="Tell the story of this piece..."
              required
            />
          </div>
          <div className="lg:col-span-2">
            <label className={labelClass}>Short Description</label>
            <input
              value={form.short_description}
              onChange={(e) => set("short_description", e.target.value)}
              className={inputClass}
              placeholder="One-liner shown on cards"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#0d0d0d] border border-white/5 p-6">
        <h3 className="font-bebas text-xl tracking-wider text-brand-ivory mb-5">PRICING & CATEGORY</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Price (₹) *</label>
            <input
              type="number"
              min="1"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              className={inputClass}
              placeholder="999"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Compare Price (₹)</label>
            <input
              type="number"
              min="1"
              value={form.compare_price}
              onChange={(e) => set("compare_price", e.target.value)}
              className={inputClass}
              placeholder="1299"
            />
          </div>
          <div>
            <label className={labelClass}>SKU *</label>
            <input
              value={form.sku}
              onChange={(e) => set("sku", e.target.value)}
              className={inputClass}
              placeholder="SKW-TGT-001"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select
              value={form.category_id}
              onChange={(e) => set("category_id", e.target.value)}
              className={inputClass}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Collection</label>
            <input
              value={form.collection}
              onChange={(e) => set("collection", e.target.value)}
              className={inputClass}
              placeholder="Cultural Edition"
            />
          </div>
          <div>
            <label className={labelClass}>Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              className={inputClass}
              placeholder="new, cultural, bestseller"
            />
          </div>
          <div>
            <label className={labelClass}>Material</label>
            <input
              value={form.material}
              onChange={(e) => set("material", e.target.value)}
              className={inputClass}
              placeholder="100% Organic Cotton, 180 GSM"
            />
          </div>
          <div className="lg:col-span-2">
            <label className={labelClass}>Care Instructions</label>
            <input
              value={form.care_instructions}
              onChange={(e) => set("care_instructions", e.target.value)}
              className={inputClass}
              placeholder="Machine wash cold, tumble dry low"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#0d0d0d] border border-white/5 p-6">
        <h3 className="font-bebas text-xl tracking-wider text-brand-ivory mb-5">IMAGES</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {form.images.map((src, i) => (
            <div key={`${src}-${i}`} className="relative aspect-[3/4] bg-[#1a1a1a] border border-white/5 group">
              <Image src={src} alt={`Image ${i + 1}`} fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                className="absolute top-1.5 right-1.5 bg-black/70 border border-white/10 p-1 text-brand-gray opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 bg-brand-orange text-brand-ivory text-[0.5rem] tracking-widest uppercase px-1.5 py-0.5">
                  Cover
                </span>
              )}
            </div>
          ))}
          <label className="aspect-[3/4] bg-[#111] border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-brand-gray hover:border-brand-orange hover:text-brand-orange cursor-pointer transition-colors">
            <Upload size={18} />
            <span className="text-[0.55rem] tracking-widest uppercase">{uploading ? "Uploading..." : "Upload"}</span>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
        <p className="text-brand-gray text-[0.65rem]">First image is used as the cover on cards and search results.</p>
      </div>

      <div className="bg-[#0d0d0d] border border-white/5 p-6">
        <h3 className="font-bebas text-xl tracking-wider text-brand-ivory mb-5">VISIBILITY</h3>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-brand-ivory text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="accent-brand-orange"
            />
            Active (visible in shop)
          </label>
          <label className="flex items-center gap-2 text-brand-ivory text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => set("is_featured", e.target.checked)}
              className="accent-brand-orange"
            />
            Featured on homepage
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-brand-orange text-brand-ivory px-8 py-3 text-xs tracking-widest uppercase hover:bg-brand-orange-dark transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="text-brand-gray text-xs tracking-wider uppercase hover:text-brand-ivory transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
