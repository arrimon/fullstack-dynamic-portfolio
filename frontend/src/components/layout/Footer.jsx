"use client";

import Link from "next/link";
import { ArrowUp, Mail } from "lucide-react";
import SocialLinks from "./SocialLinks";
import { getInitials } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export default function Footer({ site = {}, socialLinks = [] }) {
  const name = site.full_name || "Portfolio";
  const email = site.email;

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative overflow-hidden border-t border-line">
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-10 border-b border-line py-16 md:py-24">
          <p className="max-w-2xl text-[clamp(1.8rem,4.5vw,3.2rem)] font-semibold leading-[1.08] tracking-tight text-cream">
            {site.footer_note || "Let's build something worth remembering."}
          </p>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-mono text-xs uppercase tracking-widest text-cream-faint transition-colors hover:text-accent-strong"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 text-sm text-cream-muted transition-colors hover:text-cream"
                >
                  <Mail className="h-4 w-4" />
                  {email}
                </a>
              )}
              <button
                type="button"
                onClick={scrollTop}
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-xs uppercase tracking-widest text-cream-muted transition-colors hover:border-accent hover:text-accent-strong"
                aria-label="Back to top"
              >
                <ArrowUp className="h-3.5 w-3.5" />
                Top
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neon-gradient font-mono text-xs font-semibold text-white">
              {getInitials(site.full_name) || "P"}
            </span>
            <p className="text-sm text-cream-faint">
              {site.footer_copyright
                ? site.footer_copyright.replace("{year}", new Date().getFullYear())
                : `© ${new Date().getFullYear()} ${name}. All rights reserved.`}
            </p>
          </div>
          <SocialLinks links={socialLinks} size="sm" />
        </div>
      </div>
    </footer>
  );
}