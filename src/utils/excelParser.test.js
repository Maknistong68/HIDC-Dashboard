import { describe, it, expect } from 'vitest'
import { FOOTER_MARKER_PATTERNS, detectFooterStart } from './excelParser'

describe('FOOTER_MARKER_PATTERNS', () => {
  const matchesAny = (text) =>
    FOOTER_MARKER_PATTERNS.some((p) => p.test(text))

  it('matches existing patterns (regression)', () => {
    expect(matchesAny('Information')).toBe(true)
    expect(matchesAny('  information  ')).toBe(true)
    expect(matchesAny('This report has been generated on 2026-01-15')).toBe(true)
    expect(matchesAny('Search Criteria')).toBe(true)
    expect(matchesAny('Query Builder')).toBe(true)
    expect(matchesAny('End of Report')).toBe(true)
  })

  it('matches "Unable to display" pattern', () => {
    expect(matchesAny('Unable to display a report with more than 2000 rows')).toBe(true)
    expect(matchesAny('unable to display')).toBe(true)
  })

  it('matches "Please use extraction" pattern', () => {
    expect(matchesAny('Please use extraction.')).toBe(true)
    expect(matchesAny('please use extraction')).toBe(true)
  })

  it('does not match normal data text', () => {
    expect(matchesAny('Worker fell from height')).toBe(false)
    expect(matchesAny('EV-12345')).toBe(false)
    expect(matchesAny('diesel spill near tank 3')).toBe(false)
  })
})

describe('detectFooterStart', () => {
  it('returns -1 when no footer rows exist', () => {
    const rows = [
      ['EV-001', '2026-01-01', 'FAC', 'Slip and fall'],
      ['EV-002', '2026-01-02', 'MTI', 'Cut finger'],
      ['EV-003', '2026-01-03', 'LTI', 'Broken arm'],
    ]
    expect(detectFooterStart(rows)).toBe(-1)
  })

  it('detects footer text in the first column', () => {
    const rows = [
      ['EV-001', '2026-01-01', 'FAC', 'Slip and fall'],
      ['Information', '', '', ''],
    ]
    expect(detectFooterStart(rows)).toBe(1)
  })

  it('detects footer text in a non-first column', () => {
    const rows = [
      ['EV-001', '2026-01-01', 'FAC', 'Slip and fall'],
      ['', 'Unable to display a report with more than 2000 rows', '', ''],
    ]
    expect(detectFooterStart(rows)).toBe(1)
  })

  it('detects multi-row footer block', () => {
    const rows = [
      ['EV-001', '2026-01-01', 'FAC', 'Slip and fall'],
      ['Information', '', '', ''],
      ['This report has been generated on 2026-01-15', '', '', ''],
    ]
    expect(detectFooterStart(rows)).toBe(1)
  })

  it('skips empty rows between footer lines', () => {
    const rows = [
      ['EV-001', '2026-01-01', 'FAC', 'Slip and fall'],
      ['Information', '', '', ''],
      ['', '', '', ''],
      ['End of Report', '', '', ''],
    ]
    expect(detectFooterStart(rows)).toBe(1)
  })

  it('detects the exact user-reported footer structure', () => {
    // Real structure: footer text appears in the Event ID column (not first)
    const rows = [
      ['EV-1999', '2026-01-01', 'FAC', 'Last real data row'],
      ['EV-2000', '2026-01-02', 'MTI', 'Another real row'],
      ['', 'Information', '', '', ''],
      ['', 'Unable to display a report with more than 2000 rows', '', '', ''],
      ['', 'Please use extraction.', '', '', ''],
    ]
    expect(detectFooterStart(rows)).toBe(2)
  })

  it('handles rows with null/undefined values', () => {
    const rows = [
      ['EV-001', null, undefined, 'Data'],
      [null, null, 'Information', null],
    ]
    expect(detectFooterStart(rows)).toBe(1)
  })

  it('does not flag rows where footer text is part of normal data', () => {
    // "information" as a standalone cell matches, but mid-sentence should not
    // since the pattern is /^\s*information\s*$/i
    const rows = [
      ['EV-001', 'For more information contact safety dept', '', ''],
      ['EV-002', '2026-01-01', 'FAC', 'Normal row'],
    ]
    expect(detectFooterStart(rows)).toBe(-1)
  })
})
