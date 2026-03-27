export function FeedSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg skeleton" />
        <div>
          <div className="h-4 w-32 rounded skeleton mb-1" />
          <div className="h-3 w-20 rounded skeleton" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="rounded-lg p-3.5 space-y-2"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded skeleton" />
              <div className="h-3 w-12 rounded skeleton" />
            </div>
            <div className="h-4 w-full rounded skeleton" />
            <div className="h-4 w-3/4 rounded skeleton" />
            <div className="h-3 w-full rounded skeleton" />
            <div className="flex items-center gap-3 pt-1">
              <div className="h-3 w-10 rounded skeleton" />
              <div className="h-3 w-10 rounded skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
