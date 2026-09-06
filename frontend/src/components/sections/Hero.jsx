/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@/components/ui/Button";
import SocialLinks from "@/components/layout/SocialLinks";
import { getInitials, mediaUrl } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1];

function Sparkle({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2c.6 4.8 2.2 6.4 7 7-4.8.6-6.4 2.2-7 7-.6-4.8-2.2-6.4-7-7 4.8-.6 6.4-2.2 7-7Z" />
    </svg>
  );
}

function Cross({ className }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HeroVisual({ site, photo }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto w-[340px] sm:w-[400px]">
      {/* ambient glow behind frame */}
      <div
        className="absolute -inset-8 rounded-[36px] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(147,51,234,0.45), rgba(224,51,159,0.22), transparent)",
        }}
        aria-hidden="true"
      />

      {/* decorative accents */}
      <Sparkle className="absolute -left-7 top-8 h-4 w-4 text-magenta-strong/80" />
      <Cross className="absolute -right-5 bottom-16 h-3 w-3 text-accent-strong/70" />
      <span className="absolute -right-3 -top-3 h-2 w-2 rounded-full bg-magenta-strong shadow-[0_0_10px_2px_rgba(224,51,159,0.55)]" aria-hidden="true" />
      <span className="absolute -bottom-2 left-10 h-1.5 w-1.5 rounded-full bg-accent-strong shadow-[0_0_10px_2px_rgba(192,132,252,0.5)]" aria-hidden="true" />

      {/* neon gradient frame */}
      <div className="relative overflow-hidden rounded-[20px] bg-neon-gradient p-px shadow-neon">
        {reduce ? null : (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 animate-spin-slow" aria-hidden="true">
            <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow-[0_0_12px_3px_rgba(244,114,208,0.8)]" />
          </div>
        )}
        <div
          className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[19px] bg-surface"
          style={{ aspectRatio: "4 / 5" }}
        >
          <div className="absolute inset-0 bg-dots opacity-70" aria-hidden="true" />
          <div
            className="absolute inset-x-0 bottom-0 h-40"
            style={{ background: "radial-gradient(60% 100% at 50% 100%, rgba(224,51,159,0.18), transparent)" }}
            aria-hidden="true"
          />
          {photo && (
            <Image
              src={photo}
              alt={site?.full_name || "Profile"}
              fill
              sizes="(min-width: 640px) 400px, 340px"
              className="z-[1] object-cover object-top"
            />
          )}
          {!photo && (
            <span className="relative font-mono text-7xl font-semibold tracking-tight text-gradient sm:text-8xl">
              {getInitials(site?.full_name) || "P"}
            </span>
          )}

          <div className="absolute left-4 top-4 hidden rounded-lg border border-line bg-bg-muted/90 px-3 py-2 font-mono text-[11px] text-cream-muted backdrop-blur sm:block">
            <span className="text-accent-strong">const</span> craft ={" "}
            <span className="text-cream">&ldquo;deliberate&rdquo;</span>
          </div>
          <div className="absolute bottom-4 right-4 hidden rounded-lg border border-line bg-bg-muted/90 px-3 py-2 font-mono text-[11px] text-cream-muted backdrop-blur sm:block">
            <span className="text-accent-strong">export</span>{" "}
            <span className="text-cream">quality</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero({ site = {}, socialLinks = [] }) {
  const reduce = useReducedMotion();
  const eyebrow = site.hero_eyebrow || "Full-Stack Engineer";
  const title = site.hero_title || "Building digital experiences that matter.";
  const subtitle =
    site.hero_subtitle ||
    "I design and engineer thoughtful products — combining clean code, sharp design and a relentless eye for detail.";
  const words = title.split(" ");
  const highlightIndex = words.length - 1;

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  };
  const word = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
  };

  const renderWords = () =>
    words.map((w, i) => (
      <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
        <motion.span
          variants={word}
          className={i >= highlightIndex ? "inline-block text-gradient" : "inline-block"}
        >
          {w}
        </motion.span>
        {i < words.length - 1 && <span>&nbsp;</span>}
      </span>
    ));

  return (
    <section className="relative overflow-hidden">
      {/* subtle local glow */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-[380px] max-w-4xl opacity-50 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(147,51,234,0.35), transparent)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-32 sm:px-8 md:pt-40 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-10 lg:pb-28 lg:pt-48">
        {/* Social rail — desktop */}
        {socialLinks.length > 0 && (
          <div className="hidden lg:flex lg:flex-col lg:items-center lg:gap-4 lg:pt-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-cream-faint [writing-mode:vertical-rl]">
              Follow me
            </span>
            <span className="h-14 w-px bg-gradient-to-b from-transparent via-line-strong to-transparent" aria-hidden="true" />
            <SocialLinks links={socialLinks} size="sm" orientation="vertical" />
          </div>
        )}

        {/* Content */}
        <div className="max-w-2xl">
          {reduce ? (
            <>
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.25em] text-accent-strong">
                {eyebrow}
              </p>
              <h1 className="text-[clamp(2.6rem,7.5vw,5.2rem)] font-semibold leading-[1.02] tracking-tight text-cream">
                {words.map((w, i) => (
                  <span key={i}>
                    <span className={i >= highlightIndex ? "text-gradient" : undefined}>{w}</span>
                    {i < words.length - 1 && <span>&nbsp;</span>}
                  </span>
                ))}
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-cream-muted">
                {subtitle}
              </p>
            </>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show">
              <motion.p
                variants={word}
                className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/70 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.25em] text-accent-strong backdrop-blur"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-magenta-strong shadow-[0_0_8px_2px_rgba(224,51,159,0.6)]" aria-hidden="true" />
                {eyebrow}
              </motion.p>
              <h1 className="text-[clamp(2.6rem,7.5vw,5.2rem)] font-semibold leading-[1.02] tracking-tight text-cream">
                {renderWords()}
              </h1>
              <motion.p
                variants={word}
                className="mt-6 max-w-lg text-lg leading-relaxed text-cream-muted"
              >
                {subtitle}
              </motion.p>
            </motion.div>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button href="/projects" size="lg" arrow>
              View projects
            </Button>
            <Button href="/contact" size="lg" variant="secondary">
              Get in touch
            </Button>
          </div>

          {/* Social row — tablet/mobile */}
          {socialLinks.length > 0 && (
            <div className="mt-10 flex items-center gap-4 lg:hidden">
              <span className="font-mono text-[11px] uppercase tracking-widest text-cream-faint">
                Follow
              </span>
              <span className="h-px w-8 bg-line-strong" aria-hidden="true" />
              <SocialLinks links={socialLinks} size="sm" />
            </div>
          )}
        </div>

        <div className="relative pt-2 lg:pt-6">
          <HeroVisual site={site} photo={mediaUrl(site.profile_picture)} />
        </div>
      </div>
    </section>
  );
}