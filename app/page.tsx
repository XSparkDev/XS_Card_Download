"use client"
// Test commit to verify repo sync

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Smartphone, Users, Zap, Shield, Globe, Star, RefreshCw, User, Monitor, Tablet, Play, X as CloseIcon } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import emailjs from "@emailjs/browser"
import Link from "next/link"
import { useDeviceDetection } from "@/hooks/use-device-detection"
import { getApkDownloadUrl, submitSalesForm, submitContactForm, handleApiError, submitQueryWithoutCaptcha, API_BASE_URL } from "@/utils/api"
import { useAuth } from "@/hooks/use-auth"
import { AuthModal } from "@/components/auth/auth-modal"
import { UserProfile } from "@/components/auth/user-profile"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { AuthGuardModal } from "@/components/auth/auth-guard-modal"
import { usePremiumAuthGuard } from "@/hooks/use-premium-auth-guard"
import { PremiumAuthModal } from "@/components/auth/premium-auth-modal"
import { HCaptchaComponent } from "@/components/ui/hcaptcha"
import EnvironmentalImpactDemo from "@/components/EnvironmentalImpactDemo"
import { CurrencySelector } from "@/components/ui/currency-selector"
import { type Currency, convertPrice, formatPrice } from "@/lib/currency"

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

// Enterprise Sales Enquiry Form Interface
interface EnterpriseSalesForm {
  name: string
  jobTitle: string
  email: string
  companyName: string
  companySize: string
  timeline: string
  budgetRange: string
  requirements: string
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

export default function HomePage() {
  const device = useDeviceDetection()
  const { user, isAuthenticated } = useAuth()
  const {
    navigateToProtectedRoute,
    showAuthModal,
    setShowAuthModal,
    authStep,
    setAuthStep,
    isSubmitting: isAuthSubmitting,
    error: authError,
    signInData: authSignInData,
    setSignInData: setAuthSignInData,
    registerData: authRegisterData,
    setRegisterData: setAuthRegisterData,
    handleSignIn: handleAuthSignIn,
    handleRegister: handleAuthRegister
  } = useAuthGuard()

  const {
    navigateToPremiumTrial,
    showAuthModal: showPremiumAuthModal,
    setShowAuthModal: setShowPremiumAuthModal,
    authStep: premiumAuthStep,
    setAuthStep: setPremiumAuthStep,
    isSubmitting: isPremiumSubmitting,
    error: premiumError,
    signInData: premiumSignInData,
    setSignInData: setPremiumSignInData,
    registerData: premiumRegisterData,
    setRegisterData: setPremiumRegisterData,
    cardData: premiumCardData,
    setCardData: setPremiumCardData,
    userData: premiumUserData,
    setUserData: setPremiumUserData,
    handleSignIn: handlePremiumSignIn,
    handleRegister: handlePremiumRegister,
    handleCardSubmit: handlePremiumCardSubmit
  } = usePremiumAuthGuard()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isOverLightSection, setIsOverLightSection] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [demoVideoUrl, setDemoVideoUrl] = useState<string | null>(null)

  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  // Download captcha state
  const [isDownloadCaptchaVerified, setIsDownloadCaptchaVerified] = useState(false)
  const [downloadCaptchaToken, setDownloadCaptchaToken] = useState<string | null>(null)
  
  // Enterprise Sales Form State
  const [enterpriseForm, setEnterpriseForm] = useState<EnterpriseSalesForm>({
    name: "",
    jobTitle: "",
    email: "",
    companyName: "",
    companySize: "",
    timeline: "",
    budgetRange: "",
    requirements: ""
  })
  const [enterpriseFormErrors, setEnterpriseFormErrors] = useState<Partial<EnterpriseSalesForm>>({})
  const [isEnterpriseSubmitting, setIsEnterpriseSubmitting] = useState(false)
  const [enterpriseSubmitStatus, setEnterpriseSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [isEnterpriseCaptchaVerified, setIsEnterpriseCaptchaVerified] = useState(false)
  const [enterpriseCaptchaToken, setEnterpriseCaptchaToken] = useState<string | null>(null)
  
  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("ZAR")
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  })
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  })
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
  })


  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsScrolled(scrollY > 50)

      // Check if scrolled over pricing section (light background)
      const pricingSection = document.getElementById("pricing")
      const contactSection = document.getElementById("contact")

      if (pricingSection) {
        const pricingTop = pricingSection.offsetTop - 100
        const pricingBottom = pricingTop + pricingSection.offsetHeight

        // Only treat the actual pricing block as a light section.
        // Teams and Environmental Impact are dark and must not be considered light.
        setIsOverLightSection(scrollY >= pricingTop && scrollY < pricingBottom)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init("YOUR_PUBLIC_KEY") // Replace with your EmailJS public key
  }, [])

  // Fetch demo video from backend
  const fetchDemoVideo = async () => {
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
      
      if (result.success && result.videos && result.videos.length > 0) {
        // Use the first video as demo video (you can change this logic)
        setDemoVideoUrl(result.videos[0].url)
      }
    } catch (error) {
      console.error('Error fetching demo video:', error)
      // Fallback to local video if backend fails
      setDemoVideoUrl('/videos/demo.mp4')
    }
  }

  // Load demo video on component mount
  useEffect(() => {
    fetchDemoVideo()
  }, [])

  const handleWatchDemo = () => {
    if (demoVideoUrl) {
      setShowVideoModal(true)
    }
  }

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

  // Smooth scroll function with offset for fixed navigation
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      let offsetTop: number

      if (sectionId === "contact") {
        // For contact section, scroll to center of the section
        const sectionHeight = element.offsetHeight
        const viewportHeight = window.innerHeight
        const sectionTop = element.offsetTop
        const centerOffset = (sectionHeight - viewportHeight) / 2
        offsetTop = sectionTop + centerOffset
      } else {
        // For other sections, use standard offset for fixed navigation
        offsetTop = element.offsetTop - 100
      }

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      })
    }
  }

  // Scroll to top function for logo
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignInData({
      ...signInData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    })
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // Format data for API
      const contactFormData = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        message: formData.message,
        captchaToken: captchaToken || undefined
      }

      console.log('🔍 DEBUG: Attempting contact form submission with data:', contactFormData)

      // ALWAYS use bypass in development to avoid captcha issues
      console.log('🔍 DEBUG: Using bypass API to avoid captcha issues')
      const bypassData = {
        name: formData.name,
        email: formData.email,
        message: `Contact Form Inquiry from ${formData.name}\n\nContact Information:\n- Name: ${formData.name}\n- Email: ${formData.email}${formData.company ? `\n- Company: ${formData.company}` : ''}\n\nMessage:\n${formData.message}`,
        to: "xscard@xspark.co.za",
        type: "contact"
      }
      console.log('🔍 DEBUG: Using bypass API with data:', bypassData)
      const response = await submitQueryWithoutCaptcha(bypassData)
      console.log('🔍 DEBUG: Bypass API response:', response)
      
      if (response.success) {
        console.log('🔍 DEBUG: Form submission successful!')
        setSubmitStatus("success")
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({ name: "", email: "", company: "", message: "" })
          setShowContactModal(false)
          setSubmitStatus("idle")
          setIsCaptchaVerified(false)
          setCaptchaToken(null)
        }, 2000)
      } else {
        console.log('🔍 DEBUG: Form submission failed:', response)
        throw new Error(response.message || "Submission failed")
      }
    } catch (error) {
      console.error("🔍 DEBUG: Contact form submission error:", error)
      const errorMessage = handleApiError(error)
      console.error("🔍 DEBUG: Error details:", errorMessage)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }



  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const openContactModal = () => {
    setShowContactModal(true)
    setSubmitStatus("idle")
    setIsCaptchaVerified(false)
  }

  const closeContactModal = () => {
    setShowContactModal(false)
    setSubmitStatus("idle")
    setIsCaptchaVerified(false)
  }





  const handleCaptchaVerify = (verified: boolean, token?: string) => {
    setIsCaptchaVerified(verified)
    if (verified && token) {
      setCaptchaToken(token)
    } else {
      setCaptchaToken(null)
      setSubmitStatus("idle")
    }
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

  // Enterprise Sales Form Handlers
  const handleEnterpriseFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEnterpriseForm(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (enterpriseFormErrors[name as keyof EnterpriseSalesForm]) {
      setEnterpriseFormErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateEnterpriseForm = (): boolean => {
    const errors: Partial<EnterpriseSalesForm> = {}
    
    if (!enterpriseForm.name.trim()) errors.name = "Name is required"
    if (!enterpriseForm.jobTitle.trim()) errors.jobTitle = "Job title is required"
    if (!enterpriseForm.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enterpriseForm.email)) {
      errors.email = "Please enter a valid email address"
    }
    if (!enterpriseForm.companyName.trim()) errors.companyName = "Company name is required"
    if (!enterpriseForm.companySize) errors.companySize = "Company size is required"
    if (!enterpriseForm.timeline) errors.timeline = "Implementation timeline is required"
    if (!enterpriseForm.requirements.trim()) errors.requirements = "Specific requirements are required"
    
    setEnterpriseFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isEnterpriseCaptchaVerified || !enterpriseCaptchaToken) {
      setEnterpriseSubmitStatus("error")
      return
    }

    if (!validateEnterpriseForm()) return

    setIsEnterpriseSubmitting(true)
    setEnterpriseSubmitStatus("idle")
    
    try {
      // Format data for API
      const salesFormData = {
        name: enterpriseForm.name,
        email: enterpriseForm.email,
        company: enterpriseForm.companyName,
        jobTitle: enterpriseForm.jobTitle,
        companySize: enterpriseForm.companySize,
        budget: enterpriseForm.budgetRange,
        timeline: enterpriseForm.timeline,
        requirements: enterpriseForm.requirements,
        captchaToken: enterpriseCaptchaToken // Include captcha token
      }
      
      // Submit to API endpoint
      const response = await submitSalesForm(salesFormData)
      
      if (response.success) {
        setEnterpriseSubmitStatus("success")
        
        // Reset form after successful submission
        setTimeout(() => {
          setEnterpriseForm({
            name: "",
            jobTitle: "",
            email: "",
            companyName: "",
            companySize: "",
            timeline: "",
            budgetRange: "",
            requirements: ""
          })
          setEnterpriseFormErrors({})
          setShowEnterpriseModal(false)
          setEnterpriseSubmitStatus("idle")
          setIsEnterpriseCaptchaVerified(false)
          setEnterpriseCaptchaToken(null)
        }, 3000)
      } else {
        throw new Error(response.message || "Submission failed")
      }
      
    } catch (error) {
      console.error("Enterprise form submission error:", error)
      const errorMessage = handleApiError(error)
      console.error("Error details:", errorMessage)
      setEnterpriseSubmitStatus("error")
    } finally {
      setIsEnterpriseSubmitting(false)
    }
  }

  const openEnterpriseModal = () => {
    setShowEnterpriseModal(true)
    setEnterpriseSubmitStatus("idle")
    setEnterpriseFormErrors({})
  }

  const closeEnterpriseModal = () => {
    setShowEnterpriseModal(false)
    setEnterpriseSubmitStatus("idle")
    setEnterpriseFormErrors({})
  }

  // Determine modal background based on current section - Less transparent
  const getModalBackgroundClass = () => {
    if (isOverLightSection) {
      return "bg-slate-900/90 backdrop-blur-lg border border-slate-700/50"
    }
    return "bg-white/25 backdrop-blur-lg border border-white/30"
  }

  const getInputClass = () => {
    return "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
  }

  const getModalTextClass = () => {
    return isOverLightSection ? "text-gray-900" : "text-white"
  }

  const getModalSecondaryTextClass = () => {
    return isOverLightSection ? "text-gray-600" : "text-white/80"
  }

  // Get platform-specific text and icon based on detected device
  const getPlatformInfo = () => {
    if (device.isMobile) {
      if (device.isApple) {
        return {
          text: "Available on iOS",
          icon: (
            <PlatformIcon platform="ios" className="h-5 w-5 text-white/40" />
          ),
          className: "text-white/40",
          isAvailable: false
        }
      } else if (device.isAndroid) {
        return {
          text: "Available on Android",
          icon: (
            <PlatformIcon platform="android" className="h-5 w-5 text-white/60" />
          ),
          className: "text-white/60",
          isAvailable: true
        }
      } else {
        return {
          text: "Available on mobile!",
          icon: <Smartphone className="h-5 w-5" />,
          className: "text-white/60",
          isAvailable: true
        }
      }
    } else if (device.isTablet) {
      if (device.isApple) {
        return {
          text: "Available on iOS",
          icon: (
            <PlatformIcon platform="ios" className="h-4 w-4 text-white/40" />
          ),
          className: "text-white/40",
          isAvailable: false
        }
      } else {
        return {
          text: "Available on Android tablets",
          icon: (
            <PlatformIcon platform="android" className="h-5 w-5 text-white/60" />
          ),
          className: "text-white/60",
          isAvailable: true
        }
      }
    } else {
      // Desktop
      if (device.isApple) {
        return {
          text: "Available on macOS",
          icon: (
            <PlatformIcon platform="ios" className="h-4 w-4 text-white/40" />
          ),
          className: "text-white/40",
          isAvailable: false
        }
      } else if (device.isWindows) {
        return {
          text: "Available on Windows!",
          icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 3.545L9.818 2.182v9.818H0V3.545zM10.909 2.182L24 0v11.727H10.909V2.182zM0 12.727h9.818V24L0 22.364V12.727zM10.909 12.727H24V24L10.909 22.364V12.727z"/>
            </svg>
          ),
          className: "text-white/60",
          isAvailable: true
        }
      } else if (device.isLinux) {
        return {
          text: "Available on Linux!",
          icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          ),
          className: "text-white/60",
          isAvailable: true
        }
      } else {
        return {
          text: "Available on desktop!",
          icon: <Monitor className="h-5 w-5" />,
          className: "text-white/60",
          isAvailable: true
        }
      }
    }
  }

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
            <button
              onClick={() => scrollToSection("features")}
              className={`transition-colors font-medium cursor-pointer ${
                isOverLightSection
                  ? "text-gray-700 hover:text-purple-600"
                  : isScrolled
                    ? "text-white/90 hover:text-white"
                    : "text-gray-700 hover:text-purple-600"
              }`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className={`transition-colors font-medium cursor-pointer ${
                isOverLightSection
                  ? "text-gray-700 hover:text-purple-600"
                  : isScrolled
                    ? "text-white/90 hover:text-white"
                    : "text-gray-700 hover:text-purple-600"
              }`}
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("teams")}
              className={`transition-colors font-medium cursor-pointer ${
                isOverLightSection
                  ? "text-gray-700 hover:text-purple-600"
                  : isScrolled
                    ? "text-white/90 hover:text-white"
                    : "text-gray-700 hover:text-purple-600"
              }`}
            >
              Teams
            </button>
            <button
              onClick={() => scrollToSection("environmental-impact")}
              className={`transition-colors font-medium cursor-pointer ${
                isOverLightSection
                  ? "text-gray-700 hover:text-green-600"
                  : isScrolled
                    ? "text-white/90 hover:text-white"
                    : "text-gray-700 hover:text-green-600"
              }`}
            >
              Impact
            </button>
            <button
              onClick={openContactModal}
              className={`transition-colors font-medium cursor-pointer ${
                isOverLightSection
                  ? "text-gray-700 hover:text-purple-600"
                  : isScrolled
                    ? "text-white/90 hover:text-white"
                    : "text-gray-700 hover:text-purple-600"
              }`}
            >
              Contact
            </button>
            {isAuthenticated && <UserProfile isOverLightSection={isOverLightSection} isScrolled={isScrolled} />}
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
              className={`${
                isOverLightSection
                  ? "text-gray-700 hover:text-purple-600"
                  : isScrolled
                    ? "text-white/90 hover:text-white"
                    : "text-gray-700 hover:text-purple-600"
              }`}
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
              <button
                onClick={() => {
                  scrollToSection("features")
                  setShowMobileMenu(false)
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => {
                  scrollToSection("pricing")
                  setShowMobileMenu(false)
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => {
                  scrollToSection("teams")
                  setShowMobileMenu(false)
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
              >
                Teams
              </button>
              <button
                onClick={() => {
                  scrollToSection("environmental-impact")
                  setShowMobileMenu(false)
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
              >
                Impact
              </button>
              <button
                onClick={() => {
                  openContactModal()
                  setShowMobileMenu(false)
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
              >
                Contact
              </button>
              {isAuthenticated && (
                <div className="pt-2 border-t border-gray-200">
                  <UserProfile isOverLightSection={isOverLightSection} isScrolled={isScrolled} />
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

      {/* Hero Section */}
      <section id="hero" className="relative px-4 sm:px-6 min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10 px-2 sm:px-0">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 animate-fade-in-up">
            ✨ The Future of Business Cards
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up animation-delay-200">
            Your Digital
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}
              Business Card
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400 px-4">
            Create stunning, interactive digital business cards that make lasting impressions. Share your professional
            identity instantly with QR codes, NFC, and smart links.
          </p>
          <div className="flex justify-center items-center animate-fade-in-up animation-delay-600">
            <Button
              size="lg"
              className="bg-custom-btn-gradient hover:opacity-90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-2xl transition-opacity"
              onClick={openModal}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
          <div className="mt-4 flex justify-center items-center animate-fade-in-up animation-delay-800">
            {isClient ? (
              (() => {
                const platformInfo = getPlatformInfo()
                return (
                  <div className={`flex items-center space-x-2 ${platformInfo.className}`}>
                    {platformInfo.icon}
                    <span>{platformInfo.text}</span>
                  </div>
                )
              })()
            ) : (
              <div className="flex items-center space-x-2 text-white/60">
                <Monitor className="h-5 w-5" />
                <span>Available on desktop!</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section (Why Choose XSCard?) */}
      <section id="features" className="px-6 py-20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up animation-delay-200">
              Why Choose XS Card?
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto animate-fade-in-up animation-delay-400 mb-8">
              Experience the next generation of professional networking with our cutting-edge features
            </p>
            
            {/* Watch Demo Button */}
            <div className="flex justify-center animate-fade-in-up animation-delay-600 mb-12">
              <Button
                onClick={handleWatchDemo}
                className="bg-custom-btn-gradient hover:opacity-90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-2xl transition-opacity"
              >
                Watch Demo
                <Play className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-scale animation-delay-800">
            {[
              {
                icon: <Smartphone className="h-8 w-8" />,
                title: "Mobile Optimized",
                description: "Perfect viewing experience on all devices with responsive design and fast loading times.",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Easy Sharing",
                description: "Share via QR code, NFC tap, or direct link. No app downloads required for recipients.",
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Real-time Updates",
                description: "Update your information instantly. All shared cards reflect changes immediately.",
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Privacy Focused",
                description: "Control who sees what information with granular privacy settings and analytics.",
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Global Reach",
                description: "Works worldwide with multi-language support and international contact formats.",
              },
              {
                icon: <Star className="h-8 w-8" />,
                title: "Premium Templates",
                description: "Choose from dozens of professionally designed templates or create your own.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 group"
              >
                <CardContent className="p-8">
                  <div className="text-purple-400 mb-4 group-hover:text-pink-400 transition-colors">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Library Button */}
          <div className="flex justify-center mt-12 animate-fade-in-up animation-delay-1000">
            <Link href="/feature-library">
              <Button className="bg-custom-btn-gradient hover:opacity-90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-2xl transition-opacity">
                Feature Library
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20 relative bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Pricing Plans</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Choose the perfect plan for your business needs. All prices are exclusive of VAT.
            </p>
            <div className="flex justify-center">
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="bg-white border-2 border-gray-200 hover:border-purple-300 transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {formatPrice(convertPrice(0, "ZAR", selectedCurrency), selectedCurrency)}
                  </div>
                  <div className="text-gray-600">/month</div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Create one basic digital business card</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Standard QR code sharing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Email support within 48 hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Basic card customisation options</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Share via link or QR code</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Maximum 20 contacts</span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-custom-btn-gradient hover:opacity-90 text-white transition-opacity"
                  onClick={openModal}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-white border-2 border-purple-500 hover:border-purple-600 transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-custom-btn-gradient text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {selectedCurrency === "USD" ? "$12.00" : "R159.99"}
                  </div>
                  <div className="text-gray-600">/user/month</div>
                  <div className="text-sm text-purple-600 mt-1">
                    {selectedCurrency === "USD" ? "$120.00" : "R1,800"}/year (Save {selectedCurrency === "USD" ? "$24.00" : "R120"} with annual billing)
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Create unlimited digital business cards</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Advanced customisation with custom branding</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Premium QR code designs with brand colours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Basic analytics (scans, contacts)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Priority email support within 12 hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Social media integration</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Direct calendar booking integration</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Team sharing (up to 5 members)</span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-custom-btn-gradient hover:opacity-90 text-white transition-opacity"
                                      onClick={navigateToPremiumTrial}
                >
                  Start Premium Trial
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-white border-2 border-gray-200 hover:border-purple-300 transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise Plan</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-1">Custom</div>
                  <div className="text-gray-600">Pricing</div>
                  <div className="text-sm text-gray-500 mt-1">Contact our sales team</div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">All Premium features included</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Custom API integration</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Advanced security features</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">White-label options</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Unlimited team members</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">24/7 priority support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">CRM system integration</span>
                  </li>
                </ul>
                <Button
                  className="w-full bg-custom-btn-gradient hover:opacity-90 text-white transition-opacity"
                  onClick={openEnterpriseModal}
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="space-y-2">
                  <p>• All prices are exclusive of VAT</p>
                  <p>• Secure payment through {selectedCurrency === "ZAR" ? "SA banks" : "international payment gateways"}</p>
                  <p>• Monthly plans can be cancelled anytime</p>
                  <p>• Annual plans offer significant savings</p>
                </div>
                <div className="space-y-2">
                  <p>• All paid plans include 7-day free trial</p>
                  <p>• Billing in {selectedCurrency}</p>
                  <p>• POPIA compliant</p>
                  <p>• Full mobile app access included</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teams and Departments Section */}
      <section id="teams" className="px-6 py-20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up animation-delay-200">
              XS Card for Teams and Departments
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
              Connect. Track. Grow.
            </p>
            <p className="text-lg text-white/70 max-w-4xl mx-auto mt-6 animate-fade-in-up animation-delay-600">
              XS Card is a digital business card and real-time CRM designed to help teams connect smarter, manage relationships efficiently, and measure engagement effortlessly.
            </p>
            <p className="text-base text-white/60 max-w-4xl mx-auto mt-4 animate-fade-in-up animation-delay-800">
              From marketing and sales to communications, HR, and operations, XS Card brings visibility, consistency, and control to every professional interaction — all through a single, intuitive dashboard.
            </p>
          </div>

          {/* How Teams Use XS Card */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">How Teams Use XS Card</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className="text-purple-400 mb-4 group-hover:text-pink-400 transition-colors">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-3">Event & Campaign Tracking</h4>
                  <p className="text-white/70 leading-relaxed">
                    Capture every connection. Each shared XS Card automatically logs data such as number of shares, engagement levels, and locations — giving your team real-time insights into performance and campaign reach.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className="text-purple-400 mb-4 group-hover:text-pink-400 transition-colors">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-3">Lead and Contact Management</h4>
                  <p className="text-white/70 leading-relaxed">
                    Never lose a lead again. Track, manage, and follow up on every connection instantly. Identify your most engaged prospects and integrate seamlessly with existing CRM or communication tools.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className="text-purple-400 mb-4 group-hover:text-pink-400 transition-colors">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-3">Centralised Brand and Profile Control</h4>
                  <p className="text-white/70 leading-relaxed">
                    Keep your organisation consistent and professional. Update contact details, logos and web links across all employee cards instantly from the dashboard.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className="text-purple-400 mb-4 group-hover:text-pink-400 transition-colors">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-3">Cross-Departmental Insights</h4>
                  <p className="text-white/70 leading-relaxed">
                    Get a big-picture view of engagement across your company. Compare performance between teams, divisions, or regions to make smarter marketing and operational decisions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Designed for Every Department */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">Designed for Every Department</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="text-purple-400 mb-4 group-hover:text-pink-400 transition-colors">
                    <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Marketing</h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Measure brand visibility and engagement across events, campaigns, and activations. XS Card turns every interaction into actionable marketing data.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="text-purple-400 mb-4 group-hover:text-pink-400 transition-colors">
                    <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Sales</h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Empower your sales team with instant lead capture, real-time insights, and automated CRM integration — helping them focus on closing deals, not collecting business cards.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="text-purple-400 mb-4 group-hover:text-pink-400 transition-colors">
                    <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Human Resources</h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Equip new hires with digital business cards instantly and maintain consistent contact details, roles, and branding across your organisation.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="text-purple-400 mb-4 group-hover:text-pink-400 transition-colors">
                    <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Operations & Corporate Services</h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Gain oversight of engagement activity across departments. XS Card simplifies data collection and reporting, helping you align teams around performance and communication goals.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Why XS Card Works */}
          <div className="text-center">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-8 max-w-4xl mx-auto">
              <CardContent className="p-0">
                <h3 className="text-2xl font-bold text-white mb-4">Why XS Card Works</h3>
                <p className="text-lg text-white/80 leading-relaxed">
                  XS Card bridges the gap between people and performance — giving organisations the power to track, analyse, and enhance every professional interaction, while maintaining a unified brand identity across teams and departments.
                </p>
                <div className="mt-8">
                  <Button
                    size="lg"
                    className="bg-custom-btn-gradient hover:opacity-90 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-opacity w-full sm:w-auto"
                    onClick={openEnterpriseModal}
                  >
                    Get Started for Your Team
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Environmental Impact Demo Section */}
      <EnvironmentalImpactDemo />

      {/* Contact Section - Extended for proper modal transparency */}
      <section id="contact" className="px-6 py-20 relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl"></div>

        {/* Additional spacing to ensure clear separation from environmental impact section */}
        <div className="w-full">
          {/* Top spacing for clear transition from environmental impact section */}
          <div className="h-8"></div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-12">
              <CardContent className="p-0">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Go Digital?</h2>
                <p className="text-xl text-white/80 mb-6 max-w-2xl mx-auto">
                  Join thousands of professionals who've already made the switch to digital business cards.
                </p>
                <p className="text-sm text-white/60 mb-8 max-w-xl mx-auto">
                  🌱 By choosing digital business cards, you're helping reduce paper waste and supporting our carbon
                  offset initiatives. Every digital card created helps fund reforestation projects worldwide.
                </p>
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    className="bg-custom-btn-gradient hover:opacity-90 text-white px-8 py-4 text-lg font-semibold transition-opacity"
                    onClick={openModal}
                  >
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional content to extend the section */}
          <div className="max-w-6xl mx-auto mt-20">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="text-white/80">
                <div className="text-3xl font-bold text-white mb-2">10,000+</div>
                <p className="text-sm">Digital Cards Created</p>
              </div>
              <div className="text-white/80">
                <div className="text-3xl font-bold text-white mb-2">500+</div>
                <p className="text-sm">Companies Trust XS Card</p>
              </div>
              <div className="text-white/80">
                <div className="text-3xl font-bold text-white mb-2">50,000+</div>
                <p className="text-sm">Trees Planted</p>
              </div>
            </div>
          </div>

          {/* Bottom spacing to ensure full section coverage */}
          <div className="h-32"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/10">
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
            className={`absolute inset-0 backdrop-blur-sm animate-fade-in-scale safari-blur ${
              isOverLightSection ? "bg-black/70" : "bg-black/50"
            }`}
            onClick={closeModal}
          ></div>

          {/* Modal Content */}
          <div
            className={`relative ${getModalBackgroundClass()} rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto modal-scroll animate-fade-in-scale animation-delay-200`}
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
                      <div className={`${isOverLightSection ? 'text-white' : 'text-gray-700'} font-semibold text-sm drop-shadow-sm`}>
                        Google Play
                      </div>
                      <div className={`${isOverLightSection ? 'text-white/70' : 'text-gray-700'} text-xs font-medium drop-shadow-sm`}>
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
                      <div className={`${isOverLightSection ? 'text-white' : 'text-gray-700'} font-semibold text-sm drop-shadow-sm`}>
                        App Store
                      </div>
                      <div className={`${isOverLightSection ? 'text-white/70' : 'text-gray-700'} text-xs font-medium drop-shadow-sm`}>
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
                          <div className={`${isOverLightSection ? 'text-white' : 'text-gray-700'} font-semibold text-sm`}>Download APK</div>
                          <div className={`${isOverLightSection ? 'text-white/70' : 'text-gray-700'} text-xs`}>Direct installation file</div>
                        </div>
                      </div>
                    </button>
                    
                    {/* Security Verification for APK Download */}
                    <div className="mt-4">
                      <XSCardCaptcha
                        onVerify={handleDownloadCaptchaVerify}
                        isOverLightSection={isOverLightSection}
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

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 backdrop-blur-sm animate-fade-in-scale safari-blur ${
              isOverLightSection ? "bg-black/70" : "bg-black/50"
            }`}
            onClick={closeContactModal}
          ></div>

          {/* Modal Content */}
          <div
            className={`relative ${getModalBackgroundClass()} rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto modal-scroll animate-fade-in-scale animation-delay-200`}
          >
            {/* Close Button */}
            <button
              onClick={closeContactModal}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <Image 
                  src="/favicon.png" 
                  alt="XS Card Logo" 
                  width={32} 
                  height={32} 
                  className="mr-3 rounded-lg"
                />
                <h3 className="text-2xl font-bold text-white">Get In Touch</h3>
              </div>
            </div>

            {/* Success/Error Messages */}
            {submitStatus === "success" && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-center font-medium">
                  ✅ Thank you! We'll be in touch within 24 hours.
                </p>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-center font-medium">
                  {!isCaptchaVerified
                    ? "❌ Please complete the security verification first."
                    : "❌ Something went wrong. Please try again or contact us directly."}
                </p>
              </div>
            )}

            {/* Contact Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={getInputClass()}
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={getInputClass()}
                    placeholder="your.email@company.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-white mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className={getInputClass()}
                    placeholder="Your Company Name (Optional)"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                    How can we help you?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 resize-none"
                    rows={4}
                    placeholder="Tell us about your needs, team size, or any questions..."
                    disabled={isSubmitting}
                  />
                </div>

                {/* Captcha */}
                <div>
                  <XSCardCaptcha
                  onVerify={(verified: boolean, token?: string) => {
                    setIsCaptchaVerified(verified)
                    if (verified && token) {
                      setCaptchaToken(token)
                    } else {
                      setCaptchaToken(null)
                      setSubmitStatus("idle")
                    }
                  }}
                    isOverLightSection={isOverLightSection}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={
                    isSubmitting || !formData.name || !formData.email || !formData.message || submitStatus === "success"
                  }
                  className="w-full bg-custom-btn-gradient hover:opacity-90 text-white transition-opacity"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Send Message"
                  )}
                </Button>

                {/* Footer Text */}
                <div className="text-center pt-4">
                  <p className="text-white/80 text-sm">
                    We'll get back to you within 24 hours with personalized recommendations.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Sales Enquiry Modal */}
      {showEnterpriseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 backdrop-blur-sm animate-fade-in-scale safari-blur ${
              isOverLightSection ? "bg-black/70" : "bg-black/50"
            }`}
            onClick={closeEnterpriseModal}
          ></div>

          {/* Modal Content */}
          <div
            className={`relative ${getModalBackgroundClass()} rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-scroll animate-fade-in-scale animation-delay-200`}
          >
            {/* Close Button */}
            <button
              onClick={closeEnterpriseModal}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-3">
                <Image 
                  src="/favicon.png" 
                  alt="XS Card Logo" 
                  width={40} 
                  height={40} 
                  className="mr-3 rounded-lg"
                />
                <h3 className="text-3xl font-bold text-white">Enterprise Sales Enquiry</h3>
              </div>
              <p className="text-white/80 text-lg">Tell us about your business needs and we'll get back to you within 24 hours</p>
            </div>

            {/* Success/Error Messages */}
            {enterpriseSubmitStatus === "success" && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-center font-medium">
                  ✅ Thank you! Our enterprise sales team will contact you within 24 hours.
                </p>
              </div>
            )}

            {enterpriseSubmitStatus === "error" && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-center font-medium">
                  {!isEnterpriseCaptchaVerified
                    ? "❌ Please complete the security verification first."
                    : "❌ Something went wrong. Please try again or contact us directly."}
                </p>
              </div>
            )}

            {/* Enterprise Form */}
            <form onSubmit={handleEnterpriseSubmit} className="space-y-6">
              {/* Personal Information - 2-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={enterpriseForm.name}
                    onChange={handleEnterpriseFormChange}
                    className={`${getInputClass()} ${enterpriseFormErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Full name"
                    disabled={isEnterpriseSubmitting}
                  />
                  {enterpriseFormErrors.name && (
                    <p className="text-red-400 text-sm mt-1">{enterpriseFormErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-white mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    required
                    value={enterpriseForm.jobTitle}
                    onChange={handleEnterpriseFormChange}
                    className={`${getInputClass()} ${enterpriseFormErrors.jobTitle ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="e.g. CTO, VP Sales"
                    disabled={isEnterpriseSubmitting}
                  />
                  {enterpriseFormErrors.jobTitle && (
                    <p className="text-red-400 text-sm mt-1">{enterpriseFormErrors.jobTitle}</p>
                  )}
                </div>
              </div>

              {/* Contact Information - full width */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={enterpriseForm.email}
                    onChange={handleEnterpriseFormChange}
                    className={`${getInputClass()} ${enterpriseFormErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="your.email@company.com"
                    disabled={isEnterpriseSubmitting}
                  />
                  {enterpriseFormErrors.email && (
                    <p className="text-red-400 text-sm mt-1">{enterpriseFormErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-white mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    required
                    value={enterpriseForm.companyName}
                    onChange={handleEnterpriseFormChange}
                    className={`${getInputClass()} ${enterpriseFormErrors.companyName ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Your company name"
                    disabled={isEnterpriseSubmitting}
                  />
                  {enterpriseFormErrors.companyName && (
                    <p className="text-red-400 text-sm mt-1">{enterpriseFormErrors.companyName}</p>
                  )}
                </div>
              </div>

              {/* Business Context - 2-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="companySize" className="block text-sm font-medium text-white mb-2">
                    Company Size *
                  </label>
                  <select
                    id="companySize"
                    name="companySize"
                    required
                    value={enterpriseForm.companySize}
                    onChange={handleEnterpriseFormChange}
                    className={`${getInputClass()} ${enterpriseFormErrors.companySize ? 'border-red-500 focus:ring-red-500' : ''}`}
                    disabled={isEnterpriseSubmitting}
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                  {enterpriseFormErrors.companySize && (
                    <p className="text-red-400 text-sm mt-1">{enterpriseFormErrors.companySize}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-white mb-2">
                    Implementation Timeline *
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    required
                    value={enterpriseForm.timeline}
                    onChange={handleEnterpriseFormChange}
                    className={`${getInputClass()} ${enterpriseFormErrors.timeline ? 'border-red-500 focus:ring-red-500' : ''}`}
                    disabled={isEnterpriseSubmitting}
                  >
                    <option value="">Select timeline</option>
                    <option value="immediate">Immediate (1-30 days)</option>
                    <option value="quarter">This quarter (1-3 months)</option>
                    <option value="6months">Next 6 months</option>
                    <option value="planning">Planning phase (6+ months)</option>
                  </select>
                  {enterpriseFormErrors.timeline && (
                    <p className="text-red-400 text-sm mt-1">{enterpriseFormErrors.timeline}</p>
                  )}
                </div>
              </div>

              {/* Budget Information - full width */}
              <div>
                <label htmlFor="budgetRange" className="block text-sm font-medium text-white mb-2">
                  Annual Budget Range
                </label>
                <select
                  id="budgetRange"
                  name="budgetRange"
                  value={enterpriseForm.budgetRange}
                  onChange={handleEnterpriseFormChange}
                  className={getInputClass()}
                  disabled={isEnterpriseSubmitting}
                >
                  <option value="">Select budget range</option>
                  <option value="under-50k">Under R50,000</option>
                  <option value="50k-100k">R50,000 - R100,000</option>
                  <option value="100k-250k">R100,000 - R250,000</option>
                  <option value="250k-500k">R250,000 - R500,000</option>
                  <option value="500k+">R500,000+</option>
                  <option value="discuss">Prefer to discuss</option>
                </select>
              </div>

              {/* Requirements - full width */}
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-white mb-2">
                  Specific Requirements *
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  required
                  value={enterpriseForm.requirements}
                  onChange={handleEnterpriseFormChange}
                  className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 resize-none ${enterpriseFormErrors.requirements ? 'border-red-500 focus:ring-red-500' : ''}`}
                  rows={4}
                  placeholder="Tell us about your specific needs: integration requirements, compliance needs, user count, custom features, etc."
                  disabled={isEnterpriseSubmitting}
                />
                {enterpriseFormErrors.requirements && (
                  <p className="text-red-400 text-sm mt-1">{enterpriseFormErrors.requirements}</p>
                )}
              </div>

              {/* Captcha */}
              <div>
                <XSCardCaptcha
                  onVerify={(verified: boolean, token?: string) => {
                    setIsEnterpriseCaptchaVerified(verified)
                    if (!verified) {
                      setEnterpriseCaptchaToken(null)
                      setEnterpriseSubmitStatus("idle")
                    } else if (token) {
                      setEnterpriseCaptchaToken(token)
                    }
                  }}
                  isOverLightSection={isOverLightSection}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isEnterpriseSubmitting || enterpriseSubmitStatus === "success"}
                className="w-full bg-custom-btn-gradient hover:opacity-90 text-white py-3 text-lg font-semibold transition-opacity"
              >
                {isEnterpriseSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit"
                )}
              </Button>

              {/* Footer Text */}
              <div className="text-center pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm">
                  By submitting this form, you agree to our privacy policy and consent to being contacted by our sales team.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Auth Guard Modal */}
      <AuthGuardModal
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        authStep={authStep}
        setAuthStep={setAuthStep}
        isSubmitting={isAuthSubmitting}
        error={authError}
        signInData={authSignInData}
        setSignInData={setAuthSignInData}
        registerData={authRegisterData}
        setRegisterData={setAuthRegisterData}
        handleSignIn={handleAuthSignIn}
        handleRegister={handleAuthRegister}
        isOverLightSection={isOverLightSection}
      />

      {/* Premium Auth Modal */}
      <PremiumAuthModal
        showAuthModal={showPremiumAuthModal}
        setShowAuthModal={setShowPremiumAuthModal}
        authStep={premiumAuthStep}
        setAuthStep={setPremiumAuthStep}
        isSubmitting={isPremiumSubmitting}
        error={premiumError}
        signInData={premiumSignInData}
        setSignInData={setPremiumSignInData}
        registerData={premiumRegisterData}
        setRegisterData={setPremiumRegisterData}
        cardData={premiumCardData}
        setCardData={setPremiumCardData}
        userData={premiumUserData}
        handleSignIn={handlePremiumSignIn}
        handleRegister={handlePremiumRegister}
        handleCardSubmit={handlePremiumCardSubmit}
        isOverLightSection={isOverLightSection}
      />

      {/* Video Demo Modal */}
      {showVideoModal && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
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
              onClick={() => setShowVideoModal(false)}
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
                src={demoVideoUrl || '/videos/demo.mp4'}
                onError={(e) => {
                  console.error('Video error:', e);
                  console.error('Video src:', e.currentTarget.src);
                }}
                onLoadStart={() => console.log('Video loading started')}
                onCanPlay={() => console.log('Video can play')}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Optional: Video Title */}
            <div className="p-6 bg-white/5">
              <h3 className="text-2xl font-bold text-white mb-2">XS Card Demo</h3>
              <p className="text-white/70">See how XS Card transforms digital networking</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
