import { useRef, useMemo, useContext, createContext } from 'react'

/**
 * TabVisibilityContext - Tells each tab whether it is the active (visible) tab.
 * Set by PreloadedTabs, consumed by useDeferredMemo.
 */
export const TabVisibilityContext = createContext(true)

/**
 * useDeferredMemo - Like useMemo, but returns a stale cached value when the tab is hidden.
 * When the tab becomes visible again, it recomputes immediately.
 *
 * This eliminates ~66% of useMemo work on every filter change, because only the
 * visible tab recomputes while the 2 hidden tabs serve stale values.
 *
 * @param {Function} factory - Computation function (same as useMemo)
 * @param {Array} deps - Dependency array (same as useMemo)
 * @returns {any} The computed or cached result
 */
export function useDeferredMemo(factory, deps) {
  const isVisible = useContext(TabVisibilityContext)
  const cachedRef = useRef(undefined)
  const prevDepsRef = useRef(undefined)

  // Check if dependencies have changed
  const depsChanged = !prevDepsRef.current ||
    deps.length !== prevDepsRef.current.length ||
    deps.some((dep, i) => !Object.is(dep, prevDepsRef.current[i]))

  // Only recompute if visible AND deps changed (or first run)
  if (depsChanged && isVisible) {
    cachedRef.current = factory()
    prevDepsRef.current = deps
  } else if (cachedRef.current === undefined) {
    // First render - always compute regardless of visibility
    cachedRef.current = factory()
    prevDepsRef.current = deps
  }

  return cachedRef.current
}
