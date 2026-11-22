import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Size Guide — SKWIRREL",
  description: "Find your perfect fit. Measurement charts and sizing tips for all SKWIRREL apparel.",
};

const SIZE_DATA = [
  { size: "XS", chest: "34–36", waist: "28–30", length: "26" },
  { size: "S", chest: "36–38", waist: "30–32", length: "27" },
  { size: "M", chest: "38–40", waist: "32–34", length: "28" },
  { size: "L", chest: "40–42", waist: "34–36", length: "29" },
  { size: "XL", chest: "42–44", waist: "36–38", length: "30" },
  { size: "XXL", chest: "44–46", waist: "38–40", length: "31" },
];

const TIPS = [
  {
    title: "Measure Correctly",
    body: "Use a soft measuring tape over a thin garment (or bare skin), keeping it snug but not tight. Measure the chest at the fullest point and the waist at the narrowest.",
  },
  {
    title: "Between Sizes?",
    body: "Our tees and hoodies have a relaxed streetwear fit. If you're between two sizes, size down for a fitted look or up for an oversized silhouette.",
  },
  {
    title: "Fabric Behaviour",
    body: "100% cotton tees may shrink up to 3% after the first wash. Wash cold and tumble dry low to keep measurements stable.",
  },
  {
    title: "Still Unsure?",
    body: "Write to hello@skwirrel.in with the product and your usual size — we'll help you pick.",
  },
];

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-brand-black pt-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 py-16">
        <p className="text-brand-orange text-[0.65rem] tracking-[0.4em] uppercase mb-2">Fit</p>
        <h1 className="font-bebas text-5xl text-brand-ivory mb-4">SIZE GUIDE</h1>
        <p className="text-brand-gray text-sm leading-relaxed mb-10">
          All measurements are in inches and refer to the garment, not the body. For best fit, measure across
          the chest and add 1".
        </p>

        <div className="bg-[#0d0d0d] border border-white/5 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Size", "Chest", "Waist", "Length"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[0.6rem] tracking-[0.2em] text-brand-orange uppercase p-4 font-normal"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIZE_DATA.map((row) => (
                  <tr key={row.size} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="p-4 text-brand-ivory font-medium text-xs tracking-wider">{row.size}</td>
                    <td className="p-4 text-brand-gray">{row.chest}"</td>
                    <td className="p-4 text-brand-gray">{row.waist}"</td>
                    <td className="p-4 text-brand-gray">{row.length}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {TIPS.map((tip) => (
            <div key={tip.title} className="bg-[#0d0d0d] border border-white/5 p-5">
              <h2 className="font-bebas text-lg tracking-wider text-brand-orange mb-2">{tip.title}</h2>
              <p className="text-brand-gray text-xs leading-relaxed">{tip.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/shop"
            className="bg-brand-orange text-brand-ivory px-8 py-3.5 text-[0.7rem] tracking-[0.25em] uppercase hover:bg-brand-orange-dark transition-colors"
          >
            Shop Now
          </Link>
          <Link
            href="/returns"
            className="border border-white/10 text-brand-gray px-8 py-3.5 text-[0.7rem] tracking-[0.25em] uppercase hover:border-brand-ivory hover:text-brand-ivory transition-all"
          >
            Returns & Exchanges
          </Link>
        </div>
      </div>
    </div>
  );
}
