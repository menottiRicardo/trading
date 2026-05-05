"use client";

import { useCallback, useEffect, useState } from "react";
import type { Outcome, TradeRecord } from "@/lib/checklist";
import {
  deleteTrade as deleteFromDb,
  loadTrades,
  saveTrade as saveToDb,
  updateTrade as updateInDb,
} from "@/lib/db";

export function useTrades() {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrades()
      .then((t) => {
        setTrades(t);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const addTrade = useCallback(async (trade: TradeRecord) => {
    await saveToDb(trade);
    setTrades((prev) => [trade, ...prev]);
  }, []);

  const updateTrade = useCallback(
    async (
      id: string,
      patch: {
        outcome: Outcome;
        pnl: number;
        notas: string;
        images: string[];
        tags: string[];
      }
    ) => {
      await updateInDb(id, patch);
      setTrades((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
      );
    },
    []
  );

  const deleteTrade = useCallback(async (id: string) => {
    await deleteFromDb(id);
    setTrades((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { trades, loading, addTrade, updateTrade, deleteTrade };
}
