"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/components/auth-provider";
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
  created_at: string;
  is_sold_out: boolean;
}

interface UserProfile {
  id: string;
  onboarded: boolean;
  gender: string;
  food_habit: string;
  smoking: string;
  drinking: string;
  budget: number;
  social_level: string;
  sleep_schedule: string;
  cleanliness: string;
}

interface AdhocPreferences {
  gender: string;
  food_habit: string;
  smoking: string;
  drinking: string;
  budget: number;
  social_level: string;
}

export default function ListingsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ======================
  // STATE
  // ======================
  const [properties, setProperties] = useState<Property[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [skipMatching, setSkipMatching] = useState(false);
  const [showPreferencePrompt, setShowPreferencePrompt] = useState(false);
  const [promptProperty, setPromptProperty] = useState<Property | null>(null);
  const [adhocPreferences, setAdhocPreferences] = useState<AdhocPreferences | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [preferenceForm, setPreferenceForm] = useState({
    budget: "",
    gender: "",
    foodHabit: "",
    smoking: "",
    drinking: "",
    socialLevel: "",
    roomType: "",
    moveInDate: "",
    parkingRequired: "",
    vehicleType: "",
    floorPreference: "",
    liftRequired: "",
  });

  const [backendScores, setBackendScores] = useState<Record<string, { score: number; details: string[] }>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [soldOutLoading, setSoldOutLoading] = useState(false);

  const handleToggleSoldOut = async (property: Property) => {
    if (!user || property.user_id !== user.id) return;
    setSoldOutLoading(true);
    try {
      const newValue = !property.is_sold_out;
      const { error } = await supabase
        .from("properties")
        .update({ is_sold_out: newValue })
        .eq("id", property.id);
      if (error) throw error;
      // Update local state
      setProperties((prev) =>
        prev.map((p) => (p.id === property.id ? { ...p, is_sold_out: newValue } : p))
      );
      if (selectedProperty?.id === property.id) {
        setSelectedProperty((prev) => prev ? { ...prev, is_sold_out: newValue } : prev);
      }
    } catch (err: any) {
      console.error("Error toggling sold out status:", err.message);
    } finally {
      setSoldOutLoading(false);
    }
  };

  const fetchAiMatches = async (prefs: any) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch("/api/ai-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: prefs }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load AI matches.");
      }
      const scoresMap: Record<string, { score: number; details: string[] }> = {};
      if (data.matches && Array.isArray(data.matches)) {
        data.matches.forEach((item: any) => {
          scoresMap[item.id] = {
            score: item.score,
            details: item.details,
          };
        });
      }
      setBackendScores(scoresMap);
      return { success: true };
    } catch (err: any) {
      console.warn("Error fetching AI matches:", err.message);
      setAiError(err.message || "Failed to compute compatibility scores.");
      return { success: false, error: err.message };
    } finally {
      setAiLoading(false);
    }
  };

  const handlePropertyClick = (property: Property) => {
    if (!user) {
      router.push("/login");
      return;
    }

    // On the listings grid, open the inline preference modal so the user
    // can fill preferences in-place. Do not redirect to onboarding.
    setSelectedProperty(property);

    if (userProfile?.onboarded || adhocPreferences) {
      setSkipMatching(false);
      setShowPreferencePrompt(false);
    } else {
      setPromptProperty(property);
      setShowPreferencePrompt(true);
      setSkipMatching(false);
    }
  };

  const handlePreferenceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setPreferenceForm({
      ...preferenceForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitPreferences = async () => {
    setPromptError(null);

    if (
      !preferenceForm.budget ||
      !preferenceForm.gender ||
      !preferenceForm.foodHabit ||
      !preferenceForm.smoking ||
      !preferenceForm.drinking ||
      !preferenceForm.socialLevel
    ) {
      setPromptError("Please answer all questions before continuing.");
      return;
    }

    if (!selectedProperty) {
      setPromptError("Please select a listing first.");
      return;
    }

    if (!user) {
      setPromptError("You must be logged in to do this.");
      return;
    }

    setPromptLoading(true);

    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          budget: Number(preferenceForm.budget),
          gender: preferenceForm.gender,
          food_habit: preferenceForm.foodHabit,
          smoking: preferenceForm.smoking,
          drinking: preferenceForm.drinking,
          social_level: preferenceForm.socialLevel,
          onboarded: true,
        })
        .eq("id", user.id);

      if (updateError) {
        throw new Error("Failed to save preferences to your profile.");
      }

      setUserProfile((prev) => prev ? {
        ...prev,
        budget: Number(preferenceForm.budget),
        gender: preferenceForm.gender,
        food_habit: preferenceForm.foodHabit,
        smoking: preferenceForm.smoking,
        drinking: preferenceForm.drinking,
        social_level: preferenceForm.socialLevel,
        onboarded: true,
      } : null);

      const prefs = {
        budget: Number(preferenceForm.budget),
        gender: preferenceForm.gender,
        foodHabit: preferenceForm.foodHabit,
        partyFrequency: "No preference",
        pets: "No preference",
        smoking: preferenceForm.smoking,
        drinking: preferenceForm.drinking,
        workFromHome: "No preference",
        cleanliness: "No preference",
        socialLevel: preferenceForm.socialLevel,
        flatmateStyle: "No preference",
        roomType: preferenceForm.roomType || "Any",
        moveInDate: preferenceForm.moveInDate || "",
        parkingRequired: preferenceForm.parkingRequired || "No preference",
        vehicleType: preferenceForm.vehicleType || "Any",
        floorPreference: preferenceForm.floorPreference || "",
        liftRequired: preferenceForm.liftRequired || "No preference",
      };

      const result = await fetchAiMatches(prefs);
      if (!result.success) {
        throw new Error(result.error || "Failed to load AI matches.");
      }

      localStorage.removeItem("flatmate_adhoc_prefs");
      setAdhocPreferences(null);

      setSkipMatching(false);
      setShowPreferencePrompt(false);
    } catch (err: any) {
      setPromptError(err.message || "Failed to calculate match score.");
    } finally {
      setPromptLoading(false);
    }
  };

  // Filters State
  const [searchCity, setSearchCity] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [roomType, setRoomType] = useState("");
  const [furnishing, setFurnishing] = useState("");

  // ======================
  // FETCH DATA
  // ======================
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 1. Fetch listings
        const { data: propData, error: propErr } = await supabase
          .from("properties")
          .select("*")
          .order("created_at", { ascending: false });

        if (propErr) throw propErr;
        setProperties(propData || []);

        // 2. Fetch logged-in user onboarding profile
        if (user) {
          const { data: uData, error: uErr } = await supabase
            .from("users")
            .select("id, onboarded, gender, food_habit, smoking, drinking, budget, social_level, sleep_schedule, cleanliness")
            .eq("id", user.id)
            .maybeSingle();

          if (!uErr && uData) {
            setUserProfile(uData);
            if (uData.onboarded) {
              fetchAiMatches({
                budget: uData.budget,
                gender: uData.gender || "Any",
                foodHabit: uData.food_habit || "Any",
                partyFrequency: "No preference",
                pets: "No preference",
                smoking: uData.smoking || "No preference",
                drinking: uData.drinking || "No preference",
                workFromHome: "No preference",
                cleanliness: uData.cleanliness || "No preference",
                socialLevel: uData.social_level || "No preference",
                flatmateStyle: "No preference",
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  useEffect(() => {
    if (loading || !properties.length) return;

    const selectedId = searchParams.get("selectedProperty");
    if (!selectedId) return;

    const foundProperty = properties.find((property) => property.id === selectedId);
    if (foundProperty) {
      setSelectedProperty(foundProperty);
      setSkipMatching(!userProfile?.onboarded);
    }
  }, [loading, properties, searchParams, userProfile]);

  // ======================
  // COMPATIBILITY ALGORITHM
  // ======================
  const scoredProperties = properties.map((property) => {
    const backendInfo = backendScores[property.id];
    return {
      ...property,
      score: backendInfo ? backendInfo.score : 0,
      details: backendInfo ? backendInfo.details : ["AI matchmaking score pending"],
    };
  });

  const sortedProperties = [...scoredProperties].sort((a, b) => b.score - a.score);

  const bestMatches = sortedProperties.slice(0, 3);

  // ======================
  // FILTERING LOGIC
  // ======================
  const filteredProperties = sortedProperties.filter((prop) => {
    const matchesCity = prop.city?.toLowerCase().includes(searchCity.toLowerCase()) ||
      prop.address?.toLowerCase().includes(searchCity.toLowerCase());
    const matchesRent = maxRent === "" || prop.rent <= Number(maxRent);
    const matchesPropType = propertyType === "" || prop.property_type === propertyType;
    const matchesRoomType = roomType === "" || prop.room_type === roomType;
    const matchesFurnishing = furnishing === "" || prop.furnishing === furnishing;

    return matchesCity && matchesRent && matchesPropType && matchesRoomType && matchesFurnishing;
  });

  const ownSelectedProperty = selectedProperty && user ? selectedProperty.user_id === user.id : false;

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 relative">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/10 via-black to-purple-950/10 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Title */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            Explore Property Listings
          </h1>
          <p className="text-gray-400 mt-3 text-lg max-w-xl">
            Filter properties and find roommates compatible with your lifestyle.
          </p>
        </div>

        {/* Filter Section Card */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 mb-12 backdrop-blur-xl">
          <h2 className="text-xl font-bold mb-4 text-cyan-400">Search & Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

            {/* Search City */}
            <input
              type="text"
              placeholder="Search city or location..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition"
            />

            {/* Max Rent */}
            <input
              type="number"
              placeholder="Max Monthly Rent (INR)"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition"
            />

            {/* Property Type */}
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition"
            >
              <option value="">All Property Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Flat">Flat</option>
              <option value="PG">PG</option>
              <option value="Villa">Villa</option>
            </select>

            {/* Room Type */}
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition"
            >
              <option value="">All Room Situations</option>
              <option value="Private Room">Private Room</option>
              <option value="Shared Room">Shared Room</option>
              <option value="Entire Flat">Entire Flat</option>
            </select>

            {/* Furnishing */}
            <select
              value={furnishing}
              onChange={(e) => setFurnishing(e.target.value)}
              className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition"
            >
              <option value="">All Furnishing States</option>
              <option value="Fully Furnished">Fully Furnished</option>
              <option value="Semi Furnished">Semi Furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>

          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-10">
            {userProfile?.onboarded && bestMatches.length > 0 && (
              <div className="mb-10 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Top Property Matches</h2>
                    <p className="text-gray-400 mt-1">These are the properties that score highest against your flatmate preferences.</p>
                  </div>
                  <div className="rounded-3xl bg-cyan-400/10 px-4 py-2 text-cyan-200 text-sm font-semibold">Best match first</div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {bestMatches.map((property, index) => (
                    <div key={property.id} className="rounded-3xl border border-white/10 bg-zinc-950 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs uppercase tracking-[0.3em] text-cyan-300">#{index + 1}</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${property.score >= 80 ? "bg-emerald-500/20 text-emerald-300" :
                            property.score >= 50 ? "bg-amber-500/20 text-amber-300" :
                              "bg-red-500/20 text-red-300"
                          }`}>{property.score}% match</span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold text-white">{property.title}</h3>
                      <p className="mt-2 text-gray-400 text-sm line-clamp-2">{property.description}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-300">
                        <span>₹{property.rent.toLocaleString()}</span>
                        <span>{property.city}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
                <div className="text-gray-400 animate-pulse">Loading amazing properties...</div>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-24 bg-white/5 border border-white/10 rounded-[32px]">
                <span className="text-5xl mb-6 block">🏢</span>
                <h3 className="text-2xl font-bold text-white mb-2">No Properties Found</h3>
                <p className="text-gray-400 max-w-md mx-auto px-4">
                  We couldn't find any properties matching your current filter set. Try resetting filters or adding a listing of your own!
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setSearchCity("");
                      setMaxRent("");
                      setPropertyType("");
                      setRoomType("");
                      setFurnishing("");
                    }}
                    className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition"
                  >
                    Reset Filters
                  </button>
                  <Link href="/post_property">
                    <button className="px-6 py-3 rounded-xl bg-cyan-400 text-black font-semibold hover:bg-cyan-500 transition">
                      Post Property
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProperties.map((property) => {
                  const backendInfo = backendScores[property.id];
                  const hasScore = !!backendInfo && !skipMatching;
                  const score = backendInfo ? backendInfo.score : 0;
                  const isOwnProperty = user && property.user_id === user.id;

                  return (
                    <div
                      key={property.id}
                      onClick={() => handlePropertyClick(property)}
                      className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden hover:border-cyan-400/50 hover:scale-[1.01] transition-all duration-300 cursor-pointer shadow-lg flex flex-col h-full group"
                    >
                      <div className="relative h-64 w-full bg-zinc-900 overflow-hidden">
                        <img
                          src={
                            property.image_urls && property.image_urls.length > 0
                              ? property.image_urls[0]
                              : "/first.jpg"
                          }
                          alt={property.title}
                          className={`object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ${property.is_sold_out ? "brightness-50 grayscale" : ""}`}
                        />

                        {/* Sold Out Overlay */}
                        {property.is_sold_out && (
                          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                            <div className="rotate-[-20deg] border-4 border-red-500 rounded-lg px-6 py-2 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                              <span className="text-red-400 font-black text-2xl tracking-[0.2em] uppercase">Sold Out</span>
                            </div>
                          </div>
                        )}

                        <div className="absolute top-4 right-4 z-10">
                          {property.is_sold_out ? (
                            <div className="px-4 py-2 rounded-full bg-red-600/90 text-white font-bold text-xs shadow-md backdrop-blur-md uppercase tracking-wide">
                              🔴 Sold Out
                            </div>
                          ) : isOwnProperty ? (
                            <div className="px-4 py-2 rounded-full bg-cyan-500/90 text-black font-bold text-sm shadow-md backdrop-blur-md">
                              Your Listing
                            </div>
                          ) : hasScore ? (
                            <div className={`px-4 py-2 rounded-full font-bold text-sm shadow-md backdrop-blur-md ${score >= 80 ? "bg-emerald-500/90 text-white" :
                                score >= 50 ? "bg-amber-500/90 text-black" :
                                  "bg-red-500/90 text-white"
                              }`}>
                              ✨ {score}% Match
                            </div>
                          ) : (
                            <div className="px-4 py-2 rounded-full bg-black/60 border border-white/20 text-cyan-400 text-xs font-semibold backdrop-blur-md">
                              Open AI Match
                            </div>
                          )}
                        </div>

                        <div className="absolute bottom-4 left-4 px-3 py-1 rounded-lg bg-black/50 text-white text-xs backdrop-blur-sm">
                          {property.property_type}
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <h3 className="text-xl font-bold line-clamp-1 group-hover:text-cyan-400 transition">
                            {property.title}
                          </h3>
                        </div>

                        <p className="text-gray-400 text-sm line-clamp-2 mb-6">
                          {property.description}
                        </p>

                        <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Monthly Rent</div>
                            <div className="text-2xl font-black text-white">
                              ₹{property.rent.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Location</div>
                            <div className="text-sm font-semibold text-gray-300">
                              {property.city}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="rounded-[32px] border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-xl backdrop-blur-xl sticky top-6 self-start">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold mb-1">AI Assistant</p>
                    <h2 className="text-xl font-bold text-white">Find Your Match</h2>
                  </div>
                </div>
                {selectedProperty ? (
                  <button
                    onClick={() => {
                      setSelectedProperty(null);
                      setSkipMatching(false);
                      setPromptError(null);
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Discover if this flat is your perfect fit. Our AI analyzes lifestyles, habits, and vibes to give you a personalized compatibility score.
              </p>
            </div>

            {selectedProperty ? (
              <div className="space-y-6">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-2 flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-900 flex-shrink-0 relative">
                    <img
                      src={selectedProperty.image_urls && selectedProperty.image_urls.length > 0 ? selectedProperty.image_urls[0] : "/first.jpg"}
                      alt={selectedProperty.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <div className="py-2 pr-4">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{selectedProperty.title}</h3>
                    <p className="text-xs text-cyan-400 font-semibold mt-1">₹{selectedProperty.rent.toLocaleString()} <span className="text-gray-500 font-normal">/ mo</span></p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <span>📍</span> {selectedProperty.city}
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-black/40 p-6 shadow-inner space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>🎯</span> Your Preferences
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Tell us a bit about yourself so our AI can calculate the match score.</p>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Monthly budget (INR)</label>
                      <select
                        name="budget"
                        value={preferenceForm.budget}
                        onChange={handlePreferenceChange}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-white outline-none focus:border-cyan-400 transition text-sm"
                      >
                        <option value="">Select Range</option>
                        <option value="10000">5k - 10k</option>
                        <option value="15000">10k - 15k</option>
                        <option value="20000">15k - 20k</option>
                        <option value="25000">20k - 25k</option>
                        <option value="30000">25k - 30k</option>
                        <option value="40000">30k - 40k</option>
                        <option value="50000">40k - 50k</option>
                        <option value="75000">50k - 75k</option>
                        <option value="100000">75k - 1 Lakh</option>
                        <option value="100001">1 Lakh+</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Gender</label>
                        <select
                          name="gender"
                          value={preferenceForm.gender}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-white outline-none focus:border-cyan-400 transition text-sm"
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Any">Any</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Food Habit</label>
                        <select
                          name="foodHabit"
                          value={preferenceForm.foodHabit}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-white outline-none focus:border-cyan-400 transition text-sm"
                        >
                          <option value="">Select</option>
                          <option value="Any">Any</option>
                          <option value="Vegetarian">Vegetarian</option>
                          <option value="Non-vegetarian">Non-vegetarian</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Smoking</label>
                        <select
                          name="smoking"
                          value={preferenceForm.smoking}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-white outline-none focus:border-cyan-400 transition text-sm"
                        >
                          <option value="">Select</option>
                          <option value="Allowed">Allowed</option>
                          <option value="Not Allowed">Not Allowed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Drinking</label>
                        <select
                          name="drinking"
                          value={preferenceForm.drinking}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-white outline-none focus:border-cyan-400 transition text-sm"
                        >
                          <option value="">Select</option>
                          <option value="Allowed">Allowed</option>
                          <option value="Not Allowed">Not Allowed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Social Vibe</label>
                      <select
                        name="socialLevel"
                        value={preferenceForm.socialLevel}
                        onChange={handlePreferenceChange}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-white outline-none focus:border-cyan-400 transition text-sm"
                      >
                        <option value="">Select</option>
                        <option value="Quiet">Quiet</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Social">Social</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Room Type</label>
                        <select
                          name="roomType"
                          value={preferenceForm.roomType}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-white outline-none focus:border-cyan-400 transition text-sm"
                        >
                          <option value="">Any</option>
                          <option value="Private Room">Private Room</option>
                          <option value="Double Shared Room">Double Shared Room</option>
                          <option value="Triple Shared Room">Triple Shared Room</option>
                          <option value="Entire Flat">Entire Flat</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Move-in Date</label>
                        <input
                          type="date"
                          name="moveInDate"
                          value={preferenceForm.moveInDate}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-white outline-none focus:border-cyan-400 transition text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Need Parking?</label>
                        <select
                          name="parkingRequired"
                          value={preferenceForm.parkingRequired}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-white outline-none focus:border-cyan-400 transition text-sm"
                        >
                          <option value="">No preference</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      {preferenceForm.parkingRequired === "Yes" && (
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Vehicle Type</label>
                          <select
                            name="vehicleType"
                            value={preferenceForm.vehicleType}
                            onChange={handlePreferenceChange}
                            className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-white outline-none focus:border-cyan-400 transition text-sm"
                          >
                            <option value="">Any</option>
                            <option value="2 Wheeler">2 Wheeler</option>
                            <option value="4 Wheeler">4 Wheeler</option>
                            <option value="Both">Both</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Need Lift?</label>
                        <select
                          name="liftRequired"
                          value={preferenceForm.liftRequired}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-white outline-none focus:border-cyan-400 transition text-sm"
                        >
                          <option value="">No preference</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Preferred Floor</label>
                        <input
                          type="number"
                          name="floorPreference"
                          placeholder="e.g. 2"
                          value={preferenceForm.floorPreference}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 text-white outline-none focus:border-cyan-400 transition text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {promptError && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-200 flex items-center gap-2">
                      <span>⚠️</span> {promptError}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      disabled={promptLoading}
                      onClick={handleSubmitPreferences}
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3.5 text-sm font-bold text-black shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {promptLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                          Analyzing compatibility...
                        </>
                      ) : (
                        <>
                          <span>⚡</span> Reveal AI Match Score
                        </>
                      )}
                    </button>
                    <button
                      disabled={promptLoading}
                      onClick={() => {
                        setSkipMatching(true);
                      }}
                      className="w-full rounded-xl border border-white/10 bg-transparent px-5 py-2.5 text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white transition disabled:opacity-50"
                    >
                      Skip this step
                    </button>
                  </div>
                </div>

                {!promptLoading && selectedProperty && !skipMatching && backendScores[selectedProperty.id] && (
                  <div className="rounded-[24px] border border-cyan-400/30 bg-cyan-950/20 p-6 shadow-[0_0_15px_rgba(34,211,238,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
                    <div className="text-center py-2 mb-2">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-[4px] border-cyan-400/20 mb-3 relative">
                        <div className="absolute inset-0 rounded-full border-[4px] border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}></div>
                        <span className="text-4xl font-extrabold text-white">
                          {backendScores[selectedProperty.id]?.score ?? 0}<span className="text-2xl text-cyan-400">%</span>
                        </span>
                      </div>
                      <span className="text-gray-300 text-sm font-medium block">Overall Compatibility</span>
                    </div>
                    <ul className="text-sm space-y-3 border-t border-white/10 pt-5">
                      {(backendScores[selectedProperty.id]?.details ?? []).map((detail, index) => {
                        const parts = detail.split(":");
                        const category = parts[0];
                        const description = parts.slice(1).join(":");
                        const isPositive = detail.includes("Match") || detail.includes("Compatible") || detail.includes("Within") || detail.includes("+");
                        return (
                          <li key={index} className="flex justify-between items-start gap-4 text-gray-300 py-1">
                            <span className="font-medium text-gray-400 whitespace-nowrap">{category}</span>
                            <span className={`text-right ${isPositive ? "text-emerald-400 font-semibold" : "text-amber-400"}`}>
                              {description || detail}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {skipMatching && (
                  <div className="rounded-[24px] border border-white/10 bg-black/40 p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">🙈</span>
                    </div>
                    <p className="text-gray-300 text-sm">You skipped the AI match. Preferences can be updated anytime.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 rounded-[24px] border border-white/10 bg-black/40 px-6 mt-8">
                <div className="w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mb-5 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                  <span className="text-2xl">🪄</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Ready to meet your match?</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Select a property on the left to reveal how compatible you are with the flatmates. Our AI looks beyond the surface to find your perfect vibe.
                </p>
              </div>
            )}
          </aside>
        </div>

        {/* PREFERENCE PROMPT MODAL */}
        {showPreferencePrompt && promptProperty && (
          <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto backdrop-blur-md animate-fadeIn">
            <div className="flex min-h-full items-center justify-center p-4 py-12">
              <div className="bg-zinc-950 border border-white/15 rounded-[36px] w-full max-w-xl p-8 shadow-2xl">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">Complete your preferences</h2>
                  <p className="text-gray-400 mt-3">Answer a few questions so the AI can calculate the best match score for this property.</p>
                </div>
                <button
                  onClick={() => {
                    setShowPreferencePrompt(false);
                    setPromptProperty(null);
                    setPromptError(null);
                  }}
                  className="text-gray-400 hover:text-white transition"
                  aria-label="Close prompt"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
                  <p className="text-sm text-gray-300">
                    Fill your preferences to get an AI match score for this room. You can also skip this step and continue without a score.
                  </p>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Monthly budget (INR)</label>
                      <select
                        name="budget"
                        value={preferenceForm.budget}
                        onChange={handlePreferenceChange}
                        className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
                      >
                        <option value="">Select Range</option>
                        <option value="10000">5k - 10k</option>
                        <option value="15000">10k - 15k</option>
                        <option value="20000">15k - 20k</option>
                        <option value="25000">20k - 25k</option>
                        <option value="30000">25k - 30k</option>
                        <option value="40000">30k - 40k</option>
                        <option value="50000">40k - 50k</option>
                        <option value="75000">50k - 75k</option>
                        <option value="100000">75k - 1 Lakh</option>
                        <option value="100001">1 Lakh+</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Gender preference</label>
                        <select
                          name="gender"
                          value={preferenceForm.gender}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Any">Any</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Food habits</label>
                        <select
                          name="foodHabit"
                          value={preferenceForm.foodHabit}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
                        >
                          <option value="">Select</option>
                          <option value="Any">Any</option>
                          <option value="Vegetarian">Vegetarian</option>
                          <option value="Non-vegetarian">Non-vegetarian</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Smoking</label>
                        <select
                          name="smoking"
                          value={preferenceForm.smoking}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
                        >
                          <option value="">Select</option>
                          <option value="Allowed">Allowed</option>
                          <option value="Not Allowed">Not Allowed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Drinking</label>
                        <select
                          name="drinking"
                          value={preferenceForm.drinking}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
                        >
                          <option value="">Select</option>
                          <option value="Allowed">Allowed</option>
                          <option value="Not Allowed">Not Allowed</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Preferred social vibe</label>
                      <select
                        name="socialLevel"
                        value={preferenceForm.socialLevel}
                        onChange={handlePreferenceChange}
                        className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
                      >
                        <option value="">Select</option>
                        <option value="Quiet">Quiet</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Social">Social</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Room Type</label>
                        <select
                          name="roomType"
                          value={preferenceForm.roomType}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
                        >
                          <option value="">Any</option>
                          <option value="Private Room">Private Room</option>
                          <option value="Double Shared Room">Double Shared Room</option>
                          <option value="Triple Shared Room">Triple Shared Room</option>
                          <option value="Entire Flat">Entire Flat</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Move-in Date</label>
                        <input
                          type="date"
                          name="moveInDate"
                          value={preferenceForm.moveInDate}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Need Parking?</label>
                        <select
                          name="parkingRequired"
                          value={preferenceForm.parkingRequired}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
                        >
                          <option value="">No preference</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      {preferenceForm.parkingRequired === "Yes" && (
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">Vehicle Type</label>
                          <select
                            name="vehicleType"
                            value={preferenceForm.vehicleType}
                            onChange={handlePreferenceChange}
                            className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
                          >
                            <option value="">Any</option>
                            <option value="2 Wheeler">2 Wheeler</option>
                            <option value="4 Wheeler">4 Wheeler</option>
                            <option value="Both">Both</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Need Lift?</label>
                        <select
                          name="liftRequired"
                          value={preferenceForm.liftRequired}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
                        >
                          <option value="">No preference</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Preferred Floor</label>
                        <input
                          type="number"
                          name="floorPreference"
                          placeholder="e.g. 2"
                          value={preferenceForm.floorPreference}
                          onChange={handlePreferenceChange}
                          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-cyan-400 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {promptError && (
                    <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-200">
                      {promptError}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    disabled={promptLoading}
                    onClick={() => {
                      if (promptProperty) {
                        setSelectedProperty(promptProperty);
                        setSkipMatching(true);
                        setShowPreferencePrompt(false);
                        setPromptProperty(null);
                      }
                    }}
                    className="w-full sm:w-auto rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition disabled:opacity-50"
                  >
                    Continue without score
                  </button>
                  <button
                    disabled={promptLoading}
                    onClick={handleSubmitPreferences}
                    className="w-full sm:w-auto rounded-3xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-black hover:bg-cyan-300 transition disabled:opacity-50"
                  >
                    {promptLoading ? "AI is finding best match..." : "Get match score"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* PROPERTY DETAIL MODAL */}
        {selectedProperty && !showPreferencePrompt && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-md animate-fadeIn">
            <div className="bg-zinc-950 border border-white/15 rounded-[36px] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">

              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedProperty(null);
                  setSkipMatching(false);
                  setPromptProperty(null);
                }}
                className="absolute top-6 right-6 z-20 bg-black/60 border border-white/20 p-2 rounded-full hover:bg-cyan-400 hover:text-black transition"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Banner Images Carousel (Simulated by first 3 or grid) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2">
                {selectedProperty.image_urls && selectedProperty.image_urls.length > 0 ? (
                  selectedProperty.image_urls.slice(0, 3).map((img, i) => (
                    <div key={i} className={`relative h-60 rounded-2xl overflow-hidden bg-zinc-900 ${selectedProperty.image_urls.length === 1 ? "md:col-span-3" :
                        selectedProperty.image_urls.length === 2 && i === 0 ? "md:col-span-2" : ""
                      }`}>
                      <img src={img} alt="Property" className="object-cover w-full h-full" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 h-60 rounded-2xl overflow-hidden bg-zinc-900 relative">
                    <img src="/first.jpg" alt="Fallback" className="object-cover w-full h-full" />
                  </div>
                )}
              </div>

              {/* Modal Body */}
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

                {/* Grid Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                  {/* Left Column: Description & Specs */}
                  <div className="md:col-span-2 space-y-8">
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-white">About this Listing</h3>
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

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h4 className="font-bold text-white mb-4">Flat Vibe & Policies</h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                          <span className="text-gray-500 text-xxs uppercase block mb-1">Flat Vibe</span>
                          <span className="text-xs font-semibold text-cyan-400">{selectedProperty.flat_vibe || "Friendly"}</span>
                        </div>
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                          <span className="text-gray-500 text-xxs uppercase block mb-1">Occupants</span>
                          <span className="text-xs font-semibold text-cyan-400">{selectedProperty.current_occupants || "Mixed"}</span>
                        </div>
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                          <span className="text-gray-500 text-xxs uppercase block mb-1">Visitors Policy</span>
                          <span className="text-xs font-semibold text-cyan-400">{selectedProperty.visitors_policy || "Allowed"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Match Analysis & Contact */}
                  <div className="space-y-8">

                    {/* Compatibility Score Breakdown */}
                    <div className="bg-gradient-to-br from-cyan-950/20 to-purple-950/20 border border-white/15 rounded-3xl p-6">
                      <h3 className="text-lg font-bold mb-4 text-white">Match Compatibility</h3>
                      {ownSelectedProperty ? (
                        <div className="text-center py-6 space-y-4">
                          <p className="text-sm text-gray-300">
                            This is your posted listing. Match scores are shown for other people's listings.
                          </p>
                          <button
                            onClick={() => handleToggleSoldOut(selectedProperty)}
                            disabled={soldOutLoading}
                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${
                              selectedProperty.is_sold_out
                                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                                : "bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30"
                            }`}
                          >
                            {soldOutLoading ? (
                              <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                Updating...
                              </span>
                            ) : selectedProperty.is_sold_out ? (
                              "✅ Reopen Listing"
                            ) : (
                              "🔴 Mark as Sold Out"
                            )}
                          </button>
                          {selectedProperty.is_sold_out && (
                            <p className="text-xs text-red-400/80">
                              This listing is currently marked as sold out and is visible to others with a Sold Out tag.
                            </p>
                          )}
                        </div>
                      ) : skipMatching || (!userProfile?.onboarded && !adhocPreferences) ? (
                        <div className="text-center py-6 space-y-4">
                          <p className="text-sm text-gray-400">
                            No matching score is available for this property because your preferences are not completed.
                          </p>
                          <button
                            onClick={() => {
                              if (selectedProperty) {
                                setPromptProperty(selectedProperty);
                                setShowPreferencePrompt(true);
                              }
                            }}
                            className="px-4 py-2 text-xs rounded-xl bg-cyan-400 text-black font-bold hover:scale-105 transition"
                          >
                            Fill Preferences to get a match score
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="text-center py-4 mb-4">
                            <span className="text-4xl font-extrabold text-cyan-400">
                              {backendScores[selectedProperty.id]?.score ?? 0}%
                            </span>
                            <span className="text-gray-400 text-xs block mt-1">Match compatibility score</span>
                          </div>
                          <ul className="text-xs space-y-2 border-t border-white/10 pt-4">
                            {(backendScores[selectedProperty.id]?.details ?? []).map((detail, index) => {
                              const parts = detail.split(":");
                              const category = parts[0];
                              const description = parts.slice(1).join(":");
                              return (
                                <li key={index} className="flex justify-between items-center text-gray-300 py-1">
                                  <span>{category}</span>
                                  <span className={detail.includes("Match") || detail.includes("Compatible") || detail.includes("Within") || detail.includes("+") ? "text-emerald-400 font-bold" : "text-amber-400"}>
                                    {description || detail}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      )}
                    </div>

                    {/* Contact Details */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                      <h3 className="text-lg font-bold mb-4 text-white">Contact Host</h3>
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
                        {selectedProperty.latitude && selectedProperty.longitude && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${selectedProperty.latitude},${selectedProperty.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-3 rounded-xl border border-white/10 hover:border-cyan-400 text-center text-xs font-semibold hover:bg-white/5 transition"
                          >
                            📍 View on Google Maps
                          </a>
                        )}
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .text-xxs {
          font-size: 0.65rem;
        }
      `}</style>
    </div>
  );
}