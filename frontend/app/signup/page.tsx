"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ======================
  // GOOGLE SIGNUP
  // ======================
  const handleGoogleSignup = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      // Redirect happens automatically via OAuth
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Google sign-up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // UI
  // ======================
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-16">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-black to-purple-900/20 z-0" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 overflow-hidden rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl">
        {/* LEFT */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-r border-white/10">
          <div>
            <Link href="/">
              <h1 className="text-4xl font-extrabold text-cyan-400">
                RoomLensAI
              </h1>
            </Link>

            <h2 className="text-5xl font-bold mt-16">
              Find Your <span className="text-cyan-400">Perfect</span> Flatmate
            </h2>

            <p className="mt-8 text-gray-300">
              AI-powered roommate matching platform. Match on lifestyle,
              cleanliness, sleep schedule, and budget.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-8 lg:p-14">
          <div className="max-w-md mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8">
              <Link href="/">
                <h1 className="text-3xl font-extrabold text-cyan-400">
                  RoomLensAI
                </h1>
              </Link>
            </div>

            <h2 className="text-4xl font-bold mb-4">Create Account</h2>
            <p className="text-gray-400 mb-10">
              Sign up instantly with your Google account — no passwords needed.
            </p>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                <span className="text-red-400 text-lg leading-none">⚠</span>
                <p className="text-red-300 text-sm">{errorMsg}</p>
              </div>
            )}

            {/* GOOGLE BUTTON */}
            <button
              type="button"
              onClick={handleGoogleSignup}
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

            {/* Login Link */}
            <p className="text-center text-gray-400 mt-8">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}