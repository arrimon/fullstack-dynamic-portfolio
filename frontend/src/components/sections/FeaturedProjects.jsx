import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { ProjectCard } from "@/components/project/ProjectCard";
import Button from "@/components/ui/Button";

export default function FeaturedProjects({ projects = [], site = {} }) {
  if (!projects.length) return null;

  const eyebrow = site.section_projects_eyebrow || "Selected Work";
  const title = site.section_projects_title || "Projects built with intent.";
  const description =
    site.section_projects_subtitle ||
    "A selection of products and experiments where engineering and design meet.";

  return (
    <section className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
      <SectionHeading
        index="01"
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      <div className="flex justify-end -mt-8 mb-8 md:mb-12">
        <Button href="/projects" variant="ghost" size="sm" arrow>
          All projects
        </Button>
      </div>

      <StaggerGroup className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:gap-12">
        {projects.slice(0, 4).map((project) => (
          <StaggerItem key={project.id}>
            <ProjectCard project={project} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}