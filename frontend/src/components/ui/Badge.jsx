import { cn } from "@/lib/utils";

const tones = {
  default: "border-line-strong bg-accent-faint text-cream-muted",
  accent: "border-accent/40 bg-accent/15 text-accent-strong",
  cream: "border-line-strong bg-cream/5 text-cream",
  success: "border-accent/50 bg-accent/10 text-accent-strong",
  danger: "border-danger/40 bg-danger/10 text-danger",
  neutral: "border-line bg-bg-muted text-cream-faint",
};

export default function Badge({ children, tone = "default", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}