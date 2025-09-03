'use client';

import { useCallback, useEffect, useState } from 'react';

interface UseMobileNavReturn {
  isMobileNavOpen: boolean;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
  openMobileNav: () => void;
  isMobile: boolean;
}

export function useMobileNav(): UseMobileNavReturn {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if viewport is mobile size
  const checkIsMobile = useCallback((): void => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    // Initial check
    checkIsMobile();
    
    // Listen for window resize
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [checkIsMobile]);

  // Close mobile nav when window is resized to desktop
  useEffect(() => {
    if (!isMobile && isMobileNavOpen) {
      setIsMobileNavOpen(false);
    }
  }, [isMobile, isMobileNavOpen]);

  // Close mobile nav on escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };

    if (isMobileNavOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when mobile nav is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileNavOpen]);

  const toggleMobileNav = useCallback((): void => {
    setIsMobileNavOpen(prev => !prev);
  }, []);

  const closeMobileNav = useCallback((): void => {
    setIsMobileNavOpen(false);
  }, []);

  const openMobileNav = useCallback((): void => {
    setIsMobileNavOpen(true);
  }, []);

  return {
    isMobileNavOpen,
    toggleMobileNav,
    closeMobileNav,
    openMobileNav,
    isMobile,
  };
}