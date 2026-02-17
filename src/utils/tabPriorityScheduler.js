/**
 * Tab Priority Scheduler
 *
 * Coordinated priority system for background computations across tabs:
 *   ACTIVE  (priority 0): Immediate execution
 *   RECENT  (priority 1): requestIdleCallback with 2s timeout
 *   DEFERRED (priority 2): requestIdleCallback with 10s timeout
 *
 * When a tab becomes active, flushForTab() immediately executes any stashed work.
 */

const PRIORITY = {
  ACTIVE: 0,
  RECENT: 1,
  DEFERRED: 2,
}

const scheduleIdle = typeof requestIdleCallback === 'function'
  ? (cb, timeout) => requestIdleCallback(cb, { timeout })
  : (cb, timeout) => setTimeout(cb, Math.min(timeout, 50))

const cancelIdle = typeof cancelIdleCallback === 'function'
  ? (id) => cancelIdleCallback(id)
  : (id) => clearTimeout(id)

let activeTab = 'dashboard'
const recentTabs = new Set() // Tabs visited in this session

// Pending work items: Map<tabName, Array<{ id, callback, callbackId }>>
const pendingWork = new Map()

/**
 * Set the currently active tab. Flushes any pending work for that tab.
 * @param {string} tabName - 'dashboard' | 'dataQuality' | 'outlook'
 */
function setActiveTab(tabName) {
  const prev = activeTab
  activeTab = tabName
  recentTabs.add(tabName)
  if (prev) recentTabs.add(prev)
  flushForTab(tabName)
}

/**
 * Get the current active tab name.
 * @returns {string}
 */
function getActiveTab() {
  return activeTab
}

/**
 * Get priority level for a given tab.
 * @param {string} tabName
 * @returns {number} 0 (ACTIVE), 1 (RECENT), or 2 (DEFERRED)
 */
function getPriority(tabName) {
  if (tabName === activeTab) return PRIORITY.ACTIVE
  if (recentTabs.has(tabName)) return PRIORITY.RECENT
  return PRIORITY.DEFERRED
}

/**
 * Schedule a callback with appropriate priority based on tab.
 *
 * @param {string} tabName - Which tab this work belongs to
 * @param {Function} callback - The work to execute
 * @returns {number} A handle ID that can be used to cancel
 */
function schedule(tabName, callback) {
  const priority = getPriority(tabName)

  if (priority === PRIORITY.ACTIVE) {
    // Execute immediately for active tab
    callback()
    return -1
  }

  const timeout = priority === PRIORITY.RECENT ? 2000 : 10000
  const callbackId = scheduleIdle(() => {
    // Remove from pending before executing
    removePending(tabName, callbackId)
    callback()
  }, timeout)

  // Track as pending work
  if (!pendingWork.has(tabName)) pendingWork.set(tabName, [])
  pendingWork.get(tabName).push({ callbackId, callback })

  return callbackId
}

/**
 * Remove a specific pending item from tracking.
 */
function removePending(tabName, callbackId) {
  const items = pendingWork.get(tabName)
  if (!items) return
  const idx = items.findIndex(item => item.callbackId === callbackId)
  if (idx !== -1) items.splice(idx, 1)
  if (items.length === 0) pendingWork.delete(tabName)
}

/**
 * Immediately execute all pending work for a tab (on tab switch).
 * Cancels the idle callbacks and runs them synchronously.
 * @param {string} tabName
 */
function flushForTab(tabName) {
  const items = pendingWork.get(tabName)
  if (!items || items.length === 0) return

  // Cancel idle callbacks and execute immediately
  const toFlush = [...items]
  pendingWork.delete(tabName)

  for (const item of toFlush) {
    cancelIdle(item.callbackId)
    try {
      item.callback()
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[TabScheduler] flush error:', err)
    }
  }
}

/**
 * Cancel all pending work for a specific tab.
 * @param {string} tabName
 */
function cancelForTab(tabName) {
  const items = pendingWork.get(tabName)
  if (!items) return
  for (const item of items) {
    cancelIdle(item.callbackId)
  }
  pendingWork.delete(tabName)
}

/**
 * Cancel all pending work across all tabs.
 */
function cancelAll() {
  for (const [, items] of pendingWork) {
    for (const item of items) {
      cancelIdle(item.callbackId)
    }
  }
  pendingWork.clear()
}

export const scheduler = {
  PRIORITY,
  setActiveTab,
  getActiveTab,
  getPriority,
  schedule,
  flushForTab,
  cancelForTab,
  cancelAll,
}
