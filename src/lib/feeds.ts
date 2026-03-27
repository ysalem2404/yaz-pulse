import type { FeedItem, Category } from "./types";

// ── Feed Sources ──
// Each category has RSS feeds from multiple sources (Reddit + professional outlets)
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
    { url: "https://techcrunch.com/category/artificial-intelligence/feed/", name: "TechCrunch AI" },
    { url: "https://www.artificialintelligence-news.com/feed/", name: "AI News" },
    { url: "https://news.mit.edu/topic/mitartificial-intelligence2-rss.xml", name: "MIT AI" },
  ],
  cybersecurity: [
    { url: "https://www.reddit.com/r/cybersecurity/.rss", name: "r/cybersecurity" },
    { url: "https://www.reddit.com/r/netsec/.rss", name: "r/netsec" },
    { url: "https://www.reddit.com/r/hacking/.rss", name: "r/hacking" },
    { url: "https://feeds.feedburner.com/TheHackersNews", name: "The Hacker News" },
    { url: "https://krebsonsecurity.com/feed/", name: "Krebs on Security" },
    { url: "https://www.bleepingcomputer.com/feed/", name: "BleepingComputer" },
  ],
  "news-geopolitics": [
    { url: "https://www.reddit.com/r/worldnews/.rss", name: "r/worldnews" },
    { url: "https://www.reddit.com/r/geopolitics/.rss", name: "r/geopolitics" },
    { url: "https://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC World" },
    { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", name: "NYT World" },
    { url: "https://www.aljazeera.com/xml/rss/all.xml", name: "Al Jazeera" },
  ],
};

const RSS2JSON_BASE = "https://api.rss2json.com/v1/api.json";

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

async function fetchSingleFeed(
  feedUrl: string,
  sourceName: string,
  category: Category
): Promise<FeedItem[]> {
  try {
    const encoded = encodeURIComponent(feedUrl);
    const res = await fetch(`${RSS2JSON_BASE}?rss_url=${encoded}`);
    if (!res.ok) return [];
    const data: Rss2JsonResponse = await res.json();
    if (data.status !== "ok") return [];

    return data.items.map((item) => ({
      id: `${sourceName}-${hashId(item.link || item.guid)}`,
      title: cleanHTML(item.title),
      url: item.link,
      source: sourceName,
      snippet: item.description ? cleanHTML(item.description).substring(0, 250) : undefined,
      category,
      timestamp: item.pubDate || new Date().toISOString(),
      thumbnail: item.thumbnail || undefined,
      author: item.author || undefined,
    }));
  } catch {
    return [];
  }
}

export async function fetchCategoryFeed(category: Category): Promise<FeedItem[]> {
  const sources = FEED_SOURCES[category];
  const results = await Promise.allSettled(
    sources.map((s) => fetchSingleFeed(s.url, s.name, category))
  );

  const items: FeedItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") items.push(...r.value);
  }

  // Sort by date descending
  items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Deduplicate by URL
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.url.replace(/\/$/, "").toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchAllFeeds(): Promise<Record<Category, FeedItem[]>> {
  const categories: Category[] = [
    "finance",
    "ai-automation",
    "cybersecurity",
    "news-geopolitics",
  ];

  const results = await Promise.allSettled(
    categories.map(async (cat) => ({
      category: cat,
      items: await fetchCategoryFeed(cat),
    }))
  );

  const feed: Record<string, FeedItem[]> = {};
  for (const r of results) {
    if (r.status === "fulfilled") {
      feed[r.value.category] = r.value.items.slice(0, 30);
    }
  }
  return feed as Record<Category, FeedItem[]>;
}
