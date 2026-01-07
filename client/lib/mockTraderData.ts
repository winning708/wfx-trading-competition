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
function generateMockTrader(index: number, seed: number, dailyMultiplier: number = 1): MockTrader {
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
  let profitPercentage: number;
  if (isDavid) {
    // David: 1320-1380% base (top tier), grows 300% daily
    // Wider gap from others (400-500 point difference)
    const baseProfit = 1320 + random() * 60;
    profitPercentage = baseProfit * dailyMultiplier + (random() - 0.5) * 200;
  } else if (index === 0 || index === 1) {
    // Top traders: 950-1050% base (clear gap from David)
    // ~250-350 point gap
    const baseProfit = 950 + random() * 100;
    profitPercentage = baseProfit * dailyMultiplier + (random() - 0.5) * 250;
  } else if (index === 2 || index === 4) {
    // High performers: 800-880% base (150-200 point gap)
    const baseProfit = 800 + random() * 80;
    profitPercentage = baseProfit * dailyMultiplier + (random() - 0.5) * 200;
  } else if (index === 5 || index === 6) {
    // Solid performers: 700-750% base (100-150 point gap)
    const baseProfit = 700 + random() * 50;
    profitPercentage = baseProfit * dailyMultiplier + (random() - 0.5) * 150;
  } else if (index === 7 || index === 8) {
    // Consistent gainers: 600-650% base (80-120 point gap)
    const baseProfit = 600 + random() * 50;
    profitPercentage = baseProfit * dailyMultiplier + (random() - 0.5) * 150;
  } else {
    // Position 9 (will be replaced with ALLISON at pos 10): 550-600% base
    const baseProfit = 550 + random() * 50;
    profitPercentage = baseProfit * dailyMultiplier + (random() - 0.5) * 150;
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

  // Check if ALLISON ORUFA should be visible (within 12 hours of being added)
  const isAllisonVisible = (now - ALLISON_ORUFA_ADDED_TIME) < ALLISON_ORUFA_DISPLAY_DURATION;

  // Handle position 10: ALLISON for first 12 hours, then replace with mock trader
  let finalTraders = traders;

  if (isAllisonVisible) {
    // Replace the 10th trader (index 9) with ALLISON ORUFA
    // Using exact data from CSV: 10,ALLISON ORUFA,Trader 4,8958.39,797.9,122
    const allisonProfit = 797.9 * dailyMultiplier;
    const allisonTrader: MockTrader = {
      rank: 10,
      id: "allison_orufa_trader",
      username: "Trader 4",
      email: "allisonorufaxrp@gmail.com",
      startingBalance: 1000,
      currentBalance: 8958.39 * dailyMultiplier,
      profitPercentage: allisonProfit,
      country: "Nigeria",
    };
    // Replace the 10th position with ALLISON
    finalTraders = [...traders.slice(0, 9), allisonTrader];
  } else {
    // After 12 hours, the traders list already has a mock trader at position 10
    // Keep it as-is (the normal mock trader generation handles this)
    finalTraders = traders;
  }

  // Sort by profit percentage (descending)
  // David will naturally rank first due to having the highest profits
  finalTraders.sort((a, b) => b.profitPercentage - a.profitPercentage);

  // Update ranks after sorting
  finalTraders.forEach((trader, index) => {
    trader.rank = index + 1;
  });

  cachedMockTraders = finalTraders;
  lastGeneratedTime = now;

  return finalTraders;
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
