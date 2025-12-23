import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Trophy, TrendingUp, Clock } from "lucide-react";

interface Trader {
  rank: number;
  username: string;
  startingBalance: number;
  currentBalance: number;
  profitPercentage: number;
}

const mockLeaderboard: Trader[] = [
  {
    rank: 1,
    username: "TradeMaster01",
    startingBalance: 1000,
    currentBalance: 1850,
    profitPercentage: 85.0,
  },
  {
    rank: 2,
    username: "ProfitSeeker",
    startingBalance: 1000,
    currentBalance: 1720,
    profitPercentage: 72.0,
  },
  {
    rank: 3,
    username: "MarketWizard",
    startingBalance: 1000,
    currentBalance: 1650,
    profitPercentage: 65.0,
  },
  {
    rank: 4,
    username: "SwingTrader99",
    startingBalance: 1000,
    currentBalance: 1520,
    profitPercentage: 52.0,
  },
  {
    rank: 5,
    username: "LongTermHolder",
    startingBalance: 1000,
    currentBalance: 1380,
    profitPercentage: 38.0,
  },
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<Trader[]>(mockLeaderboard);
  const [isLive] = useState(true);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setLeaderboard((prev) =>
        prev.map((trader) => ({
          ...trader,
          currentBalance:
            trader.currentBalance +
            (Math.random() - 0.45) * (trader.rank === 1 ? 50 : 30),
          profitPercentage:
            ((trader.currentBalance + (Math.random() - 0.45) * 40 - 1000) /
              1000) *
            100,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Header Section */}
      <div className="border-b border-border px-4 py-12 md:py-16">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                Live Leaderboard
              </h1>
              <p className="text-muted-foreground">
                Real-time rankings sorted by profit percentage
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isLive && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-success/10">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium text-success">Live</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Competition Status
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    Registration Open
                  </p>
                </div>
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Registered Traders
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {leaderboard.length}+
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Top Profit
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {leaderboard[0]?.profitPercentage.toFixed(1)}%
                  </p>
                </div>
                <Trophy className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-card/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Trader
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Starting Balance
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Current Balance
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Profit %
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((trader) => (
                  <tr
                    key={trader.rank}
                    className="border-b border-border hover:bg-card/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {trader.rank === 1 && (
                          <Trophy className="h-5 w-5 text-primary" />
                        )}
                        <span className="font-semibold text-foreground">
                          #{trader.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-foreground">
                        {trader.username}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground">
                      ${trader.startingBalance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-foreground">
                      ${trader.currentBalance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-semibold ${
                          trader.profitPercentage >= 0
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {trader.profitPercentage >= 0 ? "+" : ""}
                        {trader.profitPercentage.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 p-6 rounded-lg border border-border bg-card/30">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Leaderboard Updates:</strong> Rankings are updated
              every 15 minutes with real-time performance data from JustMarkets
              demo accounts. Profit percentage is calculated as: (Current
              Balance - $1,000) / $1,000 × 100
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
