import { cn } from "@/lib/utils";
import { CATEGORIES, CATEGORY_META, type Category } from "@/lib/types";
import {
  LayoutDashboard,
  TrendingUp,
  Brain,
  Shield,
  Globe,
  Bookmark,
  Zap,
  KeyRound,
  Workflow,
} from "lucide-react";

const CATEGORY_ICONS: Record<Category, typeof TrendingUp> = {
  finance: TrendingUp,
  "ai-automation": Brain,
  cybersecurity: Shield,
  iam: KeyRound,
  "intelligent-automation": Workflow,
  "news-geopolitics": Globe,
};

interface SidebarProps {
  active: string;
  onNavigate: (path: string) => void;
  bookmarkCount: number;
}

export function Sidebar({ active, onNavigate, bookmarkCount }: SidebarProps) {
  return (
    <aside className="w-52 shrink-0 border-r h-screen flex flex-col overflow-hidden"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-2.5"
        style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(45,212,191,0.12)" }}>
          <Zap className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-none tracking-tight"
            style={{ color: "var(--color-text)" }}>Yaz Pulse</h1>
          <p className="text-[10px] leading-none mt-0.5"
            style={{ color: "var(--color-text-faint)" }}>Intelligence Feed</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-hide">
        <p className="text-[10px] font-medium uppercase tracking-wider px-2 mb-2"
          style={{ color: "var(--color-text-faint)" }}>Topics</p>

        {/* All Feeds */}
        <button onClick={() => onNavigate("all")}
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm w-full text-left transition-colors",
            active === "all"
              ? "font-medium"
              : "hover:opacity-80"
          )}
          style={{
            color: active === "all" ? "var(--color-accent)" : "var(--color-text-muted)",
            background: active === "all" ? "rgba(45,212,191,0.08)" : "transparent",
          }}>
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>All Feeds</span>
        </button>

        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const Icon = CATEGORY_ICONS[cat];
          const isActive = active === cat;
          return (
            <button key={cat} onClick={() => onNavigate(cat)}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm w-full text-left transition-colors",
                isActive ? "font-medium" : "hover:opacity-80"
              )}
              style={{
                color: isActive ? meta.color : "var(--color-text-muted)",
                background: isActive ? `${meta.color}12` : "transparent",
              }}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{meta.label}</span>
            </button>
          );
        })}

        <div className="h-px mx-2 my-3" style={{ background: "var(--color-border)" }} />

        <p className="text-[10px] font-medium uppercase tracking-wider px-2 mb-2"
          style={{ color: "var(--color-text-faint)" }}>Library</p>

        <button onClick={() => onNavigate("bookmarks")}
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm w-full text-left transition-colors",
            active === "bookmarks" ? "font-medium" : "hover:opacity-80"
          )}
          style={{
            color: active === "bookmarks" ? "var(--color-accent)" : "var(--color-text-muted)",
            background: active === "bookmarks" ? "rgba(45,212,191,0.08)" : "transparent",
          }}>
          <Bookmark className="w-4 h-4 shrink-0" />
          <span>Bookmarks</span>
          {bookmarkCount > 0 && (
            <span className="ml-auto text-[10px] tabular-nums px-1.5 py-0.5 rounded-full"
              style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)" }}>
              {bookmarkCount}
            </span>
          )}
        </button>
      </nav>

      {/* Bottom */}
      <div className="px-4 py-3" style={{ borderTop: "1px solid var(--color-border)" }}>
        <p className="text-[10px]" style={{ color: "var(--color-text-faint)" }}>
          Reddit + GitHub + AI Blogs
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />
          <span className="text-[10px]" style={{ color: "var(--color-text-faint)" }}>Live</span>
        </div>
      </div>
    </aside>
  );
}
