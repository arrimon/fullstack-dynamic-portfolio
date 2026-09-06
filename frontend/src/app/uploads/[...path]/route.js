import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

export async function GET(request, context) {
  const params = await context.params;
  const path = Array.isArray(params.path) ? params.path.join("/") : params.path || "";
  const url = new URL(request.url);
  const target = `${API_URL}/uploads/${path}${url.search}`;

  try {
    const upstream = await fetch(target, { cache: "no-store" });
    const contentType = upstream.headers.get("content-type") || "";
    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Could not reach the API server.", { status: 502 });
  }
}
