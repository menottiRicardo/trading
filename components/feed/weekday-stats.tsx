"use client";

import { useMemo, useState } from "react";
import {
  Label,
  PieChart,
  Pie,
  Cell,
  XAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  LineChart as LineChartIcon,
  Flame,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { useTrades } from "@/hooks/use-trades";
import { getEtWeekday, getEtWeekdayName } from "@/lib/time";

const WIN_COLOR = "#10b981";
const LOSS_COLOR = "var(--destructive)";

function PnlSummary({
  net,
  icons = true,
}: {
  net: number;
  icons?: boolean;
}) {
  if (net === 0) {
    return (
      <span className="text-3xl font-bold tabular-nums text-muted-foreground">
        $0
      </span>
    );
  }
  const amount = (
    <span
      className={`text-3xl font-bold tabular-nums ${
        net > 0 ? "text-emerald-500" : "text-destructive"
      }`}
    >
      {net > 0 ? "+" : "-"}${Math.abs(net).toLocaleString()}
    </span>
  );
  if (!icons) return amount;
  return (
    <div className="flex items-center gap-2">
      {net > 0 ? (
        <TrendingUp className="size-5 shrink-0 text-emerald-500" />
      ) : (
        <TrendingDown className="size-5 shrink-0 text-destructive" />
      )}
      {amount}
    </div>
  );
}

export function WeekdayStats() {
  const { trades, loading } = useTrades();
  const [now] = useState(() => Date.now());

  const { weekdayName, stats } = useMemo(() => {
    const todayWeekday = getEtWeekday(now);
    const weekdayName = getEtWeekdayName(now);

    const weekdayTrades = trades.filter(
      (t) => getEtWeekday(t.createdAt) === todayWeekday
    );
    const wins = weekdayTrades.filter((t) => t.outcome === "win");
    const losses = weekdayTrades.filter((t) => t.outcome === "loss");

    const totalWinPnl = wins.reduce((sum, t) => sum + Math.abs(t.pnl), 0);
    const totalLossPnl = losses.reduce((sum, t) => sum + Math.abs(t.pnl), 0);
    const netPnl = totalWinPnl - totalLossPnl;

    const winRate =
      wins.length + losses.length > 0
        ? Math.round((wins.length / (wins.length + losses.length)) * 100)
        : 0;

    const sortedTrades = [...trades]
      .filter((t) => t.outcome !== "pending")
      .sort((a, b) => a.createdAt - b.createdAt);

    const equityCurve = sortedTrades.reduce<{ index: number; value: number }[]>(
      (acc, t, i) => {
        const prev = acc.length > 0 ? acc[acc.length - 1].value : 0;
        acc.push({ index: i, value: prev + t.pnl });
        return acc;
      },
      []
    );
    const totalNet =
      equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].value : 0;

    let currentStreak = 0;
    for (let i = sortedTrades.length - 1; i >= 0; i--) {
      if (sortedTrades[i].outcome === "win") currentStreak++;
      else break;
    }

    return {
      weekdayName,
      stats: {
        wins: wins.length,
        losses: losses.length,
        total: weekdayTrades.length,
        winRate,
        totalWinPnl,
        totalLossPnl,
        netPnl,
        equityCurve,
        totalNet,
        currentStreak,
      },
    };
  }, [trades, now]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-[auto_auto]">
        <div className="md:row-span-2">
          <Skeleton className="h-full min-h-40 w-full rounded-lg" />
        </div>
        <Skeleton className="h-40 w-full rounded-lg" />
        <div className="md:row-span-2">
          <Skeleton className="h-full min-h-40 w-full rounded-lg" />
        </div>
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  const hasWeekdayData = stats.wins > 0 || stats.losses > 0;
  const hasEquityData = stats.equityCurve.length > 0;

  // Card A — pie chart data (two slices: wins, losses)
  const ratioData = [
    { name: "Ganados", value: stats.wins },
    { name: "Perdidos", value: stats.losses },
  ];
  const ratioConfig = {
    Ganados: { label: "Ganados", color: WIN_COLOR },
    Perdidos: { label: "Perdidos", color: LOSS_COLOR },
  } satisfies ChartConfig;

  // Card C — equity curve data
  const equityData = [
    { label: "T0", value: 0 },
    ...stats.equityCurve.map((p, i) => ({
      label: `T${i + 1}`,
      value: p.value,
    })),
  ];
  const equityColor =
    stats.totalNet > 0
      ? WIN_COLOR
      : stats.totalNet < 0
        ? LOSS_COLOR
        : "var(--muted-foreground)";
  const equityConfig = {
    value: { label: "PnL acumulado", color: equityColor },
  } satisfies ChartConfig;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-[auto_auto]">
      {/* Card A: Win/Loss Ratio — left column, spans both rows */}
      <div className="md:row-span-2">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Target className="size-4" />
              Ratio {weekdayName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasWeekdayData ? (
              <ChartContainer
                config={ratioConfig}
                className="mx-auto aspect-square w-full max-w-[250px] mb-[-45%]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={ratioData}
                    dataKey="value"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={80}
                    outerRadius={110}
                    strokeWidth={0}
                    paddingAngle={stats.wins > 0 && stats.losses > 0 ? 2 : 0}
                  >
                    <Cell fill={WIN_COLOR} />
                    <Cell fill={LOSS_COLOR} />
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) - 16}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {stats.winRate}%
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 4}
                                className="fill-muted-foreground"
                              >
                                {stats.wins}W / {stats.losses}L de {stats.total}
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Sin datos aún.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Card B: PnL — middle column, row 1 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="size-4" />
            PnL {weekdayName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasWeekdayData ? (
            <div className="flex min-h-[3rem] items-center justify-center py-1">
              <PnlSummary net={stats.netPnl} icons={false} />
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Sin datos aún.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card C: Performance Total — right column, spans both rows */}
      <div className="md:row-span-2">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <LineChartIcon className="size-4" />
              Performance total
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasEquityData ? (
              <div className="flex flex-col gap-2">
                <PnlSummary net={stats.totalNet} />
                <ChartContainer config={equityConfig} className="h-32 w-full">
                  <AreaChart
                    accessibilityLayer
                    data={equityData}
                    margin={{ left: 8, right: 8 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      dataKey="value"
                      type="natural"
                      stroke="var(--color-value)"
                      fill="var(--color-value)"
                      fillOpacity={0.4}
                    />
                  </AreaChart>
                </ChartContainer>
                <span className="text-xs text-muted-foreground">
                  {stats.equityCurve.length} trades cerrados
                </span>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Sin datos aún.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Card D: Streak — middle column, row 2 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Flame className="size-4" />
            Racha actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[3rem] items-center justify-center py-1">
            {stats.currentStreak > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tabular-nums text-emerald-500">
                  {stats.currentStreak}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stats.currentStreak === 1
                    ? "trade ganador"
                    : "trades ganadores"}
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold tabular-nums text-muted-foreground">
                0
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
