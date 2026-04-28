"use client";

import { useCallback, useState } from "react";
import type { Outcome, TradeRecord } from "@/lib/checklist";
import {
  deleteTrade as deleteFromStorage,
  loadTrades,
  saveTrade as saveToStorage,
  updateTrade as updateInStorage,
} from "@/lib/storage";

export function useTrades() {
  const [trades, setTrades] = useState<TradeRecord[]>(() => loadTrades());

  const addTrade = useCallback((trade: TradeRecord) => {
    saveToStorage(trade);
    setTrades((prev) => [trade, ...prev]);
  }, []);

  const updateTrade = useCallback(
    (id: string, patch: { outcome: Outcome; pnl: number; notas: string; images: string[] }) => {
      updateInStorage(id, patch);
      setTrades((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
      );
    },
    []
  );

  const deleteTrade = useCallback((id: string) => {
    deleteFromStorage(id);
    setTrades((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { trades, addTrade, updateTrade, deleteTrade };
}
