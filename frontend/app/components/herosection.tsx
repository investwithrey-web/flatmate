"use client";

import Link from "next/link";
import Image from "next/image";

const images = [
  "/first.jpg",
  "/second.jpg",
  "/third.jpg",
  "/fourth.jpg",
];

const features = [
  {
    icon: "🧠",
    title: "AI Compatibility Match",
    desc: "Smart roommate matching based on lifestyle, habits, personality, and preferences.",
  },
  {
    icon: "🛡️",
    title: "Verified Profiles",
    desc: "Phone, email, and ID verification for safer and more trusted connections.",
  },
  {
    icon: "📍",
    title: "Location Based Search",
    desc: "Find roommates and properties near your office, college, or preferred area.",
  },
  {
    icon: "✨",
    title: "Smart Recommendations",
    desc: "Get AI-powered flat and roommate suggestions personalized for you.",
  },
];

const stats = [
  {
    number: "10K+",
    label: "Verified Users",
  },
  {
    number: "3K+",
    label: "Properties Listed",
  },
  {
    number: "95%",
    label: "Successful Matches",
  },
  {
    number: "24/7",
    label: "AI Assistance",
  },
];

const testimonials = [
  {
    name: "Rahul Sharma",
    text: "Found an amazing flatmate within 3 days. The AI matching was surprisingly accurate.",
  },
  {
    name: "Priya Mehta",
    text: "The best roommate finding platform I’ve used. Clean UI and great recommendations.",
  },
  {
    name: "Aman Verma",
    text: "Loved the safety and verification features. Helped me relocate stress-free.",
  },
];

export default function HeroSection() {
  return (
    <div className="bg-black text-white overflow-hidden">


      {/* HERO SECTION */}
      <section className="relative overflow-hidden">

        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/30 via-black to-cyan-900/20 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-4 pb-10 lg:py-24">

          {/* MOBILE SCROLLING IMAGES — shown first on mobile, hidden on lg+ */}
          <div className="lg:hidden overflow-hidden mb-6">
            <div className="animate-scroll-left flex gap-4" style={{ width: 'max-content' }}>
              {[...images, ...images, ...images].map((img, index) => (
                <div
                  key={index}
                  className="relative flex-shrink-0 w-[200px] h-[140px] rounded-2xl overflow-hidden border border-white/10"
                >
                  <Image
                    src={img}
                    alt="Room"
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-10 items-center">

            {/* LEFT IMAGE COLUMN */}
            <div className="hidden lg:flex flex-col gap-6 h-[700px] overflow-hidden">

              <div className="animate-scroll-up flex flex-col gap-6">

                {[...images, ...images].map((img, index) => (
                  <div
                    key={index}
                    className="relative w-full h-[260px] rounded-3xl overflow-hidden border border-white/10"
                  >
                    <Image
                      src={img}
                      alt="Room"
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ))}

              </div>
            </div>

            {/* CENTER CONTENT */}
            <div className="text-center">

              <div className="inline-block px-4 py-2 rounded-full bg-white/10 text-sm mb-3 lg:mb-6 border border-white/10">
                AI Powered Flatmate Matching
              </div>

              <h1 className="text-4xl lg:text-7xl font-extrabold leading-tight">
                Find Your Perfect
                <span className="text-cyan-400"> Flatmate </span>
                Using AI
              </h1>

              <p className="mt-4 lg:mt-8 text-gray-300 text-base lg:text-lg leading-relaxed max-w-xl mx-auto">
                Match with compatible roommates based on lifestyle,
                food habits, sleep schedule, work timing,
                cleanliness, personality, and budget.
              </p>

              <div className="flex justify-center gap-5 mt-6 lg:mt-10 flex-wrap">

                <Link href="/listings">
                  <button className="px-8 py-4 rounded-2xl bg-white text-black font-semibold hover:scale-105 transition duration-300 shadow-lg">
                    Find Flat
                  </button>
                </Link>

                <Link href="/post_property">
                  <button className="px-8 py-4 rounded-2xl border border-white hover:bg-white hover:text-black transition duration-300">
                    Post Property
                  </button>
                </Link>

              </div>

              {/* PREMIUM HIGHLIGHTS */}
              <div className="flex justify-center gap-8 mt-4 lg:mt-12 flex-wrap text-sm lg:text-base text-gray-400">

                <div className="hover:text-cyan-400 transition duration-300">
                  AI Powered Recommendations
                </div>

                <div className="hover:text-cyan-400 transition duration-300">
                  Personalized Roommate Discovery
                </div>

                <div className="hover:text-cyan-400 transition duration-300">
                  Seamless Property Experience
                </div>

              </div>

            </div>

            {/* RIGHT IMAGE COLUMN */}
            <div className="hidden lg:flex flex-col gap-6 h-[700px] overflow-hidden">

              <div className="animate-scroll-down flex flex-col gap-6">

                {[...images, ...images].map((img, index) => (
                  <div
                    key={index}
                    className="relative w-full h-[260px] rounded-3xl overflow-hidden border border-white/10"
                  >
                    <Image
                      src={img}
                      alt="Flat"
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ))}

              </div>
            </div>

          </div>
        </div>

      </section>

      {/* STATS SECTION */}
      <section className="py-20 border-t border-white/10">

        <div className="max-w-7xl mx-auto px-6">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

            {stats.map((item, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-sm"
              >
                <h2 className="text-4xl font-bold text-cyan-400">
                  {item.number}
                </h2>

                <p className="mt-3 text-gray-300">
                  {item.label}
                </p>
              </div>
            ))}

          </div>

        </div>

      </section>

      {/* FEATURES SECTION */}
      <section className="py-24">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">

            <h2 className="text-4xl lg:text-5xl font-bold">
              Why Choose Us
            </h2>

            <p className="text-gray-400 mt-5 max-w-2xl mx-auto">
              We use AI and verified profiles to help you find the perfect
              roommate and property experience.
            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-cyan-400/40 transition duration-300"
              >
                <div className="text-5xl mb-6">
                  {feature.icon}
                </div>

                <h3 className="text-2xl font-semibold mb-4">
                  {feature.title}
                </h3>

                <p className="text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}

          </div>

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 border-t border-white/10">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">

            <h2 className="text-4xl lg:text-5xl font-bold">
              How It Works
            </h2>

          </div>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-white/5 rounded-3xl border border-white/10 p-8">
              <div className="text-cyan-400 text-5xl font-bold mb-6">
                01
              </div>

              <h3 className="text-2xl font-semibold mb-4">
                Create Your Profile
              </h3>

              <p className="text-gray-400">
                Add your lifestyle preferences, budget, food habits,
                sleep schedule, and personality traits.
              </p>
            </div>

            <div className="bg-white/5 rounded-3xl border border-white/10 p-8">
              <div className="text-cyan-400 text-5xl font-bold mb-6">
                02
              </div>

              <h3 className="text-2xl font-semibold mb-4">
                AI Finds Matches
              </h3>

              <p className="text-gray-400">
                Our AI engine analyzes compatibility and recommends
                ideal roommates and properties.
              </p>
            </div>

            <div className="bg-white/5 rounded-3xl border border-white/10 p-8">
              <div className="text-cyan-400 text-5xl font-bold mb-6">
                03
              </div>

              <h3 className="text-2xl font-semibold mb-4">
                Move In Together
              </h3>

              <p className="text-gray-400">
                Chat securely, finalize your choice, and move into
                your ideal shared space.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* TESTIMONIALS */}
      <section className="py-24">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">

            <h2 className="text-4xl lg:text-5xl font-bold">
              What Users Say
            </h2>

          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {testimonials.map((item, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-3xl p-8"
              >
                <div className="text-cyan-400 text-xl mb-5">
                  ⭐⭐⭐⭐⭐
                </div>

                <p className="text-gray-300 leading-relaxed">
                  "{item.text}"
                </p>

                <div className="mt-6 font-semibold">
                  {item.name}
                </div>
              </div>
            ))}

          </div>

        </div>

      </section>

      {/* CTA SECTION */}
      <section className="py-24 border-t border-white/10">

        <div className="max-w-5xl mx-auto px-6 text-center">

          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-[40px] p-12">

            <div className="text-cyan-400 text-sm tracking-[0.3em] uppercase mb-6">
            Smart Living Starts Here
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Ready To Find Your Perfect Flatmate?
            </h2>

            <p className="text-gray-300 mt-6 max-w-2xl mx-auto text-lg">
              Join thousands of users already finding smarter,
              safer, and more compatible living spaces.
            </p>

            <div className="flex justify-center gap-5 mt-10 flex-wrap">

              <Link href="/signup">
                <button className="px-8 py-4 rounded-2xl bg-white text-black font-semibold hover:scale-105 transition duration-300">
                  Get Started
                </button>
              </Link>

              <Link href="/listings">
                <button className="px-8 py-4 rounded-2xl border border-white hover:bg-white hover:text-black transition duration-300">
                  Explore Listings
                </button>
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}
<footer className="border-t border-white/10 py-10 bg-black">

  <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row justify-between items-center gap-5">

    {/* LEFT SIDE WEBSITE NAME */}
    <h2 className="text-3xl font-extrabold tracking-wide text-cyan-400">
      RoomLensAI
    </h2>

    {/* CENTER LINKS */}
    <div className="flex gap-8 text-gray-400 text-sm flex-wrap justify-center">

      <Link href="/" className="hover:text-cyan-400 transition">
        Home
      </Link>

      <Link href="/listings" className="hover:text-cyan-400 transition">
        Listings
      </Link>

      <Link href="/post_property" className="hover:text-cyan-400 transition">
        Post Property
      </Link>

      <Link href="/login" className="hover:text-cyan-400 transition">
        Login
      </Link>

    </div>

    {/* RIGHT SIDE COPYRIGHT */}
    <div className="text-gray-500 text-sm text-center lg:text-right">
      © 2026 RoomLensAI. All Rights Reserved.
    </div>

  </div>

</footer>

    </div>
  );
}