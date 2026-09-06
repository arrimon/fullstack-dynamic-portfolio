import { cn } from "@/lib/utils";

export function Spinner({ className }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-t-accent-strong",
        className
      )}
    />
  );
}

export function ButtonSpinner() {
  return <Spinner className="h-3.5 w-3.5" />;
}