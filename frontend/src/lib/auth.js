export const AUTH_COOKIE = "pf_admin_token";

const IS_SECURE =
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://");

export function decodeToken(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now();
}

export function getAuthCookie(request) {
  const cookies = request.headers.get("cookie") || "";
  const match = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${AUTH_COOKIE}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

export function buildSetCookie(token, maxAge) {
  const secure = IS_SECURE ? "; Secure" : "";
  return `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict${secure}; Max-Age=${maxAge}`;
}

export function buildClearCookie() {
  const secure = IS_SECURE ? "; Secure" : "";
  return `${AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Strict${secure}; Max-Age=0`;
}