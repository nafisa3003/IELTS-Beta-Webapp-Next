import { NextRequest, NextResponse } from "next/server";

// Set TUTOR_API_URL in .env.local, e.g. TUTOR_API_URL=http://localhost:8000
// Keeps the Python backend's address server-side only — never shipped to the browser.
const TUTOR_API_URL = process.env.TUTOR_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  let body: { message?: string; thread_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }

  if (!body.message || !body.message.trim()) {
    return NextResponse.json({ detail: "Message cannot be empty." }, { status: 422 });
  }

  try {
    const res = await fetch(`${TUTOR_API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: body.message,
        thread_id: body.thread_id ?? "default",
      }),
      // The engine can take a while on cold Groq calls + Tavily lookups
      signal: AbortSignal.timeout(30_000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { detail: "Could not reach the AI Tutor server. Make sure the FastAPI engine is running." },
      { status: 502 }
    );
  }
}
