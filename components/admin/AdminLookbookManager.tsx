"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, ToggleLeft, ToggleRight, Upload } from "lucide-react";
import toast from "react-hot-toast";

interface LookbookImage {
  id: string;
  url: string;
  alt?: string | null;
  category?: string | null;
  sort_order: number;
  is_active: boolean;
}

const CATEGORY_OPTIONS = ["campaign", "cultural", "editorial", "bts"];

export function AdminLookbookManager({ initialImages }: { initialImages: LookbookImage[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ url: "", alt: "", category: "campaign", sort_order: "" });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "skwirrel/lookbook");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setForm((f) => ({ ...f, url: data.url }));
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url) return toast.error("Upload or paste an image URL first");
    try {
      const res = await fetch("/api/admin/lookbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: form.url,
          alt: form.alt,
          category: form.category,
          sort_order: form.sort_order ? Number(form.sort_order) : 0,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Image added");
      setForm({ url: "", alt: "", category: "campaign", sort_order: "" });
      setShowForm(false);
      router.refresh();
    } catch {
      toast.error("Failed to add image");
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/lookbook/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !current }),
      });
      router.refresh();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lookbook image?")) return;
    try {
      await fetch(`/api/admin/lookbook/${id}`, { method: "DELETE" });
      toast.success("Image deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const inputClass =
    "w-full bg-[#111] border border-white/10 text-brand-ivory px-3 py-2.5 text-xs outline-none focus:border-brand-orange transition-colors";
  const labelClass = "block text-[0.55rem] tracking-[0.2em] text-brand-gray uppercase mb-1";

  return (
    <div className="space-y-4">
      {showForm ? (
        <form onSubmit={handleCreate} className="bg-[#0d0d0d] border border-white/5 p-6">
          <h3 className="font-bebas text-xl tracking-wider text-brand-ivory mb-5">NEW LOOKBOOK IMAGE</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Image</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 bg-[#111] border border-dashed border-white/10 px-4 py-2.5 text-brand-gray text-xs hover:border-brand-orange hover:text-brand-orange cursor-pointer transition-colors">
                  <Upload size={14} />
                  {uploading ? "Uploading..." : "Upload"}
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                </label>
                <input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className={inputClass}
                  placeholder="https://... or uploaded URL"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Alt Text</label>
              <input
                value={form.alt}
                onChange={(e) => setForm({ ...form, alt: e.target.value })}
                className={inputClass}
                placeholder="Sambalpuri drape editorial"
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                className={inputClass}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={uploading}
              className="bg-brand-orange text-brand-ivory px-6 py-2.5 text-xs tracking-widest uppercase hover:bg-brand-orange-dark transition-colors disabled:opacity-50"
            >
              Add Image
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-brand-gray text-xs tracking-wider uppercase hover:text-brand-ivory transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-brand-orange text-brand-ivory px-5 py-2.5 text-xs tracking-widest uppercase hover:bg-brand-orange-dark transition-colors"
        >
          <Plus size={14} /> Add Image
        </button>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {initialImages.length === 0 && (
          <p className="text-brand-gray text-sm col-span-full py-8 text-center">No lookbook images yet.</p>
        )}
        {initialImages.map((img) => (
          <div key={img.id} className="bg-[#0d0d0d] border border-white/5 group">
            <div className="relative aspect-[3/4] bg-[#1a1a1a]">
              <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" unoptimized />
              {!img.is_active && (
                <span className="absolute top-2 left-2 bg-black/80 text-brand-gray text-[0.5rem] tracking-widest uppercase px-2 py-1">
                  Hidden
                </span>
              )}
            </div>
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-brand-ivory text-xs truncate">{img.alt ?? "Untitled"}</p>
                <p className="text-brand-gray text-[0.55rem] uppercase tracking-wider mt-0.5">
                  {img.category ?? "uncategorized"} · #{img.sort_order}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggle(img.id, img.is_active)}
                  title={img.is_active ? "Hide" : "Show"}
                  className="transition-colors"
                >
                  {img.is_active ? (
                    <ToggleRight size={18} className="text-green-400" />
                  ) : (
                    <ToggleLeft size={18} className="text-brand-gray" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="text-brand-gray hover:text-red-400 transition-colors"
                  aria-label="Delete image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
