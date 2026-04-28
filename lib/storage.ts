import type { TradeRecord } from "./checklist";

const KEY = "trading-checklist:trades";

function read(): TradeRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Partial<TradeRecord>[]).map((t) => ({
      notas: "",
      images: [],
      ...t,
    })) as TradeRecord[];
  } catch {
    console.warn("[storage] Failed to read trades from localStorage");
    return [];
  }
}

function write(trades: TradeRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(trades));
  } catch {
    console.warn("[storage] Failed to write trades to localStorage");
  }
}

export function loadTrades(): TradeRecord[] {
  return read();
}

export function saveTrade(trade: TradeRecord): void {
  const trades = read();
  write([trade, ...trades]);
}

export function updateTrade(
  id: string,
  patch: Partial<Omit<TradeRecord, "id" | "createdAt">>
): void {
  const trades = read().map((t) => (t.id === id ? { ...t, ...patch } : t));
  write(trades);
}

export function deleteTrade(id: string): void {
  write(read().filter((t) => t.id !== id));
}
