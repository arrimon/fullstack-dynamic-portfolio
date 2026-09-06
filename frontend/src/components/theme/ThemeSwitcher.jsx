"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Palette } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";

function ThemeOption({ theme, active, onSelect }) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={active}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
        active ? "bg-accent-faint text-cream" : "text-cream-muted hover:bg-accent-faint/60 hover:text-cream"
      )}
    >
      <span className="flex h-6 w-9 shrink-0 items-center justify-center gap-1 rounded-md border border-line-strong">
        {theme.swatches.map((c, i) => (
          <span key={i} className="h-3 w-1.5 rounded-full" style={{ backgroundColor: c }} />
        ))}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{theme.name}</span>
        <span className="block truncate text-[11px] text-cream-faint">{theme.description}</span>
      </span>
      {active && <Check className="h-4 w-4 shrink-0 text-accent-strong" aria-hidden="true" />}
    </button>
  );
}

export function ThemeSwitcher({ align = "right", label = "Appearance" }) {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Choose theme"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-2 rounded-full border border-line px-3 text-sm text-cream-muted transition-colors hover:border-accent-strong hover:text-cream"
      >
        <Palette className="h-4 w-4" aria-hidden="true" />
        <span className="hidden lg:inline">{label}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Theme options"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className={cn(
              "absolute top-full z-50 mt-2 w-64 rounded-xl border border-line bg-surface p-1.5 shadow-2xl",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            <p className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-cream-faint">
              Choose a theme
            </p>
            {themes.map((t) => (
              <ThemeOption
                key={t.id}
                theme={t}
                active={theme === t.id}
                onSelect={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ThemeSwitcherInline({ onSelect }) {
  const { theme, setTheme, themes } = useTheme();
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-cream-faint">
        <Palette className="h-3 w-3" />
        Choose a theme
      </p>
      {themes.map((t) => (
        <ThemeOption
          key={t.id}
          theme={t}
          active={theme === t.id}
          onSelect={() => {
            setTheme(t.id);
            onSelect?.();
          }}
        />
      ))}
    </div>
  );
}