import Link from "next/link";
import { cn } from "@/lib/utils";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "bg-neon-gradient text-white shadow-neon-sm hover:brightness-110 hover:shadow-neon active:translate-y-px",
  secondary:
    "border border-line-strong text-cream hover:border-accent-strong hover:text-accent-strong hover:bg-accent-faint",
  ghost: "text-cream-muted hover:text-cream hover:bg-accent-faint",
  danger:
    "border border-line-strong text-danger hover:border-danger hover:bg-danger/10",
  dark: "bg-cream text-bg hover:bg-cream-muted active:translate-y-px",
};

const sizes = {
  xs: "h-7 px-3 text-xs",
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-7 text-[15px]",
  icon: "h-10 w-10",
  "icon-sm": "h-8 w-8",
};

export default function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  arrow = false,
  ...props
}) {
  const classes = cn(base, variants[variant], sizes[size], className);

  const content = (
    <>
      {children}
      {arrow && (
        <svg
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 8h10m0 0-4-4m4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );

  if (href) {
    const external = /^https?:\/\//.test(href);
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  );
}