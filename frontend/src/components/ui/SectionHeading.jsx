import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  index,
  align = "left",
  className,
}) {
  return (
    <Reveal
      className={cn(
        "mb-12 flex flex-col gap-4 md:mb-16",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {index !== undefined && (
          <span className="font-mono text-xs tracking-widest text-accent-strong">
            {String(index).padStart(2, "0")}
          </span>
        )}
        <span className="h-px w-8 bg-gradient-to-r from-accent-strong to-magenta" aria-hidden="true" />
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-cream-faint">
          {eyebrow}
        </span>
      </div>
      {title && (
        <h2 className="max-w-2xl text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight text-cream">
          {title}
        </h2>
      )}
      {description && (
        <p
          className={cn(
            "max-w-xl text-base leading-relaxed text-cream-muted",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}