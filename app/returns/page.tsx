import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns & Exchanges — SKWIRREL",
  description: "Our return, exchange and refund policy for orders placed on skwirrel.in.",
};

const SECTIONS = [
  {
    title: "7-Day Returns",
    body: "Not the right fit? You can request a return within 7 days of delivery. Items must be unworn, unwashed, unwrinkled, with original tags attached and in their original packaging.",
  },
  {
    title: "Free Exchanges",
    body: "Wrong size or colour? Exchanges for a different size of the same product are free, once per order, for addresses within India. We'll arrange a pickup through our courier partner.",
  },
  {
    title: "How to Start a Return",
    body: "Email hello@skwirrel.in with your order number (find it in Account → Orders, or use Track Order), the item you'd like to return, and the reason. We'll respond within 24 hours with a return authorisation and pickup details.",
  },
  {
    title: "Refunds",
    body: "Once your return is received and inspected, refunds are issued to the original payment method within 5–7 business days. UPI and card refunds typically reflect in 2–3 days after processing.",
  },
  {
    title: "Non-Returnable Items",
    body: "For hygiene and customisation reasons, innerwear, gift cards, and items marked final-sale cannot be returned. Products with signs of wear, washing, alteration or perfume are not eligible.",
  },
  {
    title: "Damaged or Wrong Items",
    body: "Received a defective or incorrect product? Contact us within 48 hours of delivery with photos — we'll prioritise a replacement or full refund including shipping.",
  },
  {
    title: "Order Cancellations",
    body: "Orders can be cancelled before they are shipped. Once shipped, the standard return process applies. Refunds for cancelled prepaid orders follow the same timeline as above.",
  },
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-brand-black pt-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 py-16">
        <p className="text-brand-orange text-[0.65rem] tracking-[0.4em] uppercase mb-2">Support</p>
        <h1 className="font-bebas text-5xl text-brand-ivory mb-10">RETURNS & EXCHANGES</h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="font-bebas text-2xl tracking-wider text-brand-orange mb-2">{section.title}</h2>
              <p className="text-brand-gray text-sm leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-[#0d0d0d] border border-white/5 p-6">
          <p className="text-brand-ivory text-sm leading-relaxed">
            Need help with an order?{" "}
            <Link href="/contact" className="text-brand-orange hover:underline">
              Contact us
            </Link>{" "}
            or email{" "}
            <a href="mailto:hello@skwirrel.in" className="text-brand-orange hover:underline">
              hello@skwirrel.in
            </a>{" "}
            — we usually reply within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
