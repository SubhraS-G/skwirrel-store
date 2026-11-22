"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";

export interface BlogPostInitial {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author_name: string;
  tags: string[];
  category?: string | null;
  meta_title?: string | null;
  meta_desc?: string | null;
  is_published: boolean;
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

export function BlogPostForm({ initial }: { initial?: BlogPostInitial }) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slugEdited, setSlugEdited] = useState(Boolean(initial));

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    cover_image: initial?.cover_image ?? "",
    author_name: initial?.author_name ?? "SKWIRREL Team",
    tags: initial?.tags?.join(", ") ?? "",
    category: initial?.category ?? "",
    meta_title: initial?.meta_title ?? "",
    meta_desc: initial?.meta_desc ?? "",
    is_published: initial?.is_published ?? false,
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
      fd.append("folder", "skwirrel/blog");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      set("cover_image", data.url);
      toast.success("Cover uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt,
        content: form.content,
        cover_image: form.cover_image,
        author_name: form.author_name,
        tags: form.tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        category: form.category,
        meta_title: form.meta_title,
        meta_desc: form.meta_desc,
        is_published: form.is_published,
      };

      const res = await fetch(isEdit ? `/api/blog/${initial!.id}` : "/api/blog", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save post");
      }
      toast.success(isEdit ? "Post updated" : "Post created");
      router.push("/admin/blog");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[#0d0d0d] border border-white/5 p-6">
        <h3 className="font-bebas text-xl tracking-wider text-brand-ivory mb-5">STORY</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input
              value={form.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!slugEdited) set("slug", slugify(e.target.value));
              }}
              className={inputClass}
              placeholder="The Story of Sambalpuri Weave"
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
              placeholder="the-story-of-sambalpuri-weave"
              required
            />
          </div>
          <div className="lg:col-span-2">
            <label className={labelClass}>Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              className={`${inputClass} min-h-[70px]`}
              placeholder="A short summary shown on the blog index"
            />
          </div>
          <div className="lg:col-span-2">
            <label className={labelClass}>Content (HTML allowed) *</label>
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              className={`${inputClass} min-h-[260px] font-mono`}
              placeholder="<p>Your story...</p>"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Author</label>
            <input value={form.author_name} onChange={(e) => set("author_name", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <input
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputClass}
              placeholder="Culture"
            />
          </div>
          <div>
            <label className={labelClass}>Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              className={inputClass}
              placeholder="culture, textiles, heritage"
            />
          </div>
          <div>
            <label className={labelClass}>Cover Image</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 bg-[#111] border border-dashed border-white/10 px-4 py-2.5 text-brand-gray text-xs hover:border-brand-orange hover:text-brand-orange cursor-pointer transition-colors">
                <Upload size={14} />
                {uploading ? "Uploading..." : form.cover_image ? "Replace" : "Upload cover"}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
              {form.cover_image && (
                <div className="relative w-16 h-10 bg-[#1a1a1a] border border-white/5">
                  <Image src={form.cover_image} alt="Cover" fill className="object-cover" unoptimized />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0d0d0d] border border-white/5 p-6">
        <h3 className="font-bebas text-xl tracking-wider text-brand-ivory mb-5">SEO & PUBLISHING</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClass}>Meta Title</label>
            <input value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Meta Description</label>
            <input value={form.meta_desc} onChange={(e) => set("meta_desc", e.target.value)} className={inputClass} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-brand-ivory text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => set("is_published", e.target.checked)}
            className="accent-brand-orange"
          />
          Published (visible on the blog)
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-brand-orange text-brand-ivory px-8 py-3 text-xs tracking-widest uppercase hover:bg-brand-orange-dark transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Update Post" : "Create Post"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          className="text-brand-gray text-xs tracking-wider uppercase hover:text-brand-ivory transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
