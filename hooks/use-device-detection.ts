import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  detectDevice, 
  debounce, 
  DeviceInfo, 
  ScreenSize,
  BREAKPOINTS 
} from '@/lib/device-detection'

export interface UseDeviceDetectionOptions {
  debounceMs?: number
  initialDeviceInfo?: Partial<DeviceInfo>
}

export interface UseDeviceDetectionReturn extends DeviceInfo {
  // Additional reactive properties
  isLandscape: boolean
  isPortrait: boolean
  
  // Responsive helpers
  isMobileOrTablet: boolean
  isDesktopOrTablet: boolean
  
  // Breakpoint helpers
  isXs: boolean
  isSm: boolean
  isMd: boolean
  isLg: boolean
  isXl: boolean
  is2xl: boolean
  
  // Platform helpers
  isApple: boolean
  isAndroid: boolean
  isWindows: boolean
  isLinux: boolean
  
  // Browser helpers
  isChrome: boolean
  isFirefox: boolean
  isSafari: boolean
  isEdge: boolean
  isOpera: boolean
  
  // Utility functions
  refresh: () => void
  getBreakpointValue: (breakpoint: ScreenSize) => number
}

export const useDeviceDetection = (
  options: UseDeviceDetectionOptions = {}
): UseDeviceDetectionReturn => {
  const { debounceMs = 100, initialDeviceInfo } = options

  // Initialize state with SSR-safe values
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      // SSR fallback
      return {
        deviceType: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        os: 'unknown',
        browser: 'unknown',
        screenSize: 'lg',
        width: 1024,
        height: 768,
        orientation: 'landscape',
        isTouch: false,
        isRetina: false,
        isStandalone: false,
        breakpoint: 'lg',
        isAboveBreakpoint: () => false,
        isBelowBreakpoint: () => false,
        isBetweenBreakpoints: () => false,
        ...initialDeviceInfo,
      }
    }
    // For client-side, we'll initialize with basic info and update with full detection
      return {
        deviceType: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        os: 'unknown',
        browser: 'unknown',
        screenSize: 'lg',
      width: window.innerWidth,
      height: window.innerHeight,
        orientation: 'landscape',
        isTouch: false,
        isRetina: false,
        isStandalone: false,
        breakpoint: 'lg',
        isAboveBreakpoint: () => false,
        isBelowBreakpoint: () => false,
        isBetweenBreakpoints: () => false,
        ...initialDeviceInfo,
      }
  })

  // Initialize device detection on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initializeDevice = async () => {
      try {
        const detectedDevice = await detectDevice()
        setDeviceInfo(detectedDevice)
      } catch (error) {
        console.error('Failed to detect device:', error)
      }
    }

    initializeDevice()
  }, [])

  // Debounced resize handler
  const debouncedResizeHandler = useMemo(
    () => debounce(async () => {
      try {
        const detectedDevice = await detectDevice()
        setDeviceInfo(detectedDevice)
      } catch (error) {
        console.error('Failed to detect device on resize:', error)
      }
    }, debounceMs),
    [debounceMs]
  )

  // Handle resize events
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      debouncedResizeHandler()
    }

    const handleOrientationChange = () => {
      // Add small delay for orientation change
      setTimeout(async () => {
        try {
          const detectedDevice = await detectDevice()
          setDeviceInfo(detectedDevice)
        } catch (error) {
          console.error('Failed to detect device on orientation change:', error)
        }
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [debouncedResizeHandler])

  // Refresh function
  const refresh = useCallback(async () => {
    try {
      const detectedDevice = await detectDevice()
      setDeviceInfo(detectedDevice)
    } catch (error) {
      console.error('Failed to refresh device detection:', error)
    }
  }, [])

  // Computed properties
  const computedProps = useMemo(() => ({
    // Orientation helpers
    isLandscape: deviceInfo.orientation === 'landscape',
    isPortrait: deviceInfo.orientation === 'portrait',
    
    // Device type helpers
    isMobileOrTablet: deviceInfo.isMobile || deviceInfo.isTablet,
    isDesktopOrTablet: deviceInfo.isDesktop || deviceInfo.isTablet,
    
    // Breakpoint helpers
    isXs: deviceInfo.breakpoint === 'xs',
    isSm: deviceInfo.breakpoint === 'sm',
    isMd: deviceInfo.breakpoint === 'md',
    isLg: deviceInfo.breakpoint === 'lg',
    isXl: deviceInfo.breakpoint === 'xl',
    is2xl: deviceInfo.breakpoint === '2xl',
    
    // Platform helpers
    isApple: deviceInfo.os === 'ios' || deviceInfo.os === 'mac',
    isAndroid: deviceInfo.os === 'android',
    isWindows: deviceInfo.os === 'windows',
    isLinux: deviceInfo.os === 'linux',
    
    // Browser helpers
    isChrome: deviceInfo.browser === 'chrome',
    isFirefox: deviceInfo.browser === 'firefox',
    isSafari: deviceInfo.browser === 'safari',
    isEdge: deviceInfo.browser === 'edge',
    isOpera: deviceInfo.browser === 'opera',
    
    // Utility function
    getBreakpointValue: (breakpoint: ScreenSize) => BREAKPOINTS[breakpoint],
  }), [deviceInfo])

  return {
    ...deviceInfo,
    ...computedProps,
    refresh,
  }
}

// Convenience hooks for specific use cases
export const useIsMobile = () => {
  const { isMobile } = useDeviceDetection()
  return isMobile
}

export const useIsTablet = () => {
  const { isTablet } = useDeviceDetection()
  return isTablet
}

export const useIsDesktop = () => {
  const { isDesktop } = useDeviceDetection()
  return isDesktop
}

export const useIsTouch = () => {
  const { isTouch } = useDeviceDetection()
  return isTouch
}

export const useBreakpoint = () => {
  const { breakpoint } = useDeviceDetection()
  return breakpoint
}

export const useOrientation = () => {
  const { orientation, isLandscape, isPortrait } = useDeviceDetection()
  return { orientation, isLandscape, isPortrait }
}

export const usePlatform = () => {
  const { os, isApple, isAndroid, isWindows, isLinux } = useDeviceDetection()
  return { os, isApple, isAndroid, isWindows, isLinux }
}

export const useBrowser = () => {
  const { browser, isChrome, isFirefox, isSafari, isEdge, isOpera } = useDeviceDetection()
  return { browser, isChrome, isFirefox, isSafari, isEdge, isOpera }
} 