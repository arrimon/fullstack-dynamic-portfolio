import { Download, FileText } from "lucide-react";
import { getResume } from "@/lib/data";
import { mediaUrl, formatFullDate } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/StateViews";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = {
  title: "Resume",
  description: "Download my resume and get an overview of experience, skills and education.",
};

export default async function ResumePage() {
  const { data: resume } = await getResume();

  if (!resume) {
    return (
      <div className="mx-auto max-w-3xl px-5 pb-28 pt-32 sm:px-8 md:pt-40">
        <EmptyState
          icon={FileText}
          title="Resume coming soon"
          description="There's no resume available yet. Check back shortly — or reach out directly."
          action={<Button href="/contact" size="md">Get in touch</Button>}
        />
      </div>
    );
  }

  const url = mediaUrl(resume.file_url);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-28 pt-32 sm:px-8 md:pt-40">
      <Reveal>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent/60" aria-hidden="true" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-cream-faint">
                Resume
              </span>
            </div>
            <h1 className="mt-6 text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-cream">
              {resume.version_label || "Curriculum Vitae"}
            </h1>
            <p className="mt-4 max-w-lg text-cream-muted">
              A complete overview of my experience, skills and education. Updated{" "}
              {formatFullDate(resume.uploaded_at)}.
            </p>
          </div>
          <Button href={url} size="lg" arrow target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="mt-12">
        <div className="overflow-hidden rounded-2xl border border-line bg-bg-soft">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <span className="font-mono text-xs uppercase tracking-widest text-cream-faint">
              {resume.version_label || "Resume"}
            </span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-widest text-accent-strong transition-colors hover:text-cream"
            >
              Open in new tab ↗
            </a>
          </div>
          <iframe
            src={url}
            title="Resume PDF"
            className="h-[70vh] w-full bg-white"
          />
        </div>
      </Reveal>
    </div>
  );
}