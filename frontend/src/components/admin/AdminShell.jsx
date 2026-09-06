"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  Briefcase,
  ExternalLink,
  FileText,
  FolderKanban,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Share2,
  Star,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/certifications", label: "Certifications", icon: Award },
  { href: "/admin/technologies", label: "Technologies", icon: Layers },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/resume", label: "Resume", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/social-links", label: "Social Links", icon: Share2 },
  { href: "/admin/account", label: "Account", icon: KeyRound },
];

function SidebarNav({ onNavigate }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Admin navigation">
      {NAV.map((item) => {
        const active = item.end ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-accent-faint text-cream"
                : "text-cream-faint hover:bg-accent-faint/60 hover:text-cream"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                active ? "text-accent-strong" : "text-cream-faint group-hover:text-accent-strong"
              )}
            />
            {item.label}
            {active && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-strong" aria-hidden="true" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({ children }) {
  const { status, logout } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-6 w-6" />
          <p className="font-mono text-xs uppercase tracking-widest text-cream-faint">
            Verifying session…
          </p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-dvh bg-bg">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-line px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-gradient font-mono text-sm font-semibold text-white shadow-neon-sm">
            A
          </span>
          <div>
            <p className="text-sm font-semibold text-cream">Admin Panel</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-cream-faint">
              Portfolio CMS
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <SidebarNav />
        </div>
        <div className="border-t border-line p-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-cream-faint transition-colors hover:bg-accent-faint/60 hover:text-cream"
          >
            <ExternalLink className="h-4 w-4" />
            View site
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-cream-faint transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-cream"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-cream">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-cream-muted"
            aria-label="View site"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-cream-muted"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={closeDrawer}
            aria-label="Close navigation"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-surface">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <span className="text-sm font-semibold text-cream">Admin Panel</span>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-cream-muted"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SidebarNav onNavigate={closeDrawer} />
            </div>
          </aside>
        </div>
      )}

      <main className="min-h-dvh px-4 py-8 sm:px-6 lg:ml-64 lg:px-8 lg:py-10 xl:px-10">
        <div className="mx-auto w-full max-w-[1600px]">
          <a
            id="main-content"
            tabIndex={-1}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4"
          >
            Main content
          </a>
          {children}
        </div>
      </main>
    </div>
  );
}