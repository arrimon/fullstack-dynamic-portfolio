"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function Error({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5 py-20">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-accent-strong">
          Something went wrong
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-cream">
          The page could not be loaded
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-cream-muted">
          An unexpected error occurred while rendering this page. You can try
          again, or head back to the homepage.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button onClick={retry}>Try again</Button>
          <Button href="/" variant="secondary">
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}