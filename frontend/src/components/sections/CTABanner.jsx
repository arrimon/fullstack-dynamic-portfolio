import Button from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export default function CTABanner({
  eyebrow,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}) {
  return (
    <Reveal className={className}>
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface px-6 py-14 text-center sm:px-12 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-50" aria-hidden="true" />
        <span className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-magenta-strong/70 to-transparent" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-48"
          style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(147,51,234,0.28), transparent)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
          style={{ background: "radial-gradient(50% 100% at 50% 100%, rgba(224,51,159,0.16), transparent)" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-2xl">
          {eyebrow && (
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-accent-strong">
              {eyebrow}
            </p>
          )}
          <h2 className="text-[clamp(1.8rem,4.5vw,3rem)] font-semibold leading-[1.1] tracking-tight text-cream">
            {title}
          </h2>
          {description && (
            <p className="mx-auto mt-4 max-w-lg leading-relaxed text-cream-muted">
              {description}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {action}
            {secondaryAction}
          </div>
        </div>
      </div>
    </Reveal>
  );
}