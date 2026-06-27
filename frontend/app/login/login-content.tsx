"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginContent() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ======================
  // GOOGLE LOGIN
  // ======================
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 relative">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-black to-purple-500/10 z-0" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] p-10 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-4xl font-extrabold text-cyan-400 cursor-pointer">
              RoomLensAI
            </h1>
          </Link>
          <p className="text-gray-400 mt-4">
            Welcome back! Sign in to find your perfect flatmate.
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <span className="text-red-400 text-lg leading-none">⚠</span>
            <p className="text-red-300 text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 rounded-2xl border border-white/10 hover:border-cyan-400 hover:bg-white/5 flex items-center justify-center gap-3 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
            alt="Google"
          />
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>

        {/* Signup Link */}
        <p className="text-center text-gray-400 mt-8">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}