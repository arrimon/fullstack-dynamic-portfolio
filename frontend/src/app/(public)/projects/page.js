import SectionHeading from "@/components/ui/SectionHeading";
import { getProjects, hydrateProjects } from "@/lib/data";
import ProjectsGrid from "@/components/project/ProjectsGrid";

export const metadata = {
  title: "Projects",
  description: "A curated collection of engineering work, side projects and experiments.",
};

export default async function ProjectsPage() {
  const { data } = await getProjects({ page: 1, page_size: 9 });
  const items = data?.items || [];
  const hydrated = await hydrateProjects(items);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8 md:pb-32 md:pt-40">
      <SectionHeading
        index="01"
        eyebrow="Projects"
        title="Everything I've shipped."
        description="Full case studies, side projects and experiments — each one a chance to build something better."
      />
      <ProjectsGrid initial={hydrated} total={data?.total || 0} />
    </div>
  );
}