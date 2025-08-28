import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768

export function useMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Check on mount
    checkIsMobile()

    // Add event listener
    window.addEventListener('resize', checkIsMobile)

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  return isMobile
}