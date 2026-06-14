from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import httpx
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_ANON_KEY", "")

supabase: Client = create_client(url, key)

class AiPreferences(BaseModel):
    budget: float
    gender: str = "Any"
    foodHabit: str = "Any"
    partyFrequency: str = "No preference"
    pets: str = "No preference"
    smoking: str = "No preference"
    drinking: str = "No preference"
    workFromHome: str = "No preference"
    cleanliness: str = "No preference"
    socialLevel: str = "No preference"
    flatmateStyle: str = "No preference"
    roomType: str = "Any"
    moveInDate: str = ""
    parkingRequired: str = "No preference"
    vehicleType: str = "Any"
    floorPreference: str = ""
    liftRequired: str = "No preference"

class MatchRequest(BaseModel):
    preferences: AiPreferences

def quote(value: str) -> str:
    escaped = value.replace("'", "''")
    return f"'{escaped}'"

def build_sql(prefs: AiPreferences) -> str:
    conditions = [
        f"rent <= {prefs.budget}",
        f"(gender_preference = {quote(prefs.gender)} OR gender_preference = 'Any' OR gender_preference = '')" if prefs.gender and prefs.gender != "Any" else "TRUE",
        f"(food_habit = {quote(prefs.foodHabit)} OR food_habit = 'Any' OR food_habit = '')" if prefs.foodHabit and prefs.foodHabit != "Any" else "TRUE",
        f"(smoking = {quote(prefs.smoking)} OR smoking = 'Any' OR smoking = '')" if prefs.smoking and prefs.smoking != "No preference" else "TRUE",
        f"(drinking = {quote(prefs.drinking)} OR drinking = 'Any' OR drinking = '')" if prefs.drinking and prefs.drinking != "No preference" else "TRUE",
        f"(pets = {quote(prefs.pets)} OR pets = 'Any' OR pets = '')" if prefs.pets and prefs.pets != "No preference" else "TRUE",
        f"(work_from_home = {quote(prefs.workFromHome)} OR work_from_home = 'Any' OR work_from_home = '')" if prefs.workFromHome and prefs.workFromHome != "No preference" else "TRUE",
        f"(cleanliness = {quote(prefs.cleanliness)} OR cleanliness = 'Any' OR cleanliness = '')" if prefs.cleanliness and prefs.cleanliness != "No preference" else "TRUE",
        f"(social_level = {quote(prefs.socialLevel)} OR social_level = 'Any' OR social_level = '')" if prefs.socialLevel and prefs.socialLevel != "No preference" else "TRUE",
        f"(room_type = {quote(prefs.roomType)} OR {quote(prefs.roomType)} = 'Any')" if getattr(prefs, 'roomType', 'Any') != "Any" else "TRUE",
        f"(parking_available = 'Yes')" if getattr(prefs, 'parkingRequired', '') == "Yes" else "TRUE",
        f"(has_lift = 'Yes')" if getattr(prefs, 'liftRequired', '') == "Yes" else "TRUE",
    ]
    filtered = " AND ".join([c for c in conditions if c != "TRUE"])
    
    return f"""-- AI-generated SQL based on user preferences and property schema
SELECT *, 
  ROUND((
    CASE WHEN rent <= {prefs.budget} THEN 20 ELSE 0 END + 
    CASE WHEN gender_preference = {quote(prefs.gender)} OR gender_preference = 'Any' THEN 15 ELSE 0 END +
    CASE WHEN food_habit = {quote(prefs.foodHabit)} OR food_habit = 'Any' THEN 10 ELSE 0 END +
    CASE WHEN smoking = {quote(prefs.smoking)} OR smoking = 'Any' THEN 10 ELSE 0 END +
    CASE WHEN drinking = {quote(prefs.drinking)} OR drinking = 'Any' THEN 10 ELSE 0 END +
    CASE WHEN pets = {quote(prefs.pets)} OR pets = 'Any' THEN 5 ELSE 0 END +
    CASE WHEN work_from_home = {quote(prefs.workFromHome)} OR work_from_home = 'Any' THEN 10 ELSE 0 END +
    CASE WHEN cleanliness = {quote(prefs.cleanliness)} OR cleanliness = 'Any' THEN 10 ELSE 0 END +
    CASE WHEN social_level = {quote(prefs.socialLevel)} OR social_level = 'Any' THEN 10 ELSE 0 END
  )::numeric, 0) AS score
FROM properties
WHERE {filtered or "TRUE"}
ORDER BY score DESC, created_at DESC
LIMIT 5;"""

@app.post("/api/ai-match")
async def ai_match(req: MatchRequest):
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY is not configured")

    # Fetch all properties
    try:
        res = supabase.table("properties").select("*").execute()
        properties = res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    if not properties:
        return {"sql": build_sql(req.preferences), "matches": []}
        
    properties_to_score = []
    for p in properties:
        properties_to_score.append({
            "id": p.get("id"),
            "title": p.get("title"),
            "description": p.get("description"),
            "rent": p.get("rent"),
            "property_type": p.get("property_type"),
            "room_type": p.get("room_type"),
            "flat_vibe": p.get("flat_vibe"),
            "visitors_policy": p.get("visitors_policy"),
            "gender_preference": p.get("gender_preference"),
            "food_habit": p.get("food_habit"),
            "smoking": p.get("smoking"),
            "drinking": p.get("drinking"),
            "cleanliness": p.get("cleanliness"),
            "pets": p.get("pets"),
            "party_frequency": p.get("party_frequency"),
            "work_from_home": p.get("work_from_home"),
            "social_level": p.get("social_level"),
            "ideal_flatmate": p.get("ideal_flatmate"),
            "available_from": p.get("available_from"),
            "parking_available": p.get("parking_available"),
            "vehicle_type": p.get("vehicle_type"),
            "floor_number": p.get("floor_number"),
            "has_lift": p.get("has_lift"),
        })

    system_prompt = """You are an expert flatmate and roommate compatibility evaluator.
You calculate a compatibility score (0 to 100) and short reasoning details based on the user's flatmate/lifestyle preferences and property profiles.

Analyze budget, gender preference, smoking/drinking, food habits, social levels, flat vibes, and general lifestyle preferences.
Be objective and strict:
- If budget is exceeded, score should decrease.
- If smoking, drinking, food, or gender preferences conflict, score should decrease.
- If social vibes or flatmate lifestyles match, score should increase.

You must return a valid JSON object in the exact format:
{
  "matches": [
    {
      "id": "property-uuid",
      "score": 85,
      "details": ["Budget: Within limit (+25%)", "Smoking: Match (+15%)", "Vibe conflict (-10%)"]
    }
  ]
}"""

    user_prompt = f"User Preferences:\n{req.preferences.model_dump_json(indent=2)}\n\nProperties:\n{json.dumps(properties_to_score, indent=2)}\n\nEvaluate all properties and return a JSON list of matches containing the id, score, and details for each property. Make sure to score EVERY single property in the list."
    
    model_name = os.environ.get("AI_MODEL", "google/gemini-2.5-flash")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                    "HTTP-Referer": "https://flatmate-matching.app",
                    "X-Title": "Flatmate Finder",
                },
                json={
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "response_format": {"type": "json_object"},
                    "max_tokens": 1500
                },
                timeout=60.0
            )
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            # Check if there's a response with more error info
            error_details = str(e)
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_details = e.response.text
                except Exception:
                    pass
            raise HTTPException(status_code=502, detail=f"OpenRouter API error: {error_details}")

    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    if not content:
        raise HTTPException(status_code=502, detail="OpenRouter returned an empty response.")
        
    try:
        parsed = json.loads(content)
    except Exception:
        cleaned = content.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        try:
            parsed = json.loads(cleaned.strip())
        except Exception:
            raise HTTPException(status_code=502, detail="Failed to parse LLM response as JSON.")

    matches_list = parsed.get("matches", [])
    score_map = {str(m.get("id")): {"score": m.get("score"), "details": m.get("details")} for m in matches_list}
    
    final_matches = []
    for p in properties:
        pid = str(p.get("id"))
        match_info = score_map.get(pid, {"score": 0, "details": ["AI matchmaking score pending"]})
        score = match_info.get("score", 0)
        if not isinstance(score, (int, float)):
            score = 0
        details = match_info.get("details", [])
        if not isinstance(details, list):
            details = ["AI details pending"]
            
        p_copy = dict(p)
        p_copy["score"] = score
        p_copy["details"] = details
        final_matches.append(p_copy)
        
    final_matches.sort(key=lambda x: x.get("score", 0), reverse=True)

    return {
        "sql": build_sql(req.preferences),
        "matches": final_matches
    }
