"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import { 
  DeviceTypeIcon, 
  OSIcon, 
  BrowserIcon, 
  DeviceInfoIcon,
  StatusIcon,
  CapabilityIcon,
  NetworkIcon,
  BatteryIcon
} from '@/components/ui/device-icons'
import { RefreshCw, Smartphone, Tablet, Monitor, Info } from 'lucide-react'

export const DeviceDemo: React.FC = () => {
  const device = useDeviceDetection()

  const getDeviceRecommendations = () => {
    const recommendations = []
    
    if (device.isMobile) {
      recommendations.push('Optimize for touch interactions')
      recommendations.push('Use larger touch targets (44px minimum)')
      recommendations.push('Implement swipe gestures')
    }
    
    if (device.isTablet) {
      recommendations.push('Support both portrait and landscape orientations')
      recommendations.push('Use larger UI elements than mobile')
      recommendations.push('Consider split-screen layouts')
    }
    
    if (device.isDesktop) {
      recommendations.push('Utilize hover states and keyboard shortcuts')
      recommendations.push('Implement right-click context menus')
      recommendations.push('Support multi-monitor layouts')
    }
    
    if (device.isTouch) {
      recommendations.push('Disable hover effects on touch devices')
      recommendations.push('Use touch-friendly spacing')
    }
    
    if (device.isRetina) {
      recommendations.push('Use high-resolution images and icons')
      recommendations.push('Optimize for pixel density')
    }
    
    if (device.isApple) {
      recommendations.push('Follow iOS/macOS design guidelines')
      recommendations.push('Use system fonts (SF Pro)')
    }
    
    if (device.isAndroid) {
      recommendations.push('Follow Material Design principles')
      recommendations.push('Use Roboto font family')
    }
    
    return recommendations
  }

  const getPerformanceTips = () => {
    const tips = []
    
    if (device.isMobile) {
      tips.push('Minimize JavaScript bundle size')
      tips.push('Use lazy loading for images')
      tips.push('Implement service workers for offline support')
    }
    
    if (device.isRetina) {
      tips.push('Optimize image delivery with srcset')
      tips.push('Use vector graphics where possible')
    }
    
    if (device.isTouch) {
      tips.push('Debounce touch events for better performance')
      tips.push('Use passive event listeners')
    }
    
    return tips
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Device Detection Demo</h1>
        <p className="text-gray-600">Real-time device information and recommendations</p>
      </div>

      {/* Device Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DeviceInfoIcon 
              deviceType={device.deviceType}
              os={device.os}
              browser={device.browser}
              size={24}
            />
            <span>Device Overview</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={device.refresh}
              className="ml-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Device Type */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <DeviceTypeIcon deviceType={device.deviceType} size={20} />
                <span className="font-medium">Device Type</span>
              </div>
              <Badge variant={device.isMobile ? "destructive" : device.isTablet ? "secondary" : "default"}>
                {device.deviceType}
              </Badge>
            </div>

            {/* Operating System */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <OSIcon os={device.os} size={20} />
                <span className="font-medium">Operating System</span>
              </div>
              <Badge variant="outline">
                {device.os} {device.osVersion && `(${device.osVersion})`}
              </Badge>
            </div>

            {/* Browser */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <BrowserIcon browser={device.browser} size={20} />
                <span className="font-medium">Browser</span>
              </div>
              <Badge variant="outline">
                {device.browser} {device.browserVersion && `(${device.browserVersion})`}
              </Badge>
            </div>

            {/* Screen Size */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Monitor size={20} />
                <span className="font-medium">Screen Size</span>
              </div>
              <Badge variant="outline">
                {device.width} × {device.height} ({device.breakpoint})
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Device Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <CapabilityIcon capability="touch" enabled={device.isTouch} size={20} />
              <span>Touch: {device.isTouch ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CapabilityIcon capability="retina" enabled={device.isRetina} size={20} />
              <span>Retina: {device.isRetina ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CapabilityIcon capability="standalone" enabled={device.isStandalone} size={20} />
              <span>PWA: {device.isStandalone ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <StatusIcon status={device.orientation === 'landscape' ? 'info' : 'warning'} size={20} />
              <span>Orientation: {device.orientation}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsive Breakpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Breakpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Current Breakpoint:</span>
              <Badge variant="default">{device.breakpoint}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
              <div className="text-center p-2 bg-gray-100 rounded">
                <div className="font-medium">xs</div>
                <div className="text-gray-600">&lt; 640px</div>
                  </div>
              <div className="text-center p-2 bg-gray-100 rounded">
                <div className="font-medium">sm</div>
                <div className="text-gray-600">640px+</div>
              </div>
              <div className="text-center p-2 bg-gray-100 rounded">
                <div className="font-medium">md</div>
                <div className="text-gray-600">768px+</div>
              </div>
              <div className="text-center p-2 bg-gray-100 rounded">
                <div className="font-medium">lg</div>
                <div className="text-gray-600">1024px+</div>
              </div>
              <div className="text-center p-2 bg-gray-100 rounded">
                <div className="font-medium">xl</div>
                <div className="text-gray-600">1280px+</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network & Battery */}
      <Card>
        <CardHeader>
          <CardTitle>Network & Battery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <NetworkIcon 
                  type={device.connectionType === 'wifi' ? 'wifi' : 
                        device.connectionType === 'bluetooth' ? 'bluetooth' : 
                        device.connectionType === 'cellular' ? 'cellular' : 
                        device.connectionType === 'ethernet' ? 'ethernet' : 'wifi'} 
                  size={20} 
                />
                <span className="font-medium">Network</span>
              </div>
              <div className="text-sm text-gray-600">
                Type: {device.connectionType || 'Unknown'}<br />
                Effective: {device.effectiveConnectionType || 'Unknown'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <BatteryIcon 
                  level={device.batteryLevel ? Math.round(device.batteryLevel * 100) : 0} 
                  charging={device.isCharging} 
                  size={20} 
                />
                <span className="font-medium">Battery</span>
              </div>
              <div className="text-sm text-gray-600">
                Level: {device.batteryLevel ? `${Math.round(device.batteryLevel * 100)}%` : 'Unknown'}<br />
                Charging: {device.isCharging ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Device-Specific Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">UX Recommendations:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {getDeviceRecommendations().map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Performance Tips:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {getPerformanceTips().map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info size={20} />
            <span>Raw Device Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(device, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
} 