import React from 'react'
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Chrome, 
  Globe,
  Apple,
  Eye,
  Download,
  Share2,
  Wifi,
  Battery,
  Signal,
  Settings,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Lock,
  Unlock,
  Shield,
  Zap,
  Bell,
  BellOff,
  MapPin,
  MapPinOff,
  TouchpadIcon,
} from 'lucide-react'
import { DeviceType, OperatingSystem, Browser } from '@/lib/device-detection'

interface DeviceIconProps {
  deviceType?: DeviceType
  os?: OperatingSystem
  browser?: Browser
  size?: number
  className?: string
}

// Device Type Icons
export const DeviceTypeIcon: React.FC<DeviceIconProps> = ({ 
  deviceType = 'desktop', 
  size = 24, 
  className = '' 
}) => {
  const iconProps = { size, className }
  
  switch (deviceType) {
    case 'mobile':
      return <Smartphone {...iconProps} />
    case 'tablet':
      return <Tablet {...iconProps} />
    case 'desktop':
    default:
      return <Monitor {...iconProps} />
  }
}

// Operating System Icons
export const OSIcon: React.FC<DeviceIconProps> = ({ 
  os = 'unknown', 
  size = 24, 
  className = '' 
}) => {
  const iconProps = { size, className }
  
  switch (os) {
    case 'ios':
    case 'mac':
      return <Apple {...iconProps} />
    case 'android':
      return <Smartphone {...iconProps} />
    case 'windows':
      return <Monitor {...iconProps} />
    case 'linux':
      return <Globe {...iconProps} />
    default:
      return <Globe {...iconProps} />
  }
}

// Browser Icons
export const BrowserIcon: React.FC<DeviceIconProps> = ({ 
  browser = 'unknown', 
  size = 24, 
  className = '' 
}) => {
  const iconProps = { size, className }
  
  switch (browser) {
    case 'chrome':
      return <Chrome {...iconProps} />
    case 'firefox':
      return <Globe {...iconProps} />
    case 'safari':
      return <Globe {...iconProps} />
    case 'edge':
      return <Globe {...iconProps} />
    case 'opera':
      return <Globe {...iconProps} />
    default:
      return <Globe {...iconProps} />
  }
}

// Combined Device Info Icon
export const DeviceInfoIcon: React.FC<DeviceIconProps> = ({ 
  deviceType, 
  os, 
  browser, 
  size = 24, 
  className = '' 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <DeviceTypeIcon deviceType={deviceType} size={size} className={className} />
      <OSIcon os={os} size={size} className={className} />
      <BrowserIcon browser={browser} size={size} className={className} />
    </div>
  )
}

// Status Icons
export const StatusIcon: React.FC<{ 
  status: 'success' | 'error' | 'warning' | 'info' | 'loading'
  size?: number
  className?: string
}> = ({ status, size = 24, className = '' }) => {
  const iconProps = { size, className }
  
  switch (status) {
    case 'success':
      return <CheckCircle {...iconProps} className={`${className} text-green-500`} />
    case 'error':
      return <XCircle {...iconProps} className={`${className} text-red-500`} />
    case 'warning':
      return <AlertCircle {...iconProps} className={`${className} text-yellow-500`} />
    case 'info':
      return <Info {...iconProps} className={`${className} text-blue-500`} />
    case 'loading':
      return <RefreshCw {...iconProps} className={`${className} text-gray-500 animate-spin`} />
    default:
      return <Info {...iconProps} className={`${className} text-gray-500`} />
  }
}

// Capability Icons
export const CapabilityIcon: React.FC<{ 
  capability: 'touch' | 'retina' | 'standalone' | 'camera' | 'microphone' | 'location' | 'notifications'
  enabled?: boolean
  size?: number
  className?: string
}> = ({ capability, enabled = true, size = 24, className = '' }) => {
  const iconProps = { size, className }
  
  switch (capability) {
    case 'touch':
      return enabled ? <TouchpadIcon {...iconProps} /> : <TouchpadIcon {...iconProps} className={`${className} opacity-50`} />
    case 'retina':
      return enabled ? <Eye {...iconProps} /> : <Eye {...iconProps} className={`${className} opacity-50`} />
    case 'standalone':
      return enabled ? <Monitor {...iconProps} /> : <Monitor {...iconProps} className={`${className} opacity-50`} />
    case 'camera':
      return enabled ? <Camera {...iconProps} /> : <Camera {...iconProps} className={`${className} opacity-50`} />
    case 'microphone':
      return enabled ? <Mic {...iconProps} /> : <MicOff {...iconProps} className={`${className} opacity-50`} />
    case 'location':
      return enabled ? <MapPin {...iconProps} /> : <MapPinOff {...iconProps} className={`${className} opacity-50`} />
    case 'notifications':
      return enabled ? <Bell {...iconProps} /> : <BellOff {...iconProps} className={`${className} opacity-50`} />
    default:
      return <Settings {...iconProps} />
  }
}

// Network Icons
export const NetworkIcon: React.FC<{ 
  type: 'wifi' | 'bluetooth' | 'cellular' | 'ethernet'
  strength?: number // 0-4
  size?: number
  className?: string
}> = ({ type, strength = 4, size = 24, className = '' }) => {
  const iconProps = { size, className }
  
  switch (type) {
    case 'wifi':
      return <Wifi {...iconProps} className={`${className} ${strength < 2 ? 'opacity-50' : ''}`} />
    case 'bluetooth':
      return <Signal {...iconProps} className={`${className} ${strength < 2 ? 'opacity-50' : ''}`} />
    case 'cellular':
      return <Signal {...iconProps} className={`${className} ${strength < 2 ? 'opacity-50' : ''}`} />
    case 'ethernet':
      return <Wifi {...iconProps} className={`${className} ${strength < 2 ? 'opacity-50' : ''}`} />
    default:
      return <Wifi {...iconProps} />
  }
}

// Battery Icon
export const BatteryIcon: React.FC<{ 
  level: number // 0-100
  charging?: boolean
  size?: number
  className?: string
}> = ({ level, charging = false, size = 24, className = '' }) => {
  const iconProps = { size, className }
  
  let colorClass = ''
  if (level <= 20) colorClass = 'text-red-500'
  else if (level <= 50) colorClass = 'text-yellow-500'
  else colorClass = 'text-green-500'
  
  return (
    <div className="relative">
      <Battery {...iconProps} className={`${className} ${colorClass}`} />
      {charging && <Zap {...iconProps} className={`${className} absolute inset-0 text-yellow-400`} />}
    </div>
  )
} 