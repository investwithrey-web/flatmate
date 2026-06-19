"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ======================
  // STATE
  // ======================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // ======================
  // EMAIL LOGIN
  // ======================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Supabase returns the same "Invalid login credentials" for both
        // wrong email and wrong password. We probe email existence separately.
        const emailExists = await checkEmailExists(email);
        if (!emailExists) {
          setErrorMsg("Email not found. Please check your email address or sign up.");
        } else {
          setErrorMsg("Incorrect password. Please try again.");
        }
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // CHECK IF EMAIL EXISTS
  // We use signInWithOtp (magic link, no create) to probe.
  // If it says "Email not confirmed" the user exists.
  // If it says "User not found" the email is not registered.
  // ======================
  const checkEmailExists = async (emailToCheck: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailToCheck,
        options: { shouldCreateUser: false },
      });
      // If no error or error is about confirmation/rate-limit → email exists
      if (!error) return true;
      const msg = error.message?.toLowerCase() ?? "";
      if (
        msg.includes("email not confirmed") ||
        msg.includes("email link") ||
        msg.includes("for security purposes") ||
        msg.includes("email rate limit")
      ) {
        return true;
      }
      // "Signups not allowed" or "User not found" → email doesn't exist
      return false;
    } catch {
      return false;
    }
  };

  // ======================
  // GOOGLE LOGIN
  // ======================
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Google sign-in failed.");
    }
  };

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setShowPopup(true);
    }
    if (searchParams.get("reset") === "success") {
      setShowPasswordReset(true);
    }
  }, [searchParams]);

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
            Welcome back! Login to find your perfect match.
          </p>
        </div>

        {/* Password Reset Success Banner */}
        {showPasswordReset && (
          <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-start gap-3">
            <span className="text-green-400 text-lg">✓</span>
            <p className="text-green-300 text-sm">
              Password reset successfully! You can now log in with your new password.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
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

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-gray-300">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-cyan-400 hover:text-cyan-300 transition"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg("");
              }}
              className="w-full px-5 py-4 rounded-2xl bg-black/40 border border-white/10 focus:border-cyan-400 outline-none text-white placeholder:text-gray-500 transition"
              required
            />
          </div>

          {/* Inline Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <span className="text-red-400 text-lg leading-none">⚠</span>
              <p className="text-red-300 text-sm">{errorMsg}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-cyan-400 text-black font-bold hover:scale-[1.02] active:scale-95 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-center text-gray-500 my-4">— OR —</div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-4 rounded-2xl border border-white/10 hover:border-cyan-400 hover:bg-white/5 flex items-center justify-center gap-3 transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
              alt="Google"
            />
            Continue with Google
          </button>
        </form>

        {/* Signup Link */}
        <p className="text-center text-gray-400 mt-8">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Signup
          </Link>
        </p>
      </div>

      {/* Account Created Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/25 rounded-3xl p-10 w-[90%] max-w-md text-center shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Account Created!
            </h2>
            <p className="text-gray-400 mb-8">
              Your account has been created successfully. Please login to continue.
            </p>

            <button
              onClick={() => setShowPopup(false)}
              className="w-full py-4 rounded-2xl bg-cyan-400 text-black font-bold hover:scale-[1.02] active:scale-95 transition"
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}