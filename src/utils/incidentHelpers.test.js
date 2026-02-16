import { describe, it, expect } from 'vitest'
import { parseISO } from 'date-fns'
import {
  getSortedDates,
  getIncidentDateRange,
  filterByHazard,
  isOpenAction,
  getOpenActions,
  getUniqueValues,
  buildDailyCounts,
} from './incidentHelpers'

const mockIncidents = [
  { date: '2024-03-15', location: 'Working At Height', contractor: 'Alpha Co', actionStatus: 'open' },
  { date: '2024-03-10', location: 'Excavation', contractor: 'Beta Corp', actionStatus: 'closed' },
  { date: '2024-03-20', location: 'Working At Height', contractor: 'Alpha Co', actionStatus: 'in-progress' },
  { date: null, location: 'Electrical', contractor: 'Gamma LLC', actionStatus: 'open' },
]

describe('getSortedDates', () => {
  it('returns sorted dates, filtering out nulls', () => {
    const result = getSortedDates(mockIncidents)
    expect(result).toEqual(['2024-03-10', '2024-03-15', '2024-03-20'])
  })

  it('returns empty array for no incidents', () => {
    expect(getSortedDates([])).toEqual([])
  })
})

describe('getIncidentDateRange', () => {
  it('returns full date range when no period specified', () => {
    const result = getIncidentDateRange(mockIncidents)
    expect(result.hasData).toBe(true)
    expect(result.dates).toHaveLength(3)
  })

  it('returns no data for empty incidents', () => {
    const result = getIncidentDateRange([])
    expect(result.hasData).toBe(false)
    expect(result.startDate).toBeNull()
  })
})

describe('filterByHazard', () => {
  it('filters incidents by hazard name (location)', () => {
    const result = filterByHazard(mockIncidents, 'Working At Height')
    expect(result).toHaveLength(2)
    expect(result.every(i => i.location === 'Working At Height')).toBe(true)
  })

  it('returns empty array for non-existent hazard', () => {
    expect(filterByHazard(mockIncidents, 'Nonexistent')).toHaveLength(0)
  })
})

describe('isOpenAction', () => {
  it('returns true for open actions', () => {
    expect(isOpenAction({ actionStatus: 'open' })).toBe(true)
  })

  it('returns true for in-progress actions', () => {
    expect(isOpenAction({ actionStatus: 'in-progress' })).toBe(true)
  })

  it('returns false for closed actions', () => {
    expect(isOpenAction({ actionStatus: 'closed' })).toBe(false)
  })
})

describe('getOpenActions', () => {
  it('returns only open/in-progress incidents', () => {
    const result = getOpenActions(mockIncidents)
    expect(result).toHaveLength(3)
  })
})

describe('getUniqueValues', () => {
  it('extracts unique sorted values for a field', () => {
    const result = getUniqueValues(mockIncidents, 'contractor')
    expect(result).toEqual(['Alpha Co', 'Beta Corp', 'Gamma LLC'])
  })

  it('filters out null/undefined values', () => {
    const incidents = [{ site: 'A' }, { site: null }, { site: 'B' }, { site: 'A' }]
    expect(getUniqueValues(incidents, 'site')).toEqual(['A', 'B'])
  })
})

describe('buildDailyCounts', () => {
  it('builds daily counts within range', () => {
    const start = parseISO('2024-03-10')
    const end = parseISO('2024-03-20')
    const counts = buildDailyCounts(mockIncidents, start, end)
    expect(counts['2024-03-10']).toBe(1)
    expect(counts['2024-03-15']).toBe(1)
    expect(counts['2024-03-20']).toBe(1)
  })

  it('excludes incidents outside range', () => {
    const start = parseISO('2024-03-11')
    const end = parseISO('2024-03-19')
    const counts = buildDailyCounts(mockIncidents, start, end)
    expect(counts['2024-03-10']).toBeUndefined()
    expect(counts['2024-03-20']).toBeUndefined()
    expect(counts['2024-03-15']).toBe(1)
  })
})
