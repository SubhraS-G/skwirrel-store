"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export function AdminSettingsForm({ name, email }: { name: string; email: string }) {
  const [displayName, setDisplayName] = useState(name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const inputClass =
    "w-full bg-[#111] border border-white/10 text-brand-ivory px-3 py-2.5 text-xs outline-none focus:border-brand-orange transition-colors";
  const labelClass = "block text-[0.55rem] tracking-[0.2em] text-brand-gray uppercase mb-1";

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAccount(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      toast.success("Name updated");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update");
    } finally {
      setSavingAccount(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) return toast.error("New password must be at least 8 characters");
    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password changed");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form onSubmit={saveName} className="bg-[#0d0d0d] border border-white/5 p-6">
        <h3 className="font-bebas text-xl tracking-wider text-brand-ivory mb-5">ACCOUNT</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Display Name</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input value={email} className={`${inputClass} opacity-60`} disabled />
          </div>
          <button
            type="submit"
            disabled={savingAccount}
            className="bg-brand-orange text-brand-ivory px-6 py-2.5 text-xs tracking-widest uppercase hover:bg-brand-orange-dark transition-colors disabled:opacity-50"
          >
            {savingAccount ? "Saving..." : "Save Name"}
          </button>
        </div>
      </form>

      <form onSubmit={savePassword} className="bg-[#0d0d0d] border border-white/5 p-6">
        <h3 className="font-bebas text-xl tracking-wider text-brand-ivory mb-5">CHANGE PASSWORD</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className={labelClass}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              placeholder="At least 8 characters"
            />
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="bg-brand-orange text-brand-ivory px-6 py-2.5 text-xs tracking-widest uppercase hover:bg-brand-orange-dark transition-colors disabled:opacity-50"
          >
            {savingPassword ? "Saving..." : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
