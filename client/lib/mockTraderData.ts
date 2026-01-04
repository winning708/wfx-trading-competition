// Mock trader data generator for leaderboard
// This generates realistic mock traders with Nigerian and international names

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
  'Chukwu', 'Zainab', 'Okafor', 'Amara', 'Segun', 'Chioma', 'Ibrahim', 'Tunde',
  'Ngozi', 'Adeyemi', 'Blessing', 'Emeka', 'Funke', 'Kelvin', 'Aisha', 'Oluwatoyin',
  'Nnamdi', 'Folake', 'Kamil', 'Fatima', 'Adekunle', 'Ifeoma', 'Tobi', 'Yusuf'
];

const NIGERIAN_LAST_NAMES = [
  'Okonkwo', 'Adebayo', 'Hassan', 'Ekwueme', 'Adeola', 'Okafor', 'Eze', 'Oluwaseun',
  'Ibrahim', 'Afolabi', 'Chimdi', 'Oyedepo', 'Akinsanya', 'Uzomah', 'Mensah', 'Okoro',
  'Adeleke', 'Oparaugo', 'Talabi', 'Agbaje', 'Ogundimu', 'Ikechukwu', 'Omotayo', 'Abubakar'
];

const INTERNATIONAL_NAMES = [
  { first: 'David', last: 'Johnson' },
  { first: 'Maria', last: 'Santos' },
  { first: 'Ahmed', last: 'Khan' },
  { first: 'Sophie', last: 'Dubois' },
  { first: 'Juan', last: 'Martinez' },
  { first: 'Lisa', last: 'Mueller' },
  { first: 'Raj', last: 'Patel' },
  { first: 'Anna', last: 'Rossi' },
];

const COUNTRIES = [
  'Nigeria', 'Nigeria', 'Nigeria', 'Nigeria', 'Nigeria', 'Nigeria', // Mostly Nigerian
  'United States', 'Kenya', 'Ghana', 'South Africa'
];

// Seeded random number generator for consistency
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Generate a mock trader with realistic data
// David is included in the traders but not always first - he finishes with highest profits
function generateMockTrader(index: number, seed: number): MockTrader {
  const random = seededRandom(seed + index);

  let firstName: string;
  let lastName: string;
  let country: string;
  let isDavid = false;

  // David is one of the 10 traders but not necessarily first
  // We'll give him the best profits so he naturally ranks first by profits
  if (index === 3) {
    // David will be at index 3, giving him a better profit than those before
    firstName = 'David';
    lastName = 'Johnson';
    country = 'United States';
    isDavid = true;
  } else if (index < 6 || (index === 3)) {
    // Positions with good mix, mostly Nigerian
    if (random() > 0.3) {
      firstName = NIGERIAN_FIRST_NAMES[Math.floor(random() * NIGERIAN_FIRST_NAMES.length)];
      lastName = NIGERIAN_LAST_NAMES[Math.floor(random() * NIGERIAN_LAST_NAMES.length)];
      country = 'Nigeria';
    } else {
      const intName = INTERNATIONAL_NAMES[Math.floor(random() * INTERNATIONAL_NAMES.length)];
      firstName = intName.first;
      lastName = intName.last;
      country = COUNTRIES[Math.floor(random() * COUNTRIES.length)];
    }
  } else {
    // Positions 7-10: Mix of countries
    if (random() > 0.5) {
      firstName = NIGERIAN_FIRST_NAMES[Math.floor(random() * NIGERIAN_FIRST_NAMES.length)];
      lastName = NIGERIAN_LAST_NAMES[Math.floor(random() * NIGERIAN_LAST_NAMES.length)];
      country = 'Nigeria';
    } else {
      const intName = INTERNATIONAL_NAMES[Math.floor(random() * INTERNATIONAL_NAMES.length)];
      firstName = intName.first;
      lastName = intName.last;
      country = COUNTRIES[Math.floor(random() * COUNTRIES.length)];
    }
  }

  const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
  const email = `${username}@example.com`;

  // Realistic profit percentages
  // David has the BEST profits (50-60%) so he finishes first
  // Others have varying profits
  let profitPercentage: number;
  if (isDavid) {
    // David: 50-60% profit (highest - will finish first)
    profitPercentage = 50 + random() * 10;
  } else if (index === 0 || index === 1) {
    // First two: 35-42% profit
    profitPercentage = 35 + random() * 7;
  } else if (index === 2 || index === 4) {
    // Mid-high: 28-38% profit
    profitPercentage = 28 + random() * 10;
  } else if (index < 7) {
    // Mid: 18-28% profit
    profitPercentage = 18 + random() * 10;
  } else {
    // Lower: 8-18% profit
    profitPercentage = 8 + random() * 10;
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
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Generate all mock traders
function generateAllMockTraders(): MockTrader[] {
  const now = Date.now();
  
  // Use cache if still valid
  if (cachedMockTraders && (now - lastGeneratedTime) < CACHE_DURATION) {
    return cachedMockTraders;
  }

  // Generate fresh mock traders
  const traders: MockTrader[] = [];
  // Use current time as base seed for dynamic updates
  const baseSeed = Math.floor(now / 60000) * 1000; // Changes every minute
  
  for (let i = 0; i < 10; i++) {
    traders.push(generateMockTrader(i, baseSeed));
  }

  // Sort by profit percentage (descending)
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
function updateProfileWithMarketMovement(trader: MockTrader, volatility: number = 0.5): MockTrader {
  const random = Math.random();
  // Small random changes to profit (-volatility to +volatility)
  const change = (random - 0.5) * volatility;
  const updatedProfit = Math.max(-90, Math.min(100, trader.profitPercentage + change));
  
  return {
    ...trader,
    profitPercentage: updatedProfit,
    currentBalance: trader.startingBalance * (1 + updatedProfit / 100),
  };
}

export function getMockLeaderboard(): MockTrader[] {
  const traders = generateAllMockTraders();
  
  // Apply small market movements for realistic feel
  return traders.map(trader => 
    updateProfileWithMarketMovement(trader, 0.2)
  );
}

export function getMockTraderCount(): number {
  return 205; // Fixed at 205 registered members from Jan 6
}

export function isMockDataMode(): boolean {
  // Return true to use mock data
  return true;
}

export function getMockLeaderboardWithCacheTime(): { traders: MockTrader[]; cacheTime: Date } {
  return {
    traders: getMockLeaderboard(),
    cacheTime: new Date(),
  };
}
