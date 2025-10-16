import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

interface TimerBarProps {
  duration: number; // in seconds
  onTimeout?: () => void;
  isRunning?: boolean;
}

export function TimerBar({ duration, onTimeout, isRunning = true }: TimerBarProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onTimeout?.();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, onTimeout]);

  const percentage = (timeLeft / duration) * 100;
  const isWarning = timeLeft < duration * 0.3;
  const isCritical = timeLeft < duration * 0.15;

  const getBarColor = () => {
    if (isCritical) return "bg-wrong-answer";
    if (isWarning) return "bg-timer-warning";
    return "bg-gradient-to-r from-correct-answer to-neon-cyan";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isCritical ? 'text-wrong-answer animate-pulse' : 'text-muted-foreground'}`} />
          <span className="text-sm font-medium text-muted-foreground">Time Remaining</span>
        </div>
        <span className={`text-lg font-mono font-bold ${isCritical ? 'text-wrong-answer animate-pulse' : 'text-foreground'}`} data-testid="text-time-remaining">
          {Math.ceil(timeLeft)}s
        </span>
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-100 ${getBarColor()} ${isCritical ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
          data-testid="timer-progress-bar"
        />
      </div>
    </div>
  );
}
