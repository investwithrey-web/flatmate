"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();

  // ======================
  // STATE
  // ======================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ======================
  // EMAIL SIGNUP
  // ======================
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert("Please fill in Name, Email, and Password.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone || null,
          }
        }
      });

      if (error) {
        throw error;
      }

      // Sync user to public.users table immediately if user is created
      if (data.user) {
        await supabase.from("users").upsert(
          {
            id: data.user.id,
            email: data.user.email,
            name,
            phone: phone || null,
            provider: "email",
          },
          { onConflict: "email" }
        );
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong during signup");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // GOOGLE SIGNUP
  // ======================
  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
      // Note: Redirect happens automatically
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Google signup failed");
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
              AI-powered roommate matching platform. Match on lifestyle, cleanliness, sleep schedule, and budget.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-8 lg:p-14">
          <div className="max-w-md mx-auto">
            <h2 className="text-4xl font-bold mb-10">Create Account</h2>

            {/* FORM */}
            <form onSubmit={handleSignup} className="space-y-6">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400 transition"
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400 transition"
                required
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400 transition"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400 transition"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-cyan-400 text-black font-bold hover:scale-[1.02] active:scale-95 transition duration-300"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>

              <div className="text-center text-gray-500 my-4">— OR —</div>

              {/* GOOGLE */}
              <button
                type="button"
                onClick={handleGoogleSignup}
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
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}