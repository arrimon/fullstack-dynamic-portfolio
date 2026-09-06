import { ArrowRight, MapPin } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";

export default function AboutSnapshot({ site = {} }) {
  const bio = site.bio || site.about_bio;
  if (!bio) return null;

  return (
    <section className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
      <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
        <SectionHeading
          index="02"
          eyebrow="About"
          title="More than a developer."
          className="mb-0"
        />
        <Reveal delay={0.1} className="flex flex-col justify-center">
          <p className="whitespace-pre-line text-lg leading-relaxed text-cream-muted">
            {bio}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            {site.location && (
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cream-faint">
                <MapPin className="h-3.5 w-3.5 text-accent-strong" />
                {site.location}
              </span>
            )}
            <Button href="/about" variant="ghost" size="sm" arrow>
              Read my story
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}