import Header from "@/components/layout/Header";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-8">
        <PagePlaceholder
          title="Admin Panel"
          description="Manage registered traders, monitor demo accounts, view performance data, and freeze leaderboard. Admin access only!"
        />
      </div>
    </div>
  );
}
