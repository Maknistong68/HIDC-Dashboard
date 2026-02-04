import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLoading } from '../../context/LoadingContext'

const GlobalLoadingOverlay = () => {
  const { isLoading, progress, message } = useLoading()
  const [visible, setVisible] = useState(false)
  const [displayProgress, setDisplayProgress] = useState(0)

  // Handle visibility with fade animation
  useEffect(() => {
    if (isLoading) {
      setVisible(true)
      document.body.style.overflow = 'hidden'
    } else {
      // Delay hiding for fade-out
      const timer = setTimeout(() => {
        setVisible(false)
        document.body.style.overflow = ''
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  // Smooth progress counter animation
  useEffect(() => {
    if (progress !== displayProgress) {
      const step = progress > displayProgress ? 1 : -1
      const timer = setInterval(() => {
        setDisplayProgress(prev => {
          const next = prev + step
          if ((step > 0 && next >= progress) || (step < 0 && next <= progress)) {
            clearInterval(timer)
            return progress
          }
          return next
        })
      }, 15)
      return () => clearInterval(timer)
    }
  }, [progress, displayProgress])

  // Don't render if not visible
  if (!visible) return null

  // Calculate SVG circle properties
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (displayProgress / 100) * circumference

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)' }}
      aria-live="polite"
      aria-busy={isLoading}
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0 backdrop-blur-sm" />

      {/* Content container */}
      <div className="relative flex flex-col items-center gap-6 p-8">
        {/* Circular progress ring with spinner */}
        <div className="relative w-36 h-36">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
            />
            {/* Progress arc */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-out"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Spinning outer ring */}
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400/50"
            style={{ animation: 'progress-ring-spin 1.2s linear infinite' }}
          />

          {/* Percentage display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-4xl font-bold text-white tabular-nums"
              style={{ animation: displayProgress < 100 ? 'percentage-pulse 2s ease-in-out infinite' : 'none' }}
            >
              {displayProgress}%
            </span>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${displayProgress}%`,
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
            }}
          />
        </div>

        {/* Message */}
        {message && (
          <p className="text-white/90 text-lg font-medium tracking-wide">
            {message}
          </p>
        )}
      </div>
    </div>,
    document.body
  )
}

export default GlobalLoadingOverlay
