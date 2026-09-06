import { SITE_URL } from "@/lib/utils";
import { getProjects } from "@/lib/data";

export default async function sitemap() {
  const staticRoutes = ["", "/projects", "/about", "/resume", "/contact"].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: path === "" ? 1 : 0.8,
    })
  );

  let projectRoutes = [];
  const { data } = await getProjects({ page_size: 100 });
  (data?.items || []).forEach((project) => {
    projectRoutes.push({
      url: `${SITE_URL}/projects/${project.slug}`,
      lastModified: project.created_at ? new Date(project.created_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  return [...staticRoutes, ...projectRoutes];
}