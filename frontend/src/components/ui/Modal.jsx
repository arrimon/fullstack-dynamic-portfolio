"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({ open, onClose, title, description, size = "md", children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden="true"
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={cn(
            "relative w-full rounded-t-2xl border border-line bg-bg-soft shadow-2xl shadow-black/50 sm:rounded-2xl",
            sizes[size]
          )}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-cream">{title}</h2>
              {description && (
                <p className="mt-0.5 text-sm text-cream-faint">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-cream-muted transition-colors hover:border-line-strong hover:text-cream"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-[calc(100dvh-12rem)] overflow-y-auto p-6">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}