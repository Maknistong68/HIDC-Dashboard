import * as XLSX from 'xlsx'

/**
 * Web Worker for XLSX parsing - moves the expensive XLSX.read() off the main thread.
 * Worker is bundled separately by Vite, so xlsx is NOT in the main bundle.
 *
 * Receives: ArrayBuffer of the Excel file
 * Returns: { sheetName, jsonData } - raw parsed data for the main thread to process
 */
self.onmessage = (e) => {
  try {
    const arrayBuffer = e.data
    const data = new Uint8Array(arrayBuffer)
    const workbook = XLSX.read(data, { type: 'array', cellDates: true })

    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]

    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      dateNF: 'yyyy-mm-dd'
    })

    self.postMessage({ success: true, sheetName, jsonData })
  } catch (error) {
    self.postMessage({ success: false, error: error.message })
  }
}
