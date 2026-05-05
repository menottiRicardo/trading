import { openDB, type IDBPDatabase } from "idb";
import type { TradeRecord } from "./checklist";

const DB_NAME = "trading-checklist";
const DB_VERSION = 1;
const STORE = "trades";
const LS_KEY = "trading-checklist:trades";

let dbPromise: Promise<IDBPDatabase> | null = null;

async function migrateFromLocalStorage(db: IDBPDatabase): Promise<void> {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return;

  try {
    const trades: TradeRecord[] = JSON.parse(raw);
    if (trades.length === 0) {
      localStorage.removeItem(LS_KEY);
      return;
    }
    const tx = db.transaction(STORE, "readwrite");
    await Promise.all(trades.map((t) => tx.store.put(t)));
    await tx.done;
    localStorage.removeItem(LS_KEY);
  } catch {
    console.warn("[db] Failed to migrate from localStorage");
  }
}

export function getDb(): Promise<IDBPDatabase> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB not available on server"));
  }

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" });
        }
      },
    }).then(async (db) => {
      await migrateFromLocalStorage(db);
      return db;
    });
  }
  return dbPromise;
}

export async function loadTrades(): Promise<TradeRecord[]> {
  const db = await getDb();
  const all = await db.getAll(STORE);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveTrade(trade: TradeRecord): Promise<void> {
  const db = await getDb();
  await db.put(STORE, trade);
}

export async function updateTrade(
  id: string,
  patch: Partial<Omit<TradeRecord, "id" | "createdAt">>
): Promise<void> {
  const db = await getDb();
  const existing = await db.get(STORE, id);
  if (existing) {
    await db.put(STORE, { ...existing, ...patch });
  }
}

export async function deleteTrade(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE, id);
}

export async function getTrade(id: string): Promise<TradeRecord | undefined> {
  const db = await getDb();
  return db.get(STORE, id);
}
