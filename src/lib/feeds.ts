import type { FeedItem, Category } from "./types";

// ── Feed Sources ──
// Reddit + GitHub + AI frontier blogs + professional outlets
const FEED_SOURCES: Record<Category, { url: string; name: string }[]> = {
  finance: [
    // Reddit
    { url: "https://www.reddit.com/r/investing/.rss", name: "r/investing" },
    { url: "https://www.reddit.com/r/stocks/.rss", name: "r/stocks" },
    { url: "https://www.reddit.com/r/wallstreetbets/.rss", name: "r/wallstreetbets" },
    { url: "https://www.reddit.com/r/CryptoCurrency/.rss", name: "r/CryptoCurrency" },
    // Professional
    { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US", name: "Yahoo Finance" },
    { url: "https://feeds.feedburner.com/CoinDesk", name: "CoinDesk" },
  ],
  "ai-automation": [
    // Reddit
    { url: "https://www.reddit.com/r/MachineLearning/.rss", name: "r/MachineLearning" },
    { url: "https://www.reddit.com/r/LocalLLaMA/.rss", name: "r/LocalLLaMA" },
    { url: "https://www.reddit.com/r/artificial/.rss", name: "r/artificial" },
    { url: "https://www.reddit.com/r/ChatGPT/.rss", name: "r/ChatGPT" },
    // GitHub — Trending & Key Releases
    { url: "https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml", name: "GitHub Trending" },
    { url: "https://github.com/langchain-ai/langchain/releases.atom", name: "LangChain Releases" },
    { url: "https://github.com/microsoft/autogen/releases.atom", name: "AutoGen Releases" },
    { url: "https://github.com/huggingface/transformers/releases.atom", name: "Transformers Releases" },
    // AI Frontier Blogs
    { url: "https://openai.com/news/rss.xml", name: "OpenAI" },
    { url: "https://deepmind.google/blog/rss.xml", name: "Google DeepMind" },
    { url: "https://blog.google/technology/ai/rss/", name: "Google AI Blog" },
    { url: "https://www.microsoft.com/en-us/ai/blog/feed/", name: "Microsoft AI" },
    { url: "https://www.databricks.com/feed", name: "Databricks" },
    { url: "https://huggingface.co/blog/feed.xml", name: "Hugging Face" },
    { url: "https://blogs.nvidia.com/feed/", name: "NVIDIA" },
    // Professional
    { url: "https://techcrunch.com/category/artificial-intelligence/feed/", name: "TechCrunch AI" },
    { url: "https://www.artificialintelligence-news.com/feed/", name: "AI News" },
    { url: "https://news.mit.edu/topic/mitartificial-intelligence2-rss.xml", name: "MIT AI" },
  ],
  cybersecurity: [
    // Reddit
    { url: "https://www.reddit.com/r/cybersecurity/.rss", name: "r/cybersecurity" },
    { url: "https://www.reddit.com/r/netsec/.rss", name: "r/netsec" },
    { url: "https://www.reddit.com/r/hacking/.rss", name: "r/hacking" },
    // GitHub — Security Tools
    { url: "https://github.com/projectdiscovery/nuclei/releases.atom", name: "Nuclei Releases" },
    { url: "https://github.com/OWASP/CheatSheetSeries/releases.atom", name: "OWASP Cheat Sheets" },
    // Azure & Cloud Security
    { url: "https://learn.microsoft.com/en-us/azure/databricks/feed.xml", name: "Azure Databricks" },
    // Professional
    { url: "https://feeds.feedburner.com/TheHackersNews", name: "The Hacker News" },
    { url: "https://krebsonsecurity.com/feed/", name: "Krebs on Security" },
    { url: "https://www.bleepingcomputer.com/feed/", name: "BleepingComputer" },
  ],
  iam: [
    // Reddit
    { url: "https://www.reddit.com/r/IdentityManagement/.rss", name: "r/IdentityManagement" },
    { url: "https://www.reddit.com/r/iam/.rss", name: "r/IAM" },
    // IAM Vendor Blogs
    { url: "https://jumpcloud.com/feed", name: "JumpCloud" },
    { url: "https://curity.io/news-feed.xml", name: "Curity" },
    // IAM Knowledge & Industry
    { url: "https://identitymanagementinstitute.org/feed/", name: "Identity Mgmt Institute" },
    // GitHub — IAM Open Source
    { url: "https://github.com/keycloak/keycloak/releases.atom", name: "Keycloak Releases" },
    // Intelligent Automation (WorkFusion overlaps compliance/identity)
    { url: "https://www.workfusion.com/feed", name: "WorkFusion" },
  ],
  "intelligent-automation": [
    // Reddit
    { url: "https://www.reddit.com/r/automation/.rss", name: "r/automation" },
    // Automation Platforms
    { url: "https://www.workfusion.com/feed", name: "WorkFusion" },
    // GitHub — Automation Tools
    { url: "https://github.com/n8n-io/n8n/releases.atom", name: "n8n Releases" },
    { url: "https://github.com/microsoft/autogen/releases.atom", name: "AutoGen Releases" },
    { url: "https://github.com/langchain-ai/langchain/releases.atom", name: "LangChain Releases" },
    // AI & Automation Blogs (cross-category)
    { url: "https://blogs.nvidia.com/feed/", name: "NVIDIA" },
    { url: "https://www.microsoft.com/en-us/ai/blog/feed/", name: "Microsoft AI" },
    { url: "https://www.artificialintelligence-news.com/feed/", name: "AI News" },
  ],
  "news-geopolitics": [
    // Reddit
    { url: "https://www.reddit.com/r/worldnews/.rss", name: "r/worldnews" },
    { url: "https://www.reddit.com/r/geopolitics/.rss", name: "r/geopolitics" },
    // Professional
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

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Throttled fetch: process feeds in batches of 3 with 2s gaps
// to avoid rss2json rate limits
async function fetchFeedsBatched(
  feeds: { url: string; name: string }[],
  category: Category
): Promise<FeedItem[]> {
  const BATCH_SIZE = 3;
  const BATCH_DELAY = 2000;
  const all: FeedItem[] = [];

  for (let i = 0; i < feeds.length; i += BATCH_SIZE) {
    if (i > 0) await delay(BATCH_DELAY);
    const batch = feeds.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((s) => fetchSingleFeed(s.url, s.name, category))
    );
    for (const r of results) {
      if (r.status === "fulfilled") all.push(...r.value);
    }
  }
  return all;
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

function dedupeByUrl(items: FeedItem[]): FeedItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.url.replace(/\/$/, "").toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchCategoryFeed(category: Category): Promise<FeedItem[]> {
  const sources = FEED_SOURCES[category];
  const items = await fetchFeedsBatched(sources, category);

  items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return dedupeByUrl(items);
}

export async function fetchAllFeeds(): Promise<Record<Category, FeedItem[]>> {
  const categories: Category[] = [
    "finance",
    "ai-automation",
    "cybersecurity",
    "iam",
    "intelligent-automation",
    "news-geopolitics",
  ];

  // Collect all unique feed URLs across categories, then fetch once
  // and distribute items to their categories.
  const urlToCategories = new Map<string, { name: string; categories: Category[] }>();

  for (const cat of categories) {
    for (const src of FEED_SOURCES[cat]) {
      const existing = urlToCategories.get(src.url);
      if (existing) {
        existing.categories.push(cat);
      } else {
        urlToCategories.set(src.url, { name: src.name, categories: [cat] });
      }
    }
  }

  // Build deduplicated job list
  const uniqueFeeds: { url: string; name: string }[] = [];
  for (const [url, info] of urlToCategories) {
    uniqueFeeds.push({ url, name: info.name });
  }

  // Fetch all unique feeds in throttled batches (3 at a time, 2s gaps)
  const BATCH_SIZE = 3;
  const BATCH_DELAY = 2000;
  const rawByUrl = new Map<string, Rss2JsonItem[]>();

  async function fetchOne(feedUrl: string): Promise<{ url: string; items: Rss2JsonItem[] }> {
    try {
      const encoded = encodeURIComponent(feedUrl);
      const res = await fetch(`${RSS2JSON_BASE}?rss_url=${encoded}`);
      if (!res.ok) return { url: feedUrl, items: [] };
      const data: Rss2JsonResponse = await res.json();
      return { url: feedUrl, items: data.status === "ok" ? data.items : [] };
    } catch {
      return { url: feedUrl, items: [] };
    }
  }

  const failed: { url: string; name: string }[] = [];

  for (let i = 0; i < uniqueFeeds.length; i += BATCH_SIZE) {
    if (i > 0) await delay(BATCH_DELAY);
    const batch = uniqueFeeds.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map((f) => fetchOne(f.url)));
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.status === "fulfilled" && r.value.items.length > 0) {
        rawByUrl.set(r.value.url, r.value.items);
      } else {
        failed.push(batch[j]);
      }
    }
  }

  // Retry failed feeds once (rate limit may have cleared)
  if (failed.length > 0) {
    await delay(3000);
    for (let i = 0; i < failed.length; i += BATCH_SIZE) {
      if (i > 0) await delay(BATCH_DELAY);
      const batch = failed.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(batch.map((f) => fetchOne(f.url)));
      for (const r of results) {
        if (r.status === "fulfilled" && r.value.items.length > 0) {
          rawByUrl.set(r.value.url, r.value.items);
        }
      }
    }
  }

  // Distribute fetched items to categories
  const feed: Record<string, FeedItem[]> = {};
  for (const cat of categories) {
    const items: FeedItem[] = [];
    for (const src of FEED_SOURCES[cat]) {
      const raw = rawByUrl.get(src.url);
      if (!raw) continue;
      for (const item of raw) {
        items.push({
          id: `${src.name}-${hashId(item.link || item.guid)}`,
          title: cleanHTML(item.title),
          url: item.link,
          source: src.name,
          snippet: item.description ? cleanHTML(item.description).substring(0, 250) : undefined,
          category: cat,
          timestamp: item.pubDate || new Date().toISOString(),
          thumbnail: item.thumbnail || undefined,
          author: item.author || undefined,
        });
      }
    }
    items.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    feed[cat] = dedupeByUrl(items).slice(0, 40);
  }

  return feed as Record<Category, FeedItem[]>;
}
