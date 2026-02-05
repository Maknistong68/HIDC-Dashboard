import { useState, useCallback, useMemo } from 'react'
import { QUICK_ACTION_PRESETS } from '../utils/constants'

/**
 * useScenarioSimulator - State management hook for compact scenario simulator
 *
 * Manages:
 * - View mode (quick/custom/advanced)
 * - Selected hazards (multi-select + "All Trending")
 * - Quick action state
 * - Slider values
 * - Expansion state
 */
const useScenarioSimulator = ({
  trendingHazards = [],
  openActionsCount = 0,
  initialHazard = null
}) => {
  // UI State
  const [mode, setMode] = useState('quick') // 'quick' | 'custom' | 'advanced'
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedCategory, setExpandedCategory] = useState(null) // For accordion-style sliders

  // Selection State
  const [selectedHazards, setSelectedHazards] = useState(
    initialHazard ? [initialHazard] : []
  )
  const [selectAllTrending, setSelectAllTrending] = useState(false)

  // Intervention State
  const [activeQuickAction, setActiveQuickAction] = useState(null)
  const [sliders, setSliders] = useState({})
  const [actionsToClose, setActionsToClose] = useState(0)

  // Get trending hazards (significant-rise or rising)
  const trendingHazardsList = useMemo(() => {
    return trendingHazards.filter(h =>
      h.trendLevel?.level === 'significant-rise' ||
      h.trendLevel?.level === 'rising'
    )
  }, [trendingHazards])

  // Effective selected hazards (accounts for "All Trending" toggle)
  const effectiveSelectedHazards = useMemo(() => {
    if (selectAllTrending) {
      return trendingHazardsList.map(h => h.name)
    }
    return selectedHazards
  }, [selectAllTrending, trendingHazardsList, selectedHazards])

  // Check if any changes have been made
  const hasChanges = useMemo(() => {
    const hasSliderChanges = Object.values(sliders).some(v => v !== 0)
    const hasActionChanges = actionsToClose > 0
    const hasQuickAction = activeQuickAction !== null
    return hasSliderChanges || hasActionChanges || hasQuickAction
  }, [sliders, actionsToClose, activeQuickAction])

  // Toggle hazard selection
  const toggleHazard = useCallback((hazardName) => {
    setSelectAllTrending(false) // Clear "All Trending" when manually selecting
    setSelectedHazards(prev => {
      if (prev.includes(hazardName)) {
        return prev.filter(h => h !== hazardName)
      }
      return [...prev, hazardName]
    })
  }, [])

  // Select single hazard (replace selection)
  const selectHazard = useCallback((hazardName) => {
    setSelectAllTrending(false)
    setSelectedHazards([hazardName])
  }, [])

  // Toggle "All Trending" selection
  const toggleAllTrending = useCallback(() => {
    setSelectAllTrending(prev => !prev)
    if (!selectAllTrending) {
      setSelectedHazards([]) // Clear manual selections when enabling "All Trending"
    }
  }, [selectAllTrending])

  // Clear hazard selection
  const clearHazardSelection = useCallback(() => {
    setSelectAllTrending(false)
    setSelectedHazards([])
  }, [])

  // Toggle quick action
  const toggleQuickAction = useCallback((actionId) => {
    setActiveQuickAction(prev => {
      if (prev === actionId) {
        // Deactivate - reset sliders applied by this action
        setSliders({})
        setActionsToClose(0)
        return null
      }

      // Activate - apply action's effects
      const action = QUICK_ACTION_PRESETS.find(a => a.id === actionId)
      if (action) {
        const newSliders = {}
        for (const [key, value] of Object.entries(action.effect)) {
          if (key === 'actionsToClose') {
            if (value === 'max') {
              setActionsToClose(openActionsCount)
            } else {
              setActionsToClose(value)
            }
          } else {
            newSliders[key] = value
          }
        }
        setSliders(newSliders)
      }

      return actionId
    })
  }, [openActionsCount])

  // Update single slider value
  const updateSlider = useCallback((sliderId, value) => {
    setActiveQuickAction(null) // Clear quick action when manually adjusting
    setSliders(prev => ({ ...prev, [sliderId]: value }))
  }, [])

  // Update actions to close
  const updateActionsToClose = useCallback((value) => {
    setActiveQuickAction(null) // Clear quick action when manually adjusting
    setActionsToClose(value)
  }, [])

  // Reset all interventions
  const reset = useCallback(() => {
    setActiveQuickAction(null)
    setSliders({})
    setActionsToClose(0)
  }, [])

  // Reset everything including selections
  const resetAll = useCallback(() => {
    reset()
    setSelectAllTrending(false)
    setSelectedHazards([])
    setMode('quick')
  }, [reset])

  // Toggle expansion
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  // Toggle category expansion (for accordion sliders)
  const toggleCategory = useCallback((categoryKey) => {
    setExpandedCategory(prev => prev === categoryKey ? null : categoryKey)
  }, [])

  // Apply hazard-specific recommendation
  const applyRecommendation = useCallback((factor, effectValue) => {
    setActiveQuickAction(null)
    setSliders(prev => ({ ...prev, [factor.toLowerCase()]: effectValue }))
  }, [])

  return {
    // UI State
    mode,
    setMode,
    isExpanded,
    toggleExpanded,
    expandedCategory,
    toggleCategory,

    // Selection State
    selectedHazards: effectiveSelectedHazards,
    selectAllTrending,
    trendingHazardsList,
    toggleHazard,
    selectHazard,
    toggleAllTrending,
    clearHazardSelection,

    // Intervention State
    activeQuickAction,
    toggleQuickAction,
    sliders,
    updateSlider,
    actionsToClose,
    updateActionsToClose,

    // Actions
    reset,
    resetAll,
    hasChanges,
    applyRecommendation
  }
}

export default useScenarioSimulator
