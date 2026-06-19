"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordContent() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  // ======================
  // DETECT ACCESS TOKEN IN URL HASH & ESTABLISH SESSION
  // Supabase redirects to /reset-password#access_token=...&type=recovery
  // ======================
  useEffect(() => {
    const hash = window.location.hash;

    if (!hash) {
      setInvalidLink(true);
      return;
    }

    const params = new URLSearchParams(hash.slice(1)); // remove leading '#'
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (!accessToken || type !== "recovery") {
      setInvalidLink(true);
      return;
    }

    // Establish a Supabase session from the tokens in the hash
    supabase.auth
      .setSession({
        access_token: accessToken,
        refresh_token: refreshToken ?? "",
      })
      .then(({ error }) => {
        if (error) {
          console.error("setSession error:", error);
          setInvalidLink(true);
        } else {
          setSessionReady(true);
          // Clean the token from the URL bar without a page reload
          window.history.replaceState(null, "", window.location.pathname);
        }
      });
  }, []);

  // ======================
  // HANDLE PASSWORD UPDATE
  // ======================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!newPassword || !confirmPassword) {
      setErrorMsg("Please fill in both fields.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMsg(error.message || "Failed to update password. Please try again.");
        return;
      }

      // Sign out so the user logs in fresh with the new password
      await supabase.auth.signOut();
      router.push("/login?reset=success");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // RENDER: INVALID LINK
  // ======================
  if (invalidLink) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-black to-purple-500/10 z-0" />
        <div className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] p-10 shadow-2xl text-center space-y-6">
          <h1 className="text-4xl font-extrabold text-cyan-400">RoomLensAI</h1>
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30">
            <span className="text-red-400 text-3xl">⚠</span>
            <p className="text-red-300 mt-3 text-sm leading-relaxed">
              This reset link is invalid or has expired.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Please request a new password reset link.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="block w-full py-4 rounded-2xl bg-cyan-400 text-black font-bold hover:scale-[1.02] active:scale-95 transition duration-300"
          >
            Request New Link
          </Link>
          <Link
            href="/login"
            className="block text-center text-sm text-gray-400 hover:text-cyan-400 transition"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ======================
  // RENDER: LOADING SESSION
  // ======================
  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-black to-purple-500/10 z-0" />
        <p className="relative z-10 text-gray-400 animate-pulse">Verifying reset link…</p>
      </div>
    );
  }

  // ======================
  // RENDER: RESET PASSWORD FORM
  // ======================
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 relative">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-black to-purple-500/10 z-0" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] p-10 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-4xl font-extrabold text-cyan-400 cursor-pointer">
              RoomLensAI
            </h1>
          </Link>
          <p className="text-gray-400 mt-4">
            Choose a strong new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block mb-3 text-sm text-gray-300">
              New Password
            </label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrorMsg("");
              }}
              className="w-full px-5 py-4 rounded-2xl bg-black/40 border border-white/10 focus:border-cyan-400 outline-none text-white placeholder:text-gray-500 transition"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-3 text-sm text-gray-300">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrorMsg("");
              }}
              className="w-full px-5 py-4 rounded-2xl bg-black/40 border border-white/10 focus:border-cyan-400 outline-none text-white placeholder:text-gray-500 transition"
              required
            />
          </div>

          {/* Inline Error */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <span className="text-red-400 text-lg leading-none">⚠</span>
              <p className="text-red-300 text-sm">{errorMsg}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-cyan-400 text-black font-bold hover:scale-[1.02] active:scale-95 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Updating Password..." : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
