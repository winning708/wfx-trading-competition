import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import CountdownTimer from "@/components/CountdownTimer";
import { AlertCircle, Check, Clock, Trophy, Shield, Users } from "lucide-react";

export default function RulesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Countdown */}
      <section className="border-b border-border px-4 py-12 md:py-20 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              WFX Trading Competition Rules
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Competition starts January 5, 2026. Read all rules carefully.
            </p>
            <div className="mb-8">
              <CountdownTimer />
            </div>
          </div>
        </div>
      </section>

      {/* Rules Content */}
      <section className="px-4 py-12 md:py-20">
        <div className="container mx-auto max-w-4xl">
          {/* Quick Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-6">
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Duration</h3>
                  <p className="text-sm text-muted-foreground">
                    January 5-10, 2026
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-success/30 bg-success/5 p-6">
              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Entry</h3>
                  <p className="text-sm text-muted-foreground">
                    $15 USD entry fee
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-warning/30 bg-warning/5 p-6">
              <div className="flex items-start gap-3">
                <Trophy className="h-6 w-6 text-warning flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Capital</h3>
                  <p className="text-sm text-muted-foreground">
                    $1,000 demo balance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Rules */}
          <div className="space-y-8 mb-12">
            {/* Registration & Participation */}
            <div className="rounded-lg border border-border bg-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  1. Registration & Participation
                </h2>
              </div>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Who Can Participate:</strong> Any individual aged 18+ from any country can register for the competition.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Registration Requirement:</strong> You must register and pay the $15 USD entry fee before January 5, 2026.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>One Account Per Person:</strong> Each participant receives exactly one JustMarkets demo account. Multiple registrations under different names are strictly prohibited and will result in disqualification.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Shared Devices:</strong> If trading from a shared device, you must ensure your account credentials are kept secure and confidential.
                  </span>
                </li>
              </ul>
            </div>

            {/* Trading Rules */}
            <div className="rounded-lg border border-border bg-card p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                2. Trading Rules & Restrictions
              </h2>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Demo Accounts Only:</strong> All trading must be conducted exclusively on JustMarkets demo accounts. Trading with real money or on live accounts is prohibited.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Starting Balance:</strong> Each account starts with exactly $1,000 USD in demo funds.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>No Deposits or Withdrawals:</strong> You cannot deposit additional funds or withdraw funds during the competition. Trading is limited to your $1,000 starting capital.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Trading Pairs & Instruments:</strong> All forex pairs, metals, and commodities available on JustMarkets are allowed. CFDs and derivatives may have restrictions.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Leverage:</strong> Standard leverage provided by JustMarkets applies. Excessive leverage abuse or margin call patterns may trigger investigation.
                  </span>
                </li>
              </ul>
            </div>

            {/* Competition Period */}
            <div className="rounded-lg border border-border bg-card p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                3. Competition Period & Trading Hours
              </h2>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Official Period:</strong> January 5 - January 10, 2026 (00:00 UTC to 23:59 UTC)
                  </span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Trading Windows:</strong> Trade during standard forex market hours. Weekend trading may have limited liquidity.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Cutoff Time:</strong> Competition ends at 23:59 UTC on January 10, 2026. No trades will be accepted after this time.
                  </span>
                </li>
              </ul>
            </div>

            {/* Ranking Criteria */}
            <div className="rounded-lg border border-border bg-card p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                4. Ranking & Scoring
              </h2>
              <div className="space-y-6">
                <div>
                  <p className="font-semibold text-foreground mb-3">
                    Profit Percentage Calculation:
                  </p>
                  <div className="bg-background rounded-lg p-4 font-mono text-sm">
                    <p>Profit % = ((Final Balance - $1,000) / $1,000) × 100</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Winners are ranked by highest profit percentage, not absolute profit amount.
                  </p>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Tie Breaker:</strong> In case of identical profit percentages, the trader who achieved that profit first (by time) ranks higher.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Real-Time Updates:</strong> Leaderboard updates every 15 minutes. Live prices and account balances are monitored automatically.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Prohibited Activities */}
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8">
              <div className="flex items-start gap-3 mb-6">
                <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                <h2 className="text-2xl font-bold text-foreground">
                  5. Prohibited Activities & Disqualifications
                </h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Participants engaging in any of the following activities will be immediately disqualified and lose all prizes:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span>Account sharing or trading using another person's account</span>
                </li>
                <li className="flex gap-3">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span>Using bots, algorithmic traders, or automated trading systems not provided by the platform</span>
                </li>
                <li className="flex gap-3">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span>Collusion with other traders or market manipulation</span>
                </li>
                <li className="flex gap-3">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span>Attempting to gain unfair advantage through system exploits or bugs</span>
                </li>
                <li className="flex gap-3">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span>Providing false information during registration</span>
                </li>
                <li className="flex gap-3">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span>Any form of hacking, phishing, or attempted unauthorized access</span>
                </li>
                <li className="flex gap-3">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span>Abusive behavior towards WFX staff or other participants</span>
                </li>
              </ul>
            </div>

            {/* Prizes & Rewards */}
            <div className="rounded-lg border border-border bg-card p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                6. Prize Distribution
              </h2>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="rounded-lg border-2 border-primary bg-primary/5 p-6 text-center">
                  <p className="text-sm font-medium text-primary mb-2">🥇 1st Place</p>
                  <p className="text-3xl font-bold text-foreground mb-2">$500</p>
                  <p className="text-sm text-muted-foreground">Cash Prize + Champion Title</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6 text-center">
                  <p className="text-sm font-medium text-foreground mb-2">🥈 2nd Place</p>
                  <p className="text-2xl font-bold text-foreground mb-2">$10,000</p>
                  <p className="text-sm text-muted-foreground">Prop Firm Account Credit</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6 text-center">
                  <p className="text-sm font-medium text-foreground mb-2">🥉 3rd Place</p>
                  <p className="text-2xl font-bold text-foreground mb-2">$5,000</p>
                  <p className="text-sm text-muted-foreground">Prop Firm Account Credit</p>
                </div>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Payment Method:</strong> Winners will receive their prizes within 7 business days via bank transfer or preferred payment method.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Verification Required:</strong> Winners must verify their identity and provide tax information as required by local regulations.
                  </span>
                </li>
              </ul>
            </div>

            {/* Admin Decisions */}
            <div className="rounded-lg border border-border bg-card p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                7. Admin Authority & Dispute Resolution
              </h2>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Final Authority:</strong> WFX Trading reserves the right to make final decisions on all matters relating to the competition.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Disqualification:</strong> WFX may disqualify any participant without notice if suspected of rule violations.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Dispute Process:</strong> If you believe there's an error, contact support@wfxtrading.com within 24 hours of the issue with evidence.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Appeals:</strong> Appeals must be submitted in writing within 48 hours. Decision will be provided within 5 business days.
                  </span>
                </li>
              </ul>
            </div>

            {/* Liability & Terms */}
            <div className="rounded-lg border border-border bg-card p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                8. Liability & Disclaimers
              </h2>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>No Real Money Trading:</strong> This competition uses demo accounts only. No real money is deposited or withdrawn.
                  </span>
                </li>
                <li className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Third-Party Platforms:</strong> WFX is not responsible for technical issues on JustMarkets' platform. Contact JustMarkets support for account-related problems.
                  </span>
                </li>
                <li className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Technical Issues:</strong> In case of platform downtime or technical failures, WFX may extend the competition period or compensate affected traders.
                  </span>
                </li>
                <li className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Refund Policy:</strong> Entry fees are non-refundable after registration. In case of disqualification, fees will not be refunded.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Questions or Concerns?
            </h2>
            <p className="text-muted-foreground mb-6">
              Contact our support team at support@wfxtrading.com or visit our FAQ page for more information.
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
