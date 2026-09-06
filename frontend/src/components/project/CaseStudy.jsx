"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, Copy, ExternalLink } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Gallery from "@/components/project/Gallery";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { mediaUrl } from "@/lib/utils";

function DescriptionBlock({ text }) {
  const paragraphs = String(text || "").split(/\n{2,}/);
  return (
    <div className="space-y-5">
      {paragraphs.map((p, i) => (
        <p key={i} className="leading-relaxed text-cream-muted">
          {p}
        </p>
      ))}
    </div>
  );
}

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="group flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-bg px-3 py-2 text-left transition-colors hover:border-accent/50"
      aria-label={`Copy ${label}`}
    >
      <span className="flex min-w-0 flex-col">
        <span className="font-mono text-[9px] uppercase tracking-widest text-cream-faint">
          {label}
        </span>
        <span className="truncate font-mono text-sm text-cream">
          {value}
        </span>
      </span>
      {copied ? (
        <Check className="h-4 w-4 shrink-0 text-accent-strong" />
      ) : (
        <Copy className="h-4 w-4 shrink-0 text-cream-faint transition-colors group-hover:text-accent-strong" />
      )}
    </button>
  );
}

export default function CaseStudy({ project, prevProject, nextProject }) {
  const techStack = project.technologies || [];
  const images = project.images || [];
  const heroImage = images[0]?.image_url || project.thumbnail_url;

  return (
    <article>
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 md:pt-36">
        <Reveal>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cream-faint transition-colors hover:text-accent-strong"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All projects
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-16">
          <div>
            <Reveal>
              <h1 className="text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[1.05] tracking-tight text-cream">
                {project.title}
              </h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream-muted">
                {project.short_description}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="lg:pt-2">
            <div className="rounded-2xl border border-line bg-bg-soft p-6">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-cream-faint">
                Project Access
              </p>
              <div className="flex flex-col gap-3">
                {project.live_link && (
                  <Button href={project.live_link} size="sm" arrow target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Live demo
                  </Button>
                )}
              </div>
              {(project.testing_email || project.testing_password) && (
                <div className="mt-5 border-t border-line pt-4">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-cream-faint">
                    Test credentials
                  </p>
                  <div className="flex flex-col gap-2">
                    {project.testing_email && (
                      <CopyRow label="Email" value={project.testing_email} />
                    )}
                    {project.testing_password && (
                      <CopyRow label="Password" value={project.testing_password} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      {heroImage && (
        <Reveal>
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="overflow-hidden rounded-2xl border border-line">
              <Image
                src={mediaUrl(heroImage)}
                alt={`${project.title} cover`}
                width={1600}
                height={900}
                priority
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </div>
        </Reveal>
      )}

      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <StaggerGroup className="space-y-14">
          <StaggerItem>
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-accent-strong">
                Overview
              </p>
              <DescriptionBlock text={project.description} />
            </div>
          </StaggerItem>

          {images.length > 1 && (
            <StaggerItem>
              <div>
                <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-accent-strong">
                  Gallery
                </p>
                <Gallery images={images} />
              </div>
            </StaggerItem>
          )}

          {techStack.length > 0 && (
            <StaggerItem>
              <div>
                <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-accent-strong">
                  Technologies
                </p>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <Badge key={tech.id} tone="accent">
                      {tech.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </StaggerItem>
          )}
        </StaggerGroup>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-px px-5 sm:px-8 md:grid-cols-2">
          {prevProject ? (
            <Link
              href={`/projects/${prevProject.slug}`}
              className="group flex flex-col gap-2 border-b border-line py-8 pr-8 transition-colors hover:bg-bg-soft/50 md:border-b-0 md:border-r"
            >
              <span className="font-mono text-[11px] uppercase tracking-widest text-cream-faint">
                ← Previous project
              </span>
              <span className="text-xl font-semibold tracking-tight text-cream transition-colors group-hover:text-accent-strong">
                {prevProject.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {nextProject ? (
            <Link
              href={`/projects/${nextProject.slug}`}
              className="group flex flex-col items-end gap-2 border-t border-line py-8 pl-8 text-right transition-colors hover:bg-bg-soft/50 md:border-t-0"
            >
              <span className="font-mono text-[11px] uppercase tracking-widest text-cream-faint">
                Next project →
              </span>
              <span className="text-xl font-semibold tracking-tight text-cream transition-colors group-hover:text-accent-strong">
                {nextProject.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </article>
  );
}