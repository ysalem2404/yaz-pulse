import { CATEGORY_META, type Category } from "@/lib/types";
import { TrendingUp, Brain, Shield, Globe, KeyRound, Workflow } from "lucide-react";

const ICONS: Record<Category, typeof TrendingUp> = {
  finance: TrendingUp,
  "ai-automation": Brain,
  cybersecurity: Shield,
  iam: KeyRound,
  "intelligent-automation": Workflow,
  "news-geopolitics": Globe,
};

interface CategoryHeaderProps {
  category: Category;
  itemCount: number;
}

export function CategoryHeader({ category, itemCount }: CategoryHeaderProps) {
  const meta = CATEGORY_META[category];
  const Icon = ICONS[category];

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${meta.color}18` }}>
        <Icon className="w-4 h-4" style={{ color: meta.color }} />
      </div>
      <div>
        <h2 className="text-base font-semibold leading-none"
          style={{ color: "var(--color-text)" }}>
          {meta.label}
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          {itemCount} {itemCount === 1 ? "article" : "articles"} from live sources
        </p>
      </div>
    </div>
  );
}
