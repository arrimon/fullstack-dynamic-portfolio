"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Images, Pencil } from "lucide-react";
import { adminGet } from "@/lib/admin";
import PageHeader from "@/components/admin/PageHeader";
import Button from "@/components/ui/Button";
import ProjectForm from "@/components/admin/ProjectForm";
import ImageManager from "@/components/admin/ImageManager";
import { ErrorState } from "@/components/ui/StateViews";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export default function ProjectEditor() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id;
  const tab = searchParams.get("tab") === "images" ? "images" : "details";

  const [project, setProject] = useState(null);
  const [technologies, setTechnologies] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([adminGet(`/projects/${projectId}`), adminGet("/technologies")]).then(
      ([projectRes, techRes]) => {
        if (!mounted) return;
        if (projectRes.error) {
          setError(projectRes.error === "UNAUTHORIZED" ? "UNAUTHORIZED" : projectRes.error);
          return;
        }
        setProject(projectRes.data);
        setTechnologies(techRes.data || []);
      }
    );
    return () => {
      mounted = false;
    };
  }, [projectId]);

  if (error) {
    return (
      <ErrorState
        title="Couldn't load project"
        description={error}
        backHref="/admin/projects"
      />
    );
  }

  const handleImageUploaded = (image) => {
    setProject((prev) =>
      prev ? { ...prev, images: [...(prev.images || []), image] } : prev
    );
  };

  const handleImageRemoved = (imageId) => {
    setProject((prev) =>
      prev
        ? { ...prev, images: (prev.images || []).filter((img) => img.id !== imageId) }
        : prev
    );
  };

  if (!project) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="rounded-xl border border-line bg-bg-soft p-6">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-4 h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" href="/admin/projects">
          <ArrowLeft className="h-3.5 w-3.5" />
          All projects
        </Button>
        <div className="flex items-center gap-2">
          <a
            href={`/projects/${project.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-accent-strong transition-colors hover:text-cream"
          >
            View on site ↗
          </a>
        </div>
      </div>

      <PageHeader title={project.title} description={`/${project.slug}`} />

      <div className="mb-6 flex items-center gap-1 rounded-lg border border-line bg-bg-soft p-1">
        {[
          { key: "details", label: "Details", icon: Pencil },
          { key: "images", label: "Images", icon: Images },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <a
              key={t.key}
              href={`/admin/projects/${project.id}?tab=${t.key}`}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm transition-colors",
                active ? "bg-bg-muted text-cream" : "text-cream-faint hover:text-cream"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </a>
          );
        })}
      </div>

      {tab === "details" ? (
        <ProjectForm
          project={project}
          technologies={technologies}
          onImageUploaded={handleImageUploaded}
          onImageRemoved={handleImageRemoved}
        />
      ) : (
        <ImageManager projectId={project.id} images={project.images} />
      )}
    </div>
  );
}