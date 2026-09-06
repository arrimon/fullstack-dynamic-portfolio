import { cn } from "@/lib/utils";

export function Skeleton({ className }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-bg-muted", className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ className, lines = 3 }) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn("space-y-4", className)} aria-hidden="true">
      <Skeleton className="aspect-[16/10] w-full rounded-xl" />
      <Skeleton className="h-5 w-3/4" />
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}