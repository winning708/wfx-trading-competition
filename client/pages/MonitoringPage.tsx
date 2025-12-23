import Header from "@/components/layout/Header";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-8">
        <PagePlaceholder
          title="Performance Monitoring"
          description="Real-time monitoring via Myfxbook and FX Blue integration. Automated data sync and leaderboard calculations. Coming soon!"
        />
      </div>
    </div>
  );
}
