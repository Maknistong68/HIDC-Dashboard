import { toPng } from 'html-to-image'
import { EXPORT_CONFIG } from './exportConfig'

/**
 * Captures a DOM element as a high-resolution PNG data URL
 */
export const captureElement = async (element, options = {}) => {
  if (!element) throw new Error('Element not found')

  const { scale = EXPORT_CONFIG.SCALE, backgroundColor = '#ffffff' } = options

  // Create style to hide scrollbars during capture
  const style = document.createElement('style')
  style.id = 'hide-scrollbars-for-export'
  style.textContent = `
    *::-webkit-scrollbar { display: none !important; }
    * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
  `
  document.head.appendChild(style)

  // Add export-mode class to force desktop layout during capture
  document.documentElement.classList.add('export-mode')

  try {
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: scale,
      backgroundColor,
      cacheBust: true,
      filter: (node) => {
        // Skip elements with no-export class
        if (node.classList?.contains('no-export')) return false
        return true
      },
    })
    return dataUrl
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error capturing element:', error)
    throw error
  } finally {
    // Remove export-mode class and scrollbar style
    document.documentElement.classList.remove('export-mode')
    style.remove()
  }
}

/**
 * Captures all chart elements and returns image data URLs
 */
export const captureAllCharts = async (chartRefs, onProgress) => {
  const chartKeys = Object.keys(chartRefs)
  const images = {}

  for (let i = 0; i < chartKeys.length; i++) {
    const key = chartKeys[i]
    const ref = chartRefs[key]

    const title = EXPORT_CONFIG.CHART_TITLES[key] || key
    onProgress?.(`Capturing ${title}... (${i + 1}/${chartKeys.length})`)

    if (ref?.current) {
      try {
        images[key] = await captureElement(ref.current)
      } catch (error) {
        // error handled silently
        images[key] = null
      }
    }
  }

  return images
}

/**
 * Gets image dimensions from a data URL
 */
export const getImageDimensions = (dataUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => {
      reject(new Error('Failed to load image from data URL'))
    }
    img.src = dataUrl
  })
}
