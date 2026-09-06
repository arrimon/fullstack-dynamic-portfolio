"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function AdminError({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-5 py-20">
      <div className="max-w-md rounded-xl border border-line bg-surface p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          Admin error
        </p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-cream">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-cream-muted">
          An unexpected error occurred in the admin panel. Try again to reload
          this view.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={retry}>Try again</Button>
          <Button href="/admin" variant="secondary">
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}