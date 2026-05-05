"use client";

import { useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

import type { Outcome, TradeRecord } from "@/lib/checklist";
import { cn } from "@/lib/utils";
import { formatEt } from "@/lib/time";

function formatPnl(pnl: number, outcome: Outcome): string {
  if (outcome === "pending" || pnl === 0) return "—";
  return pnl > 0
    ? `+$${pnl.toLocaleString()}`
    : `-$${Math.abs(pnl).toLocaleString()}`;
}

function outcomeBadgeVariant(
  outcome: Outcome
): "default" | "secondary" | "destructive" | "outline" {
  if (outcome === "win") return "default";
  if (outcome === "loss") return "destructive";
  return "outline";
}

function outcomeLabel(outcome: Outcome): string {
  if (outcome === "win") return "Ganado";
  if (outcome === "loss") return "Perdido";
  return "Pendiente";
}

interface TradeFeedCardProps {
  trade: TradeRecord;
}

export function TradeFeedCard({ trade }: TradeFeedCardProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const pnlText = formatPnl(trade.pnl, trade.outcome);
  const isWin = trade.outcome === "win";
  const isLoss = trade.outcome === "loss";
  const tagList = trade.tags ?? [];
  const visibleTags = tagList.slice(0, 2);
  const overflow = tagList.length - visibleTags.length;
  const hasImages = trade.images && trade.images.length > 0;
  const hasMultipleImages = trade.images && trade.images.length > 1;

  const handleApiChange = (api: CarouselApi) => {
    if (!api) return;
    setApi(api);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  };

  return (
    <Link
      href={`/trades/${trade.id}`}
      target="_blank"
      rel="noopener"
      className="block"
    >
      <Card
        className={cn(
          "cursor-pointer border-l-4 transition-colors hover:bg-accent/40",
          trade.outcome === "win" && "border-l-emerald-500",
          trade.outcome === "loss" && "border-l-destructive",
          trade.outcome === "pending" && "border-l-border"
        )}
      >
        <CardContent className="flex flex-col gap-3 p-4">
          {/* Header row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-xs text-muted-foreground">
              {formatEt(trade.createdAt, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>

            <Badge variant="secondary" className="shrink-0 capitalize">
              {trade.direction}
            </Badge>

            {visibleTags.length > 0 && (
              <div className="flex shrink-0 flex-wrap items-center gap-1">
                {visibleTags.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="text-[10px] font-normal"
                  >
                    {t}
                  </Badge>
                ))}
                {overflow > 0 && (
                  <Badge variant="outline" className="text-[10px] font-normal">
                    +{overflow}
                  </Badge>
                )}
              </div>
            )}

            <Badge
              variant={outcomeBadgeVariant(trade.outcome)}
              className="shrink-0"
            >
              {outcomeLabel(trade.outcome)}
            </Badge>

            <span
              className={`ml-auto shrink-0 text-sm font-semibold tabular-nums ${
                isWin
                  ? "text-emerald-500"
                  : isLoss
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            >
              {pnlText}
            </span>
          </div>

          {/* Image carousel */}
          {hasImages && (
            <div
              className="relative"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Carousel setApi={handleApiChange} className="w-full">
                <CarouselContent>
                  {trade.images.map((src, idx) => (
                    <CarouselItem key={idx}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Trade image ${idx + 1}`}
                        className="h-56 w-full rounded-md object-cover"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {hasMultipleImages && (
                  <>
                    <CarouselPrevious
                      className="left-2 h-8 w-8"
                      onClick={(e) => e.preventDefault()}
                    />
                    <CarouselNext
                      className="right-2 h-8 w-8"
                      onClick={(e) => e.preventDefault()}
                    />
                  </>
                )}
              </Carousel>
              {/* Dot indicators */}
              {hasMultipleImages && (
                <div className="mt-2 flex justify-center gap-1">
                  {trade.images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition-colors",
                        idx === current ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        api?.scrollTo(idx);
                      }}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes excerpt */}
          {trade.notas && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {trade.notas}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
