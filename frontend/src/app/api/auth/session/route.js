import { NextResponse } from "next/server";
import { getAuthCookie, isTokenExpired } from "@/lib/auth";

export async function GET(request) {
  const token = getAuthCookie(request);
  if (!token || isTokenExpired(token)) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  return NextResponse.json({ authenticated: true });
}