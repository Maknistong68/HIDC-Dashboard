import { useMemo } from 'react'

/**
 * useFilteredIncidents - Optimized hook for filtering incidents and computing derived data
 *
 * Performs a single iteration through the incidents array to compute:
 * - filteredIncidents: Incidents matching the current filters
 * - uniqueContractors: Unique contractors from all incidents (for filter options)
 * - siteOptions: Sites available for the selected contractor
 *
 * This eliminates 2-3 separate array iterations per page, improving performance
 * on large datasets.
 *
 * @param {Object} options
 * @param {Array} options.incidents - All incidents
 * @param {Array} options.contractor - Selected contractor filter ([] = all)
 * @param {Array} options.site - Selected site filter ([] = all)
 * @param {Array} options.subRegion - Selected sub-region filter ([] = all)
 * @param {Object} options.siteClassifications - Map of site to sub-region
 * @param {number|null} options.period - Time period filter (null = all, number = months)
 * @param {Function} options.getPeriodRange - Function to get date range from period
 * @returns {Object} { filteredIncidents, uniqueContractors, siteOptions }
 */
export const useFilteredIncidents = ({
  incidents,
  contractor,
  site,
  subRegion,
  siteClassifications,
  period,
  getPeriodRange
}) => {
  return useMemo(() => {
    // Get date range if period is set
    let dateFrom = null
    let dateTo = null
    if (period !== null) {
      const range = getPeriodRange(period)
      dateFrom = range.start
      dateTo = range.end
    }

    // Pre-compute filter sets for O(1) lookups
    const hasContractor = contractor && contractor.length > 0
    const hasSite = site && site.length > 0
    const hasSubRegion = subRegion && subRegion.length > 0
    const contractorFilter = hasContractor ? new Set(contractor) : null
    const siteFilter = hasSite ? new Set(site) : null
    const subRegionFilter = hasSubRegion ? new Set(subRegion) : null

    // Single iteration to collect all data
    const filtered = []
    const contractorSet = new Set()
    const allSitesSet = new Set()
    const contractorSitesSet = new Set()

    for (let i = 0; i < incidents.length; i++) {
      const incident = incidents[i]

      // Collect unique contractors (from all incidents, not filtered)
      if (incident.contractor) {
        contractorSet.add(incident.contractor)
      }

      // Collect sites for selected contractors (or all if no contractor selected)
      if (incident.site) {
        allSitesSet.add(incident.site)
        if (!hasContractor || contractorFilter.has(incident.contractor)) {
          contractorSitesSet.add(incident.site)
        }
      }

      // Apply filters for filteredIncidents
      if (hasContractor && !contractorFilter.has(incident.contractor)) continue
      if (hasSite && !siteFilter.has(incident.site)) continue
      if (hasSubRegion && !subRegionFilter.has(siteClassifications[incident.site])) continue

      // Date filtering
      if (dateFrom !== null && dateTo !== null) {
        if (incident.date < dateFrom || incident.date > dateTo) continue
      }

      filtered.push(incident)
    }

    // Convert to sorted arrays for options
    const uniqueContractors = Array.from(contractorSet)
      .sort()
      .map(c => ({ value: c, label: c }))

    const siteOptions = Array.from(contractorSitesSet)
      .sort()
      .map(s => ({ value: s, label: s }))

    return {
      filteredIncidents: filtered,
      uniqueContractors,
      siteOptions
    }
  }, [incidents, contractor, site, subRegion, siteClassifications, period, getPeriodRange])
}

/**
 * useFilteredIncidentsWithExclusions - Extended hook that also handles reporter exclusions
 *
 * Adds support for excluding specific reporters from the filtered results.
 *
 * @param {Object} options - Same as useFilteredIncidents plus:
 * @param {Array} options.excludedReporters - Array of reporter names to exclude
 * @returns {Object} { filteredIncidents, uniqueContractors, siteOptions, reporterOptions }
 */
export const useFilteredIncidentsWithExclusions = ({
  incidents,
  contractor,
  site,
  subRegion,
  siteClassifications,
  period,
  getPeriodRange,
  excludedReporters = []
}) => {
  return useMemo(() => {
    // Get date range if period is set
    let dateFrom = null
    let dateTo = null
    if (period !== null) {
      const range = getPeriodRange(period)
      dateFrom = range.start
      dateTo = range.end
    }

    // Create Sets for faster lookups
    const excludedSet = new Set(excludedReporters)
    const hasContractor = contractor && contractor.length > 0
    const hasSite = site && site.length > 0
    const hasSubRegion = subRegion && subRegion.length > 0
    const contractorFilter = hasContractor ? new Set(contractor) : null
    const siteFilter = hasSite ? new Set(site) : null
    const subRegionFilter = hasSubRegion ? new Set(subRegion) : null

    // Single iteration to collect all data
    const filtered = []
    const contractorSet = new Set()
    const contractorSitesSet = new Set()
    const reporterSet = new Set()

    for (let i = 0; i < incidents.length; i++) {
      const incident = incidents[i]

      // Collect unique contractors (from all incidents)
      if (incident.contractor) {
        contractorSet.add(incident.contractor)
      }

      // Collect sites for selected contractors
      if (incident.site && (!hasContractor || contractorFilter.has(incident.contractor))) {
        contractorSitesSet.add(incident.site)
      }

      // Collect unique reporters (from all incidents matching filters except exclusion)
      if (incident.reportedBy) {
        // Only add to reporter options if it passes contractor/site/subRegion filters
        const passesFilters = (
          (!hasContractor || contractorFilter.has(incident.contractor)) &&
          (!hasSite || siteFilter.has(incident.site)) &&
          (!hasSubRegion || subRegionFilter.has(siteClassifications[incident.site]))
        )
        if (passesFilters) {
          reporterSet.add(incident.reportedBy)
        }
      }

      // Apply all filters for filteredIncidents
      if (hasContractor && !contractorFilter.has(incident.contractor)) continue
      if (hasSite && !siteFilter.has(incident.site)) continue
      if (hasSubRegion && !subRegionFilter.has(siteClassifications[incident.site])) continue
      if (excludedSet.size > 0 && excludedSet.has(incident.reportedBy)) continue

      // Date filtering
      if (dateFrom !== null && dateTo !== null) {
        if (incident.date < dateFrom || incident.date > dateTo) continue
      }

      filtered.push(incident)
    }

    // Convert to sorted arrays for options
    const uniqueContractors = Array.from(contractorSet)
      .sort()
      .map(c => ({ value: c, label: c }))

    const siteOptions = Array.from(contractorSitesSet)
      .sort()
      .map(s => ({ value: s, label: s }))

    const reporterOptions = Array.from(reporterSet)
      .sort()
      .map(r => ({ value: r, label: r }))

    return {
      filteredIncidents: filtered,
      uniqueContractors,
      siteOptions,
      reporterOptions
    }
  }, [incidents, contractor, site, subRegion, siteClassifications, period, getPeriodRange, excludedReporters])
}

export default useFilteredIncidents
