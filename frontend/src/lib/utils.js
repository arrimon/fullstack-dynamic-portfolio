export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function mediaUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  // Serve locally uploaded files through the same-origin proxy so images work
  // regardless of where the API is deployed or whether NEXT_PUBLIC_API_URL is set.
  return url.startsWith("/") ? url : `/${url}`;
}

export function formatMonthYear(dateStr) {
  if (!dateStr) return "Present";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatFullDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getInitials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function asBool(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function truncate(str, max, suffix = "…") {
  if (!str) return "";
  return str.length > max ? `${str.slice(0, max).trimEnd()}${suffix}` : str;
}

export function slugify(str = "") {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}