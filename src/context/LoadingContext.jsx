import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

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

  const startLoading = useCallback((loadingMessage = 'Loading...') => {
    setIsLoading(true)
    setProgress(0)
    setMessage(loadingMessage)
  }, [])

  const updateProgress = useCallback((percent) => {
    setProgress(Math.min(100, Math.max(0, percent)))
  }, [])

  const finishLoading = useCallback(() => {
    setProgress(100)
    // Delay hiding for smooth exit animation
    setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
      setMessage('')
    }, 400)
  }, [])

  const value = useMemo(() => ({
    isLoading,
    progress,
    message,
    startLoading,
    updateProgress,
    finishLoading
  }), [isLoading, progress, message, startLoading, updateProgress, finishLoading])

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}
