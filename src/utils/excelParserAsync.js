/**
 * Async wrapper for XLSX parsing via Web Worker.
 * Moves the expensive XLSX.read() + sheet_to_json() off the main thread.
 *
 * Returns the same shape as parseExcelFile() from excelParser.js
 * so it's a drop-in replacement.
 */

// Import the header/footer detection from the main parser
// (these are lightweight string operations, fine on main thread)
import {
  EXPECTED_COLUMNS,
  FOOTER_MARKER_PATTERNS,
  detectFooterStart,
} from './excelParser'

const normalizeHeader = (h) => {
  if (!h) return ''
  return h.toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '')
}

function detectHeaderRow(rows, maxRowsToCheck = 15) {
  const allExpectedNames = Object.values(EXPECTED_COLUMNS).flat()
  let bestRowIndex = 0
  let bestScore = 0
  const rowsToCheck = Math.min(rows.length, maxRowsToCheck)

  for (let i = 0; i < rowsToCheck; i++) {
    const row = rows[i]
    if (!row || !Array.isArray(row)) continue
    let score = 0
    let nonEmptyCells = 0

    row.forEach(cell => {
      if (cell !== null && cell !== undefined && cell !== '') {
        nonEmptyCells++
        const normalized = normalizeHeader(String(cell))
        if (allExpectedNames.some(name => {
          const normalizedName = normalizeHeader(name)
          return normalized.includes(normalizedName) || normalizedName.includes(normalized)
        })) {
          score += 2
        }
        const headerKeywords = ['id', 'date', 'type', 'name', 'status', 'description', 'hazard', 'observation', 'reporter', 'classification']
        if (headerKeywords.some(kw => normalized.includes(kw))) {
          score += 1
        }
      }
    })

    if (nonEmptyCells >= 3 && score > bestScore) {
      bestScore = score
      bestRowIndex = i
    }
  }
  return bestRowIndex
}

// Singleton worker - reused across calls
let worker = null

function getWorker() {
  if (!worker) {
    worker = new Worker(
      new URL('./excelParserWorker.js', import.meta.url),
      { type: 'module' }
    )
  }
  return worker
}

/**
 * Parse Excel file using Web Worker (non-blocking).
 * Returns same shape as parseExcelFile() from excelParser.js.
 *
 * @param {File} file - The Excel file to parse
 * @returns {Promise<{ sheetName, headers, rows, totalRows, headerRowIndex }>}
 */
export const parseExcelFileAsync = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const arrayBuffer = e.target.result
      const w = getWorker()

      const handler = (msg) => {
        w.removeEventListener('message', handler)
        w.removeEventListener('error', errHandler)

        if (!msg.data.success) {
          reject(new Error('Failed to parse Excel file: ' + msg.data.error))
          return
        }

        const { sheetName, jsonData } = msg.data

        if (jsonData.length < 2) {
          reject(new Error('Excel file is empty or has no data rows'))
          return
        }

        // Header/footer detection on main thread (fast string ops)
        const headerRowIndex = detectHeaderRow(jsonData)
        const headers = jsonData[headerRowIndex]
        const allRows = jsonData.slice(headerRowIndex + 1).filter(row =>
          row && row.some(cell => cell !== null && cell !== undefined && cell !== '')
        )
        const footerStartIndex = detectFooterStart(allRows)
        const rows = footerStartIndex >= 0 ? allRows.slice(0, footerStartIndex) : allRows

        resolve({
          sheetName,
          headers,
          rows,
          totalRows: rows.length,
          headerRowIndex,
        })
      }

      const errHandler = (err) => {
        w.removeEventListener('message', handler)
        w.removeEventListener('error', errHandler)
        reject(new Error('Worker error: ' + (err.message || 'Unknown error')))
      }

      w.addEventListener('message', handler)
      w.addEventListener('error', errHandler)

      // Transfer the ArrayBuffer (zero-copy) to the worker
      w.postMessage(arrayBuffer, [arrayBuffer])
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}
