import { useEffect, useState } from "react";

interface FlipUnitProps {
  value: number;
  label: string;
}

const FlipUnit = ({ value, label }: FlipUnitProps) => {
  const formattedValue = String(value).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-20 md:w-20 md:h-24">
        <div className="absolute inset-0 bg-card border border-border rounded-lg shadow-md flex items-center justify-center transition-opacity duration-200">
          <span className="text-3xl md:text-4xl font-mono font-bold">
            {formattedValue}
          </span>
        </div>
      </div>
      <span className="text-xs md:text-sm text-muted-foreground font-light">
        {label}
      </span>
    </div>
  );
};

interface FlipClockProps {
  targetDate: Date;
}

export const FlipClock = ({ targetDate }: FlipClockProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setIsExpired(true);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className="text-2xl md:text-3xl font-light">
        오늘, 우리가 마주보는 시간
      </div>
    );
  }

  return (
    <div className="flex gap-2 md:gap-4">
      <FlipUnit value={timeLeft.days} label="일" />
      <span className="text-2xl md:text-3xl font-light self-start pt-6">:</span>
      <FlipUnit value={timeLeft.hours} label="시간" />
      <span className="text-2xl md:text-3xl font-light self-start pt-6">:</span>
      <FlipUnit value={timeLeft.minutes} label="분" />
      <span className="text-2xl md:text-3xl font-light self-start pt-6">:</span>
      <FlipUnit value={timeLeft.seconds} label="초" />
    </div>
  );
};
