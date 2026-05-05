import type { NewsEvent } from "@/app/api/news/route";

const KEY = "trading-checklist:news";

export interface CachedNews {
  weekKey: string;
  fetchedAt: number;
  events: NewsEvent[];
}

export function readCachedNews(): CachedNews | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedNews;
  } catch {
    return null;
  }
}

export function writeCachedNews(data: CachedNews): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    console.warn("[news-cache] Failed to write to localStorage");
  }
}
