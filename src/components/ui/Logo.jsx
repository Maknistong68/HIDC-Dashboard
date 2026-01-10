import React from 'react'

/**
 * HIDC Logo - Oxagon-inspired hexagonal design with flowing curves
 * Represents: Innovation + Data flow + Modern analytics
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
          <defs>
            {/* Main gradient - blue tones */}
            <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3478f6" />
              <stop offset="50%" stopColor="#1e5aeb" />
              <stop offset="100%" stopColor="#1646d8" />
            </linearGradient>
            {/* Wave gradient - lighter blue/teal */}
            <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5b9cf7" />
              <stop offset="100%" stopColor="#3478f6" />
            </linearGradient>
            <linearGradient id="waveGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7db4f8" />
              <stop offset="100%" stopColor="#5b9cf7" />
            </linearGradient>
            <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15"/>
            </filter>
            {/* Clip path for rounded hexagon shape */}
            <clipPath id="hexClip">
              <path d="M24 4C25 4 26 4.3 26.8 4.8L39.2 12.2C40.8 13.2 41.8 14.8 41.8 16.6V31.4C41.8 33.2 40.8 34.8 39.2 35.8L26.8 43.2C25.2 44.2 23.2 44.2 21.6 43.2L9.2 35.8C7.6 34.8 6.6 33.2 6.6 31.4V16.6C6.6 14.8 7.6 13.2 9.2 12.2L21.6 4.8C22.4 4.3 23.4 4 24 4Z" />
            </clipPath>
          </defs>

          {/* Rounded hexagonal base */}
          <path
            d="M24 4C25 4 26 4.3 26.8 4.8L39.2 12.2C40.8 13.2 41.8 14.8 41.8 16.6V31.4C41.8 33.2 40.8 34.8 39.2 35.8L26.8 43.2C25.2 44.2 23.2 44.2 21.6 43.2L9.2 35.8C7.6 34.8 6.6 33.2 6.6 31.4V16.6C6.6 14.8 7.6 13.2 9.2 12.2L21.6 4.8C22.4 4.3 23.4 4 24 4Z"
            fill="url(#hexGradient)"
            filter="url(#shadowFilter)"
          />

          {/* Inner hexagon highlight */}
          <path
            d="M24 7C24.8 7 25.5 7.2 26.1 7.6L36.5 13.8C37.7 14.5 38.5 15.8 38.5 17.2V30.8C38.5 32.2 37.7 33.5 36.5 34.2L26.1 40.4C24.9 41.1 23.5 41.1 22.3 40.4L11.9 34.2C10.7 33.5 9.9 32.2 9.9 30.8V17.2C9.9 15.8 10.7 14.5 11.9 13.8L22.3 7.6C22.9 7.2 23.6 7 24 7Z"
            fill="white"
            fillOpacity="0.08"
          />

          {/* Flowing wave curves inside hexagon */}
          <g clipPath="url(#hexClip)">
            {/* Wave 1 - top flowing curve */}
            <path
              d="M4 18C12 12 20 20 28 14C36 8 44 16 50 10"
              stroke="url(#waveGradient2)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            {/* Wave 2 - middle flowing curve */}
            <path
              d="M-2 26C8 20 16 30 26 22C36 14 44 26 52 20"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              opacity="0.35"
            />
          </g>

          {/* Data bars (analytics) */}
          <rect x="15" y="28" width="5" height="12" rx="1.5" fill="white" fillOpacity="0.9" />
          <rect x="22" y="24" width="5" height="16" rx="1.5" fill="white" fillOpacity="0.9" />
          <rect x="29" y="20" width="5" height="20" rx="1.5" fill="white" fillOpacity="0.9" />

          {/* Subtle edge highlight */}
          <path
            d="M24 4C25 4 26 4.3 26.8 4.8L39.2 12.2C40.8 13.2 41.8 14.8 41.8 16.6V31.4C41.8 33.2 40.8 34.8 39.2 35.8L26.8 43.2C25.2 44.2 23.2 44.2 21.6 43.2L9.2 35.8C7.6 34.8 6.6 33.2 6.6 31.4V16.6C6.6 14.8 7.6 13.2 9.2 12.2L21.6 4.8C22.4 4.3 23.4 4 24 4Z"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            strokeOpacity="0.3"
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
