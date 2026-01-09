import React from 'react'

/**
 * HIDC Logo - Modern 2D safety-focused design
 * Represents: Shield (protection) + Data chart (analytics) + Checkmark (verification)
 */
const Logo = ({ size = 'default', showText = true, className = '' }) => {
  const sizes = {
    small: { icon: 32, text: 'text-sm' },
    default: { icon: 40, text: 'text-base' },
    large: { icon: 56, text: 'text-xl' },
  }

  const { icon: iconSize, text: textSize } = sizes[size] || sizes.default

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div
        className="relative flex-shrink-0"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-label="HIDC Logo"
        >
          {/* Background shield shape */}
          <defs>
            <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3478f6" />
              <stop offset="50%" stopColor="#1e5aeb" />
              <stop offset="100%" stopColor="#1646d8" />
            </linearGradient>
            <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15"/>
            </filter>
          </defs>

          {/* Shield base */}
          <path
            d="M24 4L6 12v12c0 11 8 18 18 22 10-4 18-11 18-22V12L24 4z"
            fill="url(#shieldGradient)"
            filter="url(#shadowFilter)"
          />

          {/* Inner shield highlight */}
          <path
            d="M24 8L10 14v10c0 9 6 14 14 18V8z"
            fill="white"
            fillOpacity="0.1"
          />

          {/* Data bars (representing analytics) */}
          <rect x="14" y="26" width="4" height="10" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="22" y="22" width="4" height="14" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="30" y="18" width="4" height="18" rx="1" fill="white" fillOpacity="0.9" />

          {/* Checkmark circle (verification) */}
          <circle cx="32" cy="16" r="8" fill="url(#accentGradient)" />
          <path
            d="M28 16l2.5 2.5L35 14"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-surface-800 ${textSize} leading-tight tracking-wide`}>
            HIDC
          </span>
          <span className="text-[10px] text-surface-500 leading-tight max-w-[200px]">
            Hazard Identification & Data Control
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo
