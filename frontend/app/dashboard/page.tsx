"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/auth-provider";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Property {
  id: string;
  title: string;
  description: string;
  rent: number;
  deposit: number;
  property_type: string;
  available_from: string;
  room_type: string;
  current_flatmates: number;
  bathroom_type: string;
  furnishing: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  flat_vibe: string;
  current_occupants: string;
  visitors_policy: string;
  gender_preference: string;
  food_habit: string;
  smoking: string;
  drinking: string;
  occupation: string;
  sleep_schedule: string;
  cleanliness: string;
  guest_preference: string;
  pets: string;
  party_frequency: string;
  work_from_home: string;
  noise_tolerance: string;
  social_level: string;
  overnight_guests: string;
  sharing_preference: string;
  language_preference: string;
  gym_lifestyle: string;
  ideal_flatmate: string;
  contact_name: string;
  age: number;
  phone: string;
  image_urls: string[];
  user_id: string;
}

interface UserProfile {
  id: string;
  onboarded: boolean;
  name: string;
  gender: string;
  food_habit: string;
  smoking: string;
  drinking: string;
  budget: number;
  social_level: string;
  sleep_schedule: string;
  cleanliness: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // ======================
  // STATE
  // ======================
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myPostings, setMyPostings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // ======================
  // FETCH DATA
  // ======================
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const userId = user!.id;

    async function fetchDashboardData() {
      setLoading(true);
      try {
        // 1. Fetch User Profile
        const { data: profileData, error: profileErr } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (profileErr) throw profileErr;
        setProfile(profileData);

        // 2. Fetch all properties
        const { data: allProps, error: allPropsErr } = await supabase
          .from("properties")
          .select("*");

        if (allPropsErr) throw allPropsErr;

        const propertyList: Property[] = allProps || [];

        // Filter User's own postings
        const ownProps = propertyList.filter((p) => p.user_id === userId);
        setMyPostings(ownProps);

        // Compatibility/recommendations removed
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, authLoading]);

  // Compatibility algorithm removed (feature disabled)

  // ======================
  // DELETE PROPERTY
  // ======================
  const handleDeletePosting = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property posting?")) return;

    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyId);

      if (error) throw error;

      alert("Property deleted successfully.");
      setMyPostings(myPostings.filter((p) => p.id !== propertyId));
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete property: " + err.message);
    }
  };

  // ======================
  // RENDER HELPERS
  // ======================
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl font-bold animate-pulse text-cyan-400">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/10 via-black to-purple-950/10 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Dashboard</p>
            <h2 className="mt-4 text-3xl font-extrabold text-white">Hello, {profile?.name || user?.user_metadata?.full_name || user?.email?.split("@")[0]}</h2>
            <p className="mt-3 text-gray-400 text-sm leading-relaxed">Your flatmate hub for listings, matches and property insights.</p>

            <div className="mt-6 rounded-3xl bg-zinc-950/80 p-5 border border-cyan-400/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-[0.2em]">Profile</p>
                  <p className="mt-2 text-lg font-semibold text-white">{profile?.onboarded ? "Onboarded" : "Needs attention"}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${profile?.onboarded ? "bg-emerald-500/15 text-emerald-200" : "bg-amber-500/15 text-amber-200"}`}>
                  {profile?.onboarded ? "Ready" : "Pending"}
                </span>
              </div>
              {!profile?.onboarded && (
                <Link href="/onboarding" className="mt-4 block text-sm text-cyan-300 hover:underline">
                  Complete onboarding →
                </Link>
              )}
            </div>
          </div>

          {/* Quick Actions removed per request */}

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
            <h3 className="text-sm uppercase tracking-[0.25em] text-gray-400">Insights</h3>
            <div className="mt-5 space-y-4 text-sm text-gray-300">
              <div className="rounded-3xl bg-zinc-950/80 p-4">
                <p className="text-xs uppercase text-gray-500">Active listings</p>
                <p className="mt-2 text-2xl font-bold text-white">{myPostings.length}</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="space-y-8">
          <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Overview</p>
                <h1 className="mt-3 text-4xl font-extrabold text-white">Welcome back, {profile?.name || user?.user_metadata?.full_name || user?.email?.split("@")[0]}</h1>
                <p className="mt-3 text-gray-400 max-w-2xl">A quick view of your most important dashboard metrics, recommended matches, and active listings.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/post_property">
                  <button className="rounded-3xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-black hover:bg-cyan-300 transition">Post Property</button>
                </Link>
                <Link href="/profile">
                  <button className="rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:border-cyan-400 transition">Edit Profile</button>
                </Link>
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.25em] text-gray-400">Profile status</p>
              <p className="mt-4 text-3xl font-bold text-white">{profile?.onboarded ? "Completed" : "Incomplete"}</p>
              <p className="mt-3 text-sm text-gray-400">{profile?.onboarded ? "Your onboarding is complete." : "Finish your profile for better matches."}</p>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.25em] text-gray-400">Active listings</p>
              <p className="mt-4 text-3xl font-bold text-white">{myPostings.length}</p>
              <p className="mt-3 text-sm text-gray-400">Manage your live property posts and view performance.</p>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.25em] text-gray-400">Match engagement</p>
              <p className="mt-4 text-3xl font-bold text-white">N/A</p>
              <p className="mt-3 text-sm text-gray-400">Compatibility feature disabled.</p>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.25em] text-gray-400">Quick actions</p>
              <p className="mt-4 text-3xl font-bold text-white">{profile?.onboarded ? "Ready" : "Set up"}</p>
              <p className="mt-3 text-sm text-gray-400">Post, browse, and update your profile quickly.</p>
            </div>
          </section>

          {/* Recommended matches removed (compatibility disabled) */}

          <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">My Listings</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Your active property posts</h2>
              </div>
              <Link href="/post_property">
                <button className="rounded-3xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-black hover:bg-cyan-300 transition">Create New Listing</button>
              </Link>
            </div>

            {myPostings.length === 0 ? (
              <div className="mt-6 rounded-[28px] border border-white/10 bg-black/30 p-8 text-center text-gray-400">
                You haven't posted any properties yet.
              </div>
            ) : (
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myPostings.map((property) => (
                  <div key={property.id} className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-xl">
                    <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
                      <img
                        src={property.image_urls?.[0] || "/first.jpg"}
                        alt={property.title}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => handleDeletePosting(property.id)}
                        className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/60 p-2 text-red-400 transition hover:bg-red-600 hover:text-white"
                        title="Delete Posting"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white line-clamp-1">{property.title}</h3>
                        <p className="mt-2 text-sm text-gray-400 line-clamp-2">{property.description}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-300">
                        <span className="font-semibold text-white">₹{property.rent.toLocaleString()}</span>
                        <button onClick={() => setSelectedProperty(property)} className="text-cyan-300 hover:underline">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {selectedProperty && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-md animate-fadeIn">
          <div className="bg-zinc-950 border border-white/15 rounded-[36px] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-6 right-6 z-20 bg-black/60 border border-white/20 p-2 rounded-full hover:bg-cyan-400 hover:text-black transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2">
              {selectedProperty.image_urls && selectedProperty.image_urls.length > 0 ? (
                selectedProperty.image_urls.slice(0, 3).map((img, i) => (
                  <div key={i} className="relative h-60 rounded-2xl overflow-hidden bg-zinc-900">
                    <img src={img} alt="Property" className="object-cover w-full h-full" />
                  </div>
                ))
              ) : (
                <div className="col-span-3 h-60 rounded-2xl overflow-hidden bg-zinc-900 relative">
                  <img src="/first.jpg" alt="Fallback" className="object-cover w-full h-full" />
                </div>
              )}
            </div>

            <div className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/10 pb-6">
                <div>
                  <span className="px-3 py-1 rounded-md bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 text-xs uppercase font-bold tracking-wider">
                    {selectedProperty.room_type}
                  </span>
                  <h2 className="text-3xl font-extrabold mt-3">{selectedProperty.title}</h2>
                  <p className="text-gray-400 mt-1">{selectedProperty.address}</p>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-2xl font-black text-cyan-400">
                    ₹{selectedProperty.rent.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ mo</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">Deposit: ₹{selectedProperty.deposit.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-3">About this Listing</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedProperty.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6 bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div>
                      <span className="text-gray-500 text-xs uppercase font-semibold">Available From</span>
                      <p className="text-sm font-bold text-gray-300">{selectedProperty.available_from || "Immediate"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs uppercase font-semibold">Furnishing</span>
                      <p className="text-sm font-bold text-gray-300">{selectedProperty.furnishing || "Not specified"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs uppercase font-semibold">Bathroom Situation</span>
                      <p className="text-sm font-bold text-gray-300">{selectedProperty.bathroom_type || "Not specified"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs uppercase font-semibold">Current Flatmates</span>
                      <p className="text-sm font-bold text-gray-300">{selectedProperty.current_flatmates || 0} occupant(s)</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h3 className="text-lg font-bold mb-4">Contact Details</h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-500 text-xs block">Contact Name</span>
                        <span className="font-bold text-gray-200">{selectedProperty.contact_name || "Owner"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs block">Contact Number</span>
                        <a href={`tel:${selectedProperty.phone}`} className="font-bold text-cyan-400 hover:underline">
                          {selectedProperty.phone || "Not specified"}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}