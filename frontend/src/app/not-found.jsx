import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-accent-strong">
        Error 404
      </p>
      <h1 className="mt-6 text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-tight tracking-tight text-cream">
        This page wandered off.
      </h1>
      <p className="mt-4 max-w-md leading-relaxed text-cream-muted">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Button href="/" size="md" arrow>
          Back home
        </Button>
        <Button href="/projects" size="md" variant="secondary">
          <ArrowLeft className="h-4 w-4" />
          View projects
        </Button>
      </div>
      <Link
        href="/"
        className="mt-12 font-mono text-xs uppercase tracking-widest text-cream-faint transition-colors hover:text-accent-strong"
      >
        Portfolio
      </Link>
    </div>
  );
}