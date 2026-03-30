export interface FeedItem {
  id: string;
  title: string;
  url: string;
  source: string;
  snippet?: string;
  category: Category;
  timestamp: string;
  thumbnail?: string;
  author?: string;
}

export type Category = "finance" | "ai-automation" | "cybersecurity" | "iam" | "intelligent-automation" | "news-geopolitics";

export const CATEGORIES: Category[] = [
  "finance",
  "ai-automation",
  "cybersecurity",
  "iam",
  "intelligent-automation",
  "news-geopolitics",
];

export const CATEGORY_META: Record<
  Category,
  { label: string; color: string; cssClass: string; icon: string }
> = {
  finance: {
    label: "Finance & Investment",
    color: "#22c55e",
    cssClass: "cat-finance",
    icon: "trending-up",
  },
  "ai-automation": {
    label: "AI & Automation",
    color: "#8b5cf6",
    cssClass: "cat-ai",
    icon: "brain",
  },
  cybersecurity: {
    label: "Cybersecurity",
    color: "#f59e0b",
    cssClass: "cat-cyber",
    icon: "shield",
  },
  iam: {
    label: "Identity & Access Mgmt",
    color: "#06b6d4",
    cssClass: "cat-iam",
    icon: "key-round",
  },
  "intelligent-automation": {
    label: "Intelligent Automation",
    color: "#ec4899",
    cssClass: "cat-ia",
    icon: "workflow",
  },
  "news-geopolitics": {
    label: "News & Geopolitics",
    color: "#ef4444",
    cssClass: "cat-news",
    icon: "globe",
  },
};
