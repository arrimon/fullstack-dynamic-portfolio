import { getProjectBySlug, getProjects } from "@/lib/data";
import CaseStudy from "@/components/project/CaseStudy";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data } = await getProjectBySlug(slug);
  if (!data) return { title: "Project not found" };
  return {
    title: data.meta_title || data.title,
    description: data.meta_description || data.short_description,
    openGraph: {
      title: data.meta_title || data.title,
      description: data.meta_description || data.short_description,
    },
  };
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const { data: project } = await getProjectBySlug(slug);
  if (!project) notFound();

  const { data: list } = await getProjects({ page_size: 100 });
  const items = list?.items || [];
  const index = items.findIndex((p) => p.slug === slug);
  const prevProject = index > 0 ? items[index - 1] : items[items.length - 1];
  const nextProject = index >= 0 && index < items.length - 1 ? items[index + 1] : items[0];

  return (
    <CaseStudy
      project={project}
      prevProject={prevProject}
      nextProject={nextProject}
    />
  );
}