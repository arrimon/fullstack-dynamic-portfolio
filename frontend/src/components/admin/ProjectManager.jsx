"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  Eye,
  Images,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { adminDelete, adminGet, adminPost, adminPut } from "@/lib/admin";
import { mediaUrl } from "@/lib/utils";
import { DragHandle, Sortable, useDragReorder } from "@/components/ui/SortableList";
import PageHeader from "@/components/admin/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Form";
import { EmptyState } from "@/components/ui/StateViews";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

export default function ProjectManager() {
  const { toast } = useToast();
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [deletedOnly, setDeletedOnly] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await adminGet("/projects", { page_size: 100 });
    if (res.error === "UNAUTHORIZED") return;
    if (res.error) {
      setError(res.error);
      return;
    }
    setProjects(res.data?.items || []);
    setError("");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { ordered, sensors, handleDragEnd } = useDragReorder(
    projects || [],
    (p) => p.id,
    async (ids) => {
      const res = await adminPut(
        "/projects/reorder",
        { items: ids.map((id, idx) => ({ id, display_order: idx + 1 })) }
      );
      if (res.error) {
        toast({
          title: "Couldn't save order",
          description: "Your previous order has been restored.",
          variant: "error",
        });
        throw new Error(res.error);
      }
      toast({ title: "Project order saved", variant: "success" });
    }
  );

  const filtered = useMemo(() => {
    if (!ordered.length) return [];
    return ordered.filter((p) => {
      if (deletedOnly && !p.deleted_at) return false;
      if (!deletedOnly && p.deleted_at) return false;
      if (status && p.status !== status) return false;
      if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [ordered, query, status, deletedOnly]);

  const handleDelete = useCallback(async () => {
    if (!toDelete) return;
    setBusy(true);
    const res = await adminDelete(`/projects/${toDelete.id}`);
    setBusy(false);
    if (res.error) {
      toast({ title: "Delete failed", description: res.error, variant: "error" });
    } else {
      toast({ title: "Project moved to trash", description: "It can be restored anytime." });
      setToDelete(null);
      load();
    }
  }, [toDelete, load, toast]);

  const handleRestore = useCallback(async (project) => {
    const res = await adminPost(`/projects/${project.id}/restore`);
    if (res.error) {
      toast({ title: "Restore failed", description: res.error, variant: "error" });
    } else {
      toast({ title: "Project restored" });
      load();
    }
  }, [load, toast]);

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Drag to reorder. Create, edit and manage your portfolio projects."
        actions={
          <Button href="/admin/projects/new" size="sm" arrow>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-faint" />
          <Input
            type="search"
            placeholder="Search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            aria-label="Search projects"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-44" aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
        <Button
          variant={deletedOnly ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setDeletedOnly(!deletedOnly)}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Trash
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
          <p className="text-sm text-danger">{error}</p>
          <Button size="xs" variant="secondary" onClick={load}>
            Retry
          </Button>
        </div>
      )}

      {!projects ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-line bg-bg-soft p-4">
              <Skeleton className="h-12 w-16 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={deletedOnly ? "Trash is empty" : "No projects found"}
          description={
            deletedOnly
              ? "Deleted projects will appear here."
              : "Try adjusting your filters, or create a new project."
          }
          action={
            !deletedOnly && (
              <Button href="/admin/projects/new" size="sm">
                <Plus className="h-3.5 w-3.5" />
                New project
              </Button>
            )
          }
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="overflow-hidden rounded-xl border border-line">
              <table className="hidden w-full md:table">
                <thead>
                  <tr className="border-b border-line bg-bg-soft text-left font-mono text-[11px] uppercase tracking-widest text-cream-faint">
                    <th className="w-10" />
                    <th className="px-5 py-3 font-normal">Project</th>
                    <th className="px-4 py-3 font-normal">Status</th>
                    <th className="px-4 py-3 font-normal">Featured</th>
                    <th className="px-5 py-3 text-right font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-bg-soft/60">
                  {filtered.map((project) => (
                    <Sortable key={project.id} id={project.id}>
                      {({ setNodeRef, style, attributes, listeners, isDragging }) => (
                        <tr
                          ref={setNodeRef}
                          style={style}
                          className={isDragging ? "opacity-80" : ""}
                        >
                          <td className="w-10 pl-4 align-middle">
                            <DragHandle attributes={attributes} listeners={listeners} />
                          </td>
                          <td className="px-5 py-3.5">
                            <Link href={`/admin/projects/${project.id}`} className="flex items-center gap-3">
                              {project.thumbnail_url ? (
                                <img src={mediaUrl(project.thumbnail_url)} alt="" className="h-11 w-16 rounded-md object-cover" />
                              ) : (
                                <span className="flex h-11 w-16 items-center justify-center rounded-md bg-bg-muted font-mono text-[10px] text-cream-faint">
                                  N/A
                                </span>
                              )}
                              <div>
                                <p className="text-sm font-medium text-cream">{project.title}</p>
                                <p className="font-mono text-[11px] text-cream-faint">/{project.slug}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge tone={project.status === "published" ? "success" : "neutral"}>
                              {project.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            {project.is_featured ? (
                              <Star className="h-4 w-4 fill-accent text-accent" aria-label="Featured" />
                            ) : (
                              <span className="text-cream-faint">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1">
                              {project.deleted_at ? (
                                <Button size="xs" variant="secondary" onClick={() => handleRestore(project)}>
                                  <RotateCcw className="h-3 w-3" />
                                  Restore
                                </Button>
                              ) : (
                                <>
                                  <Button size="icon-sm" variant="ghost" href={`/admin/projects/${project.id}`} aria-label="Edit project" onClick={(e) => e.stopPropagation()}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="icon-sm" variant="ghost" href={`/admin/projects/${project.id}?tab=images`} aria-label="Manage images" onClick={(e) => e.stopPropagation()}>
                                    <Images className="h-3.5 w-3.5" />
                                  </Button>
                                  {project.status === "published" && (
                                    <Button size="icon-sm" variant="ghost" href={`/projects/${project.slug}`} target="_blank" aria-label="View project" onClick={(e) => e.stopPropagation()}>
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  <Button size="icon-sm" variant="danger" onClick={(e) => { e.stopPropagation(); setToDelete(project); }} aria-label="Delete project">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Sortable>
                  ))}
                </tbody>
              </table>

              <ul className="divide-y divide-line md:hidden">
                {filtered.map((project) => (
                  <Sortable key={project.id} id={project.id}>
                    {({ setNodeRef, style, attributes, listeners, isDragging }) => (
                      <li
                        ref={setNodeRef}
                        style={style}
                        className={`flex items-center gap-3 bg-bg-soft/60 px-4 py-4 ${isDragging ? "opacity-80" : ""}`}
                      >
                        <DragHandle attributes={attributes} listeners={listeners} />
                        {project.thumbnail_url ? (
                          <img src={mediaUrl(project.thumbnail_url)} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" />
                        ) : (
                          <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-bg-muted font-mono text-[10px] text-cream-faint">
                            N/A
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <Link href={`/admin/projects/${project.id}`} className="block truncate text-sm font-medium text-cream" onClick={(e) => e.stopPropagation()}>
                            {project.title}
                          </Link>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge tone={project.status === "published" ? "success" : "neutral"}>
                              {project.status}
                            </Badge>
                            {project.is_featured && <Star className="h-3 w-3 fill-accent text-accent" aria-label="Featured" />}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {project.deleted_at ? (
                            <Button size="xs" variant="secondary" onClick={(e) => { e.stopPropagation(); handleRestore(project); }}>
                              Restore
                            </Button>
                          ) : (
                            <>
                              <Button size="icon-sm" variant="ghost" href={`/admin/projects/${project.id}`} aria-label="Edit project" onClick={(e) => e.stopPropagation()}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon-sm" variant="danger" onClick={(e) => { e.stopPropagation(); setToDelete(project); }} aria-label="Delete project">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </li>
                    )}
                  </Sortable>
                ))}
              </ul>
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete project?"
        description={`"${toDelete?.title || ""}" will be moved to trash. You can restore it later.`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setToDelete(null)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={busy}>
            <Trash2 className="h-4 w-4" />
            {busy ? "Deleting…" : "Delete project"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
