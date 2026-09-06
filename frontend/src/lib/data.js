import { API_URL } from "./api";

async function fetchJson(path) {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!res.ok) {
      let detail = `Request failed with status ${res.status}`;
      try {
        const body = await res.json();
        if (typeof body?.detail === "string") detail = body.detail;
      } catch {
        /* ignore */
      }
      return { data: null, error: detail, status: res.status };
    }
    const data = await res.json();
    return { data, error: null, status: res.status };
  } catch (err) {
    return { data: null, error: "Could not reach the API server.", status: 0 };
  }
}

export function toSettingsObject(list = []) {
  return (list || []).reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
}

export const getSettings = () => fetchJson("/api/settings");
export const getTechnologies = () => fetchJson("/api/technologies");
export const getTechCatalog = () => fetchJson("/api/technologies/catalog");
export const getSocialLinks = () => fetchJson("/api/social-links");
export const getProjects = (params) =>
  fetchJson(`/api/projects?${new URLSearchParams(params || {}).toString()}`);
export const getProjectBySlug = (slug) => fetchJson(`/api/projects/${encodeURIComponent(slug)}`);
export const getExperience = () => fetchJson("/api/experience");
export const getEducation = () => fetchJson("/api/education");
export const getCertifications = () => fetchJson("/api/certifications");
export const getResume = () => fetchJson("/api/resume");
export const getTestimonials = () => fetchJson("/api/testimonials");

export async function hydrateProjects(items = []) {
  const details = await Promise.all(
    items.map((p) => getProjectBySlug(p.slug))
  );
  return details.map((d) => d.data).filter(Boolean);
}