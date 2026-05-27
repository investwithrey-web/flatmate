"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  // ======================
  // STATE
  // ======================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ======================
  // EMAIL LOGIN
  // ======================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter Email and Password.");
      return;
    }
    setLoading(true);

    try {
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Double check if profile exists in Supabase, create if missing (failsafe)
      const { data: dbUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", firebaseUser.uid)
        .maybeSingle();

      if (!dbUser) {
        await supabase.from("users").upsert({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || email.split("@")[0],
          provider: "email",
        });
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // GOOGLE LOGIN
  // ======================
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Sync user profile to Supabase database
      await supabase.from("users").upsert(
        {
          id: user.uid,
          email: user.email,
          name: user.displayName,
          image: user.photoURL,
          phone: null,
          provider: "google",
        },
        { onConflict: "email" }
      );

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Google sign-in failed.");
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
            Welcome back! Login to find your perfect match.
          </p>
        </div>

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
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-black/40 border border-white/10 focus:border-cyan-400 outline-none text-white placeholder:text-gray-500 transition"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-3 text-sm text-gray-300">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-black/40 border border-white/10 focus:border-cyan-400 outline-none text-white placeholder:text-gray-500 transition"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-cyan-400 text-black font-bold hover:scale-[1.02] active:scale-95 transition duration-300"
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
    </div>
  );
}