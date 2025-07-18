# Device Detection System

A comprehensive device detection system for React applications with TypeScript support, SSR/SSG compatibility, and real-time responsive behavior.

## Features

- ✅ **Device Type Detection**: Mobile, Tablet, Desktop
- ✅ **Operating System Detection**: Android, iOS, Windows, macOS, Linux
- ✅ **Browser Detection**: Chrome, Firefox, Safari, Edge, Opera
- ✅ **Screen Size Detection**: xs, sm, md, lg, xl, 2xl
- ✅ **Capability Detection**: Touch, Retina, PWA, etc.
- ✅ **Responsive Breakpoints**: Real-time breakpoint tracking
- ✅ **SSR/SSG Safe**: Works with Next.js and other frameworks
- ✅ **Performance Optimized**: Debounced resize events
- ✅ **TypeScript Support**: Full type safety
- ✅ **Platform Icons**: Visual device representation
- ✅ **API Routes**: Server-side device detection

## Quick Start

### 1. Install Dependencies

The device detection system is already included in your project. No additional installation needed.

### 2. Basic Usage

```tsx
import { useDeviceDetection } from '@/hooks/use-device-detection'

function MyComponent() {
  const device = useDeviceDetection()
  
  return (
    <div>
      <p>Device: {device.deviceType}</p>
      <p>OS: {device.os}</p>
      <p>Browser: {device.browser}</p>
      <p>Screen: {device.width} × {device.height}</p>
      <p>Breakpoint: {device.breakpoint}</p>
    </div>
  )
}
```

### 3. Responsive Design

```tsx
function ResponsiveComponent() {
  const device = useDeviceDetection()
  
  if (device.isMobile) {
    return <MobileLayout />
  }
  
  if (device.isTablet) {
    return <TabletLayout />
  }
  
  return <DesktopLayout />
}
```

## API Reference

### useDeviceDetection Hook

```tsx
const device = useDeviceDetection(options)
```

#### Options

```tsx
interface UseDeviceDetectionOptions {
  debounceMs?: number        // Default: 100ms
  initialDeviceInfo?: Partial<DeviceInfo>
}
```

#### Return Value

```tsx
interface UseDeviceDetectionReturn {
  // Device Type
  deviceType: 'mobile' | 'tablet' | 'desktop'
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  
  // Operating System
  os: 'android' | 'ios' | 'windows' | 'mac' | 'linux' | 'unknown'
  osVersion?: string
  
  // Browser
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown'
  browserVersion?: string
  
  // Screen Information
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
  
  // Capabilities
  isTouch: boolean
  isRetina: boolean
  isStandalone: boolean
  
  // Responsive
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  isAboveBreakpoint: (breakpoint: ScreenSize) => boolean
  isBelowBreakpoint: (breakpoint: ScreenSize) => boolean
  isBetweenBreakpoints: (min: ScreenSize, max: ScreenSize) => boolean
  
  // Additional Helpers
  isLandscape: boolean
  isPortrait: boolean
  isMobileOrTablet: boolean
  isDesktopOrTablet: boolean
  
  // Breakpoint Helpers
  isXs: boolean
  isSm: boolean
  isMd: boolean
  isLg: boolean
  isXl: boolean
  is2xl: boolean
  
  // Platform Helpers
  isApple: boolean
  isAndroid: boolean
  isWindows: boolean
  isLinux: boolean
  
  // Browser Helpers
  isChrome: boolean
  isFirefox: boolean
  isSafari: boolean
  isEdge: boolean
  isOpera: boolean
  
  // Utility Functions
  refresh: () => void
  getBreakpointValue: (breakpoint: ScreenSize) => number
}
```

### Convenience Hooks

```tsx
import { 
  useIsMobile, 
  useIsTablet, 
  useIsDesktop, 
  useIsTouch, 
  useBreakpoint,
  useOrientation,
  usePlatform,
  useBrowser 
} from '@/hooks/use-device-detection'

// Simple boolean hooks
const isMobile = useIsMobile()
const isTablet = useIsTablet()
const isDesktop = useIsDesktop()
const isTouch = useIsTouch()

// Specific information hooks
const breakpoint = useBreakpoint()
const { orientation, isLandscape, isPortrait } = useOrientation()
const { os, isApple, isAndroid, isWindows, isLinux } = usePlatform()
const { browser, isChrome, isFirefox, isSafari, isEdge, isOpera } = useBrowser()
```

## Device Icons

### Basic Icons

```tsx
import { 
  DeviceTypeIcon, 
  OSIcon, 
  BrowserIcon, 
  DeviceInfoIcon 
} from '@/components/ui/device-icons'

function DeviceDisplay() {
  const device = useDeviceDetection()
  
  return (
    <div className="flex items-center space-x-4">
      <DeviceTypeIcon deviceType={device.deviceType} />
      <OSIcon os={device.os} />
      <BrowserIcon browser={device.browser} />
      <DeviceInfoIcon 
        deviceType={device.deviceType}
        os={device.os}
        browser={device.browser}
      />
    </div>
  )
}
```

### Status Icons

```tsx
import { StatusIcon } from '@/components/ui/device-icons'

<StatusIcon status="success" />
<StatusIcon status="error" />
<StatusIcon status="warning" />
<StatusIcon status="info" />
<StatusIcon status="loading" />
```

### Capability Icons

```tsx
import { CapabilityIcon } from '@/components/ui/device-icons'

<CapabilityIcon capability="touch" enabled={device.isTouch} />
<CapabilityIcon capability="retina" enabled={device.isRetina} />
<CapabilityIcon capability="standalone" enabled={device.isStandalone} />
<CapabilityIcon capability="camera" enabled={true} />
<CapabilityIcon capability="microphone" enabled={false} />
<CapabilityIcon capability="location" enabled={true} />
<CapabilityIcon capability="notifications" enabled={true} />
```

## Breakpoint System

### Breakpoint Values

```tsx
import { BREAKPOINTS } from '@/lib/device-detection'

console.log(BREAKPOINTS)
// {
//   xs: 0,
//   sm: 640,
//   md: 768,
//   lg: 1024,
//   xl: 1280,
//   '2xl': 1536
// }
```

### Breakpoint Utilities

```tsx
function ResponsiveComponent() {
  const device = useDeviceDetection()
  
  // Check specific breakpoints
  if (device.isAboveBreakpoint('lg')) {
    return <DesktopLayout />
  }
  
  if (device.isBelowBreakpoint('md')) {
    return <MobileLayout />
  }
  
  if (device.isBetweenBreakpoints('md', 'xl')) {
    return <TabletLayout />
  }
  
  // Get breakpoint value
  const lgBreakpoint = device.getBreakpointValue('lg') // 1024
}
```

## Server-Side Detection

### API Routes

The system includes API routes for server-side device detection:

```tsx
// GET /api/device-info
// Returns device info based on User-Agent header

// POST /api/device-info
// Accepts: { userAgent: string, width?: number, height?: number }
// Returns: Device information
```

### Usage Example

```tsx
// Client-side
const response = await fetch('/api/device-info')
const deviceInfo = await response.json()

// Server-side (in API routes)
import { detectOS, detectBrowser } from '@/lib/device-detection'

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  const os = detectOS()
  const browser = detectBrowser()
  
  return NextResponse.json({ os, browser })
}
```

## Best Practices

### 1. Performance Optimization

```tsx
// Use debouncing for resize events
const device = useDeviceDetection({ debounceMs: 150 })

// Use specific hooks when possible
const isMobile = useIsMobile() // More efficient than useDeviceDetection().isMobile
```

### 2. SSR/SSG Compatibility

```tsx
// The system automatically handles SSR with fallback values
function MyComponent() {
  const device = useDeviceDetection()
  
  // No need to check for window object - handled automatically
  return <div>Device: {device.deviceType}</div>
}
```

### 3. Responsive Design

```tsx
function ResponsiveLayout() {
  const device = useDeviceDetection()
  
  return (
    <div className={`
      ${device.isMobile ? 'p-4' : 'p-8'}
      ${device.isTablet ? 'max-w-2xl' : 'max-w-4xl'}
      ${device.isDesktop ? 'max-w-6xl' : ''}
    `}>
      {/* Content */}
    </div>
  )
}
```

### 4. Device-Specific Features

```tsx
function FeatureComponent() {
  const device = useDeviceDetection()
  
  return (
    <div>
      {/* Touch-specific features */}
      {device.isTouch && (
        <div className="touch-friendly-buttons">
          <button className="min-h-[44px]">Touch Target</button>
        </div>
      )}
      
      {/* Retina display optimization */}
      {device.isRetina && (
        <img src="/image@2x.png" alt="High resolution" />
      )}
      
      {/* PWA features */}
      {device.isStandalone && (
        <div className="pwa-installed-indicator">
          App installed
        </div>
      )}
    </div>
  )
}
```

### 5. Platform-Specific Styling

```tsx
function PlatformAwareComponent() {
  const device = useDeviceDetection()
  
  return (
    <div className={`
      ${device.isApple ? 'font-sf-pro' : 'font-roboto'}
      ${device.isAndroid ? 'material-design' : ''}
      ${device.isWindows ? 'windows-style' : ''}
    `}>
      {/* Platform-specific content */}
    </div>
  )
}
```

## Demo Component

Use the included demo component to test the device detection system:

```tsx
import { DeviceDemo } from '@/components/ui/device-demo'

function DemoPage() {
  return <DeviceDemo />
}
```

## Troubleshooting

### Common Issues

1. **SSR Hydration Mismatch**
   - The system automatically handles SSR with fallback values
   - No additional configuration needed

2. **Performance Issues**
   - Increase debounce time: `useDeviceDetection({ debounceMs: 200 })`
   - Use specific hooks instead of full device object

3. **Incorrect Detection**
   - Check User-Agent string in browser dev tools
   - Verify breakpoint values match your CSS

### Debug Mode

```tsx
function DebugComponent() {
  const device = useDeviceDetection()
  
  console.log('Device Info:', device)
  
  return (
    <pre className="text-xs">
      {JSON.stringify(device, null, 2)}
    </pre>
  )
}
```

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Opera 47+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile, etc.)

## License

This device detection system is part of the XSCard project and follows the same licensing terms. 

A comprehensive device detection system for React applications with TypeScript support, SSR/SSG compatibility, and real-time responsive behavior.

## Features

- ✅ **Device Type Detection**: Mobile, Tablet, Desktop
- ✅ **Operating System Detection**: Android, iOS, Windows, macOS, Linux
- ✅ **Browser Detection**: Chrome, Firefox, Safari, Edge, Opera
- ✅ **Screen Size Detection**: xs, sm, md, lg, xl, 2xl
- ✅ **Capability Detection**: Touch, Retina, PWA, etc.
- ✅ **Responsive Breakpoints**: Real-time breakpoint tracking
- ✅ **SSR/SSG Safe**: Works with Next.js and other frameworks
- ✅ **Performance Optimized**: Debounced resize events
- ✅ **TypeScript Support**: Full type safety
- ✅ **Platform Icons**: Visual device representation
- ✅ **API Routes**: Server-side device detection

## Quick Start

### 1. Install Dependencies

The device detection system is already included in your project. No additional installation needed.

### 2. Basic Usage

```tsx
import { useDeviceDetection } from '@/hooks/use-device-detection'

function MyComponent() {
  const device = useDeviceDetection()
  
  return (
    <div>
      <p>Device: {device.deviceType}</p>
      <p>OS: {device.os}</p>
      <p>Browser: {device.browser}</p>
      <p>Screen: {device.width} × {device.height}</p>
      <p>Breakpoint: {device.breakpoint}</p>
    </div>
  )
}
```

### 3. Responsive Design

```tsx
function ResponsiveComponent() {
  const device = useDeviceDetection()
  
  if (device.isMobile) {
    return <MobileLayout />
  }
  
  if (device.isTablet) {
    return <TabletLayout />
  }
  
  return <DesktopLayout />
}
```

## API Reference

### useDeviceDetection Hook

```tsx
const device = useDeviceDetection(options)
```

#### Options

```tsx
interface UseDeviceDetectionOptions {
  debounceMs?: number        // Default: 100ms
  initialDeviceInfo?: Partial<DeviceInfo>
}
```

#### Return Value

```tsx
interface UseDeviceDetectionReturn {
  // Device Type
  deviceType: 'mobile' | 'tablet' | 'desktop'
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  
  // Operating System
  os: 'android' | 'ios' | 'windows' | 'mac' | 'linux' | 'unknown'
  osVersion?: string
  
  // Browser
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'unknown'
  browserVersion?: string
  
  // Screen Information
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
  
  // Capabilities
  isTouch: boolean
  isRetina: boolean
  isStandalone: boolean
  
  // Responsive
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  isAboveBreakpoint: (breakpoint: ScreenSize) => boolean
  isBelowBreakpoint: (breakpoint: ScreenSize) => boolean
  isBetweenBreakpoints: (min: ScreenSize, max: ScreenSize) => boolean
  
  // Additional Helpers
  isLandscape: boolean
  isPortrait: boolean
  isMobileOrTablet: boolean
  isDesktopOrTablet: boolean
  
  // Breakpoint Helpers
  isXs: boolean
  isSm: boolean
  isMd: boolean
  isLg: boolean
  isXl: boolean
  is2xl: boolean
  
  // Platform Helpers
  isApple: boolean
  isAndroid: boolean
  isWindows: boolean
  isLinux: boolean
  
  // Browser Helpers
  isChrome: boolean
  isFirefox: boolean
  isSafari: boolean
  isEdge: boolean
  isOpera: boolean
  
  // Utility Functions
  refresh: () => void
  getBreakpointValue: (breakpoint: ScreenSize) => number
}
```

### Convenience Hooks

```tsx
import { 
  useIsMobile, 
  useIsTablet, 
  useIsDesktop, 
  useIsTouch, 
  useBreakpoint,
  useOrientation,
  usePlatform,
  useBrowser 
} from '@/hooks/use-device-detection'

// Simple boolean hooks
const isMobile = useIsMobile()
const isTablet = useIsTablet()
const isDesktop = useIsDesktop()
const isTouch = useIsTouch()

// Specific information hooks
const breakpoint = useBreakpoint()
const { orientation, isLandscape, isPortrait } = useOrientation()
const { os, isApple, isAndroid, isWindows, isLinux } = usePlatform()
const { browser, isChrome, isFirefox, isSafari, isEdge, isOpera } = useBrowser()
```

## Device Icons

### Basic Icons

```tsx
import { 
  DeviceTypeIcon, 
  OSIcon, 
  BrowserIcon, 
  DeviceInfoIcon 
} from '@/components/ui/device-icons'

function DeviceDisplay() {
  const device = useDeviceDetection()
  
  return (
    <div className="flex items-center space-x-4">
      <DeviceTypeIcon deviceType={device.deviceType} />
      <OSIcon os={device.os} />
      <BrowserIcon browser={device.browser} />
      <DeviceInfoIcon 
        deviceType={device.deviceType}
        os={device.os}
        browser={device.browser}
      />
    </div>
  )
}
```

### Status Icons

```tsx
import { StatusIcon } from '@/components/ui/device-icons'

<StatusIcon status="success" />
<StatusIcon status="error" />
<StatusIcon status="warning" />
<StatusIcon status="info" />
<StatusIcon status="loading" />
```

### Capability Icons

```tsx
import { CapabilityIcon } from '@/components/ui/device-icons'

<CapabilityIcon capability="touch" enabled={device.isTouch} />
<CapabilityIcon capability="retina" enabled={device.isRetina} />
<CapabilityIcon capability="standalone" enabled={device.isStandalone} />
<CapabilityIcon capability="camera" enabled={true} />
<CapabilityIcon capability="microphone" enabled={false} />
<CapabilityIcon capability="location" enabled={true} />
<CapabilityIcon capability="notifications" enabled={true} />
```

## Breakpoint System

### Breakpoint Values

```tsx
import { BREAKPOINTS } from '@/lib/device-detection'

console.log(BREAKPOINTS)
// {
//   xs: 0,
//   sm: 640,
//   md: 768,
//   lg: 1024,
//   xl: 1280,
//   '2xl': 1536
// }
```

### Breakpoint Utilities

```tsx
function ResponsiveComponent() {
  const device = useDeviceDetection()
  
  // Check specific breakpoints
  if (device.isAboveBreakpoint('lg')) {
    return <DesktopLayout />
  }
  
  if (device.isBelowBreakpoint('md')) {
    return <MobileLayout />
  }
  
  if (device.isBetweenBreakpoints('md', 'xl')) {
    return <TabletLayout />
  }
  
  // Get breakpoint value
  const lgBreakpoint = device.getBreakpointValue('lg') // 1024
}
```

## Server-Side Detection

### API Routes

The system includes API routes for server-side device detection:

```tsx
// GET /api/device-info
// Returns device info based on User-Agent header

// POST /api/device-info
// Accepts: { userAgent: string, width?: number, height?: number }
// Returns: Device information
```

### Usage Example

```tsx
// Client-side
const response = await fetch('/api/device-info')
const deviceInfo = await response.json()

// Server-side (in API routes)
import { detectOS, detectBrowser } from '@/lib/device-detection'

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  const os = detectOS()
  const browser = detectBrowser()
  
  return NextResponse.json({ os, browser })
}
```

## Best Practices

### 1. Performance Optimization

```tsx
// Use debouncing for resize events
const device = useDeviceDetection({ debounceMs: 150 })

// Use specific hooks when possible
const isMobile = useIsMobile() // More efficient than useDeviceDetection().isMobile
```

### 2. SSR/SSG Compatibility

```tsx
// The system automatically handles SSR with fallback values
function MyComponent() {
  const device = useDeviceDetection()
  
  // No need to check for window object - handled automatically
  return <div>Device: {device.deviceType}</div>
}
```

### 3. Responsive Design

```tsx
function ResponsiveLayout() {
  const device = useDeviceDetection()
  
  return (
    <div className={`
      ${device.isMobile ? 'p-4' : 'p-8'}
      ${device.isTablet ? 'max-w-2xl' : 'max-w-4xl'}
      ${device.isDesktop ? 'max-w-6xl' : ''}
    `}>
      {/* Content */}
    </div>
  )
}
```

### 4. Device-Specific Features

```tsx
function FeatureComponent() {
  const device = useDeviceDetection()
  
  return (
    <div>
      {/* Touch-specific features */}
      {device.isTouch && (
        <div className="touch-friendly-buttons">
          <button className="min-h-[44px]">Touch Target</button>
        </div>
      )}
      
      {/* Retina display optimization */}
      {device.isRetina && (
        <img src="/image@2x.png" alt="High resolution" />
      )}
      
      {/* PWA features */}
      {device.isStandalone && (
        <div className="pwa-installed-indicator">
          App installed
        </div>
      )}
    </div>
  )
}
```

### 5. Platform-Specific Styling

```tsx
function PlatformAwareComponent() {
  const device = useDeviceDetection()
  
  return (
    <div className={`
      ${device.isApple ? 'font-sf-pro' : 'font-roboto'}
      ${device.isAndroid ? 'material-design' : ''}
      ${device.isWindows ? 'windows-style' : ''}
    `}>
      {/* Platform-specific content */}
    </div>
  )
}
```

## Demo Component

Use the included demo component to test the device detection system:

```tsx
import { DeviceDemo } from '@/components/ui/device-demo'

function DemoPage() {
  return <DeviceDemo />
}
```

## Troubleshooting

### Common Issues

1. **SSR Hydration Mismatch**
   - The system automatically handles SSR with fallback values
   - No additional configuration needed

2. **Performance Issues**
   - Increase debounce time: `useDeviceDetection({ debounceMs: 200 })`
   - Use specific hooks instead of full device object

3. **Incorrect Detection**
   - Check User-Agent string in browser dev tools
   - Verify breakpoint values match your CSS

### Debug Mode

```tsx
function DebugComponent() {
  const device = useDeviceDetection()
  
  console.log('Device Info:', device)
  
  return (
    <pre className="text-xs">
      {JSON.stringify(device, null, 2)}
    </pre>
  )
}
```

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Opera 47+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile, etc.)

## License

This device detection system is part of the XSCard project and follows the same licensing terms. 