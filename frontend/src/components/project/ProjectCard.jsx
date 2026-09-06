import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, ImageIcon } from "lucide-react";
import BrandIcon from "@/components/ui/BrandIcon";
import { cn, mediaUrl } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

function CardMedia({ project, className }) {
  const src = mediaUrl(project.thumbnail_url || project.images?.[0]?.image_url);
  if (src) {
    return (
      <Image
        src={src}
        alt={project.title}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-bg-muted">
      <ImageIcon className="h-8 w-8 text-cream-faint" aria-hidden="true" />
      <span className="font-mono text-xs uppercase tracking-widest text-cream-faint">
        {project.title}
      </span>
    </div>
  );
}

export function ProjectCard({ project, large = false }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block"
      aria-label={`View ${project.title}`}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-line bg-surface transition-all duration-300 group-hover:border-accent-strong/50 group-hover:shadow-neon-sm",
          large ? "aspect-[16/9]" : "aspect-[16/10]"
        )}
      >
        <CardMedia project={project} />
        <div
          className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
        <span className="absolute right-4 top-4 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full border border-line bg-bg/70 text-cream opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
        {project.is_featured && (
          <span className="absolute left-4 top-4">
            <Badge tone="accent">Featured</Badge>
          </span>
        )}
      </div>
      <div className="mt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3
            className={cn(
              "font-semibold tracking-tight text-cream transition-colors duration-200 group-hover:text-accent-strong",
              large ? "text-2xl" : "text-lg"
            )}
          >
            {project.title}
          </h3>
          <div className="flex items-center gap-3 text-cream-faint">
            {project.github_link && (
              <span className="transition-colors group-hover:text-cream" aria-hidden="true">
                <BrandIcon name="github" className="h-4 w-4" />
              </span>
            )}
            {project.live_link && (
              <span className="transition-colors group-hover:text-cream" aria-hidden="true">
                <ExternalLink className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-cream-muted">
          {project.short_description}
        </p>
        {project.technologies?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.technologies.slice(0, 4).map((tech) => (
              <Badge key={tech.id}>{tech.name}</Badge>
            ))}
            {project.technologies.length > 4 && (
              <Badge tone="neutral">+{project.technologies.length - 4}</Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}