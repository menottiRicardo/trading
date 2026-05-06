"use client";

import { useMemo } from "react";
import { Newspaper } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useNews } from "@/hooks/use-news";
import type { NewsEvent } from "@/app/api/news/route";
import {
  formatEt,
  getEtDateKey,
  getEtDateKeyFromFfDateString,
  isToday,
  isPast,
  ET_TZ,
} from "@/lib/time";

interface GroupedDay {
  dateKey: string;
  label: string;
  events: NewsEvent[];
  isToday: boolean;
  isPast: boolean;
}

function groupEventsByDay(events: NewsEvent[]): GroupedDay[] {
  const groups = new Map<string, NewsEvent[]>();

  for (const event of events) {
    const dateKey = getEtDateKeyFromFfDateString(event.date);
    const existing = groups.get(dateKey) ?? [];
    groups.set(dateKey, [...existing, event]);
  }

  const result: GroupedDay[] = [];
  for (const [dateKey, dayEvents] of groups) {
    const firstEvent = dayEvents[0];
    const eventDate = new Date(firstEvent.date);
    result.push({
      dateKey,
      label: formatEt(eventDate, { weekday: "short", day: "numeric", month: "short" }),
      events: dayEvents.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      isToday: isToday(eventDate),
      isPast: isPast(eventDate) && !isToday(eventDate),
    });
  }

  return result.sort(
    (a, b) =>
      new Date(a.events[0].date).getTime() - new Date(b.events[0].date).getTime()
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/** Lex-safe compare for YYYY-MM-DD keys from getEtDateKey / FF strings. */
function etYmdOrder(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return 0;
  return y * 10000 + m * 100 + d;
}

export function ForexNews() {
  const { events, loading, error } = useNews();

  const grouped = useMemo(() => groupEventsByDay(events), [events]);

  const todayKey = getEtDateKey(Date.now());
  const visibleGrouped = grouped.filter(
    (day) => etYmdOrder(day.dateKey) >= etYmdOrder(todayKey)
  );

  if (loading) {
    return (
      <Card className="lg:sticky lg:top-16">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Newspaper className="size-4" />
            Noticias USD
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="lg:sticky lg:top-16">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Newspaper className="size-4" />
            Noticias USD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="lg:sticky lg:top-16">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Newspaper className="size-4" />
            Noticias USD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay noticias de alto impacto esta semana.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (events.length > 0 && visibleGrouped.length === 0) {
    return (
      <Card className="lg:sticky lg:top-16">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Newspaper className="size-4" />
            Noticias USD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay noticias desde hoy en adelante (ET) esta semana.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:sticky lg:top-16">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Newspaper className="size-4" />
            Noticias USD
          </CardTitle>
          <div className="flex gap-1">
            <Badge className="bg-[#ff0000] text-[10px] text-white hover:bg-[#ff0000]">
              High
            </Badge>
            <Badge className="bg-orange-500 text-[10px] hover:bg-orange-500">
              Medium
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Desde hoy (ET)</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {visibleGrouped.map((day) => (
          <div
            key={day.dateKey}
            className={`flex flex-col gap-1.5 border-l-2 pl-3 ${
              day.isToday
                ? "border-primary"
                : day.isPast
                  ? "border-muted opacity-50"
                  : "border-muted"
            }`}
          >
            <p
              className={`text-xs font-medium uppercase tracking-wide ${
                day.isToday ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {day.label}
              {day.isToday && (
                <span className="ml-2 text-[10px] font-normal lowercase">
                  (hoy)
                </span>
              )}
            </p>
            {day.events.map((event, idx) => (
              <div key={idx} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 shrink-0 rounded-full ${
                      event.impact === "High" ? "bg-red-600" : "bg-orange-500"
                    }`}
                    title={event.impact === "High" ? "Alto impacto" : "Impacto medio"}
                  />
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatTime(event.date)}
                  </span>
                  <span className="text-sm font-medium">{event.title}</span>
                </div>
                <div className="ml-4 flex gap-3 text-xs text-muted-foreground">
                  {event.forecast && <span>Fcst: {event.forecast}</span>}
                  {event.previous && <span>Prev: {event.previous}</span>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
