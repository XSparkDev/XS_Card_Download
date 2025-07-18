// Device Detection Types and Interfaces
export type DeviceType = 'mobile' | 'tablet' | 'desktop'
export type OperatingSystem = 'android' | 'ios' | 'windows' | 'mac' | 'linux' | 'unknown'
export type Browser = 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown'
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface DeviceInfo {
  // Device Type
  deviceType: DeviceType
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  
  // Operating System
  os: OperatingSystem
  osVersion?: string
  
  // Browser
  browser: Browser
  browserVersion?: string
  
  // Screen Information
  screenSize: ScreenSize
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
  
  // Capabilities
  isTouch: boolean
  isRetina: boolean
  isStandalone: boolean // PWA mode
  
  // Network Information
  connectionType?: string
  effectiveConnectionType?: string
  
  // Battery Information
  batteryLevel?: number
  isCharging?: boolean
  
  // Responsive
  breakpoint: ScreenSize
  isAboveBreakpoint: (breakpoint: ScreenSize) => boolean
  isBelowBreakpoint: (breakpoint: ScreenSize) => boolean
  isBetweenBreakpoints: (min: ScreenSize, max: ScreenSize) => boolean
}

// Breakpoint System
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// OS Detection Logic
export const detectOS = (): { os: OperatingSystem; version?: string } => {
  if (typeof window === 'undefined' || !navigator.userAgent) {
    return { os: 'unknown' }
  }

  const userAgent = navigator.userAgent.toLowerCase()
  
  // Android detection
  if (userAgent.includes('android')) {
    const match = userAgent.match(/android\s([0-9.]*)/)
    return { 
      os: 'android', 
      version: match ? match[1] : undefined 
    }
  }
  
  // iOS detection
  if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
    const match = userAgent.match(/os\s([0-9_]*)/)
    return { 
      os: 'ios', 
      version: match ? match[1].replace(/_/g, '.') : undefined 
    }
  }
  
  // Windows detection
  if (userAgent.includes('windows')) {
    const match = userAgent.match(/windows nt\s([0-9.]*)/)
    return { 
      os: 'windows', 
      version: match ? match[1] : undefined 
    }
  }
  
  // macOS detection
  if (userAgent.includes('mac os x') || userAgent.includes('macintosh')) {
    const match = userAgent.match(/mac os x\s([0-9_]*)/)
    return { 
      os: 'mac', 
      version: match ? match[1].replace(/_/g, '.') : undefined 
    }
  }
  
  // Linux detection
  if (userAgent.includes('linux')) {
    return { os: 'linux' }
  }
  
  return { os: 'unknown' }
}

// Browser Detection Logic
export const detectBrowser = (): { browser: Browser; version?: string } => {
  if (typeof window === 'undefined' || !navigator.userAgent) {
    return { browser: 'unknown' }
  }

  const userAgent = navigator.userAgent.toLowerCase()
  
  // Edge detection (must come before Chrome)
  if (userAgent.includes('edg')) {
    const match = userAgent.match(/edg\/([0-9.]*)/)
    return { 
      browser: 'edge', 
      version: match ? match[1] : undefined 
    }
  }
  
  // Chrome detection
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    const match = userAgent.match(/chrome\/([0-9.]*)/)
    return { 
      browser: 'chrome', 
      version: match ? match[1] : undefined 
    }
  }
  
  // Firefox detection
  if (userAgent.includes('firefox')) {
    const match = userAgent.match(/firefox\/([0-9.]*)/)
    return { 
      browser: 'firefox', 
      version: match ? match[1] : undefined 
    }
  }
  
  // Safari detection (must come after Chrome)
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    const match = userAgent.match(/version\/([0-9.]*)/)
    return { 
      browser: 'safari', 
      version: match ? match[1] : undefined 
    }
  }
  
  // Opera detection
  if (userAgent.includes('opr') || userAgent.includes('opera')) {
    const match = userAgent.match(/(?:opr|opera)\/([0-9.]*)/)
    return { 
      browser: 'opera', 
      version: match ? match[1] : undefined 
    }
  }
  
  return { browser: 'unknown' }
}

// Device Type Detection
export const detectDeviceType = (width: number): DeviceType => {
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// Screen Size Detection
export const detectScreenSize = (width: number): ScreenSize => {
  if (width >= BREAKPOINTS['2xl']) return '2xl'
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  if (width >= BREAKPOINTS.sm) return 'sm'
  return 'xs'
}

// Capability Detection
export const detectCapabilities = () => {
  if (typeof window === 'undefined') {
    return {
      isTouch: false,
      isRetina: false,
      isStandalone: false,
    }
  }

  return {
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isRetina: window.devicePixelRatio > 1,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true,
  }
}

// Network Detection
export const detectNetwork = () => {
  if (typeof window === 'undefined') {
    return {
      connectionType: undefined,
      effectiveConnectionType: undefined,
    }
  }

  const nav = navigator as any
  if (!nav.connection) {
    return {
      connectionType: undefined,
      effectiveConnectionType: undefined,
    }
  }

  return {
    connectionType: nav.connection.type || undefined,
    effectiveConnectionType: nav.connection.effectiveType || undefined,
  }
}

// Battery Detection
export const detectBattery = async () => {
  if (typeof window === 'undefined') {
    return {
      batteryLevel: undefined,
      isCharging: undefined,
    }
  }

  const nav = navigator as any
  if (!nav.getBattery) {
    return {
      batteryLevel: undefined,
      isCharging: undefined,
    }
  }

  try {
    const battery = await nav.getBattery()
    return {
      batteryLevel: battery.level,
      isCharging: battery.charging,
    }
  } catch (error) {
    return {
      batteryLevel: undefined,
      isCharging: undefined,
    }
  }
}

// Orientation Detection
export const detectOrientation = (width: number, height: number): 'portrait' | 'landscape' => {
  return width > height ? 'landscape' : 'portrait'
}

// Breakpoint Utilities
export const isAboveBreakpoint = (currentWidth: number, breakpoint: ScreenSize): boolean => {
  return currentWidth >= BREAKPOINTS[breakpoint]
}

export const isBelowBreakpoint = (currentWidth: number, breakpoint: ScreenSize): boolean => {
  return currentWidth < BREAKPOINTS[breakpoint]
}

export const isBetweenBreakpoints = (
  currentWidth: number, 
  min: ScreenSize, 
  max: ScreenSize
): boolean => {
  return currentWidth >= BREAKPOINTS[min] && currentWidth < BREAKPOINTS[max]
}

// Main Device Detection Function
export const detectDevice = async (): Promise<DeviceInfo> => {
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
    }
  }

  const width = window.innerWidth
  const height = window.innerHeight
  
  const os = detectOS()
  const browser = detectBrowser()
  const deviceType = detectDeviceType(width)
  const screenSize = detectScreenSize(width)
  const capabilities = detectCapabilities()
  const network = detectNetwork()
  const battery = await detectBattery()
  const orientation = detectOrientation(width, height)

  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    os: os.os,
    osVersion: os.version,
    browser: browser.browser,
    browserVersion: browser.version,
    screenSize,
    width,
    height,
    orientation,
    ...capabilities,
    ...network,
    ...battery,
    breakpoint: screenSize,
    isAboveBreakpoint: (breakpoint: ScreenSize) => isAboveBreakpoint(width, breakpoint),
    isBelowBreakpoint: (breakpoint: ScreenSize) => isBelowBreakpoint(width, breakpoint),
    isBetweenBreakpoints: (min: ScreenSize, max: ScreenSize) => isBetweenBreakpoints(width, min, max),
  }
}

// Debounce utility function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
} 