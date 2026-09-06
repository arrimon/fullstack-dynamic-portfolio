import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-5 pb-16 pt-28 sm:px-8">
      <div className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-16 w-3/4 max-w-xl" />
        <Skeleton className="h-4 w-1/2 max-w-md" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}