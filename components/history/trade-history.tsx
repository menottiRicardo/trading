"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ClipboardList } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { Outcome, TradeRecord } from "@/lib/checklist";
import { cn } from "@/lib/utils";
import { useTrades } from "@/hooks/use-trades";
import { EditTradeDialog } from "./edit-trade-dialog";

function formatDate(ts: number): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ts));
}

function formatPnl(pnl: number, outcome: Outcome): string {
  if (outcome === "pending" || pnl === 0) return "—";
  return pnl > 0 ? `+$${pnl.toLocaleString()}` : `-$${Math.abs(pnl).toLocaleString()}`;
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

export function TradeHistory() {
  const { trades, loading, updateTrade, deleteTrade } = useTrades();
  const [selected, setSelected] = useState<TradeRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleRowClick(trade: TradeRecord) {
    setSelected(trade);
    setDialogOpen(true);
  }

  async function handleSave(
    id: string,
    outcome: Outcome,
    pnl: number,
    notas: string,
    images: string[],
    tags: string[]
  ) {
    await updateTrade(id, { outcome, pnl, notas, images, tags });
    toast.success("Trade actualizado");
  }

  async function handleDelete(id: string) {
    await deleteTrade(id);
    toast.success("Trade eliminado");
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
        <ClipboardList className="size-10 opacity-40" />
        <p className="text-sm">Aún no has registrado ningún trade.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {trades.map((trade) => {
          const pnlText = formatPnl(trade.pnl, trade.outcome);
          const isWin = trade.outcome === "win";
          const isLoss = trade.outcome === "loss";
          const tagList = trade.tags ?? [];
          const visibleTags = tagList.slice(0, 2);
          const overflow = tagList.length - visibleTags.length;

          return (
            <Card
              key={trade.id}
              className={cn(
                "cursor-pointer border-l-4 transition-colors hover:bg-accent/40",
                trade.outcome === "win" && "border-l-emerald-500",
                trade.outcome === "loss" && "border-l-destructive",
                trade.outcome === "pending" && "border-l-border"
              )}
              onClick={() => handleRowClick(trade)}
            >
              <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                {/* Date */}
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {formatDate(trade.createdAt)}
                </span>

                {/* Direction badge */}
                <Badge variant="secondary" className="shrink-0 capitalize">
                  {trade.direction}
                </Badge>

                {/* Tags */}
                {visibleTags.length > 0 && (
                  <div className="flex shrink-0 flex-wrap items-center gap-1">
                    {visibleTags.map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px] font-normal">
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

                {/* Outcome badge */}
                <Badge
                  variant={outcomeBadgeVariant(trade.outcome)}
                  className="shrink-0"
                >
                  {outcomeLabel(trade.outcome)}
                </Badge>

                {/* P&L */}
                <span
                  className={`shrink-0 text-sm font-semibold tabular-nums ${
                    isWin
                      ? "text-emerald-500"
                      : isLoss
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }`}
                >
                  {pnlText}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <EditTradeDialog
        trade={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}
