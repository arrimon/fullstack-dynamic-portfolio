import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

export function StatCard({ label, value, sub, icon: Icon, accent = false }) {
  return (
    <div className="rounded-xl border border-line bg-bg-soft p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-cream-faint">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-cream">
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-cream-faint">{sub}</p>}
        </div>
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg border",
            accent
              ? "border-accent/40 bg-accent-faint text-accent-strong"
              : "border-line bg-bg-muted text-cream-faint"
          )}
        >
          {Icon && <Icon className="h-4 w-4" />}
        </span>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-bg-soft p-5">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-8 w-12" />
      <Skeleton className="mt-2 h-3 w-24" />
    </div>
  );
}