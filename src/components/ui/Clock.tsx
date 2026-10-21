import React, { useState, useEffect } from 'react';

export interface ClockProps {
  className?: string;
  showLocationPrefix?: boolean; // Default true: "Thanjavur, India — "
  showStatusDot?: boolean;      // Default true: pulsing pink dot
}

/**
 * Live Ticking Thanjavur Studio Clock
 * Timezone: Asia/Kolkata (IST, UTC+05:30)
 * Format: "Thanjavur, India — [HH:MM:SS IST]"
 * Features:
 * - 1-second interval with unmount cleanup
 * - SSR hydration safety pattern (initial placeholder --:--:-- IST prevents markup mismatch)
 * - visibilitychange event listener for instantaneous tab resync
 * - tabular-nums for jitter-free mono alignment
 */
export const Clock: React.FC<ClockProps> = ({
  className = '',
  showLocationPrefix = true,
  showStatusDot = true,
}) => {
  const [timeString, setTimeString] = useState<string>('--:--:-- IST');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const updateClock = () => {
      try {
        const now = new Date();
        const formatted = formatter.format(now);
        setTimeString(`${formatted} IST`);
      } catch (err) {
        // Fallback for unexpected date formatting issues
        const now = new Date();
        setTimeString(`${now.toTimeString().slice(0, 8)} IST`);
      }
    };

    // Immediate tick upon mount
    updateClock();

    // 1-second interval (1000ms)
    const intervalId = window.setInterval(updateClock, 1000);

    // Resync immediately when tab becomes visible after background throttling
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateClock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Unmount cleanup
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-2.5 font-mono text-xs tracking-wider text-[#1a1a1a]/80 select-none ${className}`}
      role="timer"
      aria-live="off"
      aria-label="Current studio time in Thanjavur, India"
    >
      {showStatusDot && (
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fc4778] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fc4778]" />
        </span>
      )}
      {showLocationPrefix && (
        <span className="font-semibold tracking-normal text-[#1a1a1a]">
          Thanjavur, India
        </span>
      )}
      {showLocationPrefix && (
        <span className="text-[#1a1a1a]/30" aria-hidden="true">—</span>
      )}
      <span className="tabular-nums font-medium text-[#1a1a1a]">
        {mounted ? `[${timeString}]` : '[--:--:-- IST]'}
      </span>
    </div>
  );
};
