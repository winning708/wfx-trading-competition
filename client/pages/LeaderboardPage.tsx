import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Trophy, TrendingUp, Clock, RefreshCw, Lock } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import { getLeaderboard, getTraderCount } from "@/lib/api";
import { testSupabaseConnection } from "@/lib/test";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Trader {
  rank: number;
  username: string;
  startingBalance: number;
  currentBalance: number;
  profitPercentage: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<Trader[]>([]);
  const [isLive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [traderCount, setTraderCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    traderCount: number;
    performanceDataCount: number;
    error?: string;
  } | null>(null);

  useEffect(() => {
    // Fetch leaderboard data on component mount
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Test connection first
        const status = await testSupabaseConnection();
        setConnectionStatus(status);

        console.log('Connection status:', status);

        if (!status.connected) {
          setError(`Connection error: ${status.error}`);
          return;
        }

        const data = await getLeaderboard();
        setLeaderboard(data);

        const count = await getTraderCount();
        setTraderCount(count);

        if (data.length === 0) {
          console.warn('No traders found in database');
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to load leaderboard';
        console.error("Error fetching leaderboard:", error);
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();

    // Set up real-time updates every 15 minutes
    const interval = setInterval(fetchLeaderboard, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
      const count = await getTraderCount();
      setTraderCount(count);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refresh';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Header Section */}
      <div className="border-b border-border px-4 py-8 md:py-16">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                Live Leaderboard
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Real-time rankings sorted by profit percentage
              </p>
              <div className="mb-4">
                <CountdownTimer />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 rounded-full hover:bg-card transition-colors disabled:opacity-50"
                title="Refresh leaderboard"
              >
                <RefreshCw className={`h-5 w-5 text-primary ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              {isLive && (
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full bg-success/10 whitespace-nowrap">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs sm:text-sm font-medium text-success">Live</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Competition Status
                  </p>
                  <p className="text-sm sm:text-lg font-semibold text-foreground">
                    Registration Open
                  </p>
                </div>
                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Registered Traders
                  </p>
                  <p className="text-sm sm:text-lg font-semibold text-foreground">
                    {traderCount > 0 ? traderCount : "0"}
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-success flex-shrink-0" />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 sm:p-4 sm:col-span-2 md:col-span-1">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Top Profit
                  </p>
                  <p className="text-sm sm:text-lg font-semibold text-foreground">
                    {leaderboard[0]?.profitPercentage.toFixed(1)}%
                  </p>
                </div>
                <Trophy className="h-5 w-5 text-primary flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <section className="px-4 py-8 md:py-24">
        <div className="container mx-auto">
          {error && (
            <div className="mb-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                <strong>Error loading leaderboard:</strong> {error}
              </p>
            </div>
          )}

          {connectionStatus && import.meta.env.DEV && (
            <div className="mb-8 rounded-lg border border-border bg-card/30 p-4">
              <p className="text-xs text-muted-foreground font-mono">
                <strong>Debug Info:</strong> Connected: {connectionStatus.connected ? '✓' : '✗'} | Traders: {connectionStatus.traderCount} | Performance Data: {connectionStatus.performanceDataCount}
              </p>
            </div>
          )}

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No traders registered yet</p>
              </div>
            ) : (
              leaderboard.map((trader) => (
                <div
                  key={trader.rank}
                  className="rounded-lg border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {trader.rank === 1 && (
                        <Trophy className="h-5 w-5 text-primary" />
                      )}
                      <span className="font-bold text-lg text-foreground">
                        #{trader.rank}
                      </span>
                    </div>
                    <span className="font-medium text-foreground">
                      {trader.username}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1">Start Balance</p>
                      <p className="font-medium text-foreground">${trader.startingBalance.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Current Balance</p>
                      <p className="font-medium text-foreground">${trader.currentBalance.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground mb-1">Profit %</p>
                      <span
                        className={`font-semibold text-sm ${
                          trader.profitPercentage >= 0
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {trader.profitPercentage >= 0 ? "+" : ""}
                        {trader.profitPercentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-card/50">
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-foreground">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-foreground">
                    Trader
                  </th>
                  <th className="px-4 py-3 text-right text-xs sm:text-sm font-semibold text-foreground">
                    Starting Balance
                  </th>
                  <th className="px-4 py-3 text-right text-xs sm:text-sm font-semibold text-foreground">
                    Current Balance
                  </th>
                  <th className="px-4 py-3 text-right text-xs sm:text-sm font-semibold text-foreground">
                    Profit %
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <p className="text-muted-foreground text-sm">Loading leaderboard...</p>
                    </td>
                  </tr>
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <p className="text-muted-foreground text-sm">No traders registered yet</p>
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((trader) => (
                    <tr
                      key={trader.rank}
                      className="border-b border-border hover:bg-card/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {trader.rank === 1 && (
                            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          )}
                          <span className="font-semibold text-foreground text-xs sm:text-sm">
                            #{trader.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground text-xs sm:text-sm">
                          {trader.username}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground text-xs sm:text-sm">
                        ${trader.startingBalance.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground text-xs sm:text-sm">
                        ${trader.currentBalance.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-semibold text-xs sm:text-sm ${
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-8 p-4 md:p-6 rounded-lg border border-border bg-card/30">
            <p className="text-xs sm:text-sm text-muted-foreground">
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
