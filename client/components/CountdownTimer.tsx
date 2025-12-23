import { useState, useEffect } from "react";

interface TimeUnit {
  label: string;
  value: number;
}

export default function CountdownTimer() {
  const [timeUnits, setTimeUnits] = useState<TimeUnit[]>([
    { label: "Days", value: 0 },
    { label: "Hours", value: 0 },
    { label: "Minutes", value: 0 },
    { label: "Seconds", value: 0 },
  ]);

  useEffect(() => {
    const updateCountdown = () => {
      // Competition starts on January 5, 2026
      const targetDate = new Date("2026-01-05T00:00:00").getTime();
      const now = new Date().getTime();
      const difference = Math.max(targetDate - now, 0);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeUnits([
        { label: "Days", value: days },
        { label: "Hours", value: hours },
        { label: "Minutes", value: minutes },
        { label: "Seconds", value: seconds },
      ]);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center gap-4 md:gap-8">
      {timeUnits.map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="relative mb-2">
            <div className="h-16 md:h-20 w-14 md:w-16 rounded-lg bg-card border-2 border-primary flex items-center justify-center">
              <span className="text-3xl md:text-4xl font-bold text-primary animate-countdown-pulse">
                {String(unit.value).padStart(2, "0")}
              </span>
            </div>
          </div>
          <p className="text-xs md:text-sm font-medium text-muted-foreground">
            {unit.label}
          </p>
        </div>
      ))}
    </div>
  );
}
