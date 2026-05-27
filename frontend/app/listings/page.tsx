"use client";

import { useEffect, useState } from "react";
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

export default function ListingsPage() {
  const { user } = useAuth();

  // ======================
  // STATE
  // ======================
  const [properties, setProperties] = useState<Property[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

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
            .eq("id", user.uid)
            .maybeSingle();

          if (!uErr && uData) {
            setUserProfile(uData);
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

  // ======================
  // COMPATIBILITY ALGORITHM
  // ======================
  const calculateMatchScore = (property: Property): { score: number; details: string[] } => {
    if (!userProfile || !userProfile.onboarded) {
      return { score: 0, details: ["Complete onboarding to view score"] };
    }

    let score = 0;
    const details: string[] = [];

    // 1. Gender Match (Weight: 25%)
    let genderMatch = false;
    if (
      property.gender_preference === "Any" ||
      userProfile.gender === property.gender_preference ||
      property.gender_preference === ""
    ) {
      genderMatch = true;
    }
    if (genderMatch) {
      score += 25;
      details.push("Gender Preference: Match (+25%)");
    } else {
      details.push("Gender Preference: Mismatch (0%)");
    }

    // 2. Budget Match (Weight: 25%)
    if (property.rent <= userProfile.budget) {
      score += 25;
      details.push("Budget: Within budget (+25%)");
    } else if (property.rent <= userProfile.budget * 1.25) {
      score += 15;
      details.push("Budget: Slightly over budget (+15%)");
    } else {
      details.push("Budget: Over budget (0%)");
    }

    // 3. Food Habit Match (Weight: 15%)
    let foodMatch = false;
    if (
      property.food_habit === "Any" ||
      userProfile.food_habit === property.food_habit ||
      property.food_habit === ""
    ) {
      foodMatch = true;
    }
    if (foodMatch) {
      score += 15;
      details.push("Food Habits: Compatible (+15%)");
    } else {
      details.push("Food Habits: Difference (+0%)");
    }

    // 4. Smoking Preference Match (Weight: 15%)
    let smokingMatch = false;
    if (
      property.smoking === "Allowed" ||
      (property.smoking === "Not Allowed" && userProfile.smoking === "Not Allowed")
    ) {
      smokingMatch = true;
    }
    if (smokingMatch) {
      score += 15;
      details.push("Smoking Policy: Compatible (+15%)");
    } else {
      details.push("Smoking Policy: Conflict (+0%)");
    }

    // 5. Drinking Preference Match (Weight: 10%)
    let drinkingMatch = false;
    if (
      property.drinking === "Allowed" ||
      (property.drinking === "Not Allowed" && userProfile.drinking === "Not Allowed")
    ) {
      drinkingMatch = true;
    }
    if (drinkingMatch) {
      score += 10;
      details.push("Drinking Policy: Compatible (+10%)");
    } else {
      details.push("Drinking Policy: Conflict (+0%)");
    }

    // 6. Social Level Match (Weight: 10%)
    if (property.social_level === userProfile.social_level || !property.social_level) {
      score += 10;
      details.push("Social Vibe: Match (+10%)");
    } else {
      score += 5;
      details.push("Social Vibe: Partial Match (+5%)");
    }

    return { score, details };
  };

  // ======================
  // FILTERING LOGIC
  // ======================
  const filteredProperties = properties.filter((prop) => {
    const matchesCity = prop.city?.toLowerCase().includes(searchCity.toLowerCase()) || 
                        prop.address?.toLowerCase().includes(searchCity.toLowerCase());
    const matchesRent = maxRent === "" || prop.rent <= Number(maxRent);
    const matchesPropType = propertyType === "" || prop.property_type === propertyType;
    const matchesRoomType = roomType === "" || prop.room_type === roomType;
    const matchesFurnishing = furnishing === "" || prop.furnishing === furnishing;

    return matchesCity && matchesRent && matchesPropType && matchesRoomType && matchesFurnishing;
  });

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

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
            <div className="text-gray-400 animate-pulse">Loading amazing properties...</div>
          </div>
        ) : filteredProperties.length === 0 ? (
          /* Empty State */
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
          /* Listings Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => {
              const { score } = calculateMatchScore(property);
              const hasScore = userProfile && userProfile.onboarded;

              return (
                <div
                  key={property.id}
                  onClick={() => setSelectedProperty(property)}
                  className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden hover:border-cyan-400/50 hover:scale-[1.01] transition-all duration-300 cursor-pointer shadow-lg flex flex-col h-full group"
                >
                  {/* Image Header */}
                  <div className="relative h-64 w-full bg-zinc-900 overflow-hidden">
                    <img
                      src={
                        property.image_urls && property.image_urls.length > 0
                          ? property.image_urls[0]
                          : "/first.jpg"
                      }
                      alt={property.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Compatibility Score Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      {hasScore ? (
                        <div className={`px-4 py-2 rounded-full font-bold text-sm shadow-md backdrop-blur-md ${
                          score >= 80 ? "bg-emerald-500/90 text-white" :
                          score >= 50 ? "bg-amber-500/90 text-black" :
                          "bg-red-500/90 text-white"
                        }`}>
                          ✨ {score}% Match
                        </div>
                      ) : (
                        <Link href="/onboarding" onClick={(e) => e.stopPropagation()}>
                          <div className="px-4 py-2 rounded-full bg-black/60 border border-white/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-400 hover:text-black transition backdrop-blur-md">
                            Get Match Score
                          </div>
                        </Link>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4 px-3 py-1 rounded-lg bg-black/50 text-white text-xs backdrop-blur-sm">
                      {property.property_type}
                    </div>
                  </div>

                  {/* Body Content */}
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

        {/* PROPERTY DETAIL MODAL */}
        {selectedProperty && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-md animate-fadeIn">
            <div className="bg-zinc-950 border border-white/15 rounded-[36px] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedProperty(null)}
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
                    <div key={i} className={`relative h-60 rounded-2xl overflow-hidden bg-zinc-900 ${
                      selectedProperty.image_urls.length === 1 ? "md:col-span-3" :
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
                      {userProfile && userProfile.onboarded ? (
                        <>
                          <div className="text-center py-4 mb-4">
                            <span className="text-4xl font-extrabold text-cyan-400">
                              {calculateMatchScore(selectedProperty).score}%
                            </span>
                            <span className="text-gray-400 text-xs block mt-1">Match compatibility score</span>
                          </div>
                          <ul className="text-xs space-y-2 border-t border-white/10 pt-4">
                            {calculateMatchScore(selectedProperty).details.map((detail, index) => (
                              <li key={index} className="flex justify-between items-center text-gray-300 py-1">
                                <span>{detail.split(":")[0]}</span>
                                <span className={detail.includes("Match") || detail.includes("Compatible") || detail.includes("Within") ? "text-emerald-400 font-bold" : "text-amber-400"}>
                                  {detail.split(":")[1]}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-sm text-gray-400 mb-4">Get exact compatibility matching percentages for this room.</p>
                          <Link href="/onboarding">
                            <button className="px-4 py-2 text-xs rounded-xl bg-cyan-400 text-black font-bold hover:scale-105 transition">
                              Take Onboarding Quiz
                            </button>
                          </Link>
                        </div>
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