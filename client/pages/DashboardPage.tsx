import Header from "@/components/layout/Header";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-8">
        <PagePlaceholder
          title="Trader Dashboard"
          description="View your assigned demo account details, live trading statistics, and current leaderboard rank. Coming soon!"
        />
      </div>
    </div>
  );
}
