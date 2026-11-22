import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ — SKWIRREL",
  description: "Answers about orders, shipping, payments, returns and care for SKWIRREL apparel.",
};

const FAQS = [
  {
    q: "Where do you ship from?",
    a: "All orders ship from our studio in Bhubaneswar, Odisha. We ship across India, with international shipping available to selected countries at checkout.",
  },
  {
    q: "How long will my order take?",
    a: "Orders are typically dispatched within 1–2 business days. Delivery takes 2–5 days for metros and 4–7 days for other pincodes. You'll receive a tracking link by email and SMS once it ships.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "UPI, all major cards, netbanking and wallets via Razorpay; international cards via Stripe; and Cash on Delivery for orders within India.",
  },
  {
    q: "How do I track my order?",
    a: "Use the Track Order page with your order number and the email you checked out with, or open Account → Orders for a full history.",
  },
  {
    q: "Can I return or exchange an item?",
    a: "Yes — returns and size exchanges are accepted within 7 days of delivery, provided the item is unworn with tags attached. See our Returns & Exchanges page for the full policy.",
  },
  {
    q: "How do I choose the right size?",
    a: "Every product page has a size chart with chest, waist and length measurements in inches. Our fits are relaxed streetwear — check the Size Guide if you're between sizes.",
  },
  {
    q: "Are your products sustainably made?",
    a: "Yes. We work with GOTS-certified organic cotton, water-based inks, and small-batch production to minimise waste. Details are on our Sustainability page.",
  },
  {
    q: "How should I wash my SKWIRREL piece?",
    a: "Machine wash cold, inside out, with similar colours. Tumble dry low or line dry in shade. Do not bleach. Detailed care instructions are listed on each product page.",
  },
  {
    q: "Do you restock sold-out products?",
    a: "Bestsellers are restocked regularly; limited cultural drops may not return. Follow us on Instagram @skwirrelindia for restock announcements.",
  },
  {
    q: "Can I cancel or change my order?",
    a: "Orders can be cancelled before they ship — contact us as soon as possible with your order number. After shipping, the standard return process applies.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-brand-black pt-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 py-16">
        <p className="text-brand-orange text-[0.65rem] tracking-[0.4em] uppercase mb-2">Support</p>
        <h1 className="font-bebas text-5xl text-brand-ivory mb-10">FREQUENTLY ASKED QUESTIONS</h1>

        <div className="space-y-3">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group bg-[#0d0d0d] border border-white/5 open:border-brand-orange/30 transition-colors"
            >
              <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="text-brand-ivory text-sm">{faq.q}</span>
                <span className="text-brand-orange text-lg leading-none transition-transform group-open:rotate-45 flex-shrink-0">
                  +
                </span>
              </summary>
              <p className="px-5 pb-5 text-brand-gray text-xs leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 bg-[#0d0d0d] border border-white/5 p-6">
          <p className="text-brand-ivory text-sm leading-relaxed">
            Still have a question?{" "}
            <Link href="/contact" className="text-brand-orange hover:underline">
              Contact us
            </Link>{" "}
            or email{" "}
            <a href="mailto:hello@skwirrel.in" className="text-brand-orange hover:underline">
              hello@skwirrel.in
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
