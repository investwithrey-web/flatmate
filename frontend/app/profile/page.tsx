"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/auth-provider";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface UserProfile {
  name: string;
  phone: string;
  age: string;
  gender: string;
  occupation: string;
  city: string;
  sleep_schedule: string;
  food_habit: string;
  cleanliness: string;
  smoking: string;
  drinking: string;
  budget: string;
  gender_preference: string;
  social_level: string;
  noise_tolerance: string;
  overnight_guests: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // ======================
  // STATE
  // ======================
  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    phone: "",
    age: "",
    gender: "",
    occupation: "",
    city: "",
    sleep_schedule: "",
    food_habit: "",
    cleanliness: "",
    smoking: "",
    drinking: "",
    budget: "",
    gender_preference: "",
    social_level: "",
    noise_tolerance: "",
    overnight_guests: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ======================
  // FETCH USER DATA
  // ======================
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    async function fetchProfile() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.uid)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setFormData({
            name: data.name || "",
            phone: data.phone || "",
            age: data.age?.toString() || "",
            gender: data.gender || "",
            occupation: data.occupation || "",
            city: data.city || "",
            sleep_schedule: data.sleep_schedule || "",
            food_habit: data.food_habit || "",
            cleanliness: data.cleanliness || "",
            smoking: data.smoking || "",
            drinking: data.drinking || "",
            budget: data.budget?.toString() || "",
            gender_preference: data.gender_preference || "",
            social_level: data.social_level || "",
            noise_tolerance: data.noise_tolerance || "",
            overnight_guests: data.overnight_guests || "",
          });
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, authLoading]);

  // ======================
  // HANDLERS
  // ======================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: formData.name,
          phone: formData.phone,
          age: formData.age ? Number(formData.age) : null,
          gender: formData.gender,
          occupation: formData.occupation,
          city: formData.city,
          sleep_schedule: formData.sleep_schedule,
          food_habit: formData.food_habit,
          cleanliness: formData.cleanliness,
          smoking: formData.smoking,
          drinking: formData.drinking,
          budget: formData.budget ? Number(formData.budget) : null,
          gender_preference: formData.gender_preference,
          social_level: formData.social_level,
          noise_tolerance: formData.noise_tolerance,
          overnight_guests: formData.overnight_guests,
        })
        .eq("id", user.uid);

      if (error) throw error;

      alert("Profile updated successfully!");
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      alert("Error saving profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ======================
  // RENDER
  // ======================
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl font-bold animate-pulse text-cyan-400">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 relative">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/15 via-black to-purple-950/15 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              My Profile
            </h1>
            <p className="text-gray-400 mt-2">Manage your lifestyle quiz preferences and personal information.</p>
          </div>
          <Link href="/dashboard">
            <button className="px-5 py-2.5 rounded-xl border border-white/20 hover:bg-white/5 transition text-sm font-semibold">
              ← Back to Dashboard
            </button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Section 1: Basic Info */}
          <div className="bg-white/5 border border-white/10 rounded-[28px] p-8 backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              
              <div>
                <label className="block mb-2 text-sm text-gray-400">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 transition"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 transition"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">Occupation</label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 transition"
                >
                  <option value="">Select Occupation</option>
                  <option value="Student">Student</option>
                  <option value="Working Professional">Working Professional</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 transition"
                />
              </div>

            </div>
          </div>

          {/* Section 2: Lifestyle Habits */}
          <div className="bg-white/5 border border-white/10 rounded-[28px] p-8 backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">Lifestyle & Habits</h2>
            <div className="grid md:grid-cols-2 gap-6">
              
              <div>
                <label className="block mb-2 text-sm text-gray-400">Sleep Schedule</label>
                <select
                  name="sleep_schedule"
                  value={formData.sleep_schedule}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 transition"
                >
                  <option value="">Early Bird or Night Owl?</option>
                  <option value="Early Bird">Early Bird (Wake up early, sleep early)</option>
                  <option value="Night Owl">Night Owl (Stay up late, wake up late)</option>
                  <option value="Flexible">Flexible / No fixed routine</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">Food Habit</label>
                <select
                  name="food_habit"
                  value={formData.food_habit}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 transition"
                >
                  <option value="">Food Habits</option>
                  <option value="Veg">Vegetarian</option>
                  <option value="Non-Veg">Non-Vegetarian</option>
                  <option value="Any">Anything goes</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">Cleanliness Level</label>
                <select
                  name="cleanliness"
                  value={formData.cleanliness}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 transition"
                >
                  <option value="">Cleanliness Situation</option>
                  <option value="Very Clean">Very Clean (Neat Freak)</option>
                  <option value="Moderate">Moderate (Keep it tidy but relaxed)</option>
                  <option value="Relaxed">Relaxed (Don't mind some clutter)</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">Smoking Preference</label>
                <select
                  name="smoking"
                  value={formData.smoking}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 transition"
                >
                  <option value="">Smoking Allowed?</option>
                  <option value="Not Allowed">No, never</option>
                  <option value="Allowed">Yes, regularly / occasionally</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">Drinking Preference</label>
                <select
                  name="drinking"
                  value={formData.drinking}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 transition"
                >
                  <option value="">Drinking Allowed?</option>
                  <option value="Not Allowed">No, never</option>
                  <option value="Allowed">Yes, socially / occasionally</option>
                </select>
              </div>

            </div>
          </div>

          {/* Section 3: roommate Preferences */}
          <div className="bg-white/5 border border-white/10 rounded-[28px] p-8 backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">roommate Preferences</h2>
            <div className="grid md:grid-cols-2 gap-6">
              
              <div>
                <label className="block mb-2 text-sm text-gray-400">Maximum Monthly Rent Budget (INR)</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">Preferred Gender</label>
                <select
                  name="gender_preference"
                  value={formData.gender_preference}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 transition"
                >
                  <option value="">Select Preference</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Any">No Preference / Any</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">Social Level</label>
                <select
                  name="social_level"
                  value={formData.social_level}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 transition"
                >
                  <option value="">Social Personality</option>
                  <option value="Introvert">Introvert (Quiet, keep to myself)</option>
                  <option value="Ambivert">Ambivert (Balanced, friendly but independent)</option>
                  <option value="Extrovert">Extrovert (Outgoing, love gatherings)</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">Noise Tolerance</label>
                <select
                  name="noise_tolerance"
                  value={formData.noise_tolerance}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 transition"
                >
                  <option value="">Noise Tolerance</option>
                  <option value="Very Quiet">Very Quiet (Prefer pin-drop silence)</option>
                  <option value="Moderate">Moderate (Average noise is fine)</option>
                  <option value="Okay with Noise">Okay with Noise (Music, chatter are fine)</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-400">Overnight Guests Policy</label>
                <select
                  name="overnight_guests"
                  value={formData.overnight_guests}
                  onChange={handleChange}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-cyan-400 transition"
                >
                  <option value="">Overnight Guests Policy</option>
                  <option value="Allowed">Guests allowed freely</option>
                  <option value="Sometimes">Guests allowed occasionally with notice</option>
                  <option value="Not Allowed">No overnight guests allowed</option>
                </select>
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-cyan-400 text-black py-5 rounded-2xl text-xl font-bold hover:scale-[1.01] transition duration-300 disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}