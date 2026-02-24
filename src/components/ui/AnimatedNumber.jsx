import { useState, useEffect, useRef } from 'react'

/**
 * AnimatedNumber - Animated counter that smoothly transitions between values
 */
const AnimatedNumber = ({
  value,
  duration = 600,
  formatValue = (v) => v,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0)
  const previousValue = useRef(0)
  const animationRef = useRef(null)

  useEffect(() => {
    const startValue = previousValue.current
    const endValue = typeof value === 'number' ? value : parseFloat(value) || 0
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3)

      const current = startValue + (endValue - startValue) * easeOut
      setDisplayValue(current)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        previousValue.current = endValue
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, duration])

  return (
    <span className={`tabular-nums ${className}`}>
      {formatValue(Math.round(displayValue))}
    </span>
  )
}

export default AnimatedNumber
