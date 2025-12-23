import Header from "@/components/layout/Header";
import PagePlaceholder from "@/components/PagePlaceholder";

export default function RegistrationPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-8">
        <PagePlaceholder
          title="Registration & Payment"
          description="This page will feature a secure registration form and payment checkout. Keep watching for updates!"
        />
      </div>
    </div>
  );
}
