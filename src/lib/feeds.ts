import type { FeedItem, Category } from "./types";

// ── Feed Sources ──
const FEED_SOURCES: Record<Category, { url: string; name: string }[]> = {
  finance: [
    { url: "https://www.reddit.com/r/investing/.rss", name: "r/investing" },
    { url: "https://www.reddit.com/r/stocks/.rss", name: "r/stocks" },
    { url: "https://www.reddit.com/r/wallstreetbets/.rss", name: "r/wallstreetbets" },
    { url: "https://www.reddit.com/r/CryptoCurrency/.rss", name: "r/CryptoCurrency" },
    { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US", name: "Yahoo Finance" },
    { url: "https://feeds.feedburner.com/CoinDesk", name: "CoinDesk" },
  ],
  "ai-automation": [
    { url: "https://www.reddit.com/r/MachineLearning/.rss", name: "r/MachineLearning" },
    { url: "https://www.reddit.com/r/LocalLLaMA/.rss", name: "r/LocalLLaMA" },
    { url: "https://www.reddit.com/r/artificial/.rss", name: "r/artificial" },
    { url: "https://www.reddit.com/r/ChatGPT/.rss", name: "r/ChatGPT" },
    { url: "https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml", name: "GitHub Trending" },
    { url: "https://github.com/langchain-ai/langchain/releases.atom", name: "LangChain Releases" },
    { url: "https://github.com/microsoft/autogen/releases.atom", name: "AutoGen Releases" },
    { url: "https://github.com/huggingface/transformers/releases.atom", name: "Transformers Releases" },
    { url: "https://openai.com/news/rss.xml", name: "OpenAI" },
    { url: "https://deepmind.google/blog/rss.xml", name: "Google DeepMind" },
    { url: "https://blog.google/technology/ai/rss/", name: "Google AI Blog" },
    { url: "https://www.microsoft.com/en-us/ai/blog/feed/", name: "Microsoft AI" },
    { url: "https://www.databricks.com/feed", name: "Databricks" },
    { url: "https://huggingface.co/blog/feed.xml", name: "Hugging Face" },
    { url: "https://blogs.nvidia.com/feed/", name: "NVIDIA" },
    { url: "https://techcrunch.com/category/artificial-intelligence/feed/", name: "TechCrunch AI" },
    { url: "https://www.artificialintelligence-news.com/feed/", name: "AI News" },
    { url: "https://news.mit.edu/topic/mitartificial-intelligence2-rss.xml", name: "MIT AI" },
  ],
  cybersecurity: [
    { url: "https://www.reddit.com/r/cybersecurity/.rss", name: "r/cybersecurity" },
    { url: "https://www.reddit.com/r/netsec/.rss", name: "r/netsec" },
    { url: "https://www.reddit.com/r/hacking/.rss", name: "r/hacking" },
    { url: "https://github.com/projectdiscovery/nuclei/releases.atom", name: "Nuclei Releases" },
    { url: "https://github.com/OWASP/CheatSheetSeries/releases.atom", name: "OWASP Cheat Sheets" },
    { url: "https://learn.microsoft.com/en-us/azure/databricks/feed.xml", name: "Azure Databricks" },
    { url: "https://feeds.feedburner.com/TheHackersNews", name: "The Hacker News" },
    { url: "https://krebsonsecurity.com/feed/", name: "Krebs on Security" },
    { url: "https://www.bleepingcomputer.com/feed/", name: "BleepingComputer" },
  ],
  iam: [
    { url: "https://www.reddit.com/r/IdentityManagement/.rss", name: "r/IdentityManagement" },
    { url: "https://www.reddit.com/r/iam/.rss", name: "r/IAM" },
    { url: "https://jumpcloud.com/feed", name: "JumpCloud" },
    { url: "https://curity.io/news-feed.xml", name: "Curity" },
    { url: "https://identitymanagementinstitute.org/feed/", name: "Identity Mgmt Institute" },
    { url: "https://github.com/keycloak/keycloak/releases.atom", name: "Keycloak Releases" },
    { url: "https://www.workfusion.com/feed", name: "WorkFusion" },
  ],
  "intelligent-automation": [
    { url: "https://www.reddit.com/r/automation/.rss", name: "r/automation" },
    { url: "https://www.workfusion.com/feed", name: "WorkFusion" },
    { url: "https://github.com/n8n-io/n8n/releases.atom", name: "n8n Releases" },
    { url: "https://github.com/microsoft/autogen/releases.atom", name: "AutoGen Releases" },
    { url: "https://github.com/langchain-ai/langchain/releases.atom", name: "LangChain Releases" },
    { url: "https://blogs.nvidia.com/feed/", name: "NVIDIA" },
    { url: "https://www.microsoft.com/en-us/ai/blog/feed/", name: "Microsoft AI" },
    { url: "https://www.artificialintelligence-news.com/feed/", name: "AI News" },
  ],
  "news-geopolitics": [
    { url: "https://www.reddit.com/r/worldnews/.rss", name: "r/worldnews" },
    { url: "https://www.reddit.com/r/geopolitics/.rss", name: "r/geopolitics" },
    { url: "https://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC World" },
    { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", name: "NYT World" },
    { url: "https://www.aljazeera.com/xml/rss/all.xml", name: "Al Jazeera" },
  ],
};

// ── Config ──
const RSS2JSON_BASE = "https://api.rss2json.com/v1/api.json";
const CACHE_TTL_MS = 2 * 60 * 1000;     // 2 min
const BATCH_SIZE = 2;                     // only 2 concurrent requests
const BATCH_DELAY = 3000;                 // 3s between batches
const RETRY_DELAY = 5000;                 // 5s before retry pass

// ── Per-URL cache ──
interface UrlCacheEntry {
  items: Rss2JsonItem[];
  fetchedAt: number;
}
const urlCache = new Map<string, UrlCacheEntry>();

// Assembled results cache
let assembledCache: { data: Record<Category, FeedItem[]>; timestamp: number } | null = null;
let fetchInProgress: Promise<Record<Category, FeedItem[]>> | null = null;

// Progress callback for streaming updates
type ProgressCallback = (partial: Record<Category, FeedItem[]>) => void;
let progressCallback: ProgressCallback | null = null;

export function setProgressCallback(cb: ProgressCallback | null) {
  progressCallback = cb;
}

// ── RSS types & helpers ──

interface Rss2JsonItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
}

interface Rss2JsonResponse {
  status: string;
  items: Rss2JsonItem[];
}

function cleanHTML(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hashId(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function dedupeByUrl(items: FeedItem[]): FeedItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.url.replace(/\/$/, "").toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mapRawToFeedItems(
  raw: Rss2JsonItem[],
  sourceName: string,
  category: Category
): FeedItem[] {
  return raw.map((item) => ({
    id: `${sourceName}-${hashId(item.link || item.guid)}`,
    title: cleanHTML(item.title),
    url: item.link,
    source: sourceName,
    snippet: item.description
      ? cleanHTML(item.description).substring(0, 250)
      : undefined,
    category,
    timestamp: item.pubDate || new Date().toISOString(),
    thumbnail: item.thumbnail || undefined,
    author: item.author || undefined,
  }));
}

// ── Fetcher ──

async function fetchOneRaw(
  feedUrl: string
): Promise<{ url: string; items: Rss2JsonItem[] }> {
  try {
    const encoded = encodeURIComponent(feedUrl);
    const res = await fetch(`${RSS2JSON_BASE}?rss_url=${encoded}`);
    if (!res.ok) return { url: feedUrl, items: [] };
    const data: Rss2JsonResponse = await res.json();
    const items = data.status === "ok" ? data.items : [];
    if (items.length > 0) {
      urlCache.set(feedUrl, { items, fetchedAt: Date.now() });
    }
    return { url: feedUrl, items };
  } catch {
    return { url: feedUrl, items: [] };
  }
}

/**
 * Fetch URLs in throttled batches (2 at a time, 3s gaps).
 * Calls progressCallback after each batch so the UI can update progressively.
 */
async function fetchUrls(
  feeds: { url: string; name: string }[],
  staleOnly: boolean
): Promise<void> {
  const toFetch = staleOnly
    ? feeds.filter((f) => {
        const cached = urlCache.get(f.url);
        return !cached || Date.now() - cached.fetchedAt >= CACHE_TTL_MS;
      })
    : feeds;

  if (toFetch.length === 0) return;

  const failed: { url: string; name: string }[] = [];

  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    if (i > 0) await delay(BATCH_DELAY);
    const batch = toFetch.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((f) => fetchOneRaw(f.url))
    );
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.status !== "fulfilled" || r.value.items.length === 0) {
        failed.push(batch[j]);
      }
    }
    // Emit progress after each batch so UI can render partial results
    if (progressCallback) {
      progressCallback(assembleFromCache());
    }
  }

  // Retry failed once after cooldown
  if (failed.length > 0) {
    await delay(RETRY_DELAY);
    for (let i = 0; i < failed.length; i += BATCH_SIZE) {
      if (i > 0) await delay(BATCH_DELAY);
      const batch = failed.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(batch.map((f) => fetchOneRaw(f.url)));
      if (progressCallback) {
        progressCallback(assembleFromCache());
      }
    }
  }
}

// ── Assembly ──

const ALL_CATEGORIES: Category[] = [
  "finance",
  "ai-automation",
  "cybersecurity",
  "iam",
  "intelligent-automation",
  "news-geopolitics",
];

function assembleFromCache(): Record<Category, FeedItem[]> {
  const feed: Record<string, FeedItem[]> = {};
  for (const cat of ALL_CATEGORIES) {
    const items: FeedItem[] = [];
    for (const src of FEED_SOURCES[cat]) {
      const cached = urlCache.get(src.url);
      if (!cached) continue;
      items.push(...mapRawToFeedItems(cached.items, src.name, cat));
    }
    items.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    feed[cat] = dedupeByUrl(items).slice(0, 40);
  }
  return feed as Record<Category, FeedItem[]>;
}

function getUniqueFeeds(): { url: string; name: string }[] {
  const seen = new Map<string, string>();
  const result: { url: string; name: string }[] = [];
  for (const cat of ALL_CATEGORIES) {
    for (const src of FEED_SOURCES[cat]) {
      if (!seen.has(src.url)) {
        seen.set(src.url, src.name);
        result.push(src);
      }
    }
  }
  return result;
}

// ── Public API ──

export async function fetchCategoryFeed(
  category: Category,
  force = false
): Promise<FeedItem[]> {
  const sources = FEED_SOURCES[category];
  await fetchUrls(sources, !force);

  const items: FeedItem[] = [];
  for (const src of sources) {
    const cached = urlCache.get(src.url);
    if (!cached) continue;
    items.push(...mapRawToFeedItems(cached.items, src.name, category));
  }
  items.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return dedupeByUrl(items);
}

export async function fetchAllFeeds(
  force = false
): Promise<Record<Category, FeedItem[]>> {
  // Return cache instantly if fresh
  if (!force && assembledCache && Date.now() - assembledCache.timestamp < CACHE_TTL_MS) {
    return assembledCache.data;
  }

  // Prevent duplicate fetches
  if (fetchInProgress) return fetchInProgress;

  fetchInProgress = (async () => {
    try {
      const uniqueFeeds = getUniqueFeeds();
      await fetchUrls(uniqueFeeds, !force);

      const result = assembleFromCache();
      assembledCache = { data: result, timestamp: Date.now() };
      return result;
    } finally {
      fetchInProgress = null;
    }
  })();

  return fetchInProgress;
}

export function getCacheAge(): number | null {
  if (!assembledCache) return null;
  return Date.now() - assembledCache.timestamp;
}
