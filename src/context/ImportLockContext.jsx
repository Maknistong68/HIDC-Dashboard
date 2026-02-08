import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * ImportLockContext - Global import lock that prevents ALL navigation during import
 *
 * When locked:
 * - Routes cannot change (useBlocker in App.jsx)
 * - NavLinks are disabled (Layout.jsx)
 * - Browser back/forward blocked (popstate handler)
 * - Keyboard navigation blocked (Alt+Left/Right)
 * - beforeunload shows warning
 * - Full-screen blocking overlay displayed
 *
 * The import modal is rendered at app root level, immune to route changes.
 */
const ImportLockContext = createContext()

export const useImportLock = () => {
  const context = useContext(ImportLockContext)
  if (!context) {
    throw new Error('useImportLock must be used within an ImportLockProvider')
  }
  return context
}

export const ImportLockProvider = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false)
  const [modalComponent, setModalComponent] = useState(null)
  const [onUnlockCallback, setOnUnlockCallback] = useState(null)

  /**
   * Lock the app and render the import modal at root level
   * @param {React.ReactNode} modal - The modal component to render
   * @param {Function} onUnlock - Optional callback when unlock is called
   */
  const lockImport = useCallback((modal, onUnlock = null) => {
    setIsLocked(true)
    setModalComponent(modal)
    if (onUnlock) {
      setOnUnlockCallback(() => onUnlock)
    }
  }, [])

  /**
   * Unlock the app - only callable when processing is complete
   */
  const unlockImport = useCallback(() => {
    setIsLocked(false)
    setModalComponent(null)
    if (onUnlockCallback) {
      onUnlockCallback()
      setOnUnlockCallback(null)
    }
  }, [onUnlockCallback])

  // Block browser close/reload while locked
  useEffect(() => {
    if (!isLocked) return

    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = 'Import in progress. Are you sure you want to leave?'
      return e.returnValue
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isLocked])

  // Block browser back/forward buttons while locked
  useEffect(() => {
    if (!isLocked) return

    // Push a state to prevent back navigation
    window.history.pushState({ importLock: true }, '')

    const handlePopState = (e) => {
      // Push state again to prevent navigation
      window.history.pushState({ importLock: true }, '')
      // Optionally show a message
      if (import.meta.env.DEV) {
        console.warn('[ImportLock] Navigation blocked during import')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isLocked])

  // Block keyboard navigation (Alt+Left/Right)
  useEffect(() => {
    if (!isLocked) return

    const handleKeyDown = (e) => {
      // Block Alt+Left (back) and Alt+Right (forward)
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault()
        e.stopPropagation()
      }
      // Block Backspace (some browsers use it for back navigation)
      if (e.key === 'Backspace') {
        const target = e.target
        const isEditable = target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        if (!isEditable) {
          e.preventDefault()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [isLocked])

  const value = {
    isLocked,
    lockImport,
    unlockImport
  }

  return (
    <ImportLockContext.Provider value={value}>
      {children}
      {/* Render blocking overlay and modal at app root level */}
      {isLocked && modalComponent && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ isolation: 'isolate' }}
        >
          {/* Blocking backdrop - prevents all interaction outside modal */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ pointerEvents: 'all' }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />

          {/* Modal container - centered with proper constraints */}
          <div
            className="relative z-20 max-w-2xl max-h-[90vh] overflow-hidden"
            style={{ pointerEvents: 'auto' }}
          >
            {modalComponent}
          </div>
        </div>,
        document.body
      )}
    </ImportLockContext.Provider>
  )
}

export default ImportLockProvider
