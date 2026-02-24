import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react'

const LoadingContext = createContext()

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const finishTimeoutRef = useRef(null)

  const startLoading = useCallback((loadingMessage = 'Loading...') => {
    // Clear any pending finish timeout
    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current)
      finishTimeoutRef.current = null
    }
    setIsLoading(true)
    setProgress(0)
    setMessage(loadingMessage)
  }, [])

  const updateProgress = useCallback((percent) => {
    setProgress(Math.min(100, Math.max(0, percent)))
  }, [])

  const finishLoading = useCallback(() => {
    setProgress(100)
    // Clear any previous finish timeout
    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current)
    }
    // Delay hiding for smooth exit animation
    finishTimeoutRef.current = setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
      setMessage('')
      finishTimeoutRef.current = null
    }, 400)
  }, [])

  const updateMessage = useCallback((msg) => {
    setMessage(msg)
  }, [])

  const value = useMemo(() => ({
    isLoading,
    progress,
    message,
    startLoading,
    updateProgress,
    updateMessage,
    finishLoading
  }), [isLoading, progress, message, startLoading, updateProgress, updateMessage, finishLoading])

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}
