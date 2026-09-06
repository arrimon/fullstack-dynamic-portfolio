import { GraduationCap, MapPin } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import Badge from "@/components/ui/Badge";
import CTABanner from "@/components/sections/CTABanner";
import CertificationsList from "@/components/sections/CertificationsList";
import Button from "@/components/ui/Button";
import { formatMonthYear } from "@/lib/utils";
import {
  getSettings,
  getExperience,
  getEducation,
  getCertifications,
  getProjects,
  hydrateProjects,
  toSettingsObject,
} from "@/lib/data";

export function ExperienceTimeline({ experience = [] }) {
  if (!experience.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32" id="experience">
      <SectionHeading
        index="01"
        eyebrow="Experience"
        title="Where I've been."
      />
      <div className="relative ml-2 border-l border-line pl-8 md:pl-14">
        <StaggerGroup className="flex flex-col gap-14">
          {experience.map((job) => {
            const isCurrent = job.is_current;
            return (
              <StaggerItem key={job.id} className="relative">
                <span
                  className={`absolute -left-[39px] top-1.5 h-3.5 w-3.5 rounded-full border-2 md:-left-[57px] ${
                    isCurrent
                      ? "border-accent-strong bg-magenta shadow-[0_0_0_6px_rgba(147,51,234,0.22)]"
                      : "border-line-strong bg-bg"
                  }`}
                  aria-hidden="true"
                />
                <div className="max-w-3xl">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-semibold tracking-tight text-cream">
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
                  <p className="mt-1.5 font-mono text-sm text-accent-strong">
                    {job.company_name}
                    {job.location && (
                      <span className="text-cream-faint"> · {job.location}</span>
                    )}
                    {job.employment_type && (
                      <span className="text-cream-faint"> · {job.employment_type}</span>
                    )}
                  </p>
                  <p className="mt-4 whitespace-pre-line leading-relaxed text-cream-muted">
                    {job.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}

export function EducationList({ education = [] }) {
  if (!education.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
      <SectionHeading
        index="02"
        eyebrow="Education"
        title="Foundations."
      />
      <StaggerGroup className="grid gap-4 md:grid-cols-2">
        {education.map((item) => (
          <StaggerItem key={item.id}>
            <div className="h-full rounded-xl border border-line bg-bg-soft p-6">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 bg-accent-faint text-accent-strong">
                <GraduationCap className="h-4 w-4" />
              </span>
              <h3 className="font-semibold tracking-tight text-cream">
                {item.degree}
                {item.field_of_study && (
                  <span className="text-cream-muted"> · {item.field_of_study}</span>
                )}
              </h3>
              <p className="mt-1 text-sm text-accent-strong">{item.institution}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-cream-faint">
                  {formatMonthYear(item.start_date)} —{" "}
                  {item.end_date ? formatMonthYear(item.end_date) : "Present"}
                </span>
                {item.grade && (
                  <Badge tone="neutral">{item.grade}</Badge>
                )}
              </div>
              {item.description && (
                <p className="mt-4 text-sm leading-relaxed text-cream-muted">
                  {item.description}
                </p>
              )}
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

export function TechnologyWall({ technologies = [] }) {
  if (!technologies.length) return null;
  const groups = ["frontend", "backend", "database", "tools"];
  return (
    <section className="border-y border-line bg-bg-soft/40">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
        <SectionHeading
          index="03"
          eyebrow="Toolbox"
          title="Technologies I rely on."
        />
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => {
            const items = technologies.filter((t) => t.category === group);
            if (!items.length) return null;
            return (
              <Reveal key={group}>
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-accent-strong">
                  {group}
                </p>
                <div className="flex flex-col gap-2.5">
                  {items.map((tech) => (
                    <div
                      key={tech.id}
                      className="group flex items-center gap-2.5 rounded-lg border border-line bg-bg-soft px-3.5 py-2.5 transition-colors hover:border-accent/40"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-accent/50 transition-transform group-hover:scale-125" />
                      <span className="text-sm text-cream-muted group-hover:text-cream">
                        {tech.name}
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default async function AboutPage() {
  const [
    { data: settingsRes },
    { data: experience },
    { data: education },
    { data: certifications },
    { data: projectsRes },
  ] = await Promise.all([
    getSettings(),
    getExperience(),
    getEducation(),
    getCertifications(),
    getProjects({ page_size: 100 }),
  ]);

  const site = toSettingsObject(settingsRes);
  const projectItems = projectsRes?.items || [];
  const details = await hydrateProjects(projectItems.slice(0, 8));

  const technologyMap = new Map();
  details.forEach((project) => {
    (project.technologies || []).forEach((tech) => {
      if (!technologyMap.has(tech.id)) technologyMap.set(tech.id, tech);
    });
  });
  const technologies = [...technologyMap.values()];

  const bio = site.about_bio || site.bio;
  const philosophy = site.about_philosophy;

  return (
    <>
      <header className="mx-auto max-w-6xl px-5 pb-16 pt-32 sm:px-8 md:pt-40">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-accent/60" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-cream-faint">
              {site.role || "About"}
            </span>
          </div>
          <h1 className="mt-6 max-w-3xl text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-tight text-cream">
            {site.about_intro || "The person behind the pixels."}
          </h1>
        </Reveal>
        {bio && (
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-3xl whitespace-pre-line text-lg leading-relaxed text-cream-muted">
              {bio}
            </p>
          </Reveal>
        )}
        <Reveal delay={0.16}>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            {site.location && (
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cream-faint">
                <MapPin className="h-3.5 w-3.5 text-accent-strong" />
                {site.location}
              </span>
            )}
            {site.email && (
              <a
                href={`mailto:${site.email}`}
                className="font-mono text-xs uppercase tracking-widest text-cream-faint transition-colors hover:text-accent-strong"
              >
                {site.email}
              </a>
            )}
          </div>
        </Reveal>
      </header>

      <ExperienceTimeline experience={experience || []} />
      <EducationList education={education || []} />
      <CertificationsList certifications={certifications || []} />
      <TechnologyWall technologies={technologies} />

      {philosophy && (
        <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
          <SectionHeading index="04" eyebrow="Philosophy" title="How I approach work." />
          <Reveal>
            <p className="max-w-3xl whitespace-pre-line text-lg leading-relaxed text-cream-muted">
              {philosophy}
            </p>
          </Reveal>
        </section>
      )}

      <CTABanner
        eyebrow="Contact"
        title="Sound like a fit? Let's talk."
        action={
          <Button href="/contact" size="lg" arrow>
            Get in touch
          </Button>
        }
        className="mx-auto max-w-6xl px-5 pb-28 sm:px-8 md:pb-36"
      />
    </>
  );
}