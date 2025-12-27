/**
 * Competition start date and utilities
 */

// Competition starts on January 5, 2026 at 00:00:00 UTC
const COMPETITION_START_DATE = new Date("2026-01-05T00:00:00Z");

/**
 * Check if the competition has started
 * @returns true if the current time is >= competition start time
 */
export function hasCompetitionStarted(): boolean {
  const now = new Date();
  return now >= COMPETITION_START_DATE;
}

/**
 * Get the competition start date
 * @returns The competition start date
 */
export function getCompetitionStartDate(): Date {
  return COMPETITION_START_DATE;
}

/**
 * Get the formatted competition start date string
 * @returns Formatted string like "January 5, 2026"
 */
export function getFormattedCompetitionStartDate(): string {
  return COMPETITION_START_DATE.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get time remaining until competition starts
 * @returns Object with days, hours, minutes, seconds
 */
export function getTimeUntilStart(): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} {
  const now = new Date().getTime();
  const difference = Math.max(COMPETITION_START_DATE.getTime() - now, 0);

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds: Math.floor(difference / 1000),
  };
}
