import { Award, ExternalLink } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";
import { formatMonthYear } from "@/lib/utils";

export default function CertificationsList({ certifications = [], limit, heading = {} }) {
  if (!certifications.length) return null;
  const items = limit ? certifications.slice(0, limit) : certifications;

  const eyebrow = heading.eyebrow || "Certifications";
  const title = heading.title || "Continuous learning.";

  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
      <SectionHeading
        index="04"
        eyebrow={eyebrow}
        title={title}
      />
      <StaggerGroup className="grid gap-4 sm:grid-cols-2">
        {items.map((cert) => (
          <StaggerItem key={cert.id}>
            <div className="group flex h-full flex-col justify-between rounded-xl border border-line bg-bg-soft p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent-faint text-accent-strong">
                  <Award className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-semibold leading-snug tracking-tight text-cream">
                    {cert.title}
                  </h3>
                  <p className="mt-1 text-sm text-accent-strong">
                    {cert.issuing_organization}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-cream-faint">
                  {formatMonthYear(cert.issue_date)}
                </span>
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-cream-muted transition-colors hover:text-accent-strong"
                  >
                    Verify
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}