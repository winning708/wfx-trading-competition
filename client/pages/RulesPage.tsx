import Header from "@/components/layout/Header";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-8">
        <PagePlaceholder
          title="Rules & Terms"
          description="Complete competition rules, terms of service, and participant guidelines. Available soon!"
        />
      </div>
    </div>
  );
}
