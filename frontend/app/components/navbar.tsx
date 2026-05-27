"use client";

import Link from "next/link";
import { useAuth } from "./auth-provider";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className="w-full border-b border-white/10 backdrop-blur-md bg-black/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide text-cyan-400 cursor-pointer hover:opacity-90 transition">
            RoomLensAI
          </h1>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8 text-gray-300">
          <Link href="/" className="hover:text-cyan-400 transition duration-300">
            Home
          </Link>
          <Link href="/listings" className="hover:text-cyan-400 transition duration-300">
            Listings
          </Link>
          <Link href="/post_property" className="hover:text-cyan-400 transition duration-300">
            Post Property
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-cyan-400 transition duration-300">
                Dashboard
              </Link>
              <Link href="/profile" className="hover:text-cyan-400 transition duration-300">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-xl border border-white/20 hover:border-red-500 hover:text-red-500 transition duration-300 text-sm font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-cyan-400 transition duration-300">
                Login
              </Link>
              <Link href="/signup">
                <button className="px-5 py-2 rounded-xl bg-cyan-400 text-black font-semibold hover:scale-105 transition duration-300">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-300 hover:text-cyan-400 focus:outline-none"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            )}
          </svg>
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95 py-4 px-6 flex flex-col gap-4 text-gray-300">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-cyan-400 py-1 transition"
          >
            Home
          </Link>
          <Link
            href="/listings"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-cyan-400 py-1 transition"
          >
            Listings
          </Link>
          <Link
            href="/post_property"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-cyan-400 py-1 transition"
          >
            Post Property
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-cyan-400 py-1 transition"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-cyan-400 py-1 transition"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left py-2 text-red-400 hover:text-red-300 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-cyan-400 py-1 transition"
              >
                Login
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full py-3 rounded-xl bg-cyan-400 text-black font-semibold hover:bg-cyan-500 transition">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
