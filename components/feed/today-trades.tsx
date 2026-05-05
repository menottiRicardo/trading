"use client";

import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useTrades } from "@/hooks/use-trades";
import { getEtWeekday, getEtWeekdayName } from "@/lib/time";
import { TradeFeedCard } from "./trade-feed-card";

type FilterType = "all" | "win" | "loss";

export function TodayTrades() {
  const { trades, loading } = useTrades();
  const [filter, setFilter] = useState<FilterType>("all");
  const [now] = useState(() => Date.now());

  const { filtered, counts, weekdayName } = useMemo(() => {
    const todayWeekday = getEtWeekday(now);
    const weekdayName = getEtWeekdayName(now);

    const weekdayTrades = trades.filter(
      (t) => getEtWeekday(t.createdAt) === todayWeekday
    );

    const wins = weekdayTrades.filter((t) => t.outcome === "win");
    const losses = weekdayTrades.filter((t) => t.outcome === "loss");

    let filtered = weekdayTrades;
    if (filter === "win") {
      filtered = wins;
    } else if (filter === "loss") {
      filtered = losses;
    }

    return {
      filtered,
      counts: {
        all: weekdayTrades.length,
        win: wins.length,
        loss: losses.length,
      },
      weekdayName,
    };
  }, [trades, filter, now]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const filterButtons: { value: FilterType; label: string; count: number }[] = [
    { value: "all", label: "Todos", count: counts.all },
    { value: "win", label: "Ganadores", count: counts.win },
    { value: "loss", label: "Perdedores", count: counts.loss },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold capitalize">
        Trades de los {weekdayName}
      </h2>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {filterButtons.map((btn) => (
          <Button
            key={btn.value}
            variant={filter === btn.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(btn.value)}
            className="gap-1"
          >
            {btn.label}
            <span className="text-xs opacity-70">({btn.count})</span>
          </Button>
        ))}
      </div>

      {/* Trade cards */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((trade) => (
            <TradeFeedCard key={trade.id} trade={trade} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <ClipboardList className="size-10 opacity-40" />
          <p className="text-sm">
            {filter === "all"
              ? `Aún no tienes trades de los ${weekdayName}.`
              : filter === "win"
                ? `No hay trades ganadores los ${weekdayName}.`
                : `No hay trades perdedores los ${weekdayName}.`}
          </p>
        </div>
      )}
    </div>
  );
}
