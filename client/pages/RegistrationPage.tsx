import { useState } from "react";
import { Check } from "lucide-react";
import Header from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Credit/Debit Card (Visa, Mastercard, Amex)",
    icon: "💳",
    color: "from-blue-600 to-blue-700",
  },
  {
    id: "paystack",
    name: "Paystack",
    description: "African payments platform",
    icon: "🏦",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "flutterwave",
    name: "Flutterwave",
    description: "Cards, Mobile Money, Bank Transfer",
    icon: "💰",
    color: "from-red-500 to-orange-600",
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "PayPal Account or Cards",
    icon: "🔵",
    color: "from-blue-700 to-indigo-800",
  },
];

export default function RegistrationPage() {
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    country: "",
  });
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

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

    try {
      // Simulate form validation delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStep("payment");
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPayment(paymentId);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPayment) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Integrate with actual payment processor
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In production, redirect to payment processor
      console.log(
        `Processing payment with ${selectedPayment} for ${formData.email}`
      );

      setStep("success");
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
              Welcome to the WFX Trading Competition, {formData.fullName}!
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

            <div className="mb-8 rounded-lg border-2 border-success/30 bg-success/5 p-4">
              <p className="text-sm text-muted-foreground mb-2">Entry Fee Paid</p>
              <p className="text-2xl font-bold text-success">$15.00 USD</p>
            </div>

            <p className="mb-6 text-center text-sm text-muted-foreground">
              Your demo account will be activated shortly. You'll receive an email
              with your account details and trading instructions.
            </p>

            <a
              href="/"
              className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Back to Home
            </a>
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
                Select how you'd like to pay your $15 entry fee
              </p>
            </div>

            {/* Payment Methods */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {PAYMENT_METHODS.map((method) => (
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
                  </div>
                </button>
              ))}
            </div>

            {/* Order Summary */}
            <div className="rounded-lg border border-border bg-card p-6 mb-8">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground mb-4">
                  Registration Summary
                </h3>
              </div>

              <div className="space-y-3 mb-4 pb-4 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Competition Entry Fee
                  </span>
                  <span className="font-medium text-foreground">$15.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (0%)</span>
                  <span className="font-medium text-foreground">$0.00</span>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-lg font-semibold text-foreground">
                  Total
                </span>
                <span className="text-2xl font-bold text-primary">$15.00</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handlePaymentSubmit}
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
                    Processing...
                  </span>
                ) : (
                  `Pay $15 with ${selectedPayment ? PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.name : "Selected Method"}`
                )}
              </button>

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex items-center justify-center px-4 py-20 md:py-32">
        <div className="w-full max-w-2xl">
          {/* Page Title */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl md:text-5xl font-bold text-foreground">
              Join the Competition
            </h1>
            <p className="text-lg text-muted-foreground">
              Register for the WFX Trading Competition and start trading with
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
                      WFX Trading Competition Entry Fee
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Includes $1,000 demo trading capital
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">$15</p>
                    <p className="text-xs text-muted-foreground mt-1">One-time</p>
                  </div>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="rounded-lg border border-border bg-card/50 p-4">
                <p className="text-sm text-muted-foreground">
                  By registering, you agree to the WFX Trading Competition{" "}
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
