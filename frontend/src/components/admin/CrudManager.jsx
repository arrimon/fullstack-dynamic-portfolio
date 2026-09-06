"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminDelete, adminPost, adminPut, adminGet } from "@/lib/admin";
import PageHeader from "@/components/admin/PageHeader";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input, Textarea, Select, Checkbox, Label, FieldError } from "@/components/ui/Form";
import { EmptyState, ErrorState } from "@/components/ui/StateViews";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

function FieldControl({ field, register, errors }) {
  const { label, required } = field;
  const shared = {
    id: field.name,
    "aria-invalid": !!errors[field.name],
    ...register(field.name, { valueAsNumber: field.type === "number" }),
  };

  switch (field.type) {
    case "textarea":
      return (
        <Textarea id={field.name} rows={field.rows || 4} placeholder={field.placeholder} {...shared} />
      );
    case "select":
      return (
        <Select id={field.name} {...shared}>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      );
    case "checkbox":
      return (
        <label className="flex cursor-pointer items-center gap-3">
          <Checkbox {...shared} />
          <span className="text-sm text-cream">{label}</span>
        </label>
      );
    default:
      return (
        <Input
          id={field.name}
          type={field.type || "text"}
          placeholder={field.placeholder}
          {...shared}
        />
      );
  }
}

function CrudForm({ fields, schema, initial, onSubmit, onCancel, busy }) {
  const defaults = {};
  fields.forEach((f) => {
    if (f.type === "checkbox") defaults[f.name] = initial?.[f.name] ?? false;
    else if (f.type === "number") defaults[f.name] = initial?.[f.name] ?? 0;
    else defaults[f.name] = initial?.[f.name] ?? "";
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const isCurrent = watch("is_current");

  const submit = (values) => {
    const payload = {};
    fields.forEach((f) => {
      let value = values[f.name];
      if (f.type === "number") value = Number(value) || 0;
      if (typeof value === "string") value = value.trim();
      if (f.optional && value === "") value = null;
      payload[f.name] = value;
    });
    if (fields.some((f) => f.name === "is_current")) {
      if (payload.is_current) payload.end_date = null;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="grid grid-cols-1 gap-5 sm:grid-cols-2" noValidate>
      {fields.map((field) => {
        const hidden = field.conditional === "is_current" && isCurrent;
        const fullWidth =
          hidden || field.type === "textarea" || field.type === "checkbox";
        return (
          <div
            key={field.name}
            className={cn(hidden && "hidden", fullWidth && "sm:col-span-2")}
          >
            {field.type === "checkbox" ? (
              <>
                <FieldControl field={field} register={register} errors={errors} />
                <FieldError>{errors[field.name]?.message}</FieldError>
              </>
            ) : (
              <>
                <Label htmlFor={field.name} required={field.required}>
                  {field.label}
                </Label>
                <FieldControl field={field} register={register} errors={errors} />
                <FieldError>{errors[field.name]?.message}</FieldError>
              </>
            )}
          </div>
        );
      })}
      <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
        <Button variant="ghost" size="sm" onClick={onCancel} type="button" disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? (
            <>
              <Spinner className="h-4 w-4" />
              Saving…
            </>
          ) : (
            <>{initial ? "Save changes" : "Create"}</>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function CrudManager({
  title,
  description,
  path,
  fields,
  schema,
  columns,
  newLabel = "Add new",
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null | item | { _new: true }
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    const res = await adminGet(path);
    if (res.error) {
      setError(res.error);
      return;
    }
    setItems(res.data || []);
    setError("");
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (payload) => {
    setBusy(true);
    const isEdit = editing?.id;
    const res = isEdit
      ? await adminPut(`${path}/${editing.id}`, payload)
      : await adminPost(path, payload);
    setBusy(false);
    if (res.error) {
      if (res.error === "UNAUTHORIZED") {
        setEditing(null);
        router.replace("/admin/login");
        return;
      }
      toast({ title: "Save failed", description: res.error, variant: "error" });
      return;
    }
    toast({ title: isEdit ? "Updated" : "Created", variant: "success" });
    setEditing(null);
    load();
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    const res = await adminDelete(`${path}/${toDelete.id}`);
    setBusy(false);
    if (res.error) {
      if (res.error === "UNAUTHORIZED") {
        setToDelete(null);
        router.replace("/admin/login");
        return;
      }
      toast({ title: "Delete failed", description: res.error, variant: "error" });
    } else {
      toast({ title: "Deleted" });
      setToDelete(null);
      load();
    }
  };

  const sessionExpired = error === "UNAUTHORIZED";

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button size="sm" onClick={() => setEditing({ _new: true })} arrow>
            <Plus className="h-4 w-4" />
            {newLabel}
          </Button>
        }
      />

      {error && (
        <ErrorState
          title={sessionExpired ? "Your session has expired" : "Couldn't load data"}
          description={
            sessionExpired
              ? "Please sign in again to continue."
              : error
          }
          onRetry={sessionExpired ? () => router.replace("/admin/login") : load}
        />
      )}

      {!items ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={`No ${title.toLowerCase()} yet`}
          description={`Add your first item to get started.`}
          action={
            <Button size="sm" onClick={() => setEditing({ _new: true })}>
              <Plus className="h-3.5 w-3.5" />
              {newLabel}
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line">
          <ul className="divide-y divide-line bg-bg-soft/60">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    {columns.map((col, i) => (
                      <span
                        key={col.key}
                        className={
                          i === 0
                            ? "text-sm font-medium text-cream"
                            : "text-sm text-cream-muted"
                        }
                      >
                        {col.render ? col.render(item) : item[col.key]}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 sm:justify-end">
                  <Button size="icon-sm" variant="ghost" onClick={() => setEditing(item)} aria-label={`Edit ${item.title || item.name || item.institution || ""}`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon-sm" variant="danger" onClick={() => setToDelete(item)} aria-label="Delete item">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Edit ${title.toLowerCase()}` : `New ${title.toLowerCase()}`}
        size="lg"
      >
        <CrudForm
          fields={fields}
          schema={schema}
          initial={editing?.id ? editing : null}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
          busy={busy}
        />
      </Modal>

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete item?"
        description="This action cannot be undone."
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setToDelete(null)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={busy}>
            <Trash2 className="h-4 w-4" />
            {busy ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}