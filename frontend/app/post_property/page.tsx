"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/components/auth-provider";
import Link from "next/link";

const MAX_PROPERTY_IMAGES = 5;

export default function PostPropertyPage() {
  const { user, loading } = useAuth();
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [formData, setFormData] = useState({
    // PROPERTY DETAILS
    title: "",
    description: "",
    rent: "",
    deposit: "",
    propertyType: "",
    availableFrom: "",

    // ROOM DETAILS
    roomType: "",
    currentFlatmates: "",
    bathroomType: "",
    furnishing: "",

    // LOCATION
    address: "",
    city: "",
    latitude: "",
    longitude: "",

    // FLAT VIBE
    flatVibe: "",
    currentOccupants: "",
    visitorsPolicy: "",

    // FLATMATE PREFERENCES
    genderPreference: "",
    foodHabit: "",
    smoking: "",
    drinking: "",
    occupation: "",
    sleepSchedule: "",
    cleanliness: "",
    guestPreference: "",
    pets: "",
    partyFrequency: "",
    workFromHome: "",
    noiseTolerance: "",
    socialLevel: "",
    overnightGuests: "",
    sharingPreference: "",
    languagePreference: "",
    gymLifestyle: "",

    // AI MATCHING
    idealFlatmate: "",

    // CONTACT DETAILS
    name: "",
    age: "",
    phone: "",

    // NEW FIELDS
    parkingAvailable: "",
    vehicleType: "",
    floorNumber: "",
    hasLift: "",

    // IMAGES
    images: [] as File[],
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length !== e.target.files.length) {
      alert("Only image files are allowed.");
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const getCurrentLocation = () => {
    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );

          const data = await response.json();

          setFormData((prev) => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lon.toString(),
            address: data.display_name || "",
            city:
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              "",
          }));
        } catch (error) {
          console.log(error);
        }

        setLoadingLocation(false);
      },
      (error) => {
        console.log(error);
        setLoadingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first");
      return;
    }

    if (formData.images.length > MAX_PROPERTY_IMAGES) {
      alert(
        `You can upload up to ${MAX_PROPERTY_IMAGES} images (you selected ${formData.images.length}).`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure user exists in Supabase (required for properties.user_id FK)
      const { data: dbUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.uid)
        .maybeSingle();

      if (!dbUser) {
        const { error: userSyncError } = await supabase.from("users").upsert({
          id: user.uid,
          email: user.email ?? "",
          name: user.displayName || user.email?.split("@")[0] || "User",
          provider: "email",
        });

        if (userSyncError) {
          alert("Could not sync your profile. Please try logging in again.");
          return;
        }
      }


    const uploadedImageUrls: string[] = [];
    const uploadedImagePaths: string[] = [];

    for (let i = 0; i < formData.images.length; i++) {
      const image = formData.images[i];
      const uniqueId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const filePath = `${user.uid}/${uniqueId}-${i}-${image.name}`;

      const { error: uploadError } = await supabase.storage
        .from("Images")
        .upload(filePath, image);

      if (uploadError) {
        console.error(uploadError);
        continue;
      }

      uploadedImagePaths.push(filePath);

      const { data: publicUrlData } = supabase.storage
        .from("Images")
        .getPublicUrl(filePath);

      uploadedImageUrls.push(publicUrlData.publicUrl);
    }

    // =========================
    // INSERT PROPERTY WITH IMAGE URLS
    // =========================

    const { data: finalPropertyData, error: finalPropertyError } =
      await supabase
        .from("properties")
        .insert([
          {
            user_id: user.uid,
            title: formData.title,
            description: formData.description,
            rent: Number(formData.rent),
            deposit: Number(formData.deposit),
            property_type: formData.propertyType,
            available_from: formData.availableFrom,
            room_type: formData.roomType,
            current_flatmates: Number(formData.currentFlatmates),
            bathroom_type: formData.bathroomType,
            furnishing: formData.furnishing,
            address: formData.address,
            city: formData.city,
            latitude: formData.latitude,
            longitude: formData.longitude,
            flat_vibe: formData.flatVibe,
            current_occupants: formData.currentOccupants,
            visitors_policy: formData.visitorsPolicy,
            gender_preference: formData.genderPreference,
            food_habit: formData.foodHabit,
            smoking: formData.smoking,
            drinking: formData.drinking,
            occupation: formData.occupation,
            sleep_schedule: formData.sleepSchedule,
            cleanliness: formData.cleanliness,
            guest_preference: formData.guestPreference,
            pets: formData.pets,
            party_frequency: formData.partyFrequency,
            work_from_home: formData.workFromHome,
            noise_tolerance: formData.noiseTolerance,
            social_level: formData.socialLevel,
            overnight_guests: formData.overnightGuests,
            sharing_preference: formData.sharingPreference,
            language_preference: formData.languagePreference,
            gym_lifestyle: formData.gymLifestyle,
            ideal_flatmate: formData.idealFlatmate,
            contact_name: formData.name,
            age: Number(formData.age),
            phone: formData.phone,
            image_urls: uploadedImageUrls,
            parking_available: formData.parkingAvailable,
            vehicle_type: formData.vehicleType,
            floor_number: formData.floorNumber,
            has_lift: formData.hasLift,
          },
        ])
        .select()
        .single();

    if (finalPropertyError) {
      console.error(finalPropertyError);
      if (uploadedImagePaths.length > 0) {
        await supabase.storage.from("Images").remove(uploadedImagePaths);
      }

      alert(`Failed to save property: ${finalPropertyError.message}`);
      return;
    }

    alert("Property posted successfully!");
    setFormData((prev) => ({ ...prev, images: [] }));
  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl font-bold animate-pulse text-cyan-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] p-10 text-center shadow-2xl relative z-10">
          <h2 className="text-3xl font-extrabold text-cyan-400 mb-6">Login Required</h2>
          <p className="text-gray-400 mb-8">
            You must be logged in to post a property listing. Please sign in or create an account to get started.
          </p>
          <div className="flex flex-col gap-4">
            <Link href="/login" className="w-full py-4 rounded-2xl bg-cyan-400 text-black font-bold hover:scale-[1.02] active:scale-95 transition duration-300">
              Login
            </Link>
            <Link href="/signup" className="w-full py-4 rounded-2xl border border-white/20 hover:bg-white/5 hover:border-cyan-400 text-white font-semibold transition duration-300">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            Post Your Property
          </h1>

          <p className="text-gray-400 mt-4 text-lg">
            Find the perfect flatmate using AI-powered compatibility matching.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* PROPERTY DETAILS */}
          <div className="glassCard">
            <h2 className="sectionTitle">Property Details</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                name="title"
                placeholder="Property Title"
                value={formData.title}
                onChange={handleChange}
                className="inputStyle"
                required
              />

              <input
                type="number"
                name="rent"
                placeholder="Monthly Rent"
                value={formData.rent}
                onChange={handleChange}
                className="inputStyle"
                required
              />

              <input
                type="number"
                name="deposit"
                placeholder="Security Deposit"
                value={formData.deposit}
                onChange={handleChange}
                className="inputStyle"
              />

              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="inputStyle"
              >
                <option value="">Property Type</option>
                <option value="Apartment">Apartment</option>
                <option value="Flat">Flat</option>
                <option value="PG">PG</option>
                <option value="Villa">Villa</option>
              </select>

              <div className="flex flex-col">
                <label className="text-sm text-gray-400 mb-1 ml-1">Available From (dd/mm/yyyy)</label>
                <input
                  type="date"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={handleChange}
                  className="inputStyle"
                />
              </div>
              
              <input
                type="number"
                name="floorNumber"
                placeholder="Floor Number"
                value={formData.floorNumber}
                onChange={handleChange}
                className="inputStyle"
              />

              <select
                name="hasLift"
                value={formData.hasLift}
                onChange={handleChange}
                className="inputStyle"
              >
                <option value="">Lift Available?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <textarea
              name="description"
              placeholder="Describe your property..."
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="inputStyle w-full mt-6"
            />
          </div>

          {/* ROOM DETAILS */}
          <div className="glassCard">
            <h2 className="sectionTitle">Room Details</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                className="inputStyle"
              >
                <option value="">What is available?</option>
                <option value="Private Room">Private Room</option>
                <option value="Double Shared">Double Shared</option>
                <option value="Triple Shared">Triple Shared</option>
                <option value="Entire Flat">Entire Flat</option>
              </select>

              {formData.roomType !== "Entire Flat" && (
                 <input
                   type="number"
                   name="currentFlatmates"
                   placeholder="How many people already live here?"
                   value={formData.currentFlatmates}
                   onChange={handleChange}
                   className="inputStyle"
                 />
               )}

              <select
                name="bathroomType"
                value={formData.bathroomType}
                onChange={handleChange}
                className="inputStyle"
              >
                <option value="">Bathroom situation?</option>
                <option value="Private Bathroom">
                  Private Bathroom
                </option>
                <option value="Shared Bathroom">
                  Shared Bathroom
                </option>
              </select>

              <select
                name="furnishing"
                value={formData.furnishing}
                onChange={handleChange}
                className="inputStyle"
              >
                <option value="">Furnishing Status</option>
                <option value="Fully Furnished">
                  Fully Furnished
                </option>
                <option value="Semi Furnished">
                  Semi Furnished
                </option>
                <option value="Unfurnished">
                  Unfurnished
                </option>
              </select>
            </div>
          </div>

          {/* LOCATION */}
          <div className="glassCard">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
              <h2 className="sectionTitle !mb-0">
                Location Details
              </h2>

              <button
                type="button"
                onClick={getCurrentLocation}
                className="bg-cyan-400 text-black px-5 py-3 rounded-xl font-semibold hover:scale-105 transition"
              >
                {loadingLocation
                  ? "Fetching Location..."
                  : "Use Current Location"}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className="inputStyle"
              />

              <input
                type="text"
                name="address"
                placeholder="Full Address"
                value={formData.address}
                onChange={handleChange}
                className="inputStyle"
              />

              <input
                type="text"
                name="latitude"
                placeholder="Latitude"
                value={formData.latitude}
                readOnly
                className="inputStyle"
              />

              <input
                type="text"
                name="longitude"
                placeholder="Longitude"
                value={formData.longitude}
                readOnly
                className="inputStyle"
              />
            </div>
          </div>

          {/* FLAT VIBE */}
          <div className="glassCard">
            <h2 className="sectionTitle">Flat Vibe & Amenities</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <select
                name="flatVibe"
                value={formData.flatVibe}
                onChange={handleChange}
                className="inputStyle"
              >
                <option value="">How would you describe the flat vibe?</option>
                <option value="Quiet & Peaceful">
                  Quiet & Peaceful
                </option>
                <option value="Friendly & Social">
                  Friendly & Social
                </option>
                <option value="Party & Fun">Party & Fun</option>
                <option value="Professional & Focused">
                  Professional & Focused
                </option>
              </select>

              <select
                name="currentOccupants"
                value={formData.currentOccupants}
                onChange={handleChange}
                className="inputStyle"
              >
                <option value="">Who currently lives here?</option>
                <option value="Students">Students</option>
                <option value="Working Professionals">
                  Working Professionals
                </option>
                <option value="Mixed">Mixed</option>
              </select>

              <select
                name="visitorsPolicy"
                value={formData.visitorsPolicy}
                onChange={handleChange}
                className="inputStyle"
              >
                <option value="">Visitors Policy</option>
                <option value="Visitors Allowed">
                  Visitors Allowed
                </option>
                <option value="Limited Visitors">
                  Limited Visitors
                </option>
                <option value="No Visitors">No Visitors</option>
              </select>
              
              <select
                name="parkingAvailable"
                value={formData.parkingAvailable}
                onChange={handleChange}
                className="inputStyle"
              >
                <option value="">Parking Available?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              
              {formData.parkingAvailable === "Yes" && (
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="inputStyle"
                >
                  <option value="">Vehicle Type Supported</option>
                  <option value="Two Wheeler">Two Wheeler</option>
                  <option value="Four Wheeler">Four Wheeler</option>
                  <option value="Both">Both</option>
                </select>
              )}
            </div>
          </div>

          {/* FLATMATE PREFERENCES */}
          <div className="glassCard">
            <h2 className="sectionTitle">
              Flatmate Preferences
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  name: "genderPreference",
                  label: "Preferred Gender",
                  options: ["Male", "Female", "Any"],
                },
                {
                  name: "foodHabit",
                  label: "Food Habit",
                  options: ["Veg", "Non-Veg", "Any"],
                },
                {
                  name: "smoking",
                  label: "Smoking Preference",
                  options: ["Allowed", "Not Allowed"],
                },
                {
                  name: "drinking",
                  label: "Drinking Preference",
                  options: ["Allowed", "Not Allowed"],
                },
                {
                  name: "cleanliness",
                  label: "Cleanliness Level",
                  options: ["Very Clean", "Moderate", "Relaxed"],
                },
                {
                  name: "pets",
                  label: "Pets Allowed?",
                  options: ["Yes", "No"],
                },
                {
                  name: "partyFrequency",
                  label: "Party Frequency",
                  options: ["Frequently", "Sometimes", "Rarely"],
                },
                {
                  name: "workFromHome",
                  label: "Work From Home?",
                  options: ["Yes", "Hybrid", "No"],
                },
                {
                  name: "noiseTolerance",
                  label: "Noise Tolerance",
                  options: [
                    "Very Quiet",
                    "Moderate",
                    "Okay with Noise",
                  ],
                },
                {
                  name: "socialLevel",
                  label: "Social Personality",
                  options: [
                    "Introvert",
                    "Ambivert",
                    "Extrovert",
                  ],
                },
                {
                  name: "overnightGuests",
                  label: "Overnight Guests",
                  options: ["Allowed", "Sometimes", "Not Allowed"],
                },
              ].map((item) => (
                <select
                  key={item.name}
                  name={item.name}
                  value={(formData as any)[item.name]}
                  onChange={handleChange}
                  className="inputStyle"
                >
                  <option value="">{item.label}</option>

                  {item.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ))}

              <input
                type="text"
                name="occupation"
                placeholder="Preferred Occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="inputStyle"
              />

              <input
                type="text"
                name="sleepSchedule"
                placeholder="Sleep Schedule"
                value={formData.sleepSchedule}
                onChange={handleChange}
                className="inputStyle"
              />

              <input
                type="text"
                name="languagePreference"
                placeholder="Preferred Language"
                value={formData.languagePreference}
                onChange={handleChange}
                className="inputStyle"
              />

              <input
                type="text"
                name="gymLifestyle"
                placeholder="Fitness / Gym Lifestyle"
                value={formData.gymLifestyle}
                onChange={handleChange}
                className="inputStyle"
              />
            </div>

            <textarea
              name="idealFlatmate"
              placeholder="Describe your ideal flatmate..."
              value={formData.idealFlatmate}
              onChange={handleChange}
              rows={4}
              className="inputStyle w-full mt-6"
            />
          </div>

          {/* CONTACT */}
          <div className="glassCard">
            <h2 className="sectionTitle">
              Contact Information
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className="inputStyle"
              />

              <input
                type="number"
                name="age"
                placeholder="Your Age"
                value={formData.age}
                onChange={handleChange}
                className="inputStyle"
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="inputStyle"
              />
            </div>
          </div>

          {/* IMAGE UPLOAD */}
          <div className="glassCard">
            <h2 className="sectionTitle">
              Upload Property Images
            </h2>

            <p className="text-gray-400 text-sm mb-4">
              You can upload up to {MAX_PROPERTY_IMAGES} images. Select them all in one go (hold Ctrl/Cmd to pick multiple).
            </p>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-4"
            />

            <p
              className={`mt-3 text-sm font-medium ${
                formData.images.length > MAX_PROPERTY_IMAGES
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {formData.images.length} / {MAX_PROPERTY_IMAGES} images selected
            </p>

            {formData.images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((file, index) => (
                  <div
                    key={index}
                    className="bg-black border border-white/10 rounded-xl p-3 text-sm truncate"
                  >
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isSubmitting || formData.images.length > MAX_PROPERTY_IMAGES}
            className="w-full bg-cyan-400 text-black py-5 rounded-2xl text-xl font-bold hover:scale-[1.01] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? "Posting..." : "Post Property"}
          </button>
        </form>
      </div>

      {/* GLOBAL STYLES */}
      <style jsx>{`
        .glassCard {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 32px;
          backdrop-filter: blur(14px);
        }

        .sectionTitle {
          font-size: 30px;
          font-weight: 700;
          margin-bottom: 32px;
        }

        .inputStyle {
          width: 100%;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 16px;
          outline: none;
          color: white;
        }

        .inputStyle:focus {
          border-color: #22d3ee;
          box-shadow: 0 0 0 1px #22d3ee;
        }
      `}</style>
    </div>
  );
}