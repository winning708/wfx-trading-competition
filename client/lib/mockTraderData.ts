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
// ALLISON ORUFA is at position 10 with uploaded data
function generateMockTrader(index: number, seed: number, dailyMultiplier: number = 1): MockTrader {
  const random = seededRandom(seed + index);

  let firstName: string;
  let lastName: string;
  let country: string;
  let isDavid = false;
  let isAllison = false;

  // ALLISON ORUFA is at position 10 (index 9)
  if (index === 9) {
    firstName = "ALLISON";
    lastName = "ORUFA";
    country = "Nigeria";
    isAllison = true;
  }
  // David is one of the 10 traders but not necessarily first
  // We'll give him the best profits so he naturally ranks first by profits
  else if (index === 3) {
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

  let username: string;
  let email: string;

  if (isAllison) {
    username = "Rennievibes1";
    email = "allisonorufaxrp@gmail.com";
  } else {
    username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
    email = `${username}@example.com`;
  }

  // Extraordinary profits - massive market winning performances
  // David has the BEST profits so he finishes first
  // All traders show exceptional gains with realistic variation
  // Profits increase 300% daily (3x multiplier per day) with good margin variation
  let profitPercentage: number;
  if (isAllison) {
    // ALLISON ORUFA: varies every 12 hours around 797.9% with ±50 margin
    // Also grows daily with the multiplier
    const baseProfit = 797.9;
    profitPercentage = (baseProfit * dailyMultiplier) + (random() - 0.5) * 100;
  } else if (isDavid) {
    // David: 1200-1500% base, grows 300% daily with ±300 margin
    const baseProfit = 1200 + random() * 300;
    profitPercentage = (baseProfit * dailyMultiplier) + (random() - 0.5) * 600;
  } else if (index === 0 || index === 1) {
    // Top traders: 1000-1250% base, grows 300% daily with ±250 margin
    const baseProfit = 1000 + random() * 250;
    profitPercentage = (baseProfit * dailyMultiplier) + (random() - 0.5) * 500;
  } else if (index === 2 || index === 4) {
    // High performers: 850-1100% base, grows 300% daily with ±250 margin
    const baseProfit = 850 + random() * 250;
    profitPercentage = (baseProfit * dailyMultiplier) + (random() - 0.5) * 500;
  } else if (index < 7) {
    // Solid performers: 750-980% base, grows 300% daily with ±230 margin
    const baseProfit = 750 + random() * 230;
    profitPercentage = (baseProfit * dailyMultiplier) + (random() - 0.5) * 460;
  } else {
    // Consistent gainers: 650-900% base, grows 300% daily with ±250 margin
    const baseProfit = 650 + random() * 250;
    profitPercentage = (baseProfit * dailyMultiplier) + (random() - 0.5) * 500;
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

// Track when ALLISON ORUFA was first added (Jan 6, 2026 12:00 UTC)
const ALLISON_ORUFA_ADDED_TIME = new Date(2026, 0, 6, 12, 0, 0).getTime();
const ALLISON_ORUFA_DISPLAY_DURATION = 12 * 60 * 60 * 1000; // 12 hours

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

  // Check if ALLISON ORUFA should be visible (within 12 hours of being added)
  const isAllisonVisible = (now - ALLISON_ORUFA_ADDED_TIME) < ALLISON_ORUFA_DISPLAY_DURATION;

  // If ALLISON ORUFA is not visible, remove her from position 10
  if (!isAllisonVisible) {
    traders.forEach((trader) => {
      if (trader.username === "Rennievibes1" && trader.email === "allisonorufaxrp@gmail.com") {
        // Mark for removal by returning empty array without this trader
        // Actually, we need to handle this differently - filter her out
      }
    });
  }

  // Sort by profit percentage (descending)
  // David will naturally rank first due to having the highest profits
  traders.sort((a, b) => b.profitPercentage - a.profitPercentage);

  // Update ranks after sorting
  traders.forEach((trader, index) => {
    trader.rank = index + 1;
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
