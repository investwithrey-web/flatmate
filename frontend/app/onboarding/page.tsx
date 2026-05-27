"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/auth-provider";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // ======================
  // STATE
  // ======================
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: General Info
    age: "",
    gender: "",
    occupation: "",
    city: "",

    // Step 2: Lifestyle Habits
    sleepSchedule: "",
    foodHabit: "",
    cleanliness: "",
    smoking: "",
    drinking: "",

    // Step 3: roommate Preferences
    budget: "",
    genderPreference: "",
    socialLevel: "",
    noiseTolerance: "",
    overnightGuests: "",
  });

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

  const nextStep = () => {
    // Validate current step fields
    if (step === 1) {
      if (!formData.age || !formData.gender || !formData.occupation || !formData.city) {
        alert("Please fill in all fields.");
        return;
      }
    } else if (step === 2) {
      if (
        !formData.sleepSchedule ||
        !formData.foodHabit ||
        !formData.cleanliness ||
        !formData.smoking ||
        !formData.drinking
      ) {
        alert("Please answer all lifestyle questions.");
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate Step 3
    if (
      !formData.budget ||
      !formData.genderPreference ||
      !formData.socialLevel ||
      !formData.noiseTolerance ||
      !formData.overnightGuests
    ) {
      alert("Please complete all fields in this step.");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          age: Number(formData.age),
          gender: formData.gender,
          occupation: formData.occupation,
          city: formData.city,
          sleep_schedule: formData.sleepSchedule,
          food_habit: formData.foodHabit,
          cleanliness: formData.cleanliness,
          smoking: formData.smoking,
          drinking: formData.drinking,
          budget: Number(formData.budget),
          gender_preference: formData.genderPreference,
          social_level: formData.socialLevel,
          noise_tolerance: formData.noiseTolerance,
          overnight_guests: formData.overnightGuests,
          onboarded: true,
        })
        .eq("id", user.uid);

      if (error) {
        throw error;
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Onboarding failed:", err);
      alert("Failed to save profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ======================
  // RENDER HELPERS
  // ======================
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
          <h2 className="text-3xl font-extrabold text-cyan-400 mb-6">Access Denied</h2>
          <p className="text-gray-400 mb-8">
            You must be logged in to access the onboarding quiz.
          </p>
          <div className="flex flex-col gap-4">
            <Link href="/login" className="w-full py-4 rounded-2xl bg-cyan-400 text-black font-bold hover:scale-[1.02] active:scale-95 transition">
              Login
            </Link>
            <Link href="/signup" className="w-full py-4 rounded-2xl border border-white/20 hover:bg-white/5 text-white font-semibold transition">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 relative flex items-center justify-center">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-black to-purple-950/20 z-0" />

      {/* Main card container */}
      <div className="relative z-10 w-full max-w-2xl bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] p-8 md:p-12 shadow-2xl">
        
        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-2 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-cyan-400 h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step Indicator */}
        <div className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-2">
          Step {step} of 3
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-white">
          {step === 1 && "Tell us about yourself"}
          {step === 2 && "Your lifestyle & habits"}
          {step === 3 && "Your ideal flatmate & budget"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: GENERAL INFO */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block mb-3 text-sm text-gray-300">Your Age</label>
                <input
                  type="number"
                  name="age"
                  placeholder="e.g. 24"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-400 transition"
                  min="16"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block mb-3 text-sm text-gray-300">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-400 transition"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-3 text-sm text-gray-300">Occupation</label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-400 transition"
                  required
                >
                  <option value="">Select Occupation</option>
                  <option value="Student">Student</option>
                  <option value="Working Professional">Working Professional</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-3 text-sm text-gray-300">Current City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Bangalore"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-400 transition"
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 2: LIFESTYLE HABITS */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block mb-3 text-sm text-gray-300">Sleep Schedule</label>
                <select
                  name="sleepSchedule"
                  value={formData.sleepSchedule}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-400 transition"
                  required
                >
                  <option value="">Early Bird or Night Owl?</option>
                  <option value="Early Bird">Early Bird (Wake up early, sleep early)</option>
                  <option value="Night Owl">Night Owl (Stay up late, wake up late)</option>
                  <option value="Flexible">Flexible / No fixed routine</option>
                </select>
              </div>

              <div>
                <label className="block mb-3 text-sm text-gray-300">Food Habit</label>
                <select
                  name="foodHabit"
                  value={formData.foodHabit}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-400 transition"
                  required
                >
                  <option value="">Your Food Habits?</option>
                  <option value="Veg">Vegetarian</option>
                  <option value="Non-Veg">Non-Vegetarian</option>
                  <option value="Any">Anything goes</option>
                </select>
              </div>

              <div>
                <label className="block mb-3 text-sm text-gray-300">Cleanliness Level</label>
                <select
                  name="cleanliness"
                  value={formData.cleanliness}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-400 transition"
                  required
                >
                  <option value="">How clean do you keep things?</option>
                  <option value="Very Clean">Very Clean (Neat Freak)</option>
                  <option value="Moderate">Moderate (Keep it tidy but relaxed)</option>
                  <option value="Relaxed">Relaxed (Don't mind some clutter)</option>
                </select>
              </div>

              <div>
                <label className="block mb-3 text-sm text-gray-300">Smoking</label>
                <select
                  name="smoking"
                  value={formData.smoking}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-400 transition"
                  required
                >
                  <option value="">Do you smoke?</option>
                  <option value="Not Allowed">No, never</option>
                  <option value="Allowed">Yes, regularly / occasionally</option>
                </select>
              </div>

              <div>
                <label className="block mb-3 text-sm text-gray-300">Drinking</label>
                <select
                  name="drinking"
                  value={formData.drinking}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-400 transition"
                  required
                >
                  <option value="">Do you drink alcohol?</option>
                  <option value="Not Allowed">No, never</option>
                  <option value="Allowed">Yes, socially / occasionally</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: roommate PREFERENCES & BUDGET */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block mb-3 text-sm text-gray-300">Maximum Monthly Rent (INR / Budget)</label>
                <input
                  type="number"
                  name="budget"
                  placeholder="e.g. 15000"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-400 transition"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block mb-3 text-sm text-gray-300">Preferred roommate Gender</label>
                <select
                  name="genderPreference"
                  value={formData.genderPreference}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-400 transition"
                  required
                >
                  <option value="">Preferred Gender?</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Any">No Preference / Any</option>
                </select>
              </div>

              <div>
                <label className="block mb-3 text-sm text-gray-300">Your Social Level</label>
                <select
                  name="socialLevel"
                  value={formData.socialLevel}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-400 transition"
                  required
                >
                  <option value="">How social are you?</option>
                  <option value="Introvert">Introvert (Keep to myself, value quiet time)</option>
                  <option value="Ambivert">Ambivert (Balanced, friendly but need downtime)</option>
                  <option value="Extrovert">Extrovert (Love hanging out, very outgoing)</option>
                </select>
              </div>

              <div>
                <label className="block mb-3 text-sm text-gray-300">Noise Tolerance</label>
                <select
                  name="noiseTolerance"
                  value={formData.noiseTolerance}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-400 transition"
                  required
                >
                  <option value="">Your noise tolerance?</option>
                  <option value="Very Quiet">Very Quiet (Prefer pin-drop silence)</option>
                  <option value="Moderate">Moderate (Average noise is fine)</option>
                  <option value="Okay with Noise">Okay with Noise (Music, chatter don't bother me)</option>
                </select>
              </div>

              <div>
                <label className="block mb-3 text-sm text-gray-300">Overnight Guests Policy Preference</label>
                <select
                  name="overnightGuests"
                  value={formData.overnightGuests}
                  onChange={handleChange}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-cyan-400 transition"
                  required
                >
                  <option value="">Guest preference?</option>
                  <option value="Allowed">Guests allowed freely</option>
                  <option value="Sometimes">Guests allowed occasionally with heads up</option>
                  <option value="Not Allowed">No overnight guests allowed</option>
                </select>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="w-1/2 py-4 rounded-2xl border border-white/20 text-white hover:bg-white/5 transition font-semibold"
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className={`py-4 rounded-2xl bg-cyan-400 text-black font-bold hover:scale-[1.02] active:scale-95 transition ${
                  step === 1 ? "w-full" : "w-1/2"
                }`}
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className="w-1/2 py-4 rounded-2xl bg-cyan-400 text-black font-bold hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
              >
                {saving ? "Saving Profile..." : "Complete Profile"}
              </button>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}