import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ExternalLink, Copy } from "lucide-react";
import Header from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerTrader, initiatePayment } from "@/lib/api";
import { getCurrencyInfoForCountry } from "@/lib/currency";

const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface ManualPaymentData {
  method: string;
  email: string;
  amount: number;
  fullName: string;
  instructions: string;
  orderRef: string;
  merchantId?: string;
  walletAddress?: string;
  currency: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  swiftCode?: string;
  country?: string;
  convertedAmount?: number;
  currencyCode?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "bank-transfer",
    name: "Bank Transfer",
    description: "Direct bank account transfer",
    icon: "🏦",
    color: "from-blue-500 to-blue-600",
  },
];

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "payment" | "manual-payment" | "success">("form");
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    country: "",
  });
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [manualPaymentData, setManualPaymentData] = useState<ManualPaymentData | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Redirect to leaderboard after 3 seconds when registration is complete
  useEffect(() => {
    if (step === "success") {
      const timer = setTimeout(() => {
        navigate("/leaderboard");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.country) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      country: value,
    }));
    if (errors.country) {
      setErrors((prev) => ({
        ...prev,
        country: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoadingMessage('');

    try {
      // Simulate form validation delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLoadingMessage('');
      setStep("payment");
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPayment(paymentId);
    setLoadingMessage('');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPayment) {
      return;
    }

    console.log('[Registration] 🎬 Payment submission started for:', selectedPayment);
    setIsLoading(true);
    setLoadingMessage('Preparing payment...');

    try {
      setLoadingMessage('Registering trader account...');

      // Register trader in Supabase BEFORE payment processing
      const registerSuccess = await registerTrader({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        paymentMethod: selectedPayment,
      });

      if (!registerSuccess) {
        console.error("[Registration] ❌ Failed to register trader");
        setIsLoading(false);
        setLoadingMessage('');
        alert("Registration failed. Please try again.");
        return;
      }

      console.log('[Registration] ✅ Trader registered successfully');

      // Save email to localStorage for dashboard access
      localStorage.setItem("trader_email", formData.email);
      setLoadingMessage('');

      // Handle different payment methods
      console.log('[Registration] Payment result:', {
        success: paymentResult.success,
        hasPaymentData: !!paymentResult.paymentData,
        paymentDataKeys: paymentResult.paymentData ? Object.keys(paymentResult.paymentData) : [],
        selectedPayment,
      });

      if (selectedPayment === 'flutterwave') {
        // For Flutterwave, show manual payment instructions
        console.log('[Registration] Processing Flutterwave payment');

        if (!paymentResult.paymentData) {
          console.error('[Registration] ❌ No payment data returned for Flutterwave');
          setIsLoading(false);
          alert('Payment gateway error. Please try again.');
          return;
        }

        const flutterwaveData = paymentResult.paymentData as any;
        console.log('[Registration] Flutterwave data:', {
          email: flutterwaveData.email,
          amount: flutterwaveData.amount,
          currency: flutterwaveData.currency,
          txRef: flutterwaveData.txRef,
          hasPublicKey: 'public_key' in flutterwaveData,
        });

        // Show manual payment instructions for Flutterwave
        setManualPaymentData({
          method: 'flutterwave',
          email: formData.email,
          amount: 15,
          fullName: formData.fullName,
          instructions: 'To complete your payment, click the button below to open Flutterwave\'s secure payment page. You can pay with your card, mobile money, USSD, or bank transfer.',
          orderRef: flutterwaveData.txRef || 'pending',
          currency: 'USD',
        });
        console.log('[Registration] ✅ Flutterwave manual payment data set, switching to manual-payment step');
        setIsLoading(false);
        setStep("manual-payment");
      } else if (selectedPayment === 'binance' || selectedPayment === 'bybit') {
        // For Binance and Bybit (manual payments)
        console.log('[Registration] Processing', selectedPayment, 'payment');

        if (!paymentResult.paymentData) {
          console.error('[Registration] ❌ No payment data returned for', selectedPayment);
          setIsLoading(false);
          alert('Payment gateway error. Please try again.');
          return;
        }

        const data = paymentResult.paymentData as any;
        console.log('[Registration]', selectedPayment, 'data:', {
          method: data.method,
          orderRef: data.orderRef,
          hasMerchantId: !!data.merchantId,
          hasWalletAddress: !!data.walletAddress,
        });

        setManualPaymentData({
          method: selectedPayment,
          email: formData.email,
          amount: 15,
          fullName: formData.fullName,
          instructions: data.instructions,
          orderRef: data.orderRef,
          merchantId: data.merchantId,
          walletAddress: data.walletAddress,
          currency: data.currency,
        });
        console.log('[Registration] ✅', selectedPayment, 'manual payment data set');
        setIsLoading(false);
        setStep("manual-payment");
      } else {
        console.error('[Registration] ❌ Unknown payment method:', selectedPayment);
        setIsLoading(false);
        alert('Unknown payment method. Please try again.');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("[Registration] ❌ Payment error:", errorMsg);
      setIsLoading(false);
      setLoadingMessage('');
      setStep("payment");
      alert("An error occurred during payment. Please try again.");
    }
  };

  // Manual Payment Instructions Step
  if (step === "manual-payment" && manualPaymentData) {
    console.log('[Registration] 🎯 Rendering manual-payment step for method:', manualPaymentData.method);
    const selectedPaymentMethod = PAYMENT_METHODS.find(
      (m) => m.id === manualPaymentData.method
    );
    console.log('[Registration] Selected payment method:', selectedPaymentMethod?.name);

    return (
      <div className="min-h-screen bg-background">
        <Header />

        <div className="flex items-center justify-center px-4 py-20 md:py-32">
          <div className="w-full max-w-2xl">
            {/* Page Title */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl md:text-5xl font-bold text-foreground">
                Complete Your Payment
              </h1>
              <p className="text-lg text-muted-foreground">
                {manualPaymentData.method === 'flutterwave'
                  ? 'Click the button below to complete your payment securely'
                  : 'Follow the instructions below to send your payment'}
              </p>
            </div>

            {/* Payment Method Info */}
            <div className="mb-8 rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">{selectedPaymentMethod?.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedPaymentMethod?.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {selectedPaymentMethod?.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-foreground">${manualPaymentData.amount} {manualPaymentData.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono text-sm text-foreground break-all">{manualPaymentData.orderRef}</span>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="mb-8 rounded-lg border-2 border-amber-500/30 bg-amber-500/5 p-6">
              <h3 className="font-bold text-foreground mb-4 text-lg">📋 Payment Instructions</h3>
              <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                {manualPaymentData.instructions}
              </p>

              {manualPaymentData.method === 'binance' && manualPaymentData.merchantId && (
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Merchant ID:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background rounded px-3 py-2 font-mono text-sm text-foreground break-all">
                      {manualPaymentData.merchantId}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(manualPaymentData.merchantId || '');
                      }}
                      className="px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {manualPaymentData.method === 'bybit' && manualPaymentData.walletAddress && (
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">TRC-20 Wallet Address:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background rounded px-3 py-2 font-mono text-sm text-foreground break-all">
                      {manualPaymentData.walletAddress}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(manualPaymentData.walletAddress || '');
                      }}
                      className="px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-background rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">⏱️ How long does it take?</p>
                <p className="text-muted-foreground">
                  {manualPaymentData.method === 'flutterwave'
                    ? 'Your payment is processed instantly'
                    : 'Payment confirmation typically takes 5-30 minutes'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 mt-8">
              {console.log('[Manual Payment] Method:', manualPaymentData.method, 'Expected: flutterwave')}

              {manualPaymentData.method === 'flutterwave' ? (
                <button
                  onClick={() => {
                    console.log('[Manual Payment] Clicked: I\'ve Paid via Flutterwave');
                    setStep("success");
                    setLoadingMessage('');
                  }}
                  className="w-full h-12 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg"
                >
                  ✅ I've Paid via Flutterwave
                </button>
              ) : manualPaymentData.method === 'binance' || manualPaymentData.method === 'bybit' ? (
                <button
                  onClick={() => {
                    console.log('[Manual Payment] Clicked: I\'ve Sent the Payment');
                    setStep("success");
                  }}
                  className="w-full h-12 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg"
                >
                  ✅ I've Sent the Payment
                </button>
              ) : (
                <div className="w-full p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 font-semibold">
                  ⚠️ Error: Unknown payment method: {manualPaymentData.method}
                </div>
              )}

              <button
                onClick={() => {
                  console.log('[Manual Payment] Clicked: Back to Payment Methods');
                  setStep("payment");
                  setSelectedPayment(null);
                  setManualPaymentData(null);
                }}
                className="w-full h-10 rounded-lg border-2 border-border text-foreground font-semibold hover:bg-card/50 transition-colors"
              >
                ← Back to Payment Methods
              </button>
            </div>

            <div className="mt-8 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                ℹ️ After payment is confirmed, your trading credentials will be available on your dashboard.
              </p>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                If you don't see the green "I've Paid" button above, please scroll down on this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "success") {
    const selectedPaymentMethod = PAYMENT_METHODS.find(
      (m) => m.id === selectedPayment
    );

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center px-4 py-20 md:py-32">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-8">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Check className="h-8 w-8 text-success" />
              </div>
            </div>

            <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
              Registration Complete!
            </h2>
            <p className="mb-6 text-center text-muted-foreground">
              Welcome to WFX TRADING SHOWDOWN, {formData.fullName}!
            </p>

            <div className="mb-8 space-y-4 rounded-lg border border-border bg-card/50 p-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{formData.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-medium text-foreground">{formData.country}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium text-foreground">
                  {selectedPaymentMethod?.name}
                </p>
              </div>
            </div>

            <div className="mb-8 rounded-lg border-2 border-amber-500/30 bg-amber-500/5 p-4">
              <p className="text-sm text-muted-foreground mb-2">Payment Status</p>
              <p className="text-2xl font-bold text-amber-600">Awaiting Admin Approval</p>
            </div>

            <p className="mb-6 text-center text-sm text-muted-foreground">
              Thank you for your payment! Your registration is now under review by our admin team.
              Once approved, your trading credentials will be displayed on your dashboard.
              We'll notify you via email when your account is approved.
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mb-3"
            >
              Go to Dashboard →
            </button>
            <button
              onClick={() => navigate("/leaderboard")}
              className="block w-full rounded-lg border border-border px-4 py-3 text-center text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment Methods Step
  if (step === "payment") {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <div className="flex items-center justify-center px-4 py-20 md:py-32">
          <div className="w-full max-w-2xl">
            {/* Page Title */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl md:text-5xl font-bold text-foreground">
                Choose Payment Method
              </h1>
              <p className="text-lg text-muted-foreground">
                {formData.country ? `Pay ${getCurrencyInfoForCountry(formData.country).display} ($15 USD) entry fee` : 'Select your country to see the entry fee in your local currency'}
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-4">
                ℹ️ Bank transfer payments are securely processed
              </p>
            </div>

            {/* Payment Methods */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {PAYMENT_METHODS.map((method) => {
                const currencyInfo = getCurrencyInfoForCountry(formData.country);
                return (
                <button
                  key={method.id}
                  onClick={() => handlePaymentSelect(method.id)}
                  className={`relative rounded-lg border-2 p-6 transition-all ${
                    selectedPayment === method.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="absolute top-3 right-3">
                    <div
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPayment === method.id
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {selectedPayment === method.id && (
                        <div className="h-3 w-3 bg-primary-foreground rounded-full" />
                      )}
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-4xl mb-3">{method.icon}</div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {method.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                    {formData.country && (
                      <p className="text-sm font-semibold text-primary mt-2">
                        {currencyInfo.display}
                      </p>
                    )}
                  </div>
                </button>
                );
              })}
            </div>

            {/* Selected Method Info */}
            {selectedPayment && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 mb-8">
                <p className="text-sm text-muted-foreground mb-2">Selected Payment Method</p>
                <p className="text-lg font-semibold text-foreground">
                  {PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.name}
                </p>
              </div>
            )}

            {/* Order Summary */}
            <div className="rounded-lg border border-border bg-card p-6 mb-8">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground mb-4">
                  Registration Summary
                </h3>
              </div>

              {(() => {
                const currencyInfo = getCurrencyInfoForCountry(formData.country);
                return (
                  <>
                    <div className="space-y-3 mb-4 pb-4 border-b border-border">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Competition Entry Fee (USD)
                        </span>
                        <span className="font-medium text-foreground">$15.00</span>
                      </div>
                      {formData.country && formData.country !== 'United States' && (
                        <div className="flex justify-between bg-primary/5 -mx-3 px-3 py-2 rounded">
                          <span className="text-muted-foreground">
                            Equivalent in {currencyInfo.code}
                          </span>
                          <span className="font-bold text-foreground">{currencyInfo.display}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax (0%)</span>
                        <span className="font-medium text-foreground">$0.00</span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-foreground">
                        Total (USD)
                      </span>
                      <span className="text-2xl font-bold text-primary">$15.00</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <form onSubmit={handlePaymentSubmit}>
                <button
                  type="submit"
                  disabled={!selectedPayment || isLoading}
                  className={`w-full h-12 rounded-lg text-base font-semibold transition-colors ${
                    selectedPayment && !isLoading
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      {loadingMessage || 'Processing payment...'}
                    </span>
                  ) : (
                    `Pay $15 with ${selectedPayment ? PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.name : "Selected Method"}`
                  )}
                </button>
              </form>

              <button
                onClick={() => {
                  setStep("form");
                  setSelectedPayment(null);
                }}
                className="w-full h-12 rounded-lg border-2 border-border text-base font-semibold text-foreground hover:bg-card/50 transition-colors"
              >
                Back to Form
              </button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              🔒 Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log('[Registration] 📝 Rendering form step. Current state:', { step, hasManualPaymentData: !!manualPaymentData, isLoading });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex items-center justify-center px-4 py-20 md:py-32">
        <div className="w-full max-w-2xl">
          {/* Page Title */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl md:text-5xl font-bold text-foreground">
              Join WFX TRADING SHOWDOWN
            </h1>
            <p className="text-lg text-muted-foreground">
              Register for the WFX TRADING SHOWDOWN and start trading with
              $1,000 demo capital.
            </p>
          </div>

          {/* Registration Form */}
          <div className="rounded-lg border border-border bg-card p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name *
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Country *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                    errors.country ? "border-destructive" : "border-input"
                  } text-foreground`}
                >
                  <option value="">Select your country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.country}
                  </p>
                )}
              </div>

              {/* Entry Fee Summary */}
              <div className="rounded-lg border border-border bg-card/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      WFX TRADING SHOWDOWN Entry Fee
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Entry fee: {(() => {
                        const currencyInfo = getCurrencyInfoForCountry(formData.country);
                        return formData.country ? `${currencyInfo.display} ($15 USD)` : '$15 USD'
                      })()} - Includes $1,000 demo trading capital
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">USD</div>
                    <p className="text-3xl font-bold text-primary">$15</p>
                    {formData.country && formData.country !== 'United States' && (
                      <p className="text-sm font-semibold text-primary mt-2">
                        {getCurrencyInfoForCountry(formData.country).display}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">One-time</p>
                  </div>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="rounded-lg border border-border bg-card/50 p-4">
                <p className="text-sm text-muted-foreground">
                  By registering, you agree to the WFX TRADING SHOWDOWN{" "}
                  <a href="/rules" className="text-primary hover:underline">
                    Rules & Terms
                  </a>
                  . You confirm that you are 18+ years old and will comply with all
                  competition regulations.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Processing...
                  </span>
                ) : (
                  "Continue to Payment →"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                🔒 Your payment information is secure and encrypted
              </p>
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border bg-card/30 p-4">
              <p className="font-semibold text-foreground mb-2">What You Get:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Pre-assigned JustMarkets demo account</li>
                <li>✓ $1,000 trading capital</li>
                <li>✓ 5-day trading period (Jan 5-10)</li>
                <li>✓ Real-time leaderboard tracking</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card/30 p-4">
              <p className="font-semibold text-foreground mb-2">Prizes:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>🥇 1st: $500 Cash</li>
                <li>🥈 2nd: $10,000 Prop Account</li>
                <li>🥉 3rd: $5,000 Prop Account</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
