"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { mediaUrl, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={cn("h-4 w-4", i < rating ? "text-accent-strong" : "text-cream-faint/40")}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ testimonial }) {
  const src = mediaUrl(testimonial.client_image);
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-12 w-12 rounded-full object-cover ring-1 ring-line-strong"
      />
    );
  }
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neon-gradient font-mono text-sm font-semibold text-white">
      {getInitials(testimonial.client_name)}
    </span>
  );
}

export default function Testimonials({ testimonials = [], heading = {} }) {
  const reduce = useReducedMotion();
  const items = testimonials;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  const count = items.length;
  const canSlide = count > 1;

  const go = useCallback(
    (next) => {
      if (!canSlide) return;
      setDirection(next > index ? 1 : -1);
      setIndex(((next % count) + count) % count);
    },
    [canSlide, count, index]
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (!canSlide || paused || reduce) return;
    timer.current = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % count);
    }, 6000);
    return () => clearInterval(timer.current);
  }, [canSlide, paused, reduce, count]);

  if (!count) return null;

  const eyebrow = heading.eyebrow || "Testimonials";
  const title = heading.title || "Kind words from clients.";
  const description =
    heading.description || "What it's like to work together.";

  const active = items[index];

  return (
    <section
      className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Client testimonials"
    >
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />

      <div className="relative">
        <div className="overflow-hidden rounded-2xl border border-line bg-bg-soft px-6 py-10 text-center sm:px-12 md:py-14">
          <Quote className="mx-auto mb-6 h-8 w-8 text-accent-strong/60" aria-hidden="true" />
          <div className="mx-auto max-w-2xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.blockquote
                key={active.id}
                custom={direction}
                initial={reduce ? false : { opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                drag={canSlide && !reduce ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (info.offset.x < -60) next();
                  else if (info.offset.x > 60) prev();
                }}
                className="cursor-grab active:cursor-grabbing"
              >
                <p className="text-lg leading-relaxed text-cream-muted sm:text-xl">
                  “{active.review_text}”
                </p>
                <div className="mt-8 flex flex-col items-center gap-3">
                  <Avatar testimonial={active} />
                  <div>
                    <p className="font-semibold text-cream">{active.client_name}</p>
                    {(active.client_role || active.company_name) && (
                      <p className="text-sm text-cream-faint">
                        {[active.client_role, active.company_name].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <Stars rating={active.rating} />
                </div>
              </motion.blockquote>
            </AnimatePresence>
          </div>
        </div>

        {canSlide && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous testimonial"
              className="absolute left-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-cream-muted transition-colors hover:border-accent-strong hover:text-cream sm:-left-5"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="absolute right-1 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-cream-muted transition-colors hover:border-accent-strong hover:text-cream sm:-right-5"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="mt-7 flex items-center justify-center gap-2" role="tablist" aria-label="Choose testimonial">
              {items.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => go(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === index ? "w-6 bg-accent-strong" : "w-2 bg-cream-faint/40 hover:bg-cream-faint/70"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
