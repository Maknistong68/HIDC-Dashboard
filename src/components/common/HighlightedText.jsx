import React, { useMemo } from 'react'

/**
 * HighlightedText - Highlights specified keywords in text
 * Used for showing matched factor keywords in drill-down views
 *
 * @param {string} text - The text to display
 * @param {string[]} keywords - Array of keywords to highlight (case-insensitive)
 * @param {string} highlightClass - Optional custom class for highlights
 */
const HighlightedText = ({
  text,
  keywords = [],
  highlightClass = 'bg-amber-200 text-amber-900 px-0.5 rounded'
}) => {
  const segments = useMemo(() => {
    if (!text || !keywords || keywords.length === 0) {
      return [{ text, highlight: false }]
    }

    // Create a regex pattern for all keywords (case-insensitive, word boundaries)
    const escapedKeywords = keywords.map(k =>
      k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    )
    const pattern = new RegExp(`\\b(${escapedKeywords.join('|')})\\b`, 'gi')

    const result = []
    let lastIndex = 0
    let match

    while ((match = pattern.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        result.push({
          text: text.slice(lastIndex, match.index),
          highlight: false
        })
      }

      // Add matched keyword
      result.push({
        text: match[0],
        highlight: true
      })

      lastIndex = pattern.lastIndex
    }

    // Add remaining text
    if (lastIndex < text.length) {
      result.push({
        text: text.slice(lastIndex),
        highlight: false
      })
    }

    return result.length > 0 ? result : [{ text, highlight: false }]
  }, [text, keywords])

  return (
    <span>
      {segments.map((segment, idx) => (
        segment.highlight ? (
          <mark key={idx} className={highlightClass}>
            {segment.text}
          </mark>
        ) : (
          <span key={idx}>{segment.text}</span>
        )
      ))}
    </span>
  )
}

export default React.memo(HighlightedText)
