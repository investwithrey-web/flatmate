import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AiPreferences {
  budget: number;
  partyFrequency: string;
  pets: string;
  smoking: string;
  drinking: string;
  workFromHome: string;
  cleanliness: string;
  socialLevel: string;
  flatmateStyle: string;
}

interface PropertyRecord {
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

const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;

const buildSql = (preferences: AiPreferences) => {
  const conditions = [
    `rent <= ${preferences.budget}`,
    preferences.smoking && preferences.smoking !== "No preference"
      ? `(smoking = ${quote(preferences.smoking)} OR smoking = 'Any' OR smoking = '')`
      : "TRUE",
    preferences.drinking && preferences.drinking !== "No preference"
      ? `(drinking = ${quote(preferences.drinking)} OR drinking = 'Any' OR drinking = '')`
      : "TRUE",
    preferences.pets && preferences.pets !== "No preference"
      ? `(pets = ${quote(preferences.pets)} OR pets = 'Any' OR pets = '')`
      : "TRUE",
    preferences.workFromHome && preferences.workFromHome !== "No preference"
      ? `(work_from_home = ${quote(preferences.workFromHome)} OR work_from_home = 'Any' OR work_from_home = '')`
      : "TRUE",
    preferences.cleanliness && preferences.cleanliness !== "No preference"
      ? `(cleanliness = ${quote(preferences.cleanliness)} OR cleanliness = 'Any' OR cleanliness = '')`
      : "TRUE",
    preferences.socialLevel && preferences.socialLevel !== "No preference"
      ? `(social_level = ${quote(preferences.socialLevel)} OR social_level = 'Any' OR social_level = '')`
      : "TRUE",
  ];

  const filtered = conditions.filter((condition) => condition !== "TRUE").join(" AND ");

  return `-- AI-generated SQL based on user preferences and property schema\nSELECT *, \n  ROUND((
    CASE WHEN rent <= ${preferences.budget} THEN 25 ELSE 0 END + 
    CASE WHEN smoking = ${quote(preferences.smoking)} OR smoking = 'Any' THEN 15 ELSE 0 END +
    CASE WHEN drinking = ${quote(preferences.drinking)} OR drinking = 'Any' THEN 10 ELSE 0 END +
    CASE WHEN pets = ${quote(preferences.pets)} OR pets = 'Any' THEN 10 ELSE 0 END +
    CASE WHEN work_from_home = ${quote(preferences.workFromHome)} OR work_from_home = 'Any' THEN 10 ELSE 0 END +
    CASE WHEN cleanliness = ${quote(preferences.cleanliness)} OR cleanliness = 'Any' THEN 10 ELSE 0 END +
    CASE WHEN social_level = ${quote(preferences.socialLevel)} OR social_level = 'Any' THEN 20 ELSE 0 END
  )::numeric, 0) AS score
FROM properties
WHERE ${filtered || "TRUE"}
ORDER BY score DESC, created_at DESC
LIMIT 5;`;
};

const calculateScore = (property: PropertyRecord, preferences: AiPreferences) => {
  let score = 0;

  if (property.rent <= preferences.budget) score += 25;
  if (preferences.smoking === "No preference" || property.smoking === preferences.smoking || property.smoking === "Any" || property.smoking === "") score += 15;
  if (preferences.drinking === "No preference" || property.drinking === preferences.drinking || property.drinking === "Any" || property.drinking === "") score += 10;
  if (preferences.pets === "No preference" || property.pets === preferences.pets || property.pets === "Any" || property.pets === "") score += 10;
  if (preferences.workFromHome === "No preference" || property.work_from_home === preferences.workFromHome || property.work_from_home === "Any" || property.work_from_home === "") score += 10;
  if (preferences.cleanliness === "No preference" || property.cleanliness === preferences.cleanliness || property.cleanliness === "Any" || property.cleanliness === "") score += 10;
  if (preferences.socialLevel === "No preference" || property.social_level === preferences.socialLevel || property.social_level === "Any" || property.social_level === "") score += 20;

  return Math.min(100, score);
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const preferences: AiPreferences = body.preferences;

    if (!preferences) {
      return NextResponse.json({ error: "Missing preferences" }, { status: 400 });
    }

    const { data, error } = await supabase.from("properties").select("*");
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const matches = (data || [])
      .map((property: PropertyRecord) => ({
        ...property,
        score: calculateScore(property, preferences),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return NextResponse.json({
      sql: buildSql(preferences),
      matches,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "Server error" }, { status: 500 });
  }
}
