"use client";

import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { publicGet } from "@/lib/api";
import { ProjectCard } from "@/components/project/ProjectCard";
import { EmptyState, ErrorState } from "@/components/ui/StateViews";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { StaggerGroup, StaggerItem } from "@/components/ui/Reveal";

async function hydrate(items) {
  const results = await Promise.all(
    items.map(async (p) => {
      const { data } = await publicGet(`/api/projects/${p.slug}`);
      return data;
    })
  );
  return results.filter(Boolean);
}

export default function ProjectsGrid({ initial = [], total = 0 }) {
  const [projects, setProjects] = useState(initial);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(projects.length < total);

  const loadMore = useCallback(async () => {
    setLoading(true);
    setError(null);
    const next = page + 1;
    const { data, error: err } = await publicGet("/api/projects", {
      page: next,
      page_size: 9,
    });
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }
    const more = await hydrate(data?.items || []);
    setProjects((prev) => [...prev, ...more]);
    setPage(next);
    setHasMore(projects.length + more.length < (data?.total ?? 0));
    setLoading(false);
  }, [page, projects.length]);

  if (error && projects.length === 0) {
    return (
      <ErrorState
        title="Couldn't load projects"
        description={error}
        onRetry={() => {
          setError(null);
          loadMore();
        }}
      />
    );
  }

  if (!projects.length && !loading) {
    return (
      <EmptyState
        title="No projects published yet"
        description="Projects will appear here as soon as they're published."
      />
    );
  }

  return (
    <div>
      <StaggerGroup className="grid gap-10 sm:grid-cols-2 md:gap-12">
        {projects.map((project) => (
          <StaggerItem key={project.id}>
            <ProjectCard project={project} />
          </StaggerItem>
        ))}
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
      </StaggerGroup>

      {hasMore && !loading && (
        <div className="mt-16 text-center">
          <button
            type="button"
            onClick={loadMore}
            className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3 font-mono text-xs uppercase tracking-widest text-cream-muted transition-colors hover:border-accent hover:text-accent-strong"
          >
            Load more projects
          </button>
        </div>
      )}
      {loading && (
        <div className="mt-16 flex justify-center text-cream-faint">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}
    </div>
  );
}