import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";
import { buildSetCookie } from "@/lib/auth";

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        typeof body?.detail === "string"
          ? body.detail
          : "Invalid email or password";
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const token = body?.access_token;
    if (!token) {
      return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }

    const response = NextResponse.json({ ok: true });
    response.headers.set("Set-Cookie", buildSetCookie(token, 3600));
    return response;
  } catch {
    return NextResponse.json(
      { error: "Could not reach the API server. Please try again." },
      { status: 502 }
    );
  }
}