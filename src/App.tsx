import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { FeedCard } from "@/components/FeedCard";
import { CategoryHeader } from "@/components/CategoryHeader";
import { FeedSkeleton } from "@/components/Skeleton";
import { fetchAllFeeds, fetchCategoryFeed, getCacheAge, setProgressCallback } from "@/lib/feeds";
import { CATEGORIES, CATEGORY_META, type Category, type FeedItem } from "@/lib/types";
import { RefreshCw, Zap, Bookmark as BookmarkIcon, Trash2, Search, X } from "lucide-react";

const CACHE_TTL = 2 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TTL,
      gcTime: CACHE_TTL * 2,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/** Case-insensitive search across title, source, snippet */
function filterItems(items: FeedItem[], query: string): FeedItem[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.source.toLowerCase().includes(q) ||
      (item.snippet && item.snippet.toLowerCase().includes(q))
  );
}

function Dashboard() {
  const [view, setView] = useState<string>("all");
  const [bookmarks, setBookmarks] = useState<FeedItem[]>(() => {
    try {
      const saved = localStorage.getItem("thalassa-pulse-bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try {
      localStorage.setItem("thalassa-pulse-bookmarks", JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks]);

  const addBookmark = useCallback((item: FeedItem) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.url === item.url)) return prev;
      return [item, ...prev];
    });
  }, []);

  const removeBookmark = useCallback((url: string) => {
    setBookmarks((prev) => prev.filter((b) => b.url !== url));
  }, []);

  return (
    <>
      <MobileNav active={view} onNavigate={setView} />

      <div className="hidden md:flex h-screen overflow-hidden">
        <Sidebar active={view} onNavigate={setView} bookmarkCount={bookmarks.length} />
        <main className="flex-1 overflow-hidden flex flex-col">
          {view === "bookmarks" ? (
            <BookmarksView bookmarks={bookmarks} onRemove={removeBookmark} />
          ) : view === "all" ? (
            <AllFeedsView onBookmark={addBookmark} />
          ) : (
            <CategoryView category={view as Category} onBookmark={addBookmark} />
          )}
        </main>
      </div>

      <div className="md:hidden">
        {view === "bookmarks" ? (
          <BookmarksView bookmarks={bookmarks} onRemove={removeBookmark} />
        ) : view === "all" ? (
          <AllFeedsView onBookmark={addBookmark} />
        ) : (
          <CategoryView category={view as Category} onBookmark={addBookmark} />
        )}
      </div>
    </>
  );
}

/* ── All Feeds View ── */
function AllFeedsView({ onBookmark }: { onBookmark: (item: FeedItem) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [streamData, setStreamData] = useState<Record<Category, FeedItem[]> | null>(null);

  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["all-feeds"],
    queryFn: () => fetchAllFeeds(false),
  });

  // Stream partial results while loading
  useEffect(() => {
    if (isLoading) {
      setProgressCallback((partial) => setStreamData({ ...partial }));
    } else {
      setProgressCallback(null);
      setStreamData(null);
    }
    return () => setProgressCallback(null);
  }, [isLoading]);

  const displayData = data || streamData;
  const isStreaming = isLoading && streamData !== null;

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["all-feeds"] });
  }, []);

  const filteredData = useMemo(() => {
    if (!displayData || !searchQuery.trim()) return displayData;
    const result: Record<string, FeedItem[]> = {};
    for (const cat of CATEGORIES) {
      result[cat] = filterItems(displayData[cat] || [], searchQuery);
    }
    return result as Record<Category, FeedItem[]>;
  }, [displayData, searchQuery]);

  const totalItems = filteredData
    ? Object.values(filteredData).reduce((sum, items) => sum + items.length, 0)
    : 0;

  const totalUnfiltered = displayData
    ? Object.values(displayData).reduce((sum, items) => sum + items.length, 0)
    : 0;

  const label = isLoading && !isStreaming
    ? "Loading feeds..."
    : isStreaming
      ? `Loading... ${totalUnfiltered} articles so far`
      : searchQuery.trim()
        ? `${totalItems} of ${totalUnfiltered} articles match`
        : `${totalItems} articles across ${CATEGORIES.length} topics`;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <TopBar
        label={label}
        onRefresh={handleRefresh}
        isRefreshing={isLoading && !isStreaming}
        dataUpdatedAt={dataUpdatedAt}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="p-4 sm:p-6 space-y-8">
        {isLoading && !isStreaming ? (
          CATEGORIES.map((cat) => (
            <div key={cat}><FeedSkeleton count={3} /></div>
          ))
        ) : (
          CATEGORIES.map((cat) => {
            const items = filteredData?.[cat] || [];
            if (searchQuery.trim() && items.length === 0) return null;
            return (
              <section key={cat}>
                <CategoryHeader category={cat} itemCount={items.length} />
                {items.length === 0 ? (
                  isStreaming
                    ? <FeedSkeleton count={3} />
                    : <EmptyState text={`No articles found for ${CATEGORY_META[cat].label}`} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {items.slice(0, 9).map((item) => (
                      <FeedCard key={item.id} item={item} onBookmark={onBookmark} />
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
      <Footer />
    </div>
  );
}

/* ── Category View ── */
function CategoryView({
  category,
  onBookmark,
}: {
  category: Category;
  onBookmark: (item: FeedItem) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, isRefetching, dataUpdatedAt } = useQuery({
    queryKey: ["feed", category],
    queryFn: () => fetchCategoryFeed(category, false),
  });

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["feed", category] });
  }, [category]);

  const meta = CATEGORY_META[category];
  const allItems = data || [];
  const items = useMemo(() => filterItems(allItems, searchQuery), [allItems, searchQuery]);

  const label = isLoading
    ? "Loading..."
    : searchQuery.trim()
      ? `${items.length} of ${allItems.length} articles match`
      : `${items.length} articles in ${meta.label}`;

  // Reset search when switching categories
  useEffect(() => {
    setSearchQuery("");
  }, [category]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <TopBar
        label={label}
        onRefresh={handleRefresh}
        isRefreshing={isLoading || isRefetching}
        dataUpdatedAt={dataUpdatedAt}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="p-4 sm:p-6">
        {isLoading ? (
          <FeedSkeleton count={9} />
        ) : (
          <>
            <CategoryHeader category={category} itemCount={items.length} />
            {items.length === 0 ? (
              <EmptyState text={searchQuery.trim() ? "No articles match your search." : "No articles found. Try refreshing."} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {items.map((item) => (
                  <FeedCard key={item.id} item={item} onBookmark={onBookmark} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

/* ── Bookmarks View ── */
function BookmarksView({
  bookmarks,
  onRemove,
}: {
  bookmarks: FeedItem[];
  onRemove: (url: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = useMemo(() => filterItems(bookmarks, searchQuery), [bookmarks, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <div className="sticky top-0 z-10 px-4 sm:px-6 py-3 backdrop-blur-md"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkIcon className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
              {searchQuery.trim()
                ? `${filtered.length} of ${bookmarks.length} saved`
                : `${bookmarks.length} saved ${bookmarks.length === 1 ? "item" : "items"}`}
            </span>
          </div>
          {bookmarks.length > 0 && (
            <SearchInput value={searchQuery} onChange={setSearchQuery} />
          )}
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <BookmarkIcon className="w-10 h-10 mx-auto mb-4 opacity-20"
              style={{ color: "var(--color-text-muted)" }} />
            <h3 className="text-base font-medium mb-1" style={{ color: "var(--color-text)" }}>
              No bookmarks yet
            </h3>
            <p className="text-sm max-w-xs mx-auto"
              style={{ color: "var(--color-text-muted)" }}>
              Save articles from your feed by hovering a card and clicking the bookmark icon.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState text="No bookmarks match your search." />
        ) : (
          <div className="space-y-2">
            {filtered.map((bm) => (
              <div key={bm.url}
                className="flex items-start gap-3 p-3 rounded-lg group transition-colors"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <div className="flex-1 min-w-0">
                  <a href={bm.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium line-clamp-2 transition-colors hover:underline"
                    style={{ color: "var(--color-text)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text)")}>
                    {bm.title}
                  </a>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        background: `${CATEGORY_META[bm.category]?.color || "#888"}18`,
                        color: CATEGORY_META[bm.category]?.color || "var(--color-text-muted)",
                      }}>
                      {CATEGORY_META[bm.category]?.label || bm.category}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-text-faint)" }}>{bm.source}</span>
                  </div>
                </div>
                <button onClick={() => onRemove(bm.url)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-7 h-7 flex items-center justify-center rounded-md"
                  style={{ color: "var(--color-text-faint)" }}
                  title="Remove bookmark">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

/* ── Shared Components ── */

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    if (expanded && value) {
      onChange("");
    }
    setExpanded((prev) => !prev);
  }, [expanded, value, onChange]);

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  return (
    <div className="flex items-center gap-1">
      {expanded && (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search articles..."
            className="text-sm py-1 pl-2 pr-7 rounded-md outline-none transition-all"
            style={{
              width: "180px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onChange("");
                setExpanded(false);
              }
            }}
          />
          {value && (
            <button
              onClick={() => onChange("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-faint)" }}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
      <button
        onClick={handleToggle}
        className="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
        style={{ color: expanded ? "var(--color-accent)" : "var(--color-text-muted)" }}
        title="Search articles">
        <Search className="w-4 h-4" />
      </button>
    </div>
  );
}

function formatAge(ms: number): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  return `${min}m ago`;
}

function TopBar({
  label,
  onRefresh,
  isRefreshing,
  dataUpdatedAt,
  searchQuery,
  onSearchChange,
}: {
  label: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  dataUpdatedAt?: number;
  searchQuery: string;
  onSearchChange: (v: string) => void;
}) {
  const [ageText, setAgeText] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    function tick() {
      const age = getCacheAge();
      if (age !== null) {
        setAgeText(formatAge(age));
      } else if (dataUpdatedAt && dataUpdatedAt > 0) {
        setAgeText(formatAge(Date.now() - dataUpdatedAt));
      } else {
        setAgeText("");
      }
    }
    tick();
    intervalRef.current = setInterval(tick, 5000);
    return () => clearInterval(intervalRef.current);
  }, [dataUpdatedAt]);

  return (
    <div className="sticky top-0 z-10 px-4 sm:px-6 py-3 flex items-center justify-between backdrop-blur-md"
      style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <Zap className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
          <span className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{label}</span>
        </div>
        {ageText && (
          <span className="text-xs hidden sm:inline shrink-0" style={{ color: "var(--color-text-faint)" }}>
            {ageText}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <SearchInput value={searchQuery} onChange={onSearchChange} />
        <button onClick={onRefresh} disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors"
          style={{
            color: "var(--color-text-muted)",
            background: isRefreshing ? "var(--color-surface-2)" : "transparent",
          }}>
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12 text-sm" style={{ color: "var(--color-text-muted)" }}>
      {text}
    </div>
  );
}

function Footer() {
  return (
    <footer className="px-6 py-4 text-center"
      style={{ borderTop: "1px solid var(--color-border)" }}>
      <a href="https://www.perplexity.ai/computer" target="_blank" rel="noopener noreferrer"
        className="text-xs transition-colors"
        style={{ color: "var(--color-text-faint)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-faint)")}>
        Created with Perplexity Computer
      </a>
    </footer>
  );
}

/* ── Root ── */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
