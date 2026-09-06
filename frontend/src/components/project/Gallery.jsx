"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { mediaUrl } from "@/lib/utils";

export default function Gallery({ images = [] }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const next = useCallback(() => setActive((a) => (a + 1) % images.length), [images.length]);
  const prev = useCallback(() => setActive((a) => (a - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, next, prev]);

  if (!images.length) return null;

  const activeImage = images[active];

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full overflow-hidden rounded-xl border border-line"
        aria-label={`Open image gallery (${images.length} images)`}
      >
        <Image
          src={mediaUrl(activeImage.image_url)}
          alt={activeImage.alt_text || "Project image"}
          width={1600}
          height={1000}
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(min-width: 768px) 90vw, 100vw"
        />
        <span className="absolute bottom-4 right-4 rounded-full border border-line bg-bg/80 px-3 py-1 font-mono text-xs text-cream backdrop-blur">
          {active + 1} / {images.length}
        </span>
      </button>

      {images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id || i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-all duration-200 ${
                i === active ? "border-accent-strong" : "border-line opacity-60 hover:opacity-100"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={mediaUrl(img.image_url)}
                alt={img.alt_text || `Project image ${i + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Project image lightbox"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line text-cream transition-colors hover:border-line-strong"
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-bg/40 text-cream transition-colors hover:border-accent hover:text-accent-strong md:left-6"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="max-h-[90vh] w-full max-w-5xl px-4"
            >
              <Image
                src={mediaUrl(activeImage.image_url)}
                alt={activeImage.alt_text || "Project image"}
                width={1600}
                height={1000}
                className="mx-auto max-h-[85vh] w-auto object-contain"
                sizes="90vw"
              />
            </motion.div>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-bg/40 text-cream transition-colors hover:border-accent hover:text-accent-strong md:right-6"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-line bg-bg/70 px-4 py-1.5 font-mono text-sm text-cream">
              {active + 1} / {images.length}
            </span>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}