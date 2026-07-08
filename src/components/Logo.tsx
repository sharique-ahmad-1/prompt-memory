import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  withGlow?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 28, withGlow = true }) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {withGlow && (
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none" />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="pm-grad-primary" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="0.5" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#D946EF" />
          </linearGradient>
          <linearGradient id="pm-grad-accent" x1="30" y1="2" x2="2" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        
        {/* Background rounded container / neural plate */}
        <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#pm-grad-primary)" fillOpacity="0.15" stroke="url(#pm-grad-primary)" strokeWidth="1.5" />
        
        {/* Glowing memory pathways (Abstract 'M' / Neural Node) */}
        <path
          d="M8 22V12C8 10.3431 9.34315 9 11 9C12.6569 9 14 10.3431 14 12V18L16 15L18 18V12C18 10.3431 19.3431 9 21 9C22.6569 9 24 10.3431 24 12V22"
          stroke="url(#pm-grad-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Prompt Neural Core / Pulse dot */}
        <circle cx="16" cy="11" r="2.5" fill="url(#pm-grad-accent)" />
        <circle cx="8" cy="22" r="1.5" fill="#A855F7" />
        <circle cx="24" cy="22" r="1.5" fill="#6366F1" />
      </svg>
    </div>
  );
};
