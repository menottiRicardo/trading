export const metadata = { title: "Trade – Trading Checklist" };

export default async function TradeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Trade {id.slice(0, 8)}...</h1>
      <p className="mt-2 text-muted-foreground">
        Página de detalle — próximamente.
      </p>
    </main>
  );
}
