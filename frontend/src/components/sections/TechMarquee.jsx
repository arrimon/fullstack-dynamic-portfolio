"use client";

import { useState } from "react";
import Image from "next/image";
import { Code2, Database, Server, Wrench } from "lucide-react";
import { mediaUrl, asBool } from "@/lib/utils";

const categoryIcons = {
  frontend: Code2,
  backend: Server,
  database: Database,
  tools: Wrench,
};

const SPEED_DURATION = { slow: 60, normal: 42, fast: 24 };

function TechItem({ tech, showName, showCategory }) {
  const Icon = categoryIcons[tech.category] || Code2;
  const src = tech.icon_url ? mediaUrl(tech.icon_url) : "";
  return (
    <div className="group flex shrink-0 items-center gap-2.5 rounded-full border border-line bg-bg-soft px-5 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50">
      {src ? (
        <Image
          src={src}
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <Icon className="h-4 w-4 text-accent-strong transition-transform duration-300 group-hover:scale-110" />
      )}
      {showName && (
        <span className="text-sm font-medium text-cream-muted group-hover:text-cream">
          {tech.name}
        </span>
      )}
      {showCategory && (
        <span className="font-mono text-[10px] uppercase tracking-widest text-cream-faint">
          {tech.category}
        </span>
      )}
    </div>
  );
}

function MarqueeRow({ items, settings }) {
  // Duplicate the list so the loop is seamless (translateX -50%).
  const [hovered, setHovered] = useState(false);
  const animate = settings.animation && items.length > 1;
  const visible = animate ? [...items, ...items] : items;
  const duration = SPEED_DURATION[settings.speed] ?? SPEED_DURATION.normal;

  const animationName = settings.direction === "right" ? "marquee-reverse" : "marquee";

  // Use only longhand animation properties: mixing the `animation` shorthand
  // with e.g. animationPlayState in one style object makes React reset the
  // play-state (and emit an inline-style warning), and a CSS hover rule cannot
  // override it. Emitting every longhand keeps the toggle reliable.
  const style = animate
    ? {
        animationName,
        animationDuration: `${duration}s`,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        animationPlayState: settings.pauseOnHover && hovered ? "paused" : "running",
      }
    : undefined;

  const className = [
    "flex w-max gap-3 tech-marquee-track",
    !animate ? "flex-wrap justify-center" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      onMouseEnter={settings.pauseOnHover ? () => setHovered(true) : undefined}
      onMouseLeave={settings.pauseOnHover ? () => setHovered(false) : undefined}
    >
      <div className={className} style={style}>
        {visible.map((tech, i) => (
          <TechItem
            key={`${tech.id}-${i}`}
            tech={tech}
            showName={settings.showName}
            showCategory={settings.showCategory}
          />
        ))}
      </div>
    </div>
  );
}

export default function TechMarquee({ technologies = [], label, settings = {} }) {
  const enabled = asBool(settings.tech_stack_section_enabled, true);
  if (!enabled || technologies.length === 0) return null;

  const merged = {
    animation: asBool(settings.tech_stack_animation_enabled, true),
    direction: settings.tech_stack_animation_direction || "left",
    speed: settings.tech_stack_animation_speed || "normal",
    pauseOnHover: asBool(settings.tech_stack_pause_on_hover, true),
    showName: asBool(settings.tech_stack_show_name, true),
    showCategory: asBool(settings.tech_stack_show_category, true),
  };

  // Need a few items for a smooth continuous loop.
  if (technologies.length < 4 && merged.animation) return null;

  const displayedLabel = label || "Technologies I work with";

  return (
    <section className="border-y border-line bg-bg-soft/40 py-10" aria-label="Technologies">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="mb-6 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-cream-faint">
          {displayedLabel}
        </p>
      </div>
      {merged.animation ? (
        <>
          <MarqueeRow
            items={technologies.slice(0, Math.ceil(technologies.length / 2))}
            settings={merged}
          />
          <MarqueeRow
            items={technologies.slice(Math.ceil(technologies.length / 2))}
            settings={{ ...merged, direction: merged.direction === "right" ? "left" : "right" }}
          />
        </>
      ) : (
        <MarqueeRow items={technologies} settings={merged} />
      )}
    </section>
  );
}
