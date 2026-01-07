// Mock trader data generator for leaderboard
// This generates realistic mock traders with Nigerian and international names
// David Johnson is guaranteed to finish first with the highest profits
// Profits update every 12 hours starting January 6, 2026
// David is placed at index 3 but with highest profit percentage (120-140%)
// so he naturally ranks #1 after sorting
// Really high profits showcase intense trading competition!

interface MockTrader {
  rank: number;
  id: string;
  username: string;
  email: string;
  startingBalance: number;
  currentBalance: number;
  profitPercentage: number;
  country: string;
}

// Mostly Nigerian names with some international mix
const NIGERIAN_FIRST_NAMES = [
  "Chukwu",
  "Zainab",
  "Okafor",
  "Amara",
  "Segun",
  "Chioma",
  "Ibrahim",
  "Tunde",
  "Ngozi",
  "Adeyemi",
  "Blessing",
  "Emeka",
  "Funke",
  "Kelvin",
  "Aisha",
  "Oluwatoyin",
  "Nnamdi",
  "Folake",
  "Kamil",
  "Fatima",
  "Adekunle",
  "Ifeoma",
  "Tobi",
  "Yusuf",
];

const NIGERIAN_LAST_NAMES = [
  "Okonkwo",
  "Adebayo",
  "Hassan",
  "Ekwueme",
  "Adeola",
  "Okafor",
  "Eze",
  "Oluwaseun",
  "Ibrahim",
  "Afolabi",
  "Chimdi",
  "Oyedepo",
  "Akinsanya",
  "Uzomah",
  "Mensah",
  "Okoro",
  "Adeleke",
  "Oparaugo",
  "Talabi",
  "Agbaje",
  "Ogundimu",
  "Ikechukwu",
  "Omotayo",
  "Abubakar",
];

const INTERNATIONAL_NAMES = [
  { first: "David", last: "Johnson" },
  { first: "Maria", last: "Santos" },
  { first: "Ahmed", last: "Khan" },
  { first: "Sophie", last: "Dubois" },
  { first: "Juan", last: "Martinez" },
  { first: "Lisa", last: "Mueller" },
  { first: "Raj", last: "Patel" },
  { first: "Anna", last: "Rossi" },
];

const COUNTRIES = [
  "Nigeria",
  "Nigeria",
  "Nigeria",
  "Nigeria",
  "Nigeria",
  "Nigeria", // Mostly Nigerian
  "United States",
  "Kenya",
  "Ghana",
  "South Africa",
];

// Seeded random number generator for consistency
function seededRandom(seed: number): () => number {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Generate a mock trader with realistic data
// David is included in the traders but not always first - he finishes with highest profits
// Trader names change every 12 hours along with profits
function generateMockTrader(index: number, seed: number, dailyMultiplier: number = 1): MockTrader {
  // Use seed for both name and profit generation - this ensures names change every 12 hours
  const random = seededRandom(seed + index);

  let firstName: string;
  let lastName: string;
  let country: string;
  let isDavid = false;

  // David is one of the 10 traders but not necessarily first
  // We'll give him the best profits so he naturally ranks first by profits
  if (index === 3) {
    // David will be at index 3, giving him a better profit than those before
    firstName = "David";
    lastName = "Johnson";
    country = "United States";
    isDavid = true;
  } else if (index < 6 || index === 3) {
    // Positions with good mix, mostly Nigerian
    if (random() > 0.3) {
      firstName =
        NIGERIAN_FIRST_NAMES[
          Math.floor(random() * NIGERIAN_FIRST_NAMES.length)
        ];
      lastName =
        NIGERIAN_LAST_NAMES[Math.floor(random() * NIGERIAN_LAST_NAMES.length)];
      country = "Nigeria";
    } else {
      const intName =
        INTERNATIONAL_NAMES[Math.floor(random() * INTERNATIONAL_NAMES.length)];
      firstName = intName.first;
      lastName = intName.last;
      country = COUNTRIES[Math.floor(random() * COUNTRIES.length)];
    }
  } else {
    // Positions 7-10: Mix of countries
    if (random() > 0.5) {
      firstName =
        NIGERIAN_FIRST_NAMES[
          Math.floor(random() * NIGERIAN_FIRST_NAMES.length)
        ];
      lastName =
        NIGERIAN_LAST_NAMES[Math.floor(random() * NIGERIAN_LAST_NAMES.length)];
      country = "Nigeria";
    } else {
      const intName =
        INTERNATIONAL_NAMES[Math.floor(random() * INTERNATIONAL_NAMES.length)];
      firstName = intName.first;
      lastName = intName.last;
      country = COUNTRIES[Math.floor(random() * COUNTRIES.length)];
    }
  }

  const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
  const email = `${username}@example.com`;

  // Extraordinary profits - massive market winning performances
  // David has the BEST profits so he finishes first
  // All traders show exceptional gains with realistic variation
  // Profits increase 300% daily (3x multiplier per day) with realistic spacing between traders
  // Each trader has unique profit ranges to avoid suspicious clustering
  let profitPercentage: number;
  if (isDavid) {
    // David: 1400-1480% base (clear dominant lead)
    const baseProfit = 1400 + random() * 80;
    profitPercentage = baseProfit * dailyMultiplier + (random() - 0.5) * 200;
  } else if (index === 0) {
    // Rank 2: 1050-1130% base (~250-350 point gap from David)
    const baseProfit = 1050 + random() * 80;
    profitPercentage = baseProfit * dailyMultiplier + (random() - 0.5) * 200;
  } else if (index === 1) {
    // Rank 3: 920-980% base (~150-210 point gap from rank 2)
    const baseProfit = 920 + random() * 60;
    profitPercentage = baseProfit * dailyMultiplier + (random() - 0.5) * 150;
  } else if (index === 2) {
    // Rank 4: 800-850% base (~100-180 point gap)
    const baseProfit = 800 + random() * 50;
    profitPercentage = baseProfit * dailyMultiplier + (random() - 0.5) * 150;
  } else if (index === 4) {
    // Rank 5: 700-750% base (~70-150 point gap)
    const baseProfit = 700 + random() * 50;
    profitPercentage = baseProfit * dailyMultiplier + (random() - 0.5) * 120;
  } else if (index === 5) {
    // Rank 6: 620-670% base (~50-130 point gap)
    const baseProfit = 620 + random() * 50;
    profitPercentage = baseProfit * dailyMultiplier + (random() - 0.5) * 120;
  } else if (index === 6) {
    // Rank 7: 555-600% base (~40-115 point gap)
    const baseProfit = 555 + random() * 45;
    profitPercentage = baseProfit * dailyMultiplier + (random() - 0.5) * 100;
  } else if (index === 7) {
    // Rank 8: 495-540% base (~40-105 point gap)
    const baseProfit = 495 + random() * 45;
    profitPercentage = baseProfit * dailyMultiplier + (random() - 0.5) * 100;
  } else if (index === 8) {
    // Rank 9: 440-480% base (~35-100 point gap)
    const baseProfit = 440 + random() * 40;
    profitPercentage = baseProfit * dailyMultiplier + (random() - 0.5) * 80;
  } else {
    // Rank 10: 390-425% base (~30-90 point gap)
    const baseProfit = 390 + random() * 35;
    profitPercentage = baseProfit * dailyMultiplier + (random() - 0.5) * 80;
  }

  const startingBalance = 1000;
  const currentBalance = startingBalance * (1 + profitPercentage / 100);

  return {
    rank: index + 1,
    id: `mock_trader_${index}`,
    username,
    email,
    startingBalance,
    currentBalance,
    profitPercentage,
    country,
  };
}

// Cache for current mock traders to maintain consistency
let cachedMockTraders: MockTrader[] | null = null;
let lastGeneratedTime = 0;
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours cache

// Generate all mock traders
function generateAllMockTraders(): MockTrader[] {
  const now = Date.now();

  // Use cache if still valid
  if (cachedMockTraders && now - lastGeneratedTime < CACHE_DURATION) {
    return cachedMockTraders;
  }

  // Generate fresh mock traders
  const traders: MockTrader[] = [];
  // Use current time as base seed for dynamic updates
  // Changes every 12 hours
  const baseSeed = Math.floor(now / (12 * 60 * 60 * 1000)) * 1000;

  // Competition start date
  const competitionStartDate = new Date(2026, 0, 6).getTime();

  // Calculate how many days have passed since competition start
  const daysPassed = Math.floor((now - competitionStartDate) / (24 * 60 * 60 * 1000));

  // Daily profit multiplier: profits increase by 300% daily (3x per day)
  // Day 0: 1x, Day 1: 3x, Day 2: 9x, Day 3: 27x, etc.
  const dailyMultiplier = Math.pow(3, Math.max(0, daysPassed));

  for (let i = 0; i < 10; i++) {
    traders.push(generateMockTrader(i, baseSeed, dailyMultiplier));
  }

  // Sort by profit percentage (descending)
  // David will naturally rank first due to having the highest profits
  traders.sort((a, b) => b.profitPercentage - a.profitPercentage);

  // Update ranks after sorting and regenerate names based on current 12-hour period
  // This ensures names change every 12 hours along with profits
  const currentPeriod = Math.floor(now / (12 * 60 * 60 * 1000));
  traders.forEach((trader, index) => {
    trader.rank = index + 1;

    // For non-David traders, add period rotation to name to ensure it changes
    // David stays as David (he's the consistent top trader)
    if (trader.username !== "david_johnson") {
      const periodSuffix = currentPeriod % 3; // Cycle through different name variations
      if (periodSuffix > 0) {
        // Slight variation to indicate this is a different 12-hour period
        // The seeded random already handles this, but this makes it explicit
        console.log(`[Leaderboard] Trader names updated for period ${currentPeriod}`);
      }
    }
  });

  cachedMockTraders = traders;
  lastGeneratedTime = now;

  return traders;
}

// Dynamically update profits slightly for realistic market movement
function updateProfileWithMarketMovement(
  trader: MockTrader,
  volatility: number = 0.5,
): MockTrader {
  const random = Math.random();
  // Small random changes to profit (-volatility to +volatility)
  const change = (random - 0.5) * volatility;
  const updatedProfit = Math.max(
    -90,
    Math.min(100, trader.profitPercentage + change),
  );

  return {
    ...trader,
    profitPercentage: updatedProfit,
    currentBalance: trader.startingBalance * (1 + updatedProfit / 100),
  };
}

export function getMockLeaderboard(): MockTrader[] {
  // Check if current date is before Tuesday, January 6th, 2026
  const competitionStartDate = new Date(2026, 0, 6); // January 6, 2026
  const now = new Date();

  if (now < competitionStartDate) {
    // Leaderboard is not yet active
    console.log(
      "[Leaderboard] Competition has not started yet. Available from:",
      competitionStartDate.toLocaleDateString(),
    );
    return [];
  }

  const traders = generateAllMockTraders();

  // Return traders as-is with no additional volatility
  // Profits are stable for 12-hour periods
  return traders;
}

export function getMockTraderCount(): number {
  return 205; // Fixed at 205 registered members from Jan 6
}

export function isMockDataMode(): boolean {
  // Return true to use mock data
  return true;
}

export function getMockLeaderboardWithCacheTime(): {
  traders: MockTrader[];
  cacheTime: Date;
} {
  return {
    traders: getMockLeaderboard(),
    cacheTime: new Date(),
  };
}
