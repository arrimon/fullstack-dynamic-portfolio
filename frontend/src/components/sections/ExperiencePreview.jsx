import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import Badge from "@/components/ui/Badge";
import { formatMonthYear } from "@/lib/utils";

export default function ExperiencePreview({ experience = [], heading = {} }) {
  if (!experience.length) return null;
  const items = experience.slice(0, 3);

  const eyebrow = heading.eyebrow || "Experience";
  const title = heading.title || "The path so far.";
  const description =
    heading.description || "Roles and companies that shaped how I build.";

  return (
    <section className="relative border-y border-line bg-bg-soft/40">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
        <SectionHeading
          index="03"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <div className="relative ml-2 border-l border-line pl-8 md:pl-12">
          <StaggerGroup className="flex flex-col gap-12">
            {items.map((job) => {
              const isCurrent = job.is_current;
              return (
                <StaggerItem key={job.id} className="relative">
                    <span
                      className={`absolute -left-[37px] top-1 h-3 w-3 rounded-full border-2 md:-left-[53px] ${
                        isCurrent
                          ? "border-accent-strong bg-magenta shadow-[0_0_0_5px_rgba(147,51,234,0.22)]"
                          : "border-line-strong bg-bg"
                      }`}
                      aria-hidden="true"
                    />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold tracking-tight text-cream">
                        {job.position}
                      </h3>
                      {isCurrent && (
                        <Badge tone="accent">
                          <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent-strong" />
                          Current
                        </Badge>
                      )}
                    </div>
                    <span className="font-mono text-xs uppercase tracking-widest text-cream-faint">
                      {formatMonthYear(job.start_date)} —{" "}
                      {job.is_current ? "Present" : formatMonthYear(job.end_date)}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-sm text-accent-strong">
                    {job.company_name}
                    {job.location && <span className="text-cream-faint"> · {job.location}</span>}
                  </p>
                  <p className="mt-3 line-clamp-3 max-w-2xl text-sm leading-relaxed text-cream-muted">
                    {job.description}
                  </p>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
        <Reveal className="mt-12">
          <Link
            href="/about#experience"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cream-muted transition-colors hover:text-accent-strong"
          >
            Full timeline
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}