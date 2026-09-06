"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Pencil, Plus, Star, Trash2, Upload } from "lucide-react";
import axios from "axios";
import { adminDelete, adminGet, adminPost, adminPut } from "@/lib/admin";
import { mediaUrl, getInitials } from "@/lib/utils";
import { testimonialSchema } from "@/lib/validators";
import PageHeader from "@/components/admin/PageHeader";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { Input, Textarea, Label, FieldError } from "@/components/ui/Form";
import { EmptyState } from "@/components/ui/StateViews";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@/components/ui/Spinner";
import { DragHandle, SortableList } from "@/components/ui/SortableList";

export default function TestimonialsManager() {
  const { toast } = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(testimonialSchema) });

  const load = useCallback(async () => {
    const res = await adminGet("/testimonials");
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

  const openEdit = (item) => {
    setEditing(item || { _new: true });
    reset({
      client_name: item?.client_name || "",
      client_role: item?.client_role || "",
      company_name: item?.company_name || "",
      client_image: item?.client_image || "",
      review_text: item?.review_text || "",
      rating: item?.rating ?? 5,
      is_active: item?.is_active ?? true,
    });
  };

  const openNew = () => openEdit(null);

  const submit = async (values) => {
    setBusy(true);
    const payload = {
      client_name: values.client_name,
      client_role: values.client_role || null,
      company_name: values.company_name || null,
      client_image: values.client_image || null,
      review_text: values.review_text,
      rating: Number(values.rating) || 5,
      is_active: values.is_active,
    };
    const res = editing?.id
      ? await adminPut(`/testimonials/${editing.id}`, payload)
      : await adminPost("/testimonials", payload);
    setBusy(false);
    if (res.error) {
      toast({ title: "Save failed", description: res.error, variant: "error" });
      return;
    }
    toast({ title: editing?.id ? "Testimonial updated" : "Testimonial created", variant: "success" });
    setEditing(null);
    load();
  };

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    const res = await adminDelete(`/testimonials/${toDelete.id}`);
    setBusy(false);
    if (res.error) {
      toast({ title: "Delete failed", description: res.error, variant: "error" });
    } else {
      toast({ title: "Testimonial deleted" });
      setToDelete(null);
      load();
    }
  };

  const toggleActive = async (item) => {
    const res = await adminPut(`/testimonials/${item.id}`, { is_active: !item.is_active });
    if (res.error) {
      toast({ title: "Update failed", description: res.error, variant: "error" });
    } else {
      load();
    }
  };

  const uploadImage = async (item, file) => {
    if (!file || !item?.id) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      await axios.post(`/api/admin/testimonials/${item.id}/image`, formData);
      toast({ title: "Image uploaded", variant: "success" });
      load();
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast({ title: "Upload failed", description: typeof detail === "string" ? detail : "Try another image.", variant: "error" });
    } finally {
      setUploading(false);
    }
  };

  const onReorder = async (ids) => {
    const res = await adminPut(
      "/testimonials/reorder",
      { items: ids.map((id, idx) => ({ id, display_order: idx + 1 })) }
    );
    if (res.error) {
      toast({ title: "Couldn't save order", description: "Your previous order has been restored.", variant: "error" });
      throw new Error(res.error);
    }
    toast({ title: "Testimonial order saved", variant: "success" });
  };

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Client reviews shown in the homepage slider."
        actions={
          <Button size="sm" onClick={openNew} arrow>
            <Plus className="h-4 w-4" />
            Add testimonial
          </Button>
        }
      />

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
          <p className="text-sm text-danger">{error}</p>
          <Button size="xs" variant="secondary" onClick={load}>
            Retry
          </Button>
        </div>
      )}

      {!items ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No testimonials yet"
          description="Add a client review to showcase on the homepage."
          action={
            <Button size="sm" onClick={openNew}>
              <Plus className="h-3.5 w-3.5" />
              Add testimonial
            </Button>
          }
        />
      ) : (
        <SortableList
          items={items}
          onReorder={onReorder}
          className="space-y-3"
          renderRow={(item, sortable) => {
            const src = mediaUrl(item.client_image);
            return (
              <div
                ref={sortable?.setNodeRef}
                style={sortable?.style}
                className={`group flex items-start gap-4 rounded-xl border border-line bg-bg-soft p-4 ${sortable?.isDragging ? "opacity-80 ring-1 ring-accent" : ""}`}
              >
                {sortable ? (
                  <DragHandle attributes={sortable.attributes} listeners={sortable.listeners} className="mt-1" />
                ) : (
                  <span className="mt-1 w-8 shrink-0" />
                )}
                {src ? (
                  <img src={src} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-line-strong" />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neon-gradient font-mono text-sm font-semibold text-white">
                    {getInitials(item.client_name)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-cream">{item.client_name}</p>
                    <Badge tone={item.is_active ? "success" : "neutral"}>
                      {item.is_active ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                  {(item.client_role || item.company_name) && (
                    <p className="truncate text-xs text-cream-faint">
                      {[item.client_role, item.company_name].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="mt-1.5 line-clamp-2 text-sm text-cream-muted">{item.review_text}</p>
                  <div className="mt-2 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < item.rating ? "fill-accent-strong text-accent-strong" : "text-cream-faint/40"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => toggleActive(item)} aria-label={item.is_active ? "Hide testimonial" : "Show testimonial"}>
                      <Star className={`h-3.5 w-3.5 ${item.is_active ? "fill-accent-strong text-accent-strong" : "text-cream-faint"}`} />
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(item)} aria-label="Edit testimonial">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon-sm" variant="danger" onClick={() => setToDelete(item)} aria-label="Delete testimonial">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <label className="flex cursor-pointer items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-cream-faint transition-colors hover:text-accent-strong">
                    <Upload className="h-3 w-3" />
                    {uploading ? "Uploading…" : "Image"}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => uploadImage(item, e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>
            );
          }}
        />
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit testimonial" : "New testimonial"}>
        <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
          <div>
            <Label htmlFor="client_name" required>Client name</Label>
            <Input id="client_name" placeholder="Jane Doe" {...register("client_name")} />
            <FieldError>{errors.client_name?.message}</FieldError>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="client_role">Role</Label>
              <Input id="client_role" placeholder="Product Manager" {...register("client_role")} />
            </div>
            <div>
              <Label htmlFor="company_name">Company</Label>
              <Input id="company_name" placeholder="Acme Inc." {...register("company_name")} />
            </div>
          </div>
          <div>
            <Label htmlFor="review_text" required>Review</Label>
            <Textarea id="review_text" rows={4} placeholder="What was it like to work together?" {...register("review_text")} />
            <FieldError>{errors.review_text?.message}</FieldError>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <SelectRating value={watch("rating")} onChange={(v) => setValue("rating", v)} />
            </div>
            <div>
              <Label>Visibility</Label>
              <label className="flex h-[42px] cursor-pointer items-center gap-3 rounded-lg border border-line px-3">
                <input type="checkbox" {...register("is_active")} className="accent-[var(--color-accent-strong)]" />
                <span className="text-sm text-cream">Show on site</span>
              </label>
            </div>
          </div>
          <div>
            <Label htmlFor="client_image">Image URL</Label>
            <Input id="client_image" placeholder="https://… or /uploads/…" {...register("client_image")} />
            <FieldError>{errors.client_image?.message}</FieldError>
            {editing?.id && (
              <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-cream-faint transition-colors hover:text-accent-strong">
                <Upload className="h-3 w-3" />
                Upload image instead
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => uploadImage(editing, e.target.files?.[0])}
                />
              </label>
            )}
          </div>
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

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete testimonial?" description={`"${toDelete?.client_name || ""}" will be permanently removed.`}>
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

function SelectRating({ value, onChange }) {
  const current = Number(value) || 0;
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={current === i + 1}
          aria-label={`${i + 1} stars`}
          onClick={() => onChange(i + 1)}
          className="transition-transform hover:scale-110"
        >
          <Star className={`h-5 w-5 ${i < current ? "fill-accent-strong text-accent-strong" : "text-cream-faint/50"}`} />
        </button>
      ))}
    </div>
  );
}
