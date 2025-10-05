import { NextResponse } from "next/server";

/**
 * Server proxy for POST /api/query → {NGROK_BASE}/query
 * Normalizes text/JSON responses to JSON so the client can always parse.
 */
export async function POST(request: Request) {
  try {
    const base = process.env.NEXT_PUBLIC_NGROK_BASE;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || "";

    if (!base) {
      return NextResponse.json({ error: "NGROK base not configured" }, { status: 500 });
    }

    // read client JSON body (your timeline prompt)
    const body = await request.json().catch(() => ({}));

    const upstream = await fetch(`${base}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await upstream.text();

    // normalize to JSON for client
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: upstream.ok ? 200 : upstream.status || 500 });
    } catch {
      // Sometimes upstream returns plain text like "No relevant docs"
      return NextResponse.json({ response: text }, { status: upstream.ok ? 200 : upstream.status || 500 });
    }
  } catch (e) {
    console.error("[/api/query] exception:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
