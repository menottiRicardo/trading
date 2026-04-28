import { TradeHistory } from "@/components/history/trade-history";

export const metadata = { title: "Historial – Trading Checklist" };

export default function HistoryPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Historial</h1>
        <p className="text-sm text-muted-foreground">
          Haz clic en un trade para editar su resultado o eliminarlo.
        </p>
      </div>
      <TradeHistory />
    </main>
  );
}
