import { useEffect } from 'react'

/**
 * Custom hook to set document.title dynamically
 * @param {string} title - The page title
 */
export function usePageTitle(title) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title
    return () => {
      document.title = prevTitle
    }
  }, [title])
}
