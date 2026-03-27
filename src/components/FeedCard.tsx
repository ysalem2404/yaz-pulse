import type { FeedItem } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { ExternalLink, Bookmark, Clock } from "lucide-react";

interface FeedCardProps {
  item: FeedItem;
  onBookmark: (item: FeedItem) => void;
}

export function FeedCard({ item, onBookmark }: FeedCardProps) {
  const meta = CATEGORY_META[item.category];

  return (
    <div className="feed-card relative rounded-lg p-3.5 flex flex-col gap-2 group"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}>
      {/* Top color accent line */}
      <div className="absolute top-0 left-3 right-3 h-[2px] rounded-full opacity-50"
        style={{ backgroundColor: meta.color }} />

      {/* Source + time */}
      <div className="flex items-center justify-between text-xs pt-1"
        style={{ color: "var(--color-text-muted)" }}>
        <span className="font-medium truncate max-w-[60%]"
          style={{ color: "var(--color-text)" }}>{item.source}</span>
        <div className="flex items-center gap-1 shrink-0">
          <Clock className="w-3 h-3" />
          <span className="tabular-nums">{timeAgo(item.timestamp)}</span>
        </div>
      </div>

      {/* Title */}
      <a href={item.url} target="_blank" rel="noopener noreferrer"
        className="text-sm font-medium leading-snug line-clamp-2 transition-colors hover:underline decoration-1 underline-offset-2"
        style={{ color: "var(--color-text)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text)")}>
        {item.title}
      </a>

      {/* Snippet */}
      {item.snippet && (
        <p className="text-xs line-clamp-2 leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}>
          {item.snippet}
        </p>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-auto pt-1">
        {/* Author */}
        <span className="text-xs truncate max-w-[50%]"
          style={{ color: "var(--color-text-faint)" }}>
          {item.author ? `by ${item.author}` : ""}
        </span>

        {/* Actions - visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onBookmark(item)}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            title="Bookmark">
            <Bookmark className="w-3.5 h-3.5" />
          </button>
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            title="Open">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
