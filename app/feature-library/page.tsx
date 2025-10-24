"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Play, X as CloseIcon, RefreshCw, User, Smartphone, Monitor, Tablet } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { API_BASE_URL, getApkDownloadUrl } from "@/utils/api"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from "@/hooks/use-auth"
import { UserProfile } from "@/components/auth/user-profile"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useDeviceDetection } from "@/hooks/use-device-detection"
import { HCaptchaComponent } from "@/components/ui/hcaptcha"

interface VideoFeature {
  id: string;
  filename: string;
  url: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  description?: string;
}

// Platform Icon Component
const PlatformIcon = ({ platform, className }: { platform: string; className?: string }) => {
  if (platform === 'android') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.5036C15.5902 8.2432 13.8533 7.5 12 7.5s-3.5902.7432-5.1377 1.92L4.8401 5.9164a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676L5.1185 9.3214C2.6883 11.1868 1.5 13.9121 1.5 17c0 .8284.6716 1.5 1.5 1.5h19c.8284 0 1.5-.6716 1.5-1.5 0-3.0879-1.1883-5.8132-3.6185-7.6786"/>
      </svg>
    )
  }
  
  if (platform === 'ios') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.94 5.19A4.38 4.38 0 0016 2a4.44 4.44 0 00-3 1.52 4.17 4.17 0 00-1 3.09 3.51 3.51 0 002.94-1.42zm2.52 7.44a4.51 4.51 0 012.16-3.81 4.66 4.66 0 00-3.66-2c-1.56-.16-3 .91-3.83.91s-2-.89-3.3-.87A4.92 4.92 0 004.69 9.39C2.93 12.45 4.24 17 6 19.47 6.8 20.68 7.8 22.05 9.12 22s1.75-.82 3.28-.82 2 .82 3.3.79 2.22-1.24 3.06-2.45a11 11 0 001.38-2.85A4.41 4.41 0 0117.46 12.63z"/>
      </svg>
    )
  }
  
  return null
}

// hCaptcha Component Wrapper
const XSCardCaptcha = ({
  onVerify,
  isOverLightSection,
}: {
  onVerify: (verified: boolean, token?: string) => void
  isOverLightSection: boolean
}) => {
  return (
    <HCaptchaComponent
      onVerify={onVerify}
      isOverLightSection={isOverLightSection}
    />
  )
}

export default function FeatureLibrary() {
  const device = useDeviceDetection()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuth()
  const { navigateToProtectedRoute } = useAuthGuard()
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [videos, setVideos] = useState<VideoFeature[]>([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  // Download captcha state
  const [isDownloadCaptchaVerified, setIsDownloadCaptchaVerified] = useState(false)
  const [downloadCaptchaToken, setDownloadCaptchaToken] = useState<string | null>(null)

  const fetchVideos = async () => {
    setIsLoadingVideos(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/feature-videos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setVideos(result.videos || [])
      } else {
        throw new Error(result.message || 'Failed to fetch videos')
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
      toast({
        title: "Failed to Load Videos",
        description: error instanceof Error ? error.message : 'Failed to load videos',
        variant: "destructive",
      })
    } finally {
      setIsLoadingVideos(false)
    }
  }

  const formatVideoDate = (dateString: string) => {
    try {
      // Handle backend format: "October 23 2025 at 9:09:13 AM UTC"
      const cleanedDateString = dateString.replace(' at ', ' ')
      const date = new Date(cleanedDateString)
      
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  const openVideoModal = (videoUrl: string) => {
    setSelectedVideo(videoUrl)
    setShowVideoModal(true)
  }

  const closeVideoModal = () => {
    setShowVideoModal(false)
    setSelectedVideo(null)
  }

  // Scroll to top function for logo
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const handleDownloadCaptchaVerify = (verified: boolean, token?: string) => {
    setIsDownloadCaptchaVerified(verified)
    if (verified && token) {
      setDownloadCaptchaToken(token)
    } else {
      setDownloadCaptchaToken(null)
      setIsDownloadCaptchaVerified(false)
    }
  }

  const handleGooglePlayDownload = () => {
    window.open('https://play.google.com/store/apps/details?id=com.p.zzles.xscard', '_blank')
  }

  const handleApkDownload = () => {
    if (!isDownloadCaptchaVerified || !downloadCaptchaToken) {
      return // Don't allow download without captcha verification and token
    }
    const downloadUrl = getApkDownloadUrl()
    window.open(downloadUrl, '_blank')
  }

  // Load videos on component mount
  useEffect(() => {
    fetchVideos()
  }, [])

  // Handle scroll for navigation styling
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsScrolled(scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showMobileMenu && !target.closest('.mobile-menu-container')) {
        setShowMobileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMobileMenu])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav
        className={`fixed top-4 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/20 backdrop-blur-lg border border-white/10"
            : "bg-white shadow-lg border border-gray-100"
        } ${
          // Desktop and Tablet: fixed 800px width, centered
          "md:left-1/2 md:-translate-x-1/2 md:w-[800px] md:px-6 md:py-4 md:rounded-full " +
          // Mobile: full width minus margins
          "left-4 right-4 px-4 sm:px-6 py-2 sm:py-4 rounded-full"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Image 
                src="/images/xscard-logo.png" 
                alt="XS Card Logo" 
                width={200} 
                height={67} 
                className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto" 
                priority
              />
            </button>
          </div>
          {/* Desktop and Tablet Navigation (md and up) */}
          <div className="hidden md:flex items-center space-x-6 xl:space-x-8">
            <Link href="/">
              <button className="transition-colors font-medium cursor-pointer text-gray-700 hover:text-purple-600">
                Home
              </button>
            </Link>
            <Link href="/#pricing">
              <button className="transition-colors font-medium cursor-pointer text-gray-700 hover:text-purple-600">
                Pricing
              </button>
            </Link>
            <Link href="/#teams">
              <button className="transition-colors font-medium cursor-pointer text-gray-700 hover:text-purple-600">
                Teams
              </button>
            </Link>
            <Link href="/#environmental-impact">
              <button className="transition-colors font-medium cursor-pointer text-gray-700 hover:text-green-600">
                Impact
              </button>
            </Link>
            <Link href="/#contact">
              <button className="transition-colors font-medium cursor-pointer text-gray-700 hover:text-purple-600">
                Contact
              </button>
            </Link>
            <Button 
              className="bg-custom-btn-gradient hover:opacity-90 text-white border-0 px-4 sm:px-6 xl:px-8 text-sm sm:text-base transition-opacity"
              onClick={openModal}
            >
              Download
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden mobile-menu-container">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 hover:text-purple-600"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <div className="relative w-6 h-6">
                <span className={`absolute top-1/2 left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${
                  showMobileMenu ? 'rotate-45 translate-y-0' : '-translate-y-1'
                }`}></span>
                <span className={`absolute top-1/2 left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${
                  showMobileMenu ? 'opacity-0' : 'opacity-100'
                }`}></span>
                <span className={`absolute top-1/2 left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${
                  showMobileMenu ? '-rotate-45 translate-y-0' : 'translate-y-1'
                }`}></span>
              </div>
            </Button>
          </div>
        </div>
      </nav>

      {/* Floating User Profile - Aligned with navbar */}
      {isAuthenticated && (
        <div className="fixed top-6 z-[60] right-8 md:left-[calc(50%+400px+16px)]">
          <UserProfile isOverLightSection={false} isScrolled={isScrolled} />
        </div>
      )}

      {/* Mobile Menu */}
      <>
        {/* Backdrop blur */}
        <div 
          className={`fixed inset-0 z-30 md:hidden transition-all duration-300 ${
            showMobileMenu 
              ? 'bg-black/20 backdrop-blur-sm opacity-100' 
              : 'bg-transparent backdrop-blur-none opacity-0 pointer-events-none'
          }`} 
          onClick={() => setShowMobileMenu(false)} 
        />
        
        {/* Mobile Menu */}
        <div 
          className={`fixed top-20 sm:top-24 left-4 right-4 z-40 md:hidden mobile-menu-container transition-all duration-300 transform ${
            showMobileMenu 
              ? 'translate-y-0 opacity-100' 
              : '-translate-y-4 opacity-0 pointer-events-none'
          }`}
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 p-4">
            <div className="space-y-3">
              <Link href="/">
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                >
                  Home
                </button>
              </Link>
              <Link href="/#pricing">
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                >
                  Pricing
                </button>
              </Link>
              <Link href="/#teams">
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                >
                  Teams
                </button>
              </Link>
              <Link href="/#environmental-impact">
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                >
                  Impact
                </button>
              </Link>
              <Link href="/#contact">
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                >
                  Contact
                </button>
              </Link>
              {isAuthenticated && (
                <div className="pt-2 border-t border-gray-200">
                  <UserProfile isOverLightSection={false} isScrolled={isScrolled} />
                </div>
              )}
              <Button
                className="w-full bg-custom-btn-gradient hover:opacity-90 text-white transition-opacity"
                onClick={() => {
                  openModal()
                  setShowMobileMenu(false)
                }}
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      </>

      {/* Video Grid Section */}
      <section className="px-6 py-20 relative pt-64">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up animation-delay-200">
              Feature Library
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
              Explore XS Card features through interactive demos and comprehensive guides
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-scale animation-delay-600">
            {isLoadingVideos ? (
              <div className="col-span-full text-center py-12">
                <RefreshCw className="w-8 h-8 text-white/40 mx-auto mb-4 animate-spin" />
                <p className="text-white/60">Loading videos...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Play className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No videos available yet</p>
                <p className="text-white/40 text-sm mt-2">Videos will appear here once uploaded by admins</p>
              </div>
            ) : (
              videos.map((video) => (
                <Card
                  key={video.id}
                  className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                  onClick={() => openVideoModal(video.url)}
                >
                  <CardContent className="p-8">
                    {/* Small preview window */}
                    <div className="relative aspect-video bg-black rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                      <video
                        className="w-full h-full object-contain"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => {
                          e.currentTarget.play()
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause()
                          e.currentTarget.currentTime = 0
                        }}
                      >
                        <source src={video.url} type="video/mp4" />
                      </video>
                    </div>
                    
                    {/* Title and Description */}
                    <h3 className="text-xl font-semibold text-white mb-2">{video.filename}</h3>
                    {video.description && (
                      <p className="text-white/70 text-sm mb-3 line-clamp-2">{video.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>{formatVideoDate(video.uploadDate)}</span>
                      <span>{(video.size / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={closeVideoModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-out" />
          
          {/* Modal Content */}
          <div 
            className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl max-w-5xl w-full animate-fade-in-scale overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'fadeInScale 0.3s ease-out'
            }}
          >
            {/* Close Button */}
            <button
              onClick={closeVideoModal}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 hover:scale-110"
              aria-label="Close video"
            >
              <CloseIcon className="w-6 h-6" />
            </button>

            {/* Video Player */}
            <div className="relative aspect-video bg-black">
              <video
                className="w-full h-full"
                controls
                autoPlay
                playsInline
                muted
                onError={(e) => {
                  console.error('Video error:', e);
                  console.error('Video src:', e.currentTarget.src);
                }}
                onLoadStart={() => console.log('Video loading started')}
                onCanPlay={() => console.log('Video can play')}
              >
                <source src={selectedVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Title */}
            <div className="p-6 bg-white/5">
              <h3 className="text-2xl font-bold text-white mb-2">XS Card Demo</h3>
              <p className="text-white/70">See how XS Card transforms digital networking</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image 
                src="/images/xscard-logo.png" 
                alt="XS Card Logo" 
                width={100} 
                height={32} 
                className="h-8 w-auto" 
              />
            </div>
            <div className="flex space-x-6 text-white/60">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/support" className="hover:text-white transition-colors">
                Support
              </Link>
              <button
                onClick={() => {
                  console.log('Admin Login clicked!');
                  navigateToProtectedRoute('/admin');
                }}
                className="hover:text-white transition-colors flex items-center space-x-1 cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <User className="w-4 h-4" />
                <span>Admin Login</span>
              </button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/60">
            <p>&copy; 2024 XS Card. All rights reserved.</p>
            <p className="mt-2">
              Developed by{" "}
              <a 
                href="https://xspark.co.za/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors underline"
              >
                X Spark Pty Ltd
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Download Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-sm animate-fade-in-scale safari-blur bg-black/50"
            onClick={closeModal}
          ></div>

          {/* Modal Content */}
          <div
            className="relative bg-white/25 backdrop-blur-lg border border-white/30 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto modal-scroll animate-fade-in-scale animation-delay-200"
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Get Started with XS Card</h3>
              <p className="text-white/80">Choose your preferred way to begin</p>
            </div>

            {/* Download Options */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-4">📱 Download Our App</h4>
              <div className="grid grid-cols-2 gap-4">
                {/* Google Play Store - Primary Option */}
                <button
                  onClick={handleGooglePlayDownload}
                  className="transition-all duration-300 group shadow-lg rounded-lg p-4 border relative backdrop-blur-sm bg-white/30 border-white/60 ring-2 ring-purple-400/50 hover:bg-white/40"
                >
                  {device.isAndroid && (
                    <div className="absolute -top-2 -right-2 bg-custom-btn-gradient text-white text-xs px-2 py-1 rounded-full font-medium">
                      Recommended
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-custom-btn-gradient rounded-lg flex items-center justify-center shadow-md">
                      <PlatformIcon platform="android" className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-gray-700 font-semibold text-sm drop-shadow-sm">
                        Google Play
                      </div>
                      <div className="text-gray-700 text-xs font-medium drop-shadow-sm">
                        Android App
                      </div>
                    </div>
                  </div>
                </button>
                
                {/* App Store - Primary Option */}
                <a 
                  href="https://apps.apple.com/us/app/xs-card/id6742452317?uo=4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-300 group shadow-lg rounded-lg p-4 border relative backdrop-blur-sm bg-white/30 border-white/60 ring-2 ring-purple-400/50 hover:bg-white/40"
                >
                  {device.isApple && (
                    <div className="absolute -top-2 -right-2 bg-custom-btn-gradient text-white text-xs px-2 py-1 rounded-full font-medium">
                      Recommended
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-custom-btn-gradient rounded-lg flex items-center justify-center shadow-md">
                      <PlatformIcon platform="ios" className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-gray-700 font-semibold text-sm drop-shadow-sm">
                        App Store
                      </div>
                      <div className="text-gray-700 text-xs font-medium drop-shadow-sm">
                        iOS App
                      </div>
                    </div>
                  </div>
                </a>
              </div>
              
              {/* Alternative Download Option for Huawei Devices */}
              <div className="mt-4">
                <details className="group">
                  <summary className="cursor-pointer text-sm text-white/60 hover:text-white/80 transition-colors flex items-center justify-center">
                    <span>Alternative download for Huawei devices</span>
                    <svg className="w-4 h-4 ml-1 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-xs text-white/70 mb-3">
                      For devices that can't access Google Play Store (like Huawei), you can download the APK directly:
                    </p>
                    
                    <button
                      onClick={handleApkDownload}
                      disabled={!isDownloadCaptchaVerified || !downloadCaptchaToken}
                      className={`w-full transition-all duration-300 group shadow-lg rounded-lg p-3 border relative backdrop-blur-sm ${
                        isDownloadCaptchaVerified && downloadCaptchaToken
                          ? 'bg-white/20 border-white/40 hover:bg-white/30'
                          : 'bg-white/10 border-white/30 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center shadow-md">
                          <PlatformIcon platform="android" className="w-3 h-3 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-gray-700 font-semibold text-sm">Download APK</div>
                          <div className="text-gray-700 text-xs">Direct installation file</div>
                        </div>
                      </div>
                    </button>
                    
                    {/* Security Verification for APK Download */}
                    <div className="mt-4">
                      <XSCardCaptcha
                        onVerify={handleDownloadCaptchaVerify}
                        isOverLightSection={false}
                      />
                    </div>
                    
                    {!isDownloadCaptchaVerified || !downloadCaptchaToken ? (
                      <p className="text-xs text-white/60 mt-2 text-center">
                        Please complete security verification to enable APK download.
                      </p>
                    ) : (
                      <p className="text-xs text-green-400 mt-2 text-center">
                        ✓ Security verified - APK download enabled
                      </p>
                    )}
                  </div>
                </details>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center">
              <p className="text-xs text-white/80 font-medium drop-shadow-sm">
                Start creating your digital business card in minutes. No credit card required for free plan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}
