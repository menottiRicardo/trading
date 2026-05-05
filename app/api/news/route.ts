import { getEtWeekKey } from "@/lib/time";

interface FFEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
}

export type NewsImpact = "High" | "Medium";

export interface NewsEvent {
  title: string;
  date: string;
  impact: NewsImpact;
  forecast: string;
  previous: string;
}

export async function GET() {
  try {
    const res = await fetch(
      "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
      { next: { revalidate: 1800 } }
    );

    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch news" },
        { status: res.status }
      );
    }

    const all: FFEvent[] = await res.json();
    const events: NewsEvent[] = all
      .filter((e) => e.country === "USD" && (e.impact === "High" || e.impact === "Medium"))
      .map((e) => ({
        title: e.title,
        date: e.date,
        impact: e.impact as NewsImpact,
        forecast: e.forecast,
        previous: e.previous,
      }));

    return Response.json({ weekKey: getEtWeekKey(Date.now()), events });
  } catch {
    return Response.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
