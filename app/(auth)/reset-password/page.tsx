"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (!token || !email) return toast.error("Invalid reset link");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      toast.success("Password updated — sign in with your new password");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 p-6 text-center">
        <p className="text-red-400 font-bebas text-xl tracking-wider mb-2">INVALID RESET LINK</p>
        <p className="text-brand-gray text-sm">This link is incomplete or malformed.</p>
        <Link href="/forgot-password" className="text-brand-orange text-xs tracking-wider uppercase mt-4 block hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[0.6rem] tracking-[0.25em] text-brand-gray uppercase mb-1.5">New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-[#0d0d0d] border border-white/10 text-brand-ivory px-4 py-3.5 text-sm outline-none focus:border-brand-orange transition-colors placeholder:text-brand-gray/40"
          placeholder="At least 8 characters"
          required
        />
      </div>
      <div>
        <label className="block text-[0.6rem] tracking-[0.25em] text-brand-gray uppercase mb-1.5">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-[#0d0d0d] border border-white/10 text-brand-ivory px-4 py-3.5 text-sm outline-none focus:border-brand-orange transition-colors placeholder:text-brand-gray/40"
          placeholder="Repeat your new password"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-orange text-brand-ivory py-4 font-bebas text-xl tracking-widest hover:bg-brand-orange-dark transition-colors disabled:opacity-50"
      >
        {loading ? "Updating..." : "Reset Password"}
      </button>
      <p className="text-center">
        <Link href="/login" className="text-brand-gray text-xs hover:text-brand-orange transition-colors">
          Back to login
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="w-full max-w-md py-16">
        <div className="text-center mb-10">
          <Link href="/" className="font-bebas text-3xl tracking-widest text-brand-ivory">
            SK<span className="text-brand-orange">W</span>IRREL
          </Link>
          <h1 className="font-bebas text-4xl text-brand-ivory mt-4">NEW PASSWORD</h1>
          <p className="text-brand-gray text-sm mt-2">Choose a new password for your account.</p>
        </div>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
