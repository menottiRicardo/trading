import { WeekdayStats } from "@/components/feed/weekday-stats";
import { TodayTrades } from "@/components/feed/today-trades";
import { ForexNews } from "@/components/news/forex-news";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 flex flex-col gap-8">
      <WeekdayStats />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <TodayTrades />
        <ForexNews />
      </div>
    </main>
  );
}
