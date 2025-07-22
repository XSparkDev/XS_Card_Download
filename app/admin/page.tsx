"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  RefreshCw,
  Upload,
  MessageSquare,
  Phone,
  Mail,
  Eye,
  Reply,
  Download,
  Settings,
  Smartphone,
  Shield,
  Menu,
  X,
} from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import Link from "next/link"
import { UserProfile } from "@/components/auth/user-profile"
import { auth } from "@/lib/firebase"
import { API_BASE_URL } from "@/utils/api"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface CustomerRequest {
  id: number;
  type: "demo" | "inquiry" | "call";
  name: string;
  email: string;
  company: string;
  message: string;
  date: string;
  status: "pending" | "responded";
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"requests" | "uploads">("requests")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [requests, setRequests] = useState<CustomerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null)
  const [responseText, setResponseText] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [filters, setFilters] = useState({
    type: "",
    status: ""
  })
  const [currentPage, setCurrentPage] = useState(1)
  const requestsPerPage = 5
  const [accessDenied, setAccessDenied] = useState(false)
  
  // Domain restriction check
  useEffect(() => {
    const checkDomainAccess = () => {
      const user = auth.currentUser
      if (user && user.email) {
        const emailDomain = user.email.split('@')[1]?.toLowerCase()
        if (emailDomain !== 'xspark.co.za') {
          setAccessDenied(true)
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this area.",
            variant: "destructive",
          })
        }
      }
    }

    // Check immediately
    checkDomainAccess()

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email) {
        const emailDomain = user.email.split('@')[1]?.toLowerCase()
        if (emailDomain !== 'xspark.co.za') {
          setAccessDenied(true)
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this area.",
            variant: "destructive",
          })
        } else {
          setAccessDenied(false)
        }
      }
    })

    return () => unsubscribe()
  }, [toast])
  
  // Mock data for when backend is unavailable
  const mockRequests: CustomerRequest[] = [
    {
      id: 1,
      type: "demo",
      name: "John Smith",
      email: "john.smith@company.com",
      company: "Tech Solutions Inc",
      message: "I'm interested in seeing a demo of your digital business card solution. We have a team of 50+ sales representatives who could benefit from this.",
      date: "2024-01-15",
      status: "pending"
    },
    {
      id: 2,
      type: "inquiry",
      name: "Sarah Johnson",
      email: "sarah.j@startup.co",
      company: "Innovation Startup",
      message: "What are your pricing plans for small businesses? We're looking for a cost-effective solution for our team of 10 people.",
      date: "2024-01-14",
      status: "responded"
    },
    {
      id: 3,
      type: "call",
      name: "Michael Chen",
      email: "mchen@enterprise.com",
      company: "Enterprise Corp",
      message: "Please call me to discuss enterprise licensing options. We're interested in deploying this across multiple departments.",
      date: "2024-01-13",
      status: "pending"
    }
  ]

  // Fetch requests from API
  const fetchRequests = async () => {
    // Don't fetch if access is denied
    if (accessDenied) {
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const user = auth.currentUser
      if (!user) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      const idToken = await user.getIdToken()
      
      // Build query parameters
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.status) params.append('status', filters.status)
      
      // Try multiple endpoint variations
      const endpoints = [
        `${API_BASE_URL}/api/contact-requests/frontend`,
        `${API_BASE_URL}/api/contact-requests`,
        `${API_BASE_URL}/contact-requests/frontend`,
        `${API_BASE_URL}/contact-requests`
      ]
      
      let lastError: Error | null = null
      
      for (const endpoint of endpoints) {
        try {
          const url = `${endpoint}${params.toString() ? `?${params.toString()}` : ''}`
          console.log('🔍 Trying endpoint:', url)
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json'
            }
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const result = await response.json()
          
          if (result.success) {
            console.log('✅ Successfully fetched requests from:', endpoint)
            setRequests(result.data || [])
            return // Success, exit the loop
          } else {
            throw new Error(result.message || 'Failed to fetch requests')
          }
        } catch (error) {
          console.warn(`⚠️ Failed to fetch from ${endpoint}:`, error)
          lastError = error instanceof Error ? error : new Error('Unknown error')
          continue // Try next endpoint
        }
      }
      
      // If all endpoints failed, use mock data as fallback
      if (lastError) {
        console.warn('⚠️ Using mock data as fallback - backend unavailable')
        setRequests(mockRequests)
        setError('Backend server unavailable. Showing demo data.')
        return
      }
      
    } catch (error) {
      console.error('❌ All endpoints failed:', error)
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to fetch requests'
      if (error instanceof Error) {
        if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
          errorMessage = 'Request blocked by browser. Please check your ad blocker or try a different browser.'
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running.'
        } else if (error.message.includes('401')) {
          errorMessage = 'Authentication failed. Please log in again.'
        } else if (error.message.includes('403')) {
          errorMessage = 'Access denied. You may not have admin privileges.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fetch requests on component mount and when filters change
  useEffect(() => {
    fetchRequests()
  }, [filters])

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

  // Handle modal keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedRequest && event.key === 'Escape') {
        setSelectedRequest(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedRequest])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith(".apk")) {
      setUploadFile(file)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) return
    
    // Don't upload if access is denied
    if (accessDenied) {
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const user = auth.currentUser
      if (!user) {
        setError('User not authenticated')
        setIsUploading(false)
        return
      }

      const idToken = await user.getIdToken()
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', uploadFile)
      
      // Make API call to upload APK
      console.log('🔍 Uploading APK to:', `${API_BASE_URL}/upload-apk`)
      console.log('🔍 File size:', uploadFile.size, 'bytes')
      console.log('🔍 File name:', uploadFile.name)
      
      const response = await fetch(`${API_BASE_URL}/upload-apk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
        mode: 'cors' // Explicitly set CORS mode
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Upload successful
        setUploadProgress(100)
        setUploadFile(null)
        
        // Show success toast
        toast({
          title: "APK Uploaded Successfully!",
          description: "Your app has been deployed successfully.",
          variant: "default",
        })
      } else {
        throw new Error(result.message || 'Failed to upload APK')
      }
    } catch (error) {
      console.error('Error uploading APK:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload APK')
      
      // Show error toast
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload APK',
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleResponse = async (requestId: number) => {
    if (!responseText.trim()) return
    
    // Don't respond if access is denied
    if (accessDenied) {
      return
    }
    
    try {
      const user = auth.currentUser
      if (!user) {
        setError('User not authenticated')
        toast({
          title: "Authentication Error",
          description: "Please log in again to send responses.",
          variant: "destructive",
        })
        return
      }

      const idToken = await user.getIdToken()
      
      // Make API call to update request status
      const response = await fetch(`${API_BASE_URL}/api/contact-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: "responded",
          response: responseText.trim(),
          notes: "Response sent via admin dashboard"
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Update local state to reflect the change
        setRequests((prev) => prev.map((req) => 
          req.id === requestId ? { ...req, status: "responded" as const } : req
        ))
        
        setSelectedRequest(null)
        setResponseText("")
        
        // Show success toast
        toast({
          title: "Response Sent Successfully!",
          description: "Your response has been sent to the customer.",
          variant: "default",
        })
      } else {
        throw new Error(result.message || 'Failed to send response')
      }
    } catch (error) {
      console.error('Error responding to request:', error)
      setError(error instanceof Error ? error.message : 'Failed to send response')
      
      // Show error toast
      toast({
        title: "Failed to Send Response",
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-400/20"
      case "responded":
        return "text-green-400 bg-green-400/20"
      default:
        return "text-gray-400 bg-gray-400/20"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "demo":
        return <Eye className="w-4 h-4" />
      case "inquiry":
        return <MessageSquare className="w-4 h-4" />
      case "call":
        return <Phone className="w-4 h-4" />
      default:
        return <Mail className="w-4 h-4" />
    }
  }

  // Function to format the message content
  const formatMessage = (message: string) => {
    // Split the message by lines and format each section
    const lines = message.split('\n').filter(line => line.trim())
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim()
      
      // Check if it's a section header (ends with ':')
      if (trimmedLine.endsWith(':')) {
        return (
          <div key={index} className="font-semibold text-purple-300 mb-2 mt-4 first:mt-0">
            {trimmedLine}
          </div>
        )
      }
      
      // Check if it's a bullet point (starts with '-')
      if (trimmedLine.startsWith('-')) {
        return (
          <div key={index} className="ml-4 mb-1 flex items-start">
            <span className="text-purple-400 mr-2">•</span>
            <span className="text-white/90">{trimmedLine.substring(1).trim()}</span>
          </div>
        )
      }
      
      // Check if it's a numbered item (starts with number and period)
      if (/^\d+\./.test(trimmedLine)) {
        return (
          <div key={index} className="ml-4 mb-1 flex items-start">
            <span className="text-purple-400 mr-2 font-medium">
              {trimmedLine.match(/^\d+\./)?.[0]}
            </span>
            <span className="text-white/90">
              {trimmedLine.replace(/^\d+\.\s*/, '')}
            </span>
          </div>
        )
      }
      
      // Regular text
      return (
        <div key={index} className="mb-2 text-white/90">
          {trimmedLine}
        </div>
      )
    })
  }

  const handleFilterChange = (filterType: 'type' | 'status', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setFilters({ type: "", status: "" })
    setCurrentPage(1) // Reset to first page when clearing filters
  }

  // Pagination logic
  const indexOfLastRequest = currentPage * requestsPerPage
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage
  const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest)
  const totalPages = Math.ceil(requests.length / requestsPerPage)

  // Simple modal opening
  const openResponseModal = (request: CustomerRequest) => {
    setSelectedRequest(request)
  }

  // Test backend connection
  const testBackendConnection = async () => {
    console.log('🔍 Testing backend connection...')
    
    // Test health endpoint
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      })
      
      if (healthResponse.ok) {
        console.log('✅ Health endpoint is reachable')
        
        // Test upload endpoint with OPTIONS request
        try {
          const optionsResponse = await fetch(`${API_BASE_URL}/upload-apk`, {
            method: 'OPTIONS',
            mode: 'cors'
          })
          
          console.log('🔍 Upload endpoint OPTIONS response:', {
            status: optionsResponse.status,
            headers: Object.fromEntries(optionsResponse.headers.entries())
          })
          
          toast({
            title: "Backend Connection Successful",
            description: "Both health and upload endpoints are accessible.",
            variant: "default",
          })
        } catch (uploadError) {
          console.log('⚠️ Upload endpoint test failed:', uploadError)
          toast({
            title: "Partial Backend Access",
            description: "Health endpoint works but upload endpoint has issues.",
            variant: "destructive",
          })
        }
      } else {
        console.log('⚠️ Health endpoint responded with status:', healthResponse.status)
        toast({
          title: "Backend Connection Warning",
          description: `Health endpoint responded with status: ${healthResponse.status}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.log('❌ Backend connection failed:', error)
      toast({
        title: "Backend Connection Failed",
        description: "Cannot connect to backend server. This might be a CORS issue.",
        variant: "destructive",
      })
    }
  }

  // Show access denied screen if user doesn't have proper domain
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-white/70 mb-6">
            You don't have permission to access this area.
          </p>
          <div className="space-y-3">
            <p className="text-white/60 text-sm">
              Current user: {auth.currentUser?.email || 'Not signed in'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Website
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav
        className={`fixed top-4 z-50 transition-all duration-300 ${
          // Desktop and Tablet: fixed 800px width, centered
          "md:left-1/2 md:-translate-x-1/2 md:w-[800px] md:px-6 md:py-4 md:rounded-full " +
          // Mobile: full width minus margins
          "left-4 right-4 px-4 sm:px-6 py-2 sm:py-4 rounded-full"
        } bg-white/20 backdrop-blur-lg border border-white/10`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Link
              href="/"
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
            </Link>
          </div>
          {/* Desktop and Tablet Navigation (md and up) */}
          <div className="hidden md:flex items-center space-x-6 xl:space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Website</span>
            </Link>
            <UserProfile />
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden mobile-menu-container">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/90 hover:text-white"
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
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-md transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Website</span>
              </Link>
              <div className="pt-2 border-t border-gray-200">
                <UserProfile />
              </div>
            </div>
          </div>
        </div>
      </>

      {/* Main Content */}
      <div className="pt-24 sm:pt-28 md:pt-32 px-4 sm:px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">XS Card Admin Dashboard</h1>
              </div>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-white/70 px-4">Manage customer requests and app deployments</p>
          </div>

          {/* Dashboard Card */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
            <CardContent className="p-0">
              {/* Navigation Tabs */}
              <div className="flex border-b border-white/20 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("requests")}
                  className={`px-3 sm:px-6 md:px-8 py-3 sm:py-6 font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === "requests"
                      ? "text-white border-b-2 border-purple-400 bg-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base md:text-lg">Customer Requests</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("uploads")}
                  className={`px-3 sm:px-6 md:px-8 py-3 sm:py-6 font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === "uploads"
                      ? "text-white border-b-2 border-purple-400 bg-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base md:text-lg">App Deployment</span>
                  </div>
                </button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 md:p-8">
                {activeTab === "requests" && (
                  <div className="space-y-6 sm:space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-white">Customer Requests</h2>
                      <div className="text-white/60 text-sm">
                        {requests.filter((r) => r.status === "pending").length} pending requests
                      </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-white/80 mb-2">Type</label>
                          <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800/90 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="" className="bg-slate-800 text-white">All Types</option>
                            <option value="demo" className="bg-slate-800 text-white">Demo Requests</option>
                            <option value="inquiry" className="bg-slate-800 text-white">Inquiries</option>
                            <option value="call" className="bg-slate-800 text-white">Call Requests</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
                          <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-800/90 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="" className="bg-slate-800 text-white">All Status</option>
                            <option value="pending" className="bg-slate-800 text-white">Pending</option>
                            <option value="responded" className="bg-slate-800 text-white">Responded</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={clearFilters}
                          className="bg-transparent border border-white/60 text-white hover:bg-white/20 hover:border-white/80 font-medium"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>

                    {/* Refresh Button */}
                    <div className="flex justify-end">
                      <Button
                        onClick={fetchRequests}
                        disabled={loading}
                        className="bg-transparent border border-white/60 text-white hover:bg-white/20 hover:border-white/80 font-medium"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>

                    {/* Requests List */}
                    <div className="grid gap-4 sm:gap-6">
                      {loading && <p className="text-white/70 text-center py-8">Loading requests...</p>}
                      {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
                          <p className="text-red-400 mb-4">{error}</p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                              onClick={fetchRequests}
                              disabled={loading}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                              Retry
                            </Button>
                            <Button
                              onClick={testBackendConnection}
                              variant="outline"
                              className="border-blue-400 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 font-medium"
                            >
                              Test Connection
                            </Button>
                            <Button
                              onClick={() => {
                                console.log('🔍 Current API_BASE_URL:', API_BASE_URL)
                                console.log('🔍 Current user:', auth.currentUser?.email)
                                console.log('🔍 Current filters:', filters)
                              }}
                              variant="outline"
                              className="border-red-400 text-red-300 hover:bg-red-500/20 hover:text-red-200 font-medium"
                            >
                              Debug Info
                            </Button>
                          </div>
                        </div>
                      )}
                      {!loading && !error && requests.length === 0 && (
                        <p className="text-white/70 text-center py-8">No requests found.</p>
                      )}
                      {!loading && !error && requests.length > 0 && (
                        <>
                          {error && error.includes('demo data') && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4 text-center">
                              <p className="text-yellow-400 text-sm">
                                🎭 Showing demo data - Backend server unavailable
                              </p>
                            </div>
                          )}
                          {currentRequests.map((request) => (
                          <Card
                            key={request.id}
                            className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300"
                          >
                            <CardContent className="p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                                <div className="flex items-start space-x-3 sm:space-x-4">
                                  <div className="text-purple-400 mt-1">{getTypeIcon(request.type)}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                                      <h3 className="text-base sm:text-lg font-semibold text-white truncate">{request.name}</h3>
                                      <span
                                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(
                                          request.status,
                                        )}`}
                                      >
                                        {request.status}
                                      </span>
                                    </div>
                                    <p className="text-white/80 text-sm mb-2 break-all">{request.email}</p>
                                    <p className="text-white/60 text-sm mb-3">{request.company}</p>
                                    <div className="text-white/90 text-sm sm:text-base">
                                      {formatMessage(request.message)}
                                    </div>
                                    <p className="text-white/50 text-xs">{request.date}</p>
                                  </div>
                                </div>
                                <div className="flex justify-start sm:justify-end">
                                  <Button
                                    size="sm"
                                    onClick={() => openResponseModal(request)}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                                  >
                                    <Reply className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Respond</span>
                                    <span className="sm:hidden">Reply</span>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-center space-x-2 mt-6">
                            <Button
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              variant="outline"
                              size="sm"
                              className="bg-transparent border border-white/60 text-white hover:bg-white/20 hover:border-white/80 font-medium"
                            >
                              Previous
                            </Button>
                            
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    currentPage === page
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}
                            </div>
                            
                            <Button
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                              variant="outline"
                              size="sm"
                              className="bg-transparent border border-white/60 text-white hover:bg-white/20 hover:border-white/80 font-medium"
                            >
                              Next
                            </Button>
                          </div>
                        )}
                        
                        <div className="text-center text-white/60 text-sm mt-4">
                          Showing {indexOfFirstRequest + 1}-{Math.min(indexOfLastRequest, requests.length)} of {requests.length} requests
                        </div>
                      </>
                      )}
                    </div>

                    {/* Response Modal */}
                    {selectedRequest && (
                      <div className="fixed inset-0 z-[100] overflow-y-auto">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedRequest(null)}></div>
                        <div 
                          id="response-modal"
                          className="absolute bg-white/25 backdrop-blur-lg border border-white/30 rounded-2xl p-6 max-w-md w-full max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl"
                          role="dialog"
                          aria-modal="true"
                          aria-labelledby="modal-title"
                          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 id="modal-title" className="text-xl font-bold text-white">Respond to {selectedRequest.name}</h3>
                            <button
                              onClick={() => setSelectedRequest(null)}
                              className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                              aria-label="Close modal"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-white mb-2">Response Message</label>
                            <textarea
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 resize-none"
                                rows={6}
                                placeholder="Type your response..."
                              />
                            </div>
                            <div className="flex space-x-3">
                              <Button
                                onClick={() => handleResponse(selectedRequest.id)}
                                disabled={!responseText.trim()}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                Send Response
                              </Button>
                              <Button
                                onClick={() => setSelectedRequest(null)}
                                className="flex-1 bg-transparent border border-white/60 text-white hover:bg-white/20 hover:border-white/80 font-medium"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "uploads" && (
                  <div className="space-y-6 sm:space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-white">App Deployment</h2>
                      <div className="text-white/60 text-sm">Upload new app versions</div>
                    </div>

                    <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Smartphone className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Upload Android APK</h3>
                            <p className="text-white/70 text-sm">Select your APK file to deploy a new version</p>
                          </div>

                          <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept=".apk"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="apk-upload"
                            />
                            <label
                              htmlFor="apk-upload"
                              className="cursor-pointer block"
                            >
                              <Upload className="w-8 h-8 text-white/60 mx-auto mb-2" />
                              <p className="text-white/80 text-sm">
                                {uploadFile ? uploadFile.name : "Click to select APK file"}
                              </p>
                            </label>
                          </div>

                          {uploadFile && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-white/80">File: {uploadFile.name}</span>
                                <span className="text-white/60">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                  </div>

                              {uploadProgress > 0 && uploadProgress < 100 && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-white/80">Uploading...</span>
                                    <span className="text-white/60">{uploadProgress}%</span>
                                  </div>
                                  <div className="w-full bg-white/20 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}

                                <Button
                                  onClick={handleUpload}
                                  disabled={isUploading}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                >
                                  {isUploading ? (
                                    <div className="flex items-center space-x-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Uploading...</span>
                                    </div>
                                  ) : (
                                  "Deploy App"
                                  )}
                                </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
                          <Image 
                src="/images/xscard-logo.png" 
                alt="XS Card Logo" 
                width={100} 
                height={32} 
                className="h-8 w-auto" 
              />
          </div>
                      <p className="text-white/60">&copy; 2024 XS Card Admin Dashboard. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}
