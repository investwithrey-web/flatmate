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
  const [recommendations, setRecommendations] = useState<(Property & { score: number })[]>([]);
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

    async function fetchDashboardData() {
      setLoading(true);
      try {
        // 1. Fetch User Profile
        const { data: profileData, error: profileErr } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.uid)
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
        const ownProps = propertyList.filter((p) => p.user_id === user.uid);
        setMyPostings(ownProps);

        // Calculate recommendations if onboarded
        if (profileData && profileData.onboarded) {
          const scored = propertyList
            .filter((p) => p.user_id !== user.uid) // don't recommend own property
            .map((p) => {
              const score = calculateMatchScore(p, profileData);
              return { ...p, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 3); // top 3 recommendations

          setRecommendations(scored);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, authLoading]);

  // ======================
  // COMPATIBILITY ALGORITHM
  // ======================
  const calculateMatchScore = (property: Property, userProfile: UserProfile): number => {
    let score = 0;

    // Gender Match (Weight: 25%)
    if (
      property.gender_preference === "Any" ||
      userProfile.gender === property.gender_preference ||
      property.gender_preference === ""
    ) {
      score += 25;
    }

    // Budget Match (Weight: 25%)
    if (property.rent <= userProfile.budget) {
      score += 25;
    } else if (property.rent <= userProfile.budget * 1.25) {
      score += 15;
    }

    // Food Habit Match (Weight: 15%)
    if (
      property.food_habit === "Any" ||
      userProfile.food_habit === property.food_habit ||
      property.food_habit === ""
    ) {
      score += 15;
    }

    // Smoking Match (Weight: 15%)
    if (
      property.smoking === "Allowed" ||
      (property.smoking === "Not Allowed" && userProfile.smoking === "Not Allowed")
    ) {
      score += 15;
    }

    // Drinking Match (Weight: 10%)
    if (
      property.drinking === "Allowed" ||
      (property.drinking === "Not Allowed" && userProfile.drinking === "Not Allowed")
    ) {
      score += 10;
    }

    // Social Level Match (Weight: 10%)
    if (property.social_level === userProfile.social_level || !property.social_level) {
      score += 10;
    } else {
      score += 5;
    }

    return score;
  };

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
    <div className="min-h-screen bg-black text-white px-6 py-12 relative">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/15 via-black to-purple-950/15 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold">
              Welcome, <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">{profile?.name || user?.displayName || user?.email?.split("@")[0]}</span>
            </h1>
            <p className="text-gray-400 mt-2">Manage your listings, profile, and check matches.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/post_property">
              <button className="px-6 py-3 rounded-xl bg-cyan-400 text-black font-semibold hover:scale-105 active:scale-95 transition">
                🏢 Post Property
              </button>
            </Link>
            <Link href="/profile">
              <button className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition font-semibold">
                👤 Edit Profile
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="text-gray-500 text-xs uppercase font-semibold">Profile Status</div>
            <div className="text-2xl font-bold mt-2 text-cyan-400 flex items-center gap-2">
              {profile?.onboarded ? "✨ Fully Completed" : "⚠️ Incomplete"}
            </div>
            {!profile?.onboarded && (
              <Link href="/onboarding" className="text-xs text-amber-400 hover:underline mt-2 block">
                Complete onboarding now →
              </Link>
            )}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="text-gray-500 text-xs uppercase font-semibold">My Active Postings</div>
            <div className="text-3xl font-black mt-2 text-white">{myPostings.length}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="text-gray-500 text-xs uppercase font-semibold">Match Compatibility</div>
            <div className="text-3xl font-black mt-2 text-white">
              {profile?.onboarded ? "Enabled" : "Disabled"}
            </div>
          </div>
        </div>

        {/* ONBOARDING CTA IF INCOMPLETE */}
        {!profile?.onboarded && (
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-[32px] p-8 text-center max-w-4xl mx-auto shadow-xl">
            <span className="text-4xl block mb-4">🧠</span>
            <h2 className="text-2xl font-bold mb-3">Unlock AI Compatibility Score</h2>
            <p className="text-gray-300 text-sm max-w-xl mx-auto mb-6">
              Complete the lifestyle onboarding quiz to see how compatible you are with listings on a scale of 0-100%!
            </p>
            <Link href="/onboarding">
              <button className="px-8 py-3 bg-cyan-400 text-black rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition">
                Take Onboarding Quiz
              </button>
            </Link>
          </div>
        )}

        {/* AI Matches & Recommendations */}
        {profile?.onboarded && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🧠</span> Best Match Recommendations
            </h2>

            {recommendations.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 text-center">
                <p className="text-gray-400">No properties available for matching in your area yet. Post one or check back later!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {recommendations.map((property) => (
                  <div
                    key={property.id}
                    onClick={() => setSelectedProperty(property)}
                    className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-cyan-400/50 hover:scale-[1.01] transition-all cursor-pointer flex flex-col group"
                  >
                    <div className="relative h-48 w-full bg-zinc-900 overflow-hidden">
                      <img
                        src={property.image_urls && property.image_urls.length > 0 ? property.image_urls[0] : "/first.jpg"}
                        alt={property.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                      />
                      <div className={`absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full font-bold text-xs shadow-md ${
                        property.score >= 80 ? "bg-emerald-500 text-white" :
                        property.score >= 50 ? "bg-amber-500 text-black" :
                        "bg-red-500 text-white"
                      }`}>
                        ✨ {property.score}% Match
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold line-clamp-1 group-hover:text-cyan-400 transition">{property.title}</h3>
                      <p className="text-gray-400 text-xs line-clamp-2 mt-2">{property.description}</p>
                      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-xs text-gray-400">
                        <span className="font-bold text-white text-lg">₹{property.rent.toLocaleString()}</span>
                        <span>{property.city}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Postings */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🏢</span> My Listed Properties
          </h2>

          {myPostings.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 text-center">
              <p className="text-gray-400 mb-6">You haven't posted any property listings yet.</p>
              <Link href="/post_property">
                <button className="px-6 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl text-sm font-semibold hover:border-cyan-400 hover:text-cyan-400 transition">
                  Create First Posting
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPostings.map((property) => (
                <div
                  key={property.id}
                  className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col relative"
                >
                  <div className="relative h-44 w-full bg-zinc-900">
                    <img
                      src={property.image_urls && property.image_urls.length > 0 ? property.image_urls[0] : "/first.jpg"}
                      alt={property.title}
                      className="object-cover w-full h-full"
                    />
                    <button
                      onClick={() => handleDeletePosting(property.id)}
                      className="absolute top-4 right-4 bg-black/60 hover:bg-red-600 hover:text-white p-2 rounded-full border border-white/10 transition text-red-400"
                      title="Delete Posting"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold line-clamp-1">{property.title}</h3>
                    <p className="text-gray-400 text-xs line-clamp-2 mt-2">{property.description}</p>
                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-xs text-gray-400">
                      <span className="font-bold text-white text-lg">₹{property.rent.toLocaleString()}</span>
                      <span className="font-semibold text-cyan-400 cursor-pointer hover:underline" onClick={() => setSelectedProperty(property)}>
                        View Details
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DETAILED DIALOG MODAL (Identical to Listings page for consistency) */}
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