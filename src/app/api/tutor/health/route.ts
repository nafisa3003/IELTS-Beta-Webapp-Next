import { NextResponse } from "next/server";

const TUTOR_API_URL = process.env.TUTOR_API_URL ?? "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetch(`${TUTOR_API_URL}/health`, {
      signal: AbortSignal.timeout(2_000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("bad status");
    const data = await res.json();
    return NextResponse.json({ online: true, ...data });
  } catch {
    return NextResponse.json({ online: false }, { status: 200 });
  }
}
