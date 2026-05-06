export const ET_TZ = "America/New_York";

export function getEtWeekday(ts: number | Date): number {
  const date = typeof ts === "number" ? new Date(ts) : ts;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TZ,
    weekday: "short",
  });
  const dayName = formatter.format(date);
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return dayMap[dayName] ?? 0;
}

export function getEtWeekKey(ts: number | Date): string {
  const date = typeof ts === "number" ? new Date(ts) : ts;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";

  const etDate = new Date(`${year}-${month}-${day}T12:00:00`);
  const dayOfYear = Math.floor(
    (etDate.getTime() - new Date(`${year}-01-01T12:00:00`).getTime()) /
      (24 * 60 * 60 * 1000)
  );
  const weekNumber = Math.ceil((dayOfYear + 1) / 7);
  return `${year}-W${String(weekNumber).padStart(2, "0")}`;
}

export function getEtWeekdayName(ts: number | Date): string {
  const date = typeof ts === "number" ? new Date(ts) : ts;
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: ET_TZ,
    weekday: "long",
  }).format(date);
}

export function formatEt(
  ts: number | Date,
  opts: Intl.DateTimeFormatOptions
): string {
  const date = typeof ts === "number" ? new Date(ts) : ts;
  return new Intl.DateTimeFormat("es-MX", {
    ...opts,
    timeZone: ET_TZ,
  }).format(date);
}

export function getEtDateKey(ts: number | Date): string {
  const date = typeof ts === "number" ? new Date(ts) : ts;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = (parts.find((p) => p.type === "month")?.value ?? "1").padStart(2, "0");
  const day = (parts.find((p) => p.type === "day")?.value ?? "1").padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * FF-style calendar strings encode the release in Eastern Time. Using
 * `new Date(iso)` for grouping can shift the calendar day in non-US timezones
 * when the string lacks an offset. Prefer the date prefix when present.
 */
export function getEtDateKeyFromFfDateString(isoLike: string): string {
  const trimmed = isoLike.trim();
  const m = /^(\d{4}-\d{2}-\d{2})[T ]/.exec(trimmed);
  if (m) return m[1];
  return getEtDateKey(new Date(trimmed));
}

export function isToday(ts: number | Date): boolean {
  return getEtDateKey(ts) === getEtDateKey(Date.now());
}

export function isPast(ts: number | Date): boolean {
  const date = typeof ts === "number" ? new Date(ts) : ts;
  return date.getTime() < Date.now();
}
