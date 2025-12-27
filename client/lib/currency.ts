// Currency conversion data - maps countries to their currency info
// Exchange rates are approximate and for display purposes
// Format: exchanges rates are relative to USD (1 USD = X local currency)

const CURRENCY_MAP: Record<string, { code: string; symbol: string; rate: number }> = {
  // African Countries
  "Nigeria": { code: "NGN", symbol: "₦", rate: 1650 },
  "Ghana": { code: "GHS", symbol: "₵", rate: 15.5 },
  "Kenya": { code: "KES", symbol: "KSh", rate: 130 },
  "South Africa": { code: "ZAR", symbol: "R", rate: 18.5 },
  "Egypt": { code: "EGP", symbol: "E£", rate: 50 },
  "Ethiopia": { code: "ETB", symbol: "Br", rate: 56 },
  "Tanzania": { code: "TZS", symbol: "TSh", rate: 2600 },
  "Uganda": { code: "UGX", symbol: "USh", rate: 3900 },
  "Cameroon": { code: "XAF", symbol: "Fr", rate: 590 },
  "Senegal": { code: "XOF", symbol: "Fr", rate: 590 },
  "Ivory Coast": { code: "XOF", symbol: "Fr", rate: 590 },
  "Morocco": { code: "MAD", symbol: "د.م.", rate: 10 },
  "Tunisia": { code: "TND", symbol: "د.ت", rate: 3.1 },

  // Asian Countries
  "India": { code: "INR", symbol: "₹", rate: 83 },
  "Pakistan": { code: "PKR", symbol: "₨", rate: 280 },
  "Bangladesh": { code: "BDT", symbol: "৳", rate: 105 },
  "Philippines": { code: "PHP", symbol: "₱", rate: 56 },
  "Indonesia": { code: "IDR", symbol: "Rp", rate: 16000 },
  "Vietnam": { code: "VND", symbol: "₫", rate: 25000 },
  "Thailand": { code: "THB", symbol: "฿", rate: 35 },
  "Malaysia": { code: "MYR", symbol: "RM", rate: 4.7 },
  "Singapore": { code: "SGD", symbol: "S$", rate: 1.35 },
  "Hong Kong": { code: "HKD", symbol: "HK$", rate: 7.8 },
  "China": { code: "CNY", symbol: "¥", rate: 7.2 },
  "Japan": { code: "JPY", symbol: "¥", rate: 145 },
  "South Korea": { code: "KRW", symbol: "₩", rate: 1300 },
  "United Arab Emirates": { code: "AED", symbol: "د.إ", rate: 3.67 },
  "Saudi Arabia": { code: "SAR", symbol: "﷼", rate: 3.75 },
  "Israel": { code: "ILS", symbol: "₪", rate: 3.7 },

  // European Countries
  "United Kingdom": { code: "GBP", symbol: "£", rate: 0.79 },
  "Germany": { code: "EUR", symbol: "€", rate: 0.92 },
  "France": { code: "EUR", symbol: "€", rate: 0.92 },
  "Italy": { code: "EUR", symbol: "€", rate: 0.92 },
  "Spain": { code: "EUR", symbol: "€", rate: 0.92 },
  "Netherlands": { code: "EUR", symbol: "€", rate: 0.92 },
  "Belgium": { code: "EUR", symbol: "€", rate: 0.92 },
  "Austria": { code: "EUR", symbol: "€", rate: 0.92 },
  "Poland": { code: "PLN", symbol: "zł", rate: 3.95 },
  "Czech Republic": { code: "CZK", symbol: "Kč", rate: 23 },
  "Hungary": { code: "HUF", symbol: "Ft", rate: 365 },
  "Romania": { code: "RON", symbol: "lei", rate: 4.6 },
  "Greece": { code: "EUR", symbol: "€", rate: 0.92 },
  "Portugal": { code: "EUR", symbol: "€", rate: 0.92 },
  "Switzerland": { code: "CHF", symbol: "CHF", rate: 0.88 },
  "Norway": { code: "NOK", symbol: "kr", rate: 10.5 },
  "Sweden": { code: "SEK", symbol: "kr", rate: 10.5 },
  "Denmark": { code: "DKK", symbol: "kr", rate: 6.8 },
  "Finland": { code: "EUR", symbol: "€", rate: 0.92 },
  "Iceland": { code: "ISK", symbol: "kr", rate: 138 },
  "Russia": { code: "RUB", symbol: "₽", rate: 105 },
  "Ukraine": { code: "UAH", symbol: "₴", rate: 42 },
  "Turkey": { code: "TRY", symbol: "₺", rate: 34 },

  // Americas
  "United States": { code: "USD", symbol: "$", rate: 1 },
  "Canada": { code: "CAD", symbol: "C$", rate: 1.36 },
  "Mexico": { code: "MXN", symbol: "$", rate: 17 },
  "Brazil": { code: "BRL", symbol: "R$", rate: 5 },
  "Argentina": { code: "ARS", symbol: "$", rate: 1050 },
  "Colombia": { code: "COP", symbol: "$", rate: 4100 },
  "Chile": { code: "CLP", symbol: "$", rate: 920 },
  "Peru": { code: "PEN", symbol: "S/", rate: 3.7 },
  "Ecuador": { code: "USD", symbol: "$", rate: 1 },
  "Venezuela": { code: "VES", symbol: "Bs", rate: 38 },

  // Oceania
  "Australia": { code: "AUD", symbol: "A$", rate: 1.52 },
  "New Zealand": { code: "NZD", symbol: "NZ$", rate: 1.68 },
  "Fiji": { code: "FJD", symbol: "FJ$", rate: 2.2 },
};

interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number;
  amount: number; // calculated amount in local currency
  display: string; // formatted display string
}

export function getCurrencyInfoForCountry(country: string): CurrencyInfo {
  const currencyData = CURRENCY_MAP[country] || CURRENCY_MAP["United States"];
  const amount = 15 * currencyData.rate; // $15 USD

  return {
    ...currencyData,
    amount: amount,
    display: `${currencyData.symbol}${amount.toFixed(2)}`,
  };
}

export function formatCurrencyAmount(
  amount: number,
  country: string,
  decimals: number = 2
): string {
  const currencyData = CURRENCY_MAP[country] || CURRENCY_MAP["United States"];
  const convertedAmount = amount * currencyData.rate;
  return `${currencyData.symbol}${convertedAmount.toFixed(decimals)}`;
}

export function getAllCurrencies(): Record<string, CurrencyInfo> {
  const result: Record<string, CurrencyInfo> = {};
  
  for (const [country, data] of Object.entries(CURRENCY_MAP)) {
    const amount = 15 * data.rate;
    result[country] = {
      ...data,
      amount: amount,
      display: `${data.symbol}${amount.toFixed(2)}`,
    };
  }

  return result;
}

export function getCountryCurrency(country: string): string {
  return CURRENCY_MAP[country]?.code || "USD";
}

export function getCurrencySymbol(country: string): string {
  return CURRENCY_MAP[country]?.symbol || "$";
}
