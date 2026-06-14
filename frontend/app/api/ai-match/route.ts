import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Proxy request to FastAPI backend
    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    
    const response = await fetch(`${backendUrl}/api/ai-match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "Server error" }, { status: 500 });
  }
}
