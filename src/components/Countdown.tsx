"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface CountdownProps {
  targetDate: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<null | {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>(null);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      const now = Date.now();
      const eventTime = new Date(targetDate).getTime();
      const difference = eventTime - now;

      if (difference <= 0) return null;

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // ✅ Prevent hydration mismatch
  if (!mounted) return null;

  if (!timeLeft) {
    return (
      <span className="text-green-500 font-bold text-lg sm:text-2xl">
        🎉 Event is Live!
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
              <div >
          <Link href="/register">
            <button
              // onClick={handleClick}
              className="
                mt-6 sm:mt-8
                bg-green-500 text-white font-semibold
                text-base sm:text-lg md:text-xl lg:text-2xl
                py-3 px-6 sm:py-4 sm:px-8 md:py-5 md:px-10
                w-full sm:w-auto
                rounded-lg shadow-lg
                hover:shadow-green-600/50
                transition
              "
            >
              Register
            </button>
          </Link>
          </div>
      <h1 className="text-gray-600 text-xl sm:text-2xl font-semibold">
        Camp Meeting Countdown
      </h1>

      <div className="flex gap-4 sm:gap-6">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div
            key={unit}
            className="bg-white/90 rounded-xl shadow-md px-4 py-3 text-center"
          >
            <div className="text-xl sm:text-3xl font-bold">{value}</div>
            <div className="text-xs uppercase text-gray-500">{unit}</div>
          </div>
        ))}
      </div>

      {/* ✅ Locale-safe rendering */}
      <p className="text-gray-500 text-sm mt-2">
        Arrival Date:
        <span className="font-semibold">
          {" "}
          {new Date(targetDate).toUTCString()}
        </span>
      </p>
    </div>
  );
};

export default Countdown;
