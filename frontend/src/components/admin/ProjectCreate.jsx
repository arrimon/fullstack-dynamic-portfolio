"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { adminGet } from "@/lib/admin";
import PageHeader from "@/components/admin/PageHeader";
import ProjectForm from "@/components/admin/ProjectForm";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProjectCreate() {
  const [technologies, setTechnologies] = useState(null);

  useEffect(() => {
    let mounted = true;
    adminGet("/technologies").then((res) => {
      if (mounted && !res.error) setTechnologies(res.data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" href="/admin/projects">
          <ArrowLeft className="h-3.5 w-3.5" />
          All projects
        </Button>
      </div>
      <PageHeader
        title="New project"
        description="Fill in the details below to create a project."
      />
      {technologies === null ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : (
        <ProjectForm technologies={technologies} />
      )}
    </div>
  );
}