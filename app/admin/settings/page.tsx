import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";

export const metadata: Metadata = { title: "Settings — Admin" };

const INTEGRATIONS = [
  { name: "Stripe", env: "STRIPE_SECRET_KEY" },
  { name: "Razorpay", env: "RAZORPAY_KEY_SECRET" },
  { name: "Cloudinary", env: "CLOUDINARY_API_SECRET" },
  { name: "SMTP Email", env: "SMTP_PASS" },
  { name: "Google OAuth", env: "GOOGLE_CLIENT_ID" },
];

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-[#080808] flex">
      <AdminSidebar />
      <main className="flex-1 p-8 lg:ml-64 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-bebas text-4xl text-brand-ivory tracking-wide">SETTINGS</h1>
          <p className="text-brand-gray text-sm mt-1">Account and store configuration</p>
        </div>

        <div className="space-y-6">
          <AdminSettingsForm name={session.user.name ?? ""} email={session.user.email ?? ""} />

          <div className="bg-[#0d0d0d] border border-white/5 p-6">
            <h3 className="font-bebas text-xl tracking-wider text-brand-ivory mb-5">INTEGRATIONS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INTEGRATIONS.map((integration) => {
                const configured = Boolean(process.env[integration.env]);
                return (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between border border-white/5 bg-[#111] px-4 py-3"
                  >
                    <span className="text-brand-ivory text-xs">{integration.name}</span>
                    <span
                      className={`text-[0.55rem] tracking-widest uppercase px-2 py-1 border ${
                        configured
                          ? "text-green-400 border-green-400/30"
                          : "text-brand-gray border-white/10"
                      }`}
                    >
                      {configured ? "Configured" : "Not set"}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-brand-gray text-[0.65rem] mt-4">
              Values live in <code className="text-brand-orange">.env.local</code> and are never exposed here — only
              whether each key is present.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
