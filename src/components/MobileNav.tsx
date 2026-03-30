import { useState } from "react";
import { CATEGORIES, CATEGORY_META, type Category } from "@/lib/types";
import {
  LayoutDashboard, TrendingUp, Brain, Shield, Globe, Bookmark, Zap, Menu, X, KeyRound, Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof TrendingUp> = {
  finance: TrendingUp,
  "ai-automation": Brain,
  cybersecurity: Shield,
  iam: KeyRound,
  "intelligent-automation": Workflow,
  "news-geopolitics": Globe,
};

interface MobileNavProps {
  active: string;
  onNavigate: (path: string) => void;
}

export function MobileNav({ active, onNavigate }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const go = (path: string) => {
    onNavigate(path);
    setOpen(false);
  };

  return (
    <>
      <div className="md:hidden sticky top-0 z-50 px-4 py-3 flex items-center justify-between backdrop-blur-md"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
          <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>Yaz Pulse</span>
        </div>
        <button onClick={() => setOpen(!open)}
          className="w-8 h-8 flex items-center justify-center rounded-md"
          style={{ color: "var(--color-text)" }}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 top-[49px] z-40 backdrop-blur-md"
          style={{ background: "var(--color-bg)" }}>
          <nav className="p-4 space-y-1">
            <button onClick={() => go("all")}
              className={cn("flex items-center gap-3 px-3 py-3 rounded-lg text-base w-full text-left")}
              style={{
                color: active === "all" ? "var(--color-accent)" : "var(--color-text-muted)",
                background: active === "all" ? "rgba(45,212,191,0.08)" : "transparent",
              }}>
              <LayoutDashboard className="w-5 h-5" />
              <span>All Feeds</span>
            </button>

            {CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              const Icon = ICONS[cat];
              return (
                <button key={cat} onClick={() => go(cat)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-base w-full text-left"
                  style={{
                    color: active === cat ? meta.color : "var(--color-text-muted)",
                    background: active === cat ? `${meta.color}12` : "transparent",
                  }}>
                  <Icon className="w-5 h-5" />
                  <span>{meta.label}</span>
                </button>
              );
            })}

            <div className="h-px my-2" style={{ background: "var(--color-border)" }} />

            <button onClick={() => go("bookmarks")}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-base w-full text-left"
              style={{
                color: active === "bookmarks" ? "var(--color-accent)" : "var(--color-text-muted)",
              }}>
              <Bookmark className="w-5 h-5" />
              <span>Bookmarks</span>
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
