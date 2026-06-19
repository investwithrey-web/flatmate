"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setErrorMsg(error.message || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            Forgot your password? No worries — we&apos;ve got you covered.
          </p>
        </div>

        {success ? (
          /* ── Success State ── */
          <div className="space-y-6 text-center">
            <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30">
              <span className="text-green-400 text-3xl">✓</span>
              <p className="text-green-300 mt-3 text-sm leading-relaxed">
                Check your inbox! A password reset link has been sent to{" "}
                <span className="font-semibold text-white">{email}</span>.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Didn&apos;t receive it? Check your spam folder.
              </p>
            </div>
            <Link
              href="/login"
              className="block w-full py-4 rounded-2xl border border-white/10 hover:border-cyan-400 hover:bg-white/5 text-center text-sm text-gray-300 transition"
            >
              ← Back to Login
            </Link>
          </div>
        ) : (
          /* ── Form State ── */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block mb-3 text-sm text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
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
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            {/* Back to Login */}
            <Link
              href="/login"
              className="block text-center text-sm text-gray-400 hover:text-cyan-400 transition"
            >
              ← Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
