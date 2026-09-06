import { Mail } from "lucide-react";
import BrandIcon from "@/components/ui/BrandIcon";
import { cn } from "@/lib/utils";

const PLATFORM_LABELS = {
  github: "GitHub",
  linkedin: "LinkedIn",
  x: "X / Twitter",
  twitter: "X / Twitter",
  facebook: "Facebook",
  instagram: "Instagram",
  dribbble: "Dribbble",
  youtube: "YouTube",
  website: "Website",
  email: "Email",
};

function platformKey(platform = "") {
  return String(platform || "").toLowerCase().trim();
}

export default function SocialLinks({
  links = [],
  className,
  size = "md",
  showLabel = false,
  orientation = "horizontal",
}) {
  const dims = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const vertical = orientation === "vertical";

  return (
    <div
      className={cn(
        vertical ? "flex flex-col items-center gap-1" : "flex flex-wrap items-center gap-2",
        className
      )}
    >
      {links.map((link) => {
        const key = platformKey(link.platform);
        const isEmail = key === "email";
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${PLATFORM_LABELS[key] || link.platform} profile`}
            className={cn(
              "group inline-flex items-center justify-center rounded-full text-cream-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-magenta-strong hover:text-magenta-strong hover:shadow-[0_0_16px_-4px_rgba(224,51,159,0.6)]",
              !showLabel && "border border-line",
              showLabel ? "px-4" : dims,
              vertical && size === "sm" && "h-8 w-8"
            )}
          >
            {isEmail ? (
              <Mail
                className={cn(
                  "h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110",
                  size === "sm" && "h-4 w-4"
                )}
              />
            ) : (
              <BrandIcon
                name={link.platform}
                className={cn(
                  "h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110",
                  size === "sm" && "h-4 w-4"
                )}
              />
            )}
            {showLabel && (
              <span className="text-sm font-medium">
                {PLATFORM_LABELS[key] || link.platform}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}
