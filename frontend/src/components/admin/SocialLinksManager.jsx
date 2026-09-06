"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Link2, Pencil, Plus, Trash2 } from "lucide-react";
import { adminDelete, adminGet, adminPost, adminPut } from "@/lib/admin";
import { socialLinkSchema } from "@/lib/validators";
import PageHeader from "@/components/admin/PageHeader";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input, Select, Label, FieldError } from "@/components/ui/Form";
import { EmptyState } from "@/components/ui/StateViews";
import { Skeleton } from "@/components/ui/Skeleton";
import BrandIcon from "@/components/ui/BrandIcon";
import { useToast } from "@/components/ui/Toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@/components/ui/Spinner";

const PLATFORMS = [
  { value: "github", label: "GitHub" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X (Twitter)" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "dribbble", label: "Dribbble" },
  { value: "youtube", label: "YouTube" },
  { value: "website", label: "Website" },
  { value: "email", label: "Email" },
];

export default function SocialLinksManager() {
  const { toast } = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(socialLinkSchema) });

  const watchPlatform = watch("platform");

  const load = useCallback(async () => {
    setError("");
    const res = await adminGet("/social-links");
    if (res.error) {
      setError(res.error);
      return;
    }
    setItems(res.data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (item) => {
    setEditing(item);
    reset({ platform: item.platform, url: item.url, icon: item.icon || "" });
  };

  const openNew = () => {
    setEditing({ _new: true });
    reset({ platform: "github", url: "", icon: "github" });
  };

  const onPlatformChange = (value) => {
    const current = watch("icon");
    const isDefault = PLATFORMS.some((p) => p.value === current);
    if (!current || isDefault) setValue("icon", value, { shouldValidate: true });
  };

  const submit = async (values) => {
    setBusy(true);
    const payload = {
      platform: values.platform,
      url: values.url.trim(),
      icon: values.icon?.trim() || values.platform,
    };
    const res = editing?.id
      ? await adminPut(`/social-links/${editing.id}`, payload)
      : await adminPost("/social-links", payload);
    setBusy(false);
    if (res.error) {
      toast({ title: "Save failed", description: res.error, variant: "error" });
      return;
    }
    toast({ title: editing?.id ? "Link updated" : "Link created", variant: "success" });
    setEditing(null);
    load();
  };

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    const res = await adminDelete(`/social-links/${toDelete.id}`);
    setBusy(false);
    if (res.error) {
      toast({ title: "Delete failed", description: res.error, variant: "error" });
    } else {
      toast({ title: "Link deleted" });
      setToDelete(null);
      load();
    }
  };

  return (
    <div>
      <PageHeader
        title="Social links"
        description="Links shown in the header, footer and contact sections."
        actions={
          <Button size="sm" onClick={openNew} arrow>
            <Plus className="h-4 w-4" />
            Add link
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
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="No social links yet"
          description="Add links to your profiles so visitors can reach you."
          action={
            <Button size="sm" onClick={openNew}>
              <Plus className="h-3.5 w-3.5" />
              Add link
            </Button>
          }
        />
      ) : (
        <ul className="overflow-hidden rounded-xl border border-line bg-bg-soft/60">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-bg-muted text-accent-strong">
                <BrandIcon name={item.icon || item.platform} className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium capitalize text-cream">{item.platform}</p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 truncate text-xs text-cream-faint transition-colors hover:text-accent-strong"
                >
                  <ExternalLink className="h-3 w-3" />
                  {item.url}
                </a>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button size="icon-sm" variant="ghost" onClick={() => openEdit(item)} aria-label="Edit link">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon-sm" variant="danger" onClick={() => setToDelete(item)} aria-label="Delete link">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit link" : "New link"}>
        <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
          <div>
            <Label htmlFor="platform" required>
              Platform
            </Label>
            <Select
              id="platform"
              {...register("platform")}
              onChange={(e) => {
                register("platform").onChange(e);
                onPlatformChange(e.target.value);
              }}
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
              {editing?.id && !PLATFORMS.some((p) => p.value === editing.platform) && (
                <option value={editing.platform}>{editing.platform}</option>
              )}
            </Select>
            <FieldError>{errors.platform?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="url" required>
              URL
            </Label>
            <Input id="url" type="url" placeholder="https://github.com/username" {...register("url")} />
            <FieldError>{errors.url?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              placeholder="github, linkedin, x, …"
              {...register("icon")}
              onChange={(e) => {
                register("icon").onChange(e);
                setValue("icon", e.target.value);
              }}
            />
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-cream-faint">
              {watchPlatform ? <BrandIcon name={watchPlatform} className="h-3.5 w-3.5" /> : null}
              <span>Defaults to the platform. Other values render a generic link.</span>
            </p>
            <FieldError>{errors.icon?.message}</FieldError>
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

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete link?" description="This will remove the link from the public site.">
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