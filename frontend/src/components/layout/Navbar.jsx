"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn, getInitials, mediaUrl } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { ThemeSwitcher, ThemeSwitcherInline } from "@/components/theme/ThemeSwitcher";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({ site = {} }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const name = site.full_name || "Portfolio";
  const initials = getInitials(site.full_name) || "P";
  const logoUrl = mediaUrl(site.logo);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-[#0a0514]/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="Go to homepage"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={name}
              className="h-9 w-9 rounded-lg object-cover shadow-neon-sm transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon-gradient font-mono text-sm font-semibold text-white shadow-neon-sm transition-transform duration-200 group-hover:scale-105">
              {initials}
            </span>
          )}
          <span className="hidden text-sm font-medium text-cream sm:block">
            {name}
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm transition-colors duration-200",
                  active
                    ? "text-cream"
                    : "text-cream-faint hover:text-cream"
                )}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute inset-x-3.5 -bottom-px h-0.5 rounded-full bg-neon-gradient"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher align="right" />
          <Button href="/contact" size="sm" variant="primary" className="hidden md:inline-flex">
            Get in touch
          </Button>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-cream md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-line bg-[#0a0514]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((link, i) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-4 py-3 text-base transition-colors",
                      active
                        ? "bg-accent-faint text-cream"
                        : "text-cream-muted hover:bg-accent-faint hover:text-cream"
                    )}
                  >
                    <span className="font-mono text-xs tracking-widest text-cream-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {link.label}
                    <span className="h-1.5 w-1.5 rounded-full bg-accent/70" aria-hidden="true" />
                  </Link>
                );
              })}
              <div className="pt-2">
                <ThemeSwitcherInline />
              </div>
              <Button href="/contact" size="md" className="mt-3" onClick={() => setOpen(false)}>
                Get in touch
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}