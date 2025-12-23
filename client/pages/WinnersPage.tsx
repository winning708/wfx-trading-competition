import Header from "@/components/layout/Header";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function WinnersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-8">
        <PagePlaceholder
          title="Winner Announcement"
          description="Celebrating our top 3 traders and prize winners. Leaderboard frozen. Check back after competition ends on January 10, 2026!"
        />
      </div>
    </div>
  );
}
