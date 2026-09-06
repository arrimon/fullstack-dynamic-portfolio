"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  FileText,
  FolderKanban,
  Inbox,
  MessageSquare,
  Plus,
  Star,
} from "lucide-react";
import { adminGet } from "@/lib/admin";
import { publicGet, mediaUrl } from "@/lib/api";
import PageHeader from "@/components/admin/PageHeader";
import { StatCard, StatCardSkeleton } from "@/components/admin/StatCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatFullDate } from "@/lib/utils";

function QuickAction({ href, label, icon: Icon }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-line bg-bg-soft px-5 py-4 transition-colors hover:border-accent/40"
    >
      <span className="flex items-center gap-3 text-sm font-medium text-cream">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-faint text-accent-strong">
          <Icon className="h-4 w-4" />
        </span>
        {label}
      </span>
      <ArrowUpRight className="h-4 w-4 text-cream-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-strong" />
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [projectsRes, messagesRes, unreadRes, resumeRes, testimonialsRes] = await Promise.all([
      adminGet("/projects", { page_size: 100 }),
      adminGet("/contact-messages", { page_size: 5 }),
      adminGet("/contact-messages", { is_read: false, page_size: 1 }),
      publicGet("/api/resume"),
      adminGet("/testimonials", { page_size: 1 }),
    ]);

    if (projectsRes.error || messagesRes.error) {
      setError("Could not load dashboard data.");
      return;
    }

    const projects = projectsRes.data?.items || [];
    setStats({
      projects: projects.length,
      published: projects.filter((p) => p.status === "published").length,
      drafts: projects.filter((p) => p.status === "draft").length,
      messages: messagesRes.data?.total || 0,
      unread: unreadRes.data?.total || 0,
      resume: resumeRes.data ? true : false,
      testimonials: testimonialsRes.data?.length || 0,
    });
    setRecentMessages(messagesRes.data?.items || []);
    setRecentProjects(projects.slice(0, 5));
    setError("");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="An overview of your portfolio content and activity."
        actions={
          <Button href="/admin/projects/new" size="sm" arrow>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        }
      />

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 px-4 py-3">
          <p className="text-sm text-danger">{error}</p>
          <Button size="xs" variant="secondary" onClick={load}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        {!stats ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Projects" value={stats.projects} sub={`${stats.published} published`} icon={FolderKanban} />
            <StatCard label="Drafts" value={stats.drafts} icon={FileText} />
            <StatCard label="Messages" value={stats.messages} sub={`${stats.unread} unread`} icon={Inbox} accent={stats.unread > 0} />
            <StatCard
              label="Resume"
              value={stats.resume ? "Active" : "None"}
              sub={stats.resume ? "Available publicly" : "Upload one"}
              icon={FileText}
              accent={stats.resume}
            />
            <StatCard label="Testimonials" value={stats.testimonials} icon={Star} />
          </>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-bg-soft">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold text-cream">Recent messages</h2>
            <Link
              href="/admin/messages"
              className="font-mono text-[11px] uppercase tracking-widest text-accent-strong transition-colors hover:text-cream"
            >
              View all
            </Link>
          </header>
          <div className="divide-y divide-line">
            {recentMessages.length === 0 ? (
              <p className="px-5 py-8 text-sm text-cream-faint">
                No messages yet.
              </p>
            ) : (
              recentMessages.map((msg) => (
                <Link
                  key={msg.id}
                  href="/admin/messages"
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-bg-muted"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        msg.is_read ? "bg-bg-muted" : "bg-accent-strong"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-cream">
                        {msg.name}
                      </p>
                      <p className="truncate text-xs text-cream-faint">
                        {msg.subject || "No subject"}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-cream-faint">
                    {formatFullDate(msg.created_at)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-bg-soft">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold text-cream">Recent projects</h2>
            <Link
              href="/admin/projects"
              className="font-mono text-[11px] uppercase tracking-widest text-accent-strong transition-colors hover:text-cream"
            >
              Manage
            </Link>
          </header>
          <div className="divide-y divide-line">
            {recentProjects.length === 0 ? (
              <p className="px-5 py-8 text-sm text-cream-faint">
                No projects yet. Create your first one.
              </p>
            ) : (
              recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-bg-muted"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {project.thumbnail_url ? (
                      <img
                        src={mediaUrl(project.thumbnail_url)}
                        alt=""
                        className="h-9 w-14 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <span className="flex h-9 w-14 shrink-0 items-center justify-center rounded-md bg-bg-muted font-mono text-[10px] text-cream-faint">
                        N/A
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-cream">
                        {project.title}
                      </p>
                      <p className="truncate font-mono text-[11px] text-cream-faint">
                        /{project.slug}
                      </p>
                    </div>
                  </div>
                  <Badge tone={project.status === "published" ? "success" : "neutral"}>
                    {project.status}
                  </Badge>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-line bg-bg-soft p-5">
        <h2 className="mb-4 text-sm font-semibold text-cream">Quick actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
          <QuickAction href="/admin/projects/new" label="Create a project" icon={Plus} />
          <QuickAction href="/admin/messages" label="Read messages" icon={MessageSquare} />
          <QuickAction href="/admin/resume" label="Update resume" icon={FileText} />
          <QuickAction href="/admin/testimonials" label="Manage testimonials" icon={Star} />
          <QuickAction href="/admin/settings" label="Edit site settings" icon={Inbox} />
        </div>
      </section>
    </div>
  );
}