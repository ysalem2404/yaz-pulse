import { useState, useCallback, useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { FeedCard } from "@/components/FeedCard";
import { CategoryHeader } from "@/components/CategoryHeader";
import { FeedSkeleton } from "@/components/Skeleton";
import { fetchAllFeeds, fetchCategoryFeed, getCacheAge } from "@/lib/feeds";
import { CATEGORIES, CATEGORY_META, type Category, type FeedItem } from "@/lib/types";
import { RefreshCw, Zap, Bookmark as BookmarkIcon, Trash2 } from "lucide-react";

const CACHE_TTL = 2 * 60 * 1000; // must match feeds.ts

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

function Dashboard() {
  const [view, setView] = useState<string>("all");
  const [bookmarks, setBookmarks] = useState<FeedItem[]>(() => {
    try {
      const saved = localStorage.getItem("yaz-pulse-bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try {
      localStorage.setItem("yaz-pulse-bookmarks", JSON.stringify(bookmarks));
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
      {/* Mobile nav */}
      <MobileNav active={view} onNavigate={setView} />

      {/* Desktop layout */}
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

      {/* Mobile layout */}
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
  const { data, isLoading, refetch, isRefetching, dataUpdatedAt } = useQuery({
    queryKey: ["all-feeds"],
    queryFn: () => fetchAllFeeds(false),
  });

  // Force-refresh: invalidate React Query cache so it calls fetchAllFeeds again
  // The feeds layer handles delta logic internally
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["all-feeds"] });
  }, []);

  const totalItems = data
    ? Object.values(data).reduce((sum, items) => sum + items.length, 0)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <TopBar
        label={isLoading ? "Loading feeds..." : `${totalItems} articles across ${CATEGORIES.length} topics`}
        onRefresh={handleRefresh}
        isRefreshing={isLoading || isRefetching}
        dataUpdatedAt={dataUpdatedAt}
      />
      <div className="p-4 sm:p-6 space-y-8">
        {isLoading ? (
          CATEGORIES.map((cat) => (
            <div key={cat}><FeedSkeleton count={3} /></div>
          ))
        ) : (
          CATEGORIES.map((cat) => {
            const items = data?.[cat] || [];
            return (
              <section key={cat}>
                <CategoryHeader category={cat} itemCount={items.length} />
                {items.length === 0 ? (
                  <EmptyState text={`No articles found for ${CATEGORY_META[cat].label}`} />
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
  const { data, isLoading, isRefetching, dataUpdatedAt } = useQuery({
    queryKey: ["feed", category],
    queryFn: () => fetchCategoryFeed(category, false),
  });

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["feed", category] });
  }, [category]);

  const meta = CATEGORY_META[category];
  const items = data || [];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <TopBar
        label={isLoading ? "Loading..." : `${items.length} articles in ${meta.label}`}
        onRefresh={handleRefresh}
        isRefreshing={isLoading || isRefetching}
        dataUpdatedAt={dataUpdatedAt}
      />
      <div className="p-4 sm:p-6">
        {isLoading ? (
          <FeedSkeleton count={9} />
        ) : (
          <>
            <CategoryHeader category={category} itemCount={items.length} />
            {items.length === 0 ? (
              <EmptyState text="No articles found. Try refreshing." />
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
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <div className="sticky top-0 z-10 px-4 sm:px-6 py-3 backdrop-blur-md"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex items-center gap-2">
          <BookmarkIcon className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {bookmarks.length} saved {bookmarks.length === 1 ? "item" : "items"}
          </span>
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
        ) : (
          <div className="space-y-2">
            {bookmarks.map((bm) => (
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
}: {
  label: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  dataUpdatedAt?: number;
}) {
  // Live-updating cache age display
  const [ageText, setAgeText] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

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
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{label}</span>
        </div>
        {ageText && (
          <span className="text-xs hidden sm:inline" style={{ color: "var(--color-text-faint)" }}>
            {ageText}
          </span>
        )}
      </div>
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
