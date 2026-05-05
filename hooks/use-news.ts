"use client";

import { useEffect, useState } from "react";
import type { NewsEvent } from "@/app/api/news/route";
import { readCachedNews, writeCachedNews } from "@/lib/news-cache";
import { getEtWeekKey } from "@/lib/time";

interface UseNewsResult {
  events: NewsEvent[];
  loading: boolean;
  error: string | null;
}

function getInitialState(): {
  events: NewsEvent[];
  loading: boolean;
  needsFetch: boolean;
} {
  const currentWeekKey = getEtWeekKey(Date.now());
  const cached = readCachedNews();

  if (cached && cached.weekKey === currentWeekKey) {
    return { events: cached.events, loading: false, needsFetch: false };
  }
  return { events: [], loading: true, needsFetch: true };
}

export function useNews(): UseNewsResult {
  const [state, setState] = useState(getInitialState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.needsFetch) return;

    fetch("/api/news")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: { weekKey: string; events: NewsEvent[] }) => {
        writeCachedNews({
          weekKey: data.weekKey,
          fetchedAt: Date.now(),
          events: data.events,
        });
        setState({ events: data.events, loading: false, needsFetch: false });
      })
      .catch(() => {
        setError("No se pudieron cargar las noticias");
        setState((prev) => ({ ...prev, loading: false, needsFetch: false }));
      });
  }, [state.needsFetch]);

  return { events: state.events, loading: state.loading, error };
}
