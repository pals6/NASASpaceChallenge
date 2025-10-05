import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ?? "10";

    const base = process.env.NEXT_PUBLIC_NGROK_BASE;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || "";

    // If not configured, return a safe fallback list so UI still works
    if (!base) {
      return NextResponse.json(
        ["Microgravity", "Bone Health", "Plants", "Microbes", "Radiation", "Sleep"],
        { status: 200 }
      );
    }

    const url = `${base}/graph/label/popular?limit=${encodeURIComponent(limit)}`;
    const upstream = await fetch(url, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        "X-API-Key": apiKey,
      },
      // this prevents Next from caching this server request
      cache: "no-store",
    });

    if (!upstream.ok) {
      // graceful fallback (still 200 so UI doesn’t “error”)
      console.error("[/api/popular] upstream error:", upstream.status, await upstream.text());
      return NextResponse.json(
        ["Microgravity", "Bone Health", "Plants", "Microbes", "Radiation", "Sleep"],
        { status: 200 }
      );
    }

    const data = await upstream.json().catch(() => []);
    return NextResponse.json(Array.isArray(data) ? data : [], { status: 200 });
  } catch (e) {
    console.error("[/api/popular] exception:", e);
    return NextResponse.json(
      ["Microgravity", "Bone Health", "Plants", "Microbes", "Radiation", "Sleep"],
      { status: 200 }
    );
  }
}
