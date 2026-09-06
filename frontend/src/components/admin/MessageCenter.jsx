"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { Inbox, Mail, MailOpen, Trash2 } from "lucide-react";
import { adminDelete, adminGet, adminPatch } from "@/lib/admin";
import { formatFullDate } from "@/lib/utils";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/StateViews";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function MessageCenter() {
  const { toast } = useToast();
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | unread | read
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await adminGet("/contact-messages", { page_size: 100 });
    if (res.error) {
      setError(res.error);
      return;
    }
    setMessages(res.data?.items || []);
    setError("");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleRead = async (msg, value) => {
    setBusy(true);
    const res = await adminPatch(`/contact-messages/${msg.id}`, { is_read: value });
    setBusy(false);
    if (res.error) {
      toast({ title: "Update failed", description: res.error, variant: "error" });
      return;
    }
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_read: value } : m)));
    if (selected?.id === msg.id) setSelected((s) => (s ? { ...s, is_read: value } : s));
  };

  const removeMessage = async (msg) => {
    if (!window.confirm("Delete this message permanently?")) return;
    setBusy(true);
    const res = await adminDelete(`/contact-messages/${msg.id}`);
    setBusy(false);
    if (res.error) {
      toast({ title: "Delete failed", description: res.error, variant: "error" });
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    if (selected?.id === msg.id) setSelected(null);
    toast({ title: "Message deleted", variant: "success" });
  };

  const filtered = (messages || []).filter((m) => {
    if (filter === "unread") return !m.is_read;
    if (filter === "read") return m.is_read;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Contact form submissions from your website."
      />

      <div className="mb-5 flex items-center gap-2">
        {[
          { key: "all", label: "All" },
          { key: "unread", label: "Unread" },
          { key: "read", label: "Read" },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors",
              filter === f.key
                ? "border-accent bg-accent-faint text-cream"
                : "border-line text-cream-faint hover:text-cream"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
          <p className="text-sm text-danger">{error}</p>
          <Button size="xs" variant="secondary" onClick={load}>
            Retry
          </Button>
        </div>
      )}

      {!messages ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No messages here"
          description={
            filter === "unread"
              ? "You're all caught up."
              : "Contact form submissions will appear here."
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <ul className="overflow-hidden rounded-xl border border-line bg-bg-soft/60">
            {filtered.map((msg) => (
              <li key={msg.id}>
                <button
                  type="button"
                  onClick={() => setSelected(msg)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-line px-5 py-4 text-left transition-colors hover:bg-bg-soft",
                    selected?.id === msg.id && "bg-bg-soft",
                    !msg.is_read && "bg-accent-faint/40"
                  )}
                >
                  {msg.is_read ? (
                    <MailOpen className="mt-0.5 h-4 w-4 shrink-0 text-cream-faint" />
                  ) : (
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-strong" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("truncate text-sm", msg.is_read ? "font-normal text-cream-muted" : "font-semibold text-cream")}>
                        {msg.name}
                      </p>
                      <span className="shrink-0 font-mono text-[11px] text-cream-faint">
                        {formatFullDate(msg.created_at)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-cream-faint">
                      {msg.subject || "No subject"}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-line bg-bg-soft p-6">
            {selected ? (
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-cream">
                      {selected.name}
                    </h2>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-sm text-accent-strong hover:underline"
                    >
                      {selected.email}
                    </a>
                  </div>
                  {!selected.is_read && <Badge tone="accent">Unread</Badge>}
                </div>
                <p className="mt-2 font-mono text-xs text-cream-faint">
                  {formatFullDate(selected.created_at)}
                </p>
                <div className="mt-6 rounded-lg border border-line bg-bg-muted p-5">
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-cream-faint">
                    Subject
                  </p>
                  <p className="text-sm font-medium text-cream">{selected.subject || "No subject"}</p>
                </div>
                <div className="mt-4 whitespace-pre-line rounded-lg border border-line bg-bg-muted p-5 leading-relaxed text-cream-muted">
                  {selected.message}
                </div>
                <div className="mt-6 flex items-center gap-2">
                  {selected.is_read ? (
                    <Button size="sm" variant="secondary" onClick={() => toggleRead(selected, false)} disabled={busy}>
                      <Mail className="h-4 w-4" />
                      Mark as unread
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => toggleRead(selected, true)} disabled={busy}>
                      <MailOpen className="h-4 w-4" />
                      Mark as read
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" href={`mailto:${selected.email}`}>
                    Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeMessage(selected)}
                    disabled={busy}
                    className="ml-auto text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-40 items-center justify-center">
                <p className="text-sm text-cream-faint">
                  Select a message to read it.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}