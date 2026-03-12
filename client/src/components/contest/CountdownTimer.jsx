import React, { useEffect, useState } from "react";

export default function CountdownTimer({ endTime }) {
  const [left, setLeft] = useState({ h: 0, m: 0, s: 0 });
  const [totalMs, setTotalMs] = useState(0);
  const [initialMs, setInitialMs] = useState(0);

  // Calculate remaining time helper to prevent initial 1-second delay
  const calculateTimeLeft = (ms) => ({
    h: Math.floor(ms / (1000 * 60 * 60)),
    m: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
    s: Math.floor((ms % 60000) / 1000),
  });

  useEffect(() => {
    const end = new Date(endTime).getTime();
    const total = end - new Date().getTime();
    const startingMs = Math.max(0, total);
    
    setInitialMs(startingMs);
    setTotalMs(startingMs);
    setLeft(calculateTimeLeft(startingMs));
  }, [endTime]);

  useEffect(() => {
    if (totalMs <= 0) return;
    const t = setInterval(() => {
      const end = new Date(endTime).getTime();
      const ms = Math.max(0, end - new Date().getTime());
      setTotalMs(ms);
      setLeft(calculateTimeLeft(ms));
    }, 1000);
    return () => clearInterval(t);
  }, [endTime, totalMs]);

  // SVG and Progress Calculations
  const pct = initialMs > 0 ? (totalMs / initialMs) * 100 : 0;
  
  const size = 144; // Matches Tailwind's w-36 (36 * 4px = 144px)
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Offset decreases as percentage decreases, revealing the background
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="bg-card-dark border border-white/5 rounded-lg p-5 w-fit">
      <h3 className="text-slate-400 text-sm font-medium mb-3 text-center">REMAINING TIME</h3>
      
      <div className="flex flex-col items-center">
        {/* Relative container to stack SVG and text */}
        <div className="relative flex items-center justify-center w-36 h-36">
          
          {/* Circular SVG */}
          <svg
            className="absolute inset-0 transform -rotate-90"
            width={size}
            height={size}
          >
            {/* Background Track Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(250, 204, 21, 0.2)" /* Tailwind yellow-400/20 */
              strokeWidth={strokeWidth}
            />
            
            {/* Dynamic Progress Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#facc15" /* Tailwind yellow-400 */
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Center Text overlay */}
          <div className="relative flex flex-col items-center">
            <div className="text-2xl font-bold text-white tabular-nums">
              {String(left.h).padStart(2, "0")}:{String(left.m).padStart(2, "0")}:{String(left.s).padStart(2, "0")}
            </div>
            <div className="text-[10px] tracking-widest text-slate-500 mt-1">
              HOURS : MIN : SEC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}