import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Award, DollarSign, Zap } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import Header from "@/components/layout/Header";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative border-b border-border px-4 py-20 md:py-32">
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <Zap className="mr-2 h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Competition Opening January 5, 2026
              </span>
            </div>

            <h1 className="mb-6 text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              WFX Trading Competition 2026
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Trade Smart. Trade to Win.
            </p>
            <p className="mb-12 text-base text-muted-foreground max-w-2xl mx-auto">
              Join our exclusive trading competition with $1,000 demo capital.
              Compete with traders worldwide, showcase your skills, and win
              amazing prizes.
            </p>

            <div className="mb-16">
              <CountdownTimer />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Register Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/leaderboard"
                className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-primary bg-transparent px-8 text-base font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Details */}
      <section className="border-b border-border px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                $15 Entry
              </h3>
              <p className="text-sm text-muted-foreground">
                Secure registration with instant access to your demo account
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                $1,000 Capital
              </h3>
              <p className="text-sm text-muted-foreground">
                Pre-assigned JustMarkets demo accounts ready to trade
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                5 Days Trading
              </h3>
              <p className="text-sm text-muted-foreground">
                January 5 - 10, 2026. Real-time monitoring & rankings
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Award className="h-6 w-6 text-success" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Win Big
              </h3>
              <p className="text-sm text-muted-foreground">
                Top 3 traders receive cash and prop firm account prizes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Prize Structure */}
      <section className="border-b border-border px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <h2 className="mb-16 text-center text-4xl md:text-5xl font-bold text-foreground">
            Prize Structure
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* 2nd Place */}
            <div className="rounded-lg border border-border bg-card/50 p-8 flex flex-col">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-secondary">
                  🥈 2nd Place
                </span>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">
                $10,000
              </h3>
              <p className="text-muted-foreground">
                Prop Firm Account Credit
              </p>
            </div>

            {/* 1st Place - Featured */}
            <div className="relative rounded-lg border-2 border-primary bg-card p-8 flex flex-col md:scale-105 md:-mt-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-block px-4 py-1 rounded-full text-sm font-bold bg-primary text-primary-foreground">
                  🥇 1st Place - Grand Prize
                </span>
              </div>
              <div className="mt-6 mb-4">
                <h3 className="mb-2 text-3xl font-bold text-primary">
                  $500 Cash
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Plus recognition as WFX Trading Champion
              </p>
            </div>

            {/* 3rd Place */}
            <div className="rounded-lg border border-border bg-card/50 p-8 flex flex-col">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-warning/20 text-warning">
                  🥉 3rd Place
                </span>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">
                $5,000
              </h3>
              <p className="text-muted-foreground">
                Prop Firm Account Credit
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-border px-4 py-16 md:py-24">
        <div className="container mx-auto">
          <h2 className="mb-16 text-center text-4xl md:text-5xl font-bold text-foreground">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Register",
                description: "Sign up and pay the $15 entry fee securely",
              },
              {
                step: "02",
                title: "Get Demo Account",
                description: "Receive pre-assigned JustMarkets demo account",
              },
              {
                step: "03",
                title: "Start Trading",
                description: "Trade with $1,000 demo capital Jan 5-10",
              },
              {
                step: "04",
                title: "Win Prizes",
                description: "Compete on live leaderboard, win big prizes",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="rounded-lg border border-border bg-card p-6 mb-4">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                    {item.step}
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                {index < 3 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 translate-y-1/2 justify-center">
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules Summary */}
      <section className="border-b border-border px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-12 text-4xl md:text-5xl font-bold text-foreground">
            Competition Rules
          </h2>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card/50 p-6">
              <h3 className="font-semibold text-foreground mb-2">
                ✓ Demo Trading Only
              </h3>
              <p className="text-sm text-muted-foreground">
                All trading conducted on JustMarkets demo accounts only
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-6">
              <h3 className="font-semibold text-foreground mb-2">
                ✓ One Account Per Participant
              </h3>
              <p className="text-sm text-muted-foreground">
                Each registered trader receives exactly one demo account
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-6">
              <h3 className="font-semibold text-foreground mb-2">
                ✓ No Deposits or Withdrawals
              </h3>
              <p className="text-sm text-muted-foreground">
                Trading limited to the $1,000 starting capital provided
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-6">
              <h3 className="font-semibold text-foreground mb-2">
                ✓ Trading Period: January 5-10, 2026
              </h3>
              <p className="text-sm text-muted-foreground">
                Competition concludes at 23:59 UTC on January 10, 2026
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-6">
              <h3 className="font-semibold text-foreground mb-2">
                ✓ Ranking by Profit Percentage
              </h3>
              <p className="text-sm text-muted-foreground">
                Profit % = ((Final Balance - $1,000) / $1,000) × 100
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-6">
              <h3 className="font-semibold text-foreground mb-2">
                ✓ Real-Time Monitoring
              </h3>
              <p className="text-sm text-muted-foreground">
                All accounts monitored via investor access & automated tracking
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-6">
              <h3 className="font-semibold text-foreground mb-2">
                ✓ Admin Decision Final
              </h3>
              <p className="text-sm text-muted-foreground">
                WFX reserves the right to disqualify rule violators
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              For complete rules and terms, visit our{" "}
              <Link to="/rules" className="text-primary hover:underline">
                Rules & Terms page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 md:py-32">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="mb-6 text-4xl md:text-5xl font-bold text-foreground">
            Ready to Compete?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join hundreds of traders competing for amazing prizes. Limited spots
            available.
          </p>
          <Link
            to="/register"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Register Now - $15
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 px-4 py-12">
        <div className="container mx-auto">
          <div className="mb-8 grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="mb-4 font-semibold text-foreground">WFX Trading</h3>
              <p className="text-sm text-muted-foreground">
                Fair, transparent, and automated trading competition.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/leaderboard"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/rules"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Rules
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Competition</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/register"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2026 WFX Trading Competition. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
