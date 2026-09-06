import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";
import { getAuthCookie } from "@/lib/auth";

async function proxy(request, context) {
  const token = getAuthCookie(request);
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const params = await context.params;
  const path = Array.isArray(params.path) ? params.path.join("/") : params.path || "";
  const url = new URL(request.url);
  const target = `${API_URL}/api/admin/${path}${url.search}`;

  const headers = { Authorization: `Bearer ${token}` };
  const isForm = request.headers.get("content-type")?.toLowerCase().includes("multipart/form-data");

  if (!isForm) {
    headers["Content-Type"] = request.headers.get("content-type") || "application/json";
  }

  let body;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = isForm ? await request.formData() : await request.text();
  }

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    if (upstream.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const contentType = upstream.headers.get("content-type") || "";
    const text = await upstream.text();
    const data = contentType.includes("application/json") && text ? JSON.parse(text) : text;

    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { detail: "Could not reach the API server." },
      { status: 502 }
    );
  }
}

export async function GET(request, context) {
  return proxy(request, context);
}
export async function POST(request, context) {
  return proxy(request, context);
}
export async function PUT(request, context) {
  return proxy(request, context);
}
export async function PATCH(request, context) {
  return proxy(request, context);
}
export async function DELETE(request, context) {
  return proxy(request, context);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}