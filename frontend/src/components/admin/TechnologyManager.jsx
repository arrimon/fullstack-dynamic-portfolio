"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Code2, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import axios from "axios";
import { adminDelete, adminGet, adminPost, adminPut } from "@/lib/admin";
import { publicGet } from "@/lib/api";
import { mediaUrl, cn } from "@/lib/utils";
import { technologySchema } from "@/lib/validators";
import PageHeader from "@/components/admin/PageHeader";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { Input, Select, Label, FieldError, Checkbox } from "@/components/ui/Form";
import { EmptyState } from "@/components/ui/StateViews";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@/components/ui/Spinner";
import { DragHandle, SortableList } from "@/components/ui/SortableList";

const categoryLabels = { frontend: "Frontend", backend: "Backend", database: "Database", tools: "Tools" };

export default function TechnologyManager() {
  const { toast } = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(null);

  const [catalog, setCatalog] = useState([]);
  const [query, setQuery] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [iconQuery, setIconQuery] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(technologySchema) });

  const load = useCallback(async () => {
    const res = await adminGet("/technologies");
    if (res.error) {
      setError(res.error);
      return;
    }
    setItems(res.data || []);
    setError("");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      const { data } = await publicGet("/api/technologies/catalog");
      if (data) setCatalog(data);
    })();
  }, []);

  const existingNames = useMemo(
    () => new Set((items || []).map((i) => i.name)),
    [items]
  );

  const catalogMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog
      .filter((c) => !existingNames.has(c.name))
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [catalog, query, existingNames]);

  const addFromCatalog = (entry) => {
    setCatalogOpen(false);
    setQuery("");
    openEdit({
      name: entry.name,
      category: entry.category,
      icon_url: entry.icon_url,
      is_active: true,
    });
  };

  const reorderTech = async (ids) => {
    const res = await adminPut(
      "/technologies/reorder",
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
    toast({ title: "Technology order saved", variant: "success" });
  };

  const openEdit = (item) => {
    setEditing(item || { _new: true });
    reset({
      name: item?.name || "",
      category: item?.category || "frontend",
      icon_url: item?.icon_url || "",
      is_active: item?.is_active ?? true,
    });
  };

  const openNew = () => openEdit(null);

  const nameRegister = register("name");
  const handleNameChange = (e) => {
    nameRegister.onChange(e);
    const match = catalog.find(
      (c) => c.name.toLowerCase() === e.target.value.trim().toLowerCase()
    );
    // Auto-associate icon + category from the catalog when adding a known
    // technology and the admin hasn't supplied a custom icon yet.
    if (match && !getValues("icon_url")) {
      setValue("category", match.category);
      setValue("icon_url", match.icon_url);
    }
  };

  const previewSrc = watch("icon_url");
  const previewName = watch("name");
  const previewCategory = watch("category");

  const submit = async (values) => {
    setBusy(true);
    const payload = {
      name: values.name,
      category: values.category,
      icon_url: values.icon_url || null,
      is_active: values.is_active,
    };
    const res = editing?.id
      ? await adminPut(`/technologies/${editing.id}`, payload)
      : await adminPost("/technologies", payload);
    setBusy(false);
    if (res.error) {
      toast({ title: "Save failed", description: res.error, variant: "error" });
      return;
    }
    toast({ title: editing?.id ? "Technology updated" : "Technology created", variant: "success" });
    setEditing(null);
    load();
  };

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    const res = await adminDelete(`/technologies/${toDelete.id}`);
    setBusy(false);
    if (res.error) {
      toast({ title: "Delete failed", description: res.error, variant: "error" });
    } else {
      toast({ title: "Technology deleted" });
      setToDelete(null);
      load();
    }
  };

  const toggleActive = async (item) => {
    const res = await adminPut(`/technologies/${item.id}`, { is_active: !item.is_active });
    if (res.error) {
      toast({ title: "Update failed", description: res.error, variant: "error" });
    } else {
      load();
    }
  };

  const uploadIcon = async (item, file) => {
    if (!file) return;
    setUploading(item.id);
    const formData = new FormData();
    formData.append("icon", file);
    try {
      await axios.post(`/api/admin/technologies/${item.id}/icon`, formData);
      toast({ title: "Icon uploaded", variant: "success" });
      load();
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast({ title: "Upload failed", description: typeof detail === "string" ? detail : "Try another image.", variant: "error" });
    } finally {
      setUploading(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Technologies"
        description="Drag to reorder. The technologies referenced across your projects."
        actions={
          <Button size="sm" onClick={openNew} arrow>
            <Plus className="h-4 w-4" />
            Add technology
          </Button>
        }
      />

      <div className="relative mb-6 max-w-md">
        <Label htmlFor="catalog-search">Quick add from catalog</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-faint" />
          <Input
            id="catalog-search"
            className="pl-9"
            placeholder="Search React, Docker, PostgreSQL…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCatalogOpen(true);
            }}
            onFocus={() => setCatalogOpen(true)}
            onBlur={() => setTimeout(() => setCatalogOpen(false), 120)}
            autoComplete="off"
          />
        </div>
        {catalogOpen && catalogMatches.length > 0 && (
          <ul className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-line bg-bg-muted shadow-xl shadow-black/40">
            {catalogMatches.map((entry) => (
              <li key={entry.slug}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addFromCatalog(entry)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-bg-soft"
                >
                  <img
                    src={entry.icon_url}
                    alt=""
                    className="h-5 w-5 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                  />
                  <span className="flex-1 text-sm text-cream">{entry.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-cream-faint">
                    {entry.category}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
          <p className="text-sm text-danger">{error}</p>
          <Button size="xs" variant="secondary" onClick={load}>
            Retry
          </Button>
        </div>
      )}

      {!items ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No technologies yet"
          description="Add the technologies you use so projects can reference them."
          action={
            <Button size="sm" onClick={openNew}>
              <Plus className="h-3.5 w-3.5" />
              Add technology
            </Button>
          }
        />
      ) : (
        <SortableList
          items={items}
          onReorder={reorderTech}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          renderRow={(item, sortable) => (
            <div
              ref={sortable?.setNodeRef}
              style={sortable?.style}
              className={`flex items-center gap-4 rounded-xl border border-line bg-bg-soft p-4 ${sortable?.isDragging ? "opacity-80 ring-1 ring-accent" : ""}`}
            >
              {sortable ? (
                <DragHandle attributes={sortable.attributes} listeners={sortable.listeners} />
              ) : (
                <span className="w-8 shrink-0" />
              )}
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-bg-muted text-accent-strong">
                {item.icon_url ? (
                  <img src={mediaUrl(item.icon_url)} alt="" className="h-6 w-6 object-contain" />
                ) : (
                  <Code2 className="h-5 w-5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-cream">{item.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone="neutral">{categoryLabels[item.category] || item.category}</Badge>
                  {!item.is_active && (
                    <Badge tone="neutral" className="opacity-70">Hidden</Badge>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.is_active}
                  aria-label={`${item.name} — ${item.is_active ? "active" : "inactive"}`}
                  onClick={() => toggleActive(item)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors",
                    item.is_active
                      ? "border-accent/50 bg-accent/25"
                      : "border-line bg-bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full transition-transform",
                      item.is_active
                        ? "translate-x-[22px] bg-accent-strong"
                        : "translate-x-1 bg-cream-faint"
                    )}
                  />
                </button>
                <span className={cn("font-mono text-[9px] uppercase tracking-widest", item.is_active ? "text-accent-strong" : "text-cream-faint")}>
                  {item.is_active ? "Active" : "Inactive"}
                </span>
                <div className="flex items-center gap-1">
                  <Button size="icon-sm" variant="ghost" onClick={() => openEdit(item)} aria-label="Edit technology">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon-sm" variant="danger" onClick={() => setToDelete(item)} aria-label="Delete technology">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <label className="flex cursor-pointer items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-cream-faint transition-colors hover:text-accent-strong">
                  <Upload className="h-3 w-3" />
                  {uploading === item.id ? "Uploading…" : "Icon"}
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => uploadIcon(item, e.target.files?.[0])}
                  />
                </label>
              </div>
            </div>
          )}
        />
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit technology" : "New technology"}>
        <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
          <div>
            <Label htmlFor="name" required>
              Name
            </Label>
            <Input
              id="name"
              placeholder="React"
              {...nameRegister}
              onChange={handleNameChange}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="category" required>
              Category
            </Label>
            <Select id="category" {...register("category")}>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <FieldError>{errors.category?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="icon_url">Icon URL</Label>
            <Input id="icon_url" placeholder="https://… or /uploads/…" {...register("icon_url")} />
            <FieldError>{errors.icon_url?.message}</FieldError>
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-line bg-bg-muted px-4 py-3">
              {previewSrc ? (
                <img
                  src={mediaUrl(previewSrc)}
                  alt=""
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <Code2 className="h-5 w-5 text-accent-strong" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-cream">
                  {previewName || "Technology name"}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-cream-faint">
                  {previewCategory || "category"}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between">
                <Label>Or pick a specific icon</Label>
                <Button
                  type="button"
                  size="xs"
                  variant="secondary"
                  onClick={() => setPickerOpen((o) => !o)}
                >
                  {pickerOpen ? "Hide picker" : "Choose from catalog"}
                </Button>
              </div>
              {pickerOpen && (
                <div className="mt-2 rounded-lg border border-line bg-bg-muted p-3">
                  <Input
                    className="mb-3"
                    placeholder="Search icons (React, Docker, PostgreSQL…)"
                    value={iconQuery}
                    onChange={(e) => setIconQuery(e.target.value)}
                  />
                  <div className="grid max-h-56 grid-cols-6 gap-2 overflow-auto sm:grid-cols-8">
                    {catalog
                      .filter((c) =>
                        c.name.toLowerCase().includes(iconQuery.trim().toLowerCase())
                      )
                      .map((c) => (
                        <button
                          key={c.slug}
                          type="button"
                          title={c.name}
                          aria-label={`Use ${c.name} icon`}
                          onClick={() => {
                            setValue("icon_url", c.icon_url);
                            setValue("category", c.category);
                          }}
                          className={cn(
                            "flex items-center justify-center rounded-md border p-2 transition-colors hover:border-accent",
                            previewSrc === c.icon_url
                              ? "border-accent bg-accent-faint"
                              : "border-line"
                          )}
                        >
                          <img
                            src={c.icon_url}
                            alt=""
                            className="h-6 w-6 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.visibility = "hidden";
                            }}
                          />
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox {...register("is_active")} />
            <span className="text-sm text-cream">
              Visible on the site
              <span className="ml-1 text-cream-faint">— hidden technologies are excluded from the public slider.</span>
            </span>
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)} type="button" disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Saving…
                </>
              ) : editing?.id ? (
                "Save changes"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete technology?" description="This will also remove it from projects that use it.">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setToDelete(null)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={remove} disabled={busy}>
            <Trash2 className="h-4 w-4" />
            {busy ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
