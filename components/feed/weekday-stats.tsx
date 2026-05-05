"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, TrendingDown, Target, DollarSign, LineChart as LineChartIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer } from "@/components/ui/chart";

import { useTrades } from "@/hooks/use-trades";
import { getEtWeekday, getEtWeekdayName } from "@/lib/time";

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
    const totalNet = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].value : 0;

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
      },
    };
  }, [trades, now]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const pieData = [
    { name: "Ganados", value: stats.wins, fill: "hsl(var(--chart-1))" },
    { name: "Perdidos", value: stats.losses, fill: "hsl(var(--chart-2))" },
  ];

  const barData = [
    { name: "Ganado", value: stats.totalWinPnl, fill: "hsl(var(--chart-1))" },
    { name: "Perdido", value: stats.totalLossPnl, fill: "hsl(var(--chart-2))" },
  ];

  const hasWeekdayData = stats.wins > 0 || stats.losses > 0;
  const hasEquityData = stats.equityCurve.length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Card A: Win/Loss Ratio Donut */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Target className="size-4" />
            Ratio {weekdayName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasWeekdayData ? (
            <div className="flex items-center gap-4">
              <ChartContainer
                config={{
                  wins: { label: "Ganados", color: "hsl(var(--chart-1))" },
                  losses: { label: "Perdidos", color: "hsl(var(--chart-2))" },
                }}
                className="aspect-square h-24"
              >
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={25}
                    outerRadius={40}
                    strokeWidth={0}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="flex flex-col">
                <span className="text-3xl font-bold">{stats.winRate}%</span>
                <span className="text-xs text-muted-foreground">
                  {stats.wins}W / {stats.losses}L de {stats.total}
                </span>
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Sin datos aún.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card B: PnL on this weekday */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="size-4" />
            PnL {weekdayName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasWeekdayData ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {stats.netPnl >= 0 ? (
                  <TrendingUp className="size-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="size-5 text-destructive" />
                )}
                <span
                  className={`text-3xl font-bold ${
                    stats.netPnl >= 0 ? "text-emerald-500" : "text-destructive"
                  }`}
                >
                  {stats.netPnl >= 0 ? "+" : "-"}$
                  {Math.abs(stats.netPnl).toLocaleString()}
                </span>
              </div>
              <ChartContainer
                config={{
                  ganado: { label: "Ganado", color: "hsl(var(--chart-1))" },
                  perdido: { label: "Perdido", color: "hsl(var(--chart-2))" },
                }}
                className="h-8"
              >
                <BarChart data={barData} layout="vertical" barGap={0}>
                  <XAxis type="number" hide />
                  <Bar dataKey="value" radius={4}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
              <span className="text-xs text-muted-foreground">
                Ganado ${stats.totalWinPnl.toLocaleString()} · Perdido $
                {stats.totalLossPnl.toLocaleString()}
              </span>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Sin datos aún.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card C: Overall equity curve */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <LineChartIcon className="size-4" />
            Performance total
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasEquityData ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {stats.totalNet >= 0 ? (
                  <TrendingUp className="size-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="size-5 text-destructive" />
                )}
                <span
                  className={`text-3xl font-bold ${
                    stats.totalNet >= 0 ? "text-emerald-500" : "text-destructive"
                  }`}
                >
                  {stats.totalNet >= 0 ? "+" : "-"}$
                  {Math.abs(stats.totalNet).toLocaleString()}
                </span>
              </div>
              <ChartContainer
                config={{
                  value: {
                    label: "PnL Acumulado",
                    color:
                      stats.totalNet >= 0
                        ? "hsl(var(--chart-1))"
                        : "hsl(var(--chart-2))",
                  },
                }}
                className="h-16"
              >
                <AreaChart data={stats.equityCurve}>
                  <defs>
                    <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={
                          stats.totalNet >= 0
                            ? "hsl(var(--chart-1))"
                            : "hsl(var(--chart-2))"
                        }
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={
                          stats.totalNet >= 0
                            ? "hsl(var(--chart-1))"
                            : "hsl(var(--chart-2))"
                        }
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={
                      stats.totalNet >= 0
                        ? "hsl(var(--chart-1))"
                        : "hsl(var(--chart-2))"
                    }
                    fill="url(#equityFill)"
                    strokeWidth={2}
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
  );
}
