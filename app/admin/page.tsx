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
  History,
  Trash2,
  Edit3,
} from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import Link from "next/link"
import { UserProfile } from "@/components/auth/user-profile"
import { auth } from "@/lib/firebase"
import { API_BASE_URL } from "@/utils/api"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Force dynamic rendering to prevent static export issues
export const dynamic = 'force-dynamic'

interface CustomerRequest {
  id: number;
  type: "demo" | "inquiry" | "call";
  name: string;
  email: string;
  company: string;
  message: string;
  date: string;
  status: "pending" | "responded";
  statusHistory?: Array<{
    status: string;
    timestamp: string | {
      _seconds: number;
      _nanoseconds: number;
    };
    updatedBy: string;
    notes: string;
    response: string;
    admin?: {
      id: string;
      email: string;
    };
  }>;
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"requests" | "uploads" | "video-upload">("requests")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [requests, setRequests] = useState<CustomerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null)
  const [responseText, setResponseText] = useState("")
  const [showMessageTrail, setShowMessageTrail] = useState<CustomerRequest | null>(null)
  const [isResponding, setIsResponding] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [videoUploadFile, setVideoUploadFile] = useState<File | null>(null)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const [isVideoUploading, setIsVideoUploading] = useState(false)
  const [uploadedVideos, setUploadedVideos] = useState<Array<{
    id: string;
    filename: string;
    url: string;
    size: number;
    uploadDate: string;
    uploadedBy: string;
    description?: string;
  }>>([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const [showVideoPreview, setShowVideoPreview] = useState<string | null>(null)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [editingVideoName, setEditingVideoName] = useState<string>("")
  const [editingVideoDescription, setEditingVideoDescription] = useState<string>("")
  const [isSavingVideo, setIsSavingVideo] = useState(false)
  const [filters, setFilters] = useState({
    type: "",
    status: ""
  })
  const [currentPage, setCurrentPage] = useState(1)
  const requestsPerPage = 5
  const [accessDenied, setAccessDenied] = useState(false)
  const [modalPosition, setModalPosition] = useState<{ top: string; left: string; transform: string; scale: string; opacity: string }>({ 
    top: '50%', 
    left: '50%', 
    transform: 'translate(-50%, -50%)',
    scale: '0.8',
    opacity: '0'
  })
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  
  // Authentication and domain restriction check
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
      if (!user) {
        // User signed out - redirect to home page
        console.log('🔐 User signed out, redirecting to home page')
        toast({
          title: "Signed out",
          description: "You have been signed out. Redirecting to home page...",
        })
        
        // Redirect after a short delay to show the toast
        setTimeout(() => {
          window.location.href = '/'
        }, 1500)
        return
      }

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
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (selectedRequest) {
      // Prevent body scrolling
      document.body.style.overflow = 'hidden'
    } else {
      // Restore scrolling
      document.body.style.overflow = ''
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedRequest])

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

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file type
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo']
      const validExtensions = ['.mp4', '.mov', '.avi']
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      
      if (validTypes.includes(file.type) || validExtensions.includes(fileExtension)) {
        setVideoUploadFile(file)
        setError(null)
      } else {
        setError('Please select a valid video file (MP4, MOV, or AVI)')
        toast({
          title: "Invalid File Type",
          description: "Please select a valid video file (MP4, MOV, or AVI)",
          variant: "destructive",
        })
      }
    }
  }

  const uploadVideoFile = async () => {
    if (!videoUploadFile) return
    
    // Don't upload if access is denied
    if (accessDenied) {
      return
    }

    // Check file size (150MB limit)
    if (videoUploadFile.size > 150 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Video file must be smaller than 150MB",
        variant: "destructive",
      })
      return
    }

    setIsVideoUploading(true)
    setVideoUploadProgress(0)
    setError(null)

    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('User not authenticated')
      }

      const idToken = await user.getIdToken()
      
      const formData = new FormData()
      formData.append('video', videoUploadFile)

      const response = await fetch(`${API_BASE_URL}/api/feature-videos/upload`, {
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
        setVideoUploadFile(null)
        setVideoUploadProgress(0)
        
        // Refresh video list
        fetchVideos()
        
        // Show success toast
        toast({
          title: "Video Uploaded Successfully!",
          description: "Your feature video has been uploaded successfully.",
          variant: "default",
        })
      } else {
        throw new Error(result.message || 'Failed to upload video')
      }
    } catch (error) {
      console.error('Error uploading video:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload video')
      
      // Show error toast
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload video',
        variant: "destructive",
      })
    } finally {
      setIsVideoUploading(false)
    }
  }

  // CRUD Operations for Videos
  const fetchVideos = async () => {
    setIsLoadingVideos(true)
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('User not authenticated')
      }

      const idToken = await user.getIdToken()
      
      const response = await fetch(`${API_BASE_URL}/api/feature-videos`, {
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
        setUploadedVideos(result.videos || [])
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

  const deleteVideo = async (videoId: string) => {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('User not authenticated')
      }

      const idToken = await user.getIdToken()
      
      const response = await fetch(`${API_BASE_URL}/api/feature-videos/${videoId}`, {
        method: 'DELETE',
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
        setUploadedVideos(prev => prev.filter(video => video.id !== videoId))
        toast({
          title: "Video Deleted Successfully!",
          description: "The video has been removed.",
          variant: "default",
        })
      } else {
        throw new Error(result.message || 'Failed to delete video')
      }
    } catch (error) {
      console.error('Error deleting video:', error)
      toast({
        title: "Failed to Delete Video",
        description: error instanceof Error ? error.message : 'Failed to delete video',
        variant: "destructive",
      })
    }
  }

  const updateVideoMetadata = async (videoId: string, updates: { filename?: string; description?: string }) => {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('User not authenticated')
      }

      const idToken = await user.getIdToken()
      
      const response = await fetch(`${API_BASE_URL}/api/feature-videos/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setUploadedVideos(prev => prev.map(video => 
          video.id === videoId ? { ...video, ...updates } : video
        ))
        toast({
          title: "Video Updated Successfully!",
          description: "The video metadata has been updated.",
          variant: "default",
        })
      } else {
        throw new Error(result.message || 'Failed to update video')
      }
    } catch (error) {
      console.error('Error updating video:', error)
      toast({
        title: "Failed to Update Video",
        description: error instanceof Error ? error.message : 'Failed to update video',
        variant: "destructive",
      })
    }
  }

  const startEditingVideo = (videoId: string, currentName: string, currentDescription: string = "") => {
    setEditingVideoId(videoId)
    setEditingVideoName(currentName)
    setEditingVideoDescription(currentDescription)
  }

  const cancelEditingVideo = () => {
    setEditingVideoId(null)
    setEditingVideoName("")
    setEditingVideoDescription("")
  }

  const saveVideoName = async () => {
    if (!editingVideoId || !editingVideoName.trim()) return

    setIsSavingVideo(true)
    try {
      await updateVideoMetadata(editingVideoId, { 
        filename: editingVideoName.trim(),
        description: editingVideoDescription.trim()
      })
      cancelEditingVideo()
    } finally {
      setIsSavingVideo(false)
    }
  }

  const formatVideoDate = (dateString: string) => {
    try {
      // Handle backend format: "October 23 2025 at 9:09:13 AM UTC"
      // Remove "at" and convert to standard format
      const cleanedDateString = dateString.replace(' at ', ' ')
      const date = new Date(cleanedDateString)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('Failed to parse date:', dateString)
        return "Invalid Date"
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Error parsing date:', dateString, error)
      return "Invalid Date"
    }
  }

  // Load videos when video upload tab is active
  useEffect(() => {
    if (activeTab === "video-upload") {
      fetchVideos()
    }
  }, [activeTab])

  const handleResponse = async (requestId: number) => {
    if (!responseText.trim()) return
    
    // Don't respond if access is denied
    if (accessDenied) {
      return
    }
    
    setIsResponding(true)
    
    // Create the new response entry
    const newResponse = {
      status: "responded" as const,
      response: responseText.trim(),
      notes: "Response sent via admin dashboard",
      timestamp: new Date().toISOString(),
      updatedBy: auth.currentUser?.uid || "",
      admin: {
        id: auth.currentUser?.uid || "",
        email: auth.currentUser?.email || ""
      }
    }

    // Optimistically update the UI
    setRequests((prev) => prev.map((req) => 
      req.id === requestId ? { 
        ...req, 
        status: "responded" as const,
        statusHistory: [...(req.statusHistory || []), newResponse]
      } : req
    ))

    // Update message trail if it's open
    if (showMessageTrail && showMessageTrail.id === requestId) {
      setShowMessageTrail((prev) => prev ? {
        ...prev,
        status: "responded" as const,
        statusHistory: [...(prev.statusHistory || []), newResponse]
      } : null)
    }

    // Clear the response text immediately
    const currentResponseText = responseText
    setResponseText("")
    
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('User not authenticated')
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
          response: currentResponseText.trim(),
          notes: "Response sent via admin dashboard"
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to send response')
      }

      // Close modals
      setSelectedRequest(null)
      
      // Show success toast
      toast({
        title: "Response Sent Successfully!",
        description: "Your response has been sent to the customer.",
        variant: "default",
      })
      
    } catch (error) {
      console.error('Error responding to request:', error)
      
      // Revert the optimistic update
      setRequests((prev) => prev.map((req) => 
        req.id === requestId ? { 
          ...req, 
          status: req.statusHistory && req.statusHistory.length > 0 ? "responded" as const : "pending" as const,
          statusHistory: req.statusHistory?.slice(0, -1) || []
        } : req
      ))

      // Revert message trail if it's open
      if (showMessageTrail && showMessageTrail.id === requestId) {
        setShowMessageTrail((prev) => prev ? {
          ...prev,
          status: prev.statusHistory && prev.statusHistory.length > 1 ? "responded" as const : "pending" as const,
          statusHistory: prev.statusHistory?.slice(0, -1) || []
        } : null)
      }

      // Restore the response text
      setResponseText(currentResponseText)
      
      // Show error toast
      toast({
        title: "Failed to Send Response",
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: "destructive",
      })
    } finally {
      setIsResponding(false)
    }
  }

  const openMessageTrail = (request: CustomerRequest) => {
    setShowMessageTrail(request)
  }

  const formatTimestamp = (timestamp: string | { _seconds: number; _nanoseconds: number }) => {
    if (typeof timestamp === 'string') {
      // Parse the string timestamp and format it
      const date = new Date(timestamp)
      return {
        date: date.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        time: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      }
    }
    const date = new Date(timestamp._seconds * 1000)
    return {
      date: date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
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

  // Modal opening with smooth emergence from button
  const toggleExpanded = (requestId: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(requestId)) {
        newSet.delete(requestId)
      } else {
        newSet.add(requestId)
      }
      return newSet
    })
  }

  const openResponseModal = (request: CustomerRequest, event?: React.MouseEvent) => {
    setSelectedRequest(request)
    
    if (event) {
      try {
        const buttonElement = event.currentTarget as HTMLElement
        const buttonRect = buttonElement.getBoundingClientRect()
        
        console.log('🔍 Button position:', { 
          top: buttonRect.top, 
          bottom: buttonRect.bottom,
          left: buttonRect.left,
          width: buttonRect.width
        })
        
        // Position modal to emerge from the button
        const buttonCenterX = buttonRect.left + buttonRect.width / 2
        const buttonCenterY = buttonRect.top + buttonRect.height / 2
        
        // Start position (emerging from button)
        const startPosition = {
          top: `${buttonCenterY}px`,
          left: `${buttonCenterX}px`,
          transform: 'translate(-50%, -50%)',
          scale: '0.1',
          opacity: '0'
        }
        
        // Set initial position (emerging from button)
        setModalPosition(startPosition)
        
        // Animate to final position after a brief delay
        setTimeout(() => {
          const finalPosition = {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            scale: '1',
            opacity: '1'
          }
          setModalPosition(finalPosition)
        }, 10) // Small delay to ensure smooth transition
        
      } catch (error) {
        console.error('Error calculating modal position:', error)
        // Fallback to center if calculation fails
        setModalPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', scale: '1', opacity: '1' })
      }
    } else {
      // Fallback to center if no event
      setModalPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', scale: '1', opacity: '1' })
    }
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
              className="inline-flex items-center justify-center px-6 py-3 bg-custom-btn-gradient hover:opacity-90 text-white font-medium rounded-lg transition-all duration-300"
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
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-custom-btn-gradient rounded-lg flex items-center justify-center">
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
                <button
                  onClick={() => setActiveTab("video-upload")}
                  className={`px-3 sm:px-6 md:px-8 py-3 sm:py-6 font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === "video-upload"
                      ? "text-white border-b-2 border-purple-400 bg-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base md:text-lg">Video Upload</span>
                  </div>
                </button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 md:p-8 overflow-hidden">
                {activeTab === "requests" && (
                  <div className="space-y-6 sm:space-y-8 w-full">
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
                    <div className="w-full">
                      <div className="space-y-4 sm:space-y-6">
                        {loading && <p className="text-white/70 text-center py-8">Loading requests...</p>}
                        {error && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
                            <p className="text-red-400 mb-4">{error}</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <Button
                                onClick={fetchRequests}
                                disabled={loading}
                                className="bg-custom-btn-gradient hover:opacity-90 text-white border-0"
                              >
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Retry
                              </Button>
                              <Button
                                onClick={testBackendConnection}
                                className="bg-custom-btn-gradient hover:opacity-90 text-white border-0 font-medium"
                              >
                                Test Connection
                              </Button>
                              <Button
                                onClick={() => {
                                  console.log('🔍 Current API_BASE_URL:', API_BASE_URL)
                                  console.log('🔍 Current user:', auth.currentUser?.email)
                                  console.log('🔍 Current filters:', filters)
                                }}
                                className="bg-custom-btn-gradient hover:opacity-90 text-white border-0 font-medium"
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
                            {currentRequests.map((request) => {
                              const isExpanded = expandedItems.has(request.id)
                              return (
                                <Card
                                  key={request.id}
                                  className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 w-full"
                                >
                                  <CardContent className="p-4 sm:p-6">
                                  {/* Collapsed View */}
                                  {!isExpanded && (
                                    <div className="space-y-3">
                                      {/* Mobile: Stack vertically, Desktop: Side by side */}
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                          <div className="text-purple-400 flex-shrink-0">{getTypeIcon(request.type)}</div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex flex-col space-y-2">
                                              <h3 className="text-base sm:text-lg font-semibold text-white truncate">{request.name}</h3>
                                              <span
                                                className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(
                                                  request.status,
                                                )}`}
                                              >
                                                {request.status}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Mobile: Full width buttons, Desktop: Right aligned */}
                                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto flex-shrink-0">
                                          <Button
                                            size="sm"
                                            onClick={() => toggleExpanded(request.id)}
                                            className="bg-transparent border border-white/60 text-white hover:bg-white/20 hover:border-white/80 font-medium w-full sm:w-auto"
                                          >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                          </Button>
                                          <Button
                                            size="sm"
                                            onClick={() => openMessageTrail(request)}
                                            disabled={!request.statusHistory || request.statusHistory.length === 0}
                                            className={`font-medium shadow-lg transition-all duration-300 w-full sm:w-auto ${
                                              request.statusHistory && request.statusHistory.length > 0
                                                ? 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-xl'
                                                : 'bg-gray-500 text-white/50 cursor-not-allowed'
                                            }`}
                                          >
                                            <History className="w-4 h-4 mr-2" />
                                            Message Trail
                                          </Button>
                                          <Button
                                            size="sm"
                                            onClick={(e) => openResponseModal(request, e)}
                                            className="bg-custom-btn-gradient hover:opacity-90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                                          >
                                            <Reply className="w-4 h-4 mr-2" />
                                            Respond
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Expanded View */}
                                  {isExpanded && (
                                    <div className="space-y-4">
                                      {/* Header Section */}
                                <div className="flex items-start space-x-3 sm:space-x-4">
                                  <div className="text-purple-400 mt-1">{getTypeIcon(request.type)}</div>
                                  <div className="flex-1 min-w-0">
                                          <div className="flex flex-col space-y-2 mb-4">
                                            <h3 className="text-base sm:text-lg font-semibold text-white">{request.name}</h3>
                                      <span
                                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(
                                          request.status,
                                        )}`}
                                      >
                                        {request.status}
                                      </span>
                                    </div>
                                          
                                          {/* Details Section */}
                                          <div className="space-y-3">
                                            <div>
                                              <label className="text-white/60 text-xs uppercase tracking-wide font-medium">Email</label>
                                              <p className="text-white/90 text-sm break-all">{request.email}</p>
                                            </div>
                                            <div>
                                              <label className="text-white/60 text-xs uppercase tracking-wide font-medium">Company</label>
                                              <p className="text-white/90 text-sm">{request.company}</p>
                                            </div>
                                            <div>
                                              <label className="text-white/60 text-xs uppercase tracking-wide font-medium">Message</label>
                                              <div className="text-white/90 text-sm leading-relaxed mt-1">
                                      {formatMessage(request.message)}
                                    </div>
                                  </div>
                                            <div>
                                              <label className="text-white/60 text-xs uppercase tracking-wide font-medium">Date</label>
                                              <p className="text-white/70 text-xs">{request.date}</p>
                                </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Action Buttons - Mobile: Full width, Desktop: Right aligned */}
                                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2 border-t border-white/10">
                                  <Button
                                    size="sm"
                                          onClick={() => toggleExpanded(request.id)}
                                          className="bg-transparent border border-white/60 text-white hover:bg-white/20 hover:border-white/80 font-medium w-full sm:w-auto order-3 sm:order-1"
                                        >
                                          <X className="w-4 h-4 mr-2" />
                                          Collapse
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => openMessageTrail(request)}
                                          disabled={!request.statusHistory || request.statusHistory.length === 0}
                                          className={`font-medium shadow-lg transition-all duration-300 w-full sm:w-auto order-2 sm:order-2 ${
                                            request.statusHistory && request.statusHistory.length > 0
                                              ? 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-xl'
                                              : 'bg-gray-500 text-white/50 cursor-not-allowed'
                                          }`}
                                        >
                                          <History className="w-4 h-4 mr-2" />
                                          Message Trail
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={(e) => openResponseModal(request, e)}
                                          className="bg-custom-btn-gradient hover:opacity-90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto order-1 sm:order-3"
                                  >
                                    <Reply className="w-4 h-4 mr-2" />
                                          Respond
                                  </Button>
                                </div>
                              </div>
                                  )}
                            </CardContent>
                          </Card>
                            )
                          })}
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="mt-6">
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                size="sm"
                                className="bg-custom-btn-gradient hover:opacity-90 text-white border-0 font-medium"
                              >
                                <span className="hidden sm:inline">Previous</span>
                                <span className="sm:hidden">←</span>
                              </Button>
                              
                              <div className="flex items-center space-x-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                  <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-2 sm:px-3 py-1 rounded-md text-sm font-medium transition-colors ${
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
                                size="sm"
                                className="bg-custom-btn-gradient hover:opacity-90 text-white border-0 font-medium"
                              >
                                <span className="hidden sm:inline">Next</span>
                                <span className="sm:hidden">→</span>
                              </Button>
                            </div>
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
                      <div className="fixed inset-0 z-[100] overflow-hidden">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedRequest(null)}></div>
                        <div 
                          id="response-modal"
                          className="absolute bg-white/25 backdrop-blur-lg border border-white/30 rounded-2xl p-6 max-w-md w-full max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl transition-all duration-500 ease-out"
                          role="dialog"
                          aria-modal="true"
                          aria-labelledby="modal-title"
                          style={{
                            ...modalPosition,
                            transformOrigin: 'center'
                          }}
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
                                className="flex-1 bg-custom-btn-gradient hover:opacity-90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
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

                    {/* Message Trail Modal */}
                    {showMessageTrail && (
                      <div className="fixed inset-0 z-[100] overflow-hidden">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowMessageTrail(null)}></div>
                        <div 
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/25 backdrop-blur-lg border border-white/30 rounded-2xl p-6 max-w-2xl w-full h-[600px] shadow-2xl flex flex-col"
                          role="dialog"
                          aria-modal="true"
                          aria-labelledby="message-trail-title"
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between mb-4 flex-shrink-0">
                            <div>
                              <h3 id="message-trail-title" className="text-xl font-bold text-white">Message Trail</h3>
                              <p className="text-white/70 text-sm mt-1">{showMessageTrail.name} - {showMessageTrail.email}</p>
                            </div>
                            <button
                              onClick={() => setShowMessageTrail(null)}
                              className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                              aria-label="Close modal"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          
                          {/* Scrollable Content */}
                          <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
                            {/* Responses */}
                            {showMessageTrail.statusHistory && showMessageTrail.statusHistory.length > 0 ? (
                              showMessageTrail.statusHistory.map((entry, index) => (
                                <div key={index} className="bg-white/10 rounded-lg p-4 border border-white/20">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                                        {entry.status}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Date, Time and Admin */}
                                  <div className="flex items-center justify-between mb-3">
                                    {(() => {
                                      const timestamp = formatTimestamp(entry.timestamp)
                                      return (
                                        <div className="text-white/60 text-xs space-y-1">
                                          <div>Time: {timestamp.time}</div>
                                          <div>Date: {timestamp.date}</div>
                                        </div>
                                      )
                                    })()}
                                    {entry.admin && (
                                      <div className="text-right text-white/60 text-xs">
                                        <div>by: <span className="text-purple-300 font-medium">
                                          <a 
                                            href={`mailto:${entry.admin.email}`}
                                            className="hover:text-purple-200 hover:underline transition-colors"
                                            title={`Send email to ${entry.admin.email}`}
                                          >
                                            {entry.admin.email}
                                          </a>
                                        </span></div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {entry.response && (
                                    <div className="text-white/90 text-sm bg-white/5 rounded p-3 border-l-2 border-purple-400">
                                      {entry.response}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <History className="w-12 h-12 text-white/40 mx-auto mb-4" />
                                <p className="text-white/60">No responses available</p>
                              </div>
                            )}
                          </div>

                          {/* Add Response Section */}
                          <div className="mt-4 pt-4 border-t border-white/20 flex-shrink-0">
                            <div className="space-y-3">
                              <label className="block text-sm font-medium text-white">Add Response</label>
                              <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500 resize-none"
                                rows={3}
                                placeholder="Type your response..."
                              />
                              <div className="flex space-x-3">
                                <Button
                                  onClick={() => handleResponse(showMessageTrail.id)}
                                  disabled={!responseText.trim() || isResponding}
                                  className="flex-1 bg-custom-btn-gradient hover:opacity-90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                  {isResponding ? (
                                    <div className="flex items-center space-x-2">
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                      <span>Sending...</span>
                                    </div>
                                  ) : (
                                    "Send Response"
                                  )}
                                </Button>
                                <Button
                                  onClick={() => {
                                    setResponseText("")
                                    setShowMessageTrail(null)
                                  }}
                                  disabled={isResponding}
                                  className="flex-1 bg-transparent border border-white/60 text-white hover:bg-white/20 hover:border-white/80 font-medium"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
                            <div className="w-16 h-16 bg-custom-btn-gradient rounded-full flex items-center justify-center mx-auto mb-4">
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
                                      className="bg-custom-btn-gradient h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}

                                <Button
                                  onClick={handleUpload}
                                  disabled={isUploading}
                                  className="w-full bg-custom-btn-gradient hover:opacity-90 text-white"
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

                {activeTab === "video-upload" && (
                  <div className="space-y-6 sm:space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-white">Video Upload</h2>
                      <div className="text-white/60 text-sm">Upload feature demo videos (Max 150MB)</div>
                    </div>

                    <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-custom-btn-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                              <Upload className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Upload Feature Video</h3>
                            <p className="text-white/70 text-sm">Select your video file to upload (MP4, MOV, AVI supported)</p>
                          </div>

                          <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              accept="video/mp4,video/quicktime,video/x-msvideo"
                              onChange={handleVideoUpload}
                              className="hidden"
                              id="video-upload"
                            />
                            <label
                              htmlFor="video-upload"
                              className="cursor-pointer block"
                            >
                              <Upload className="w-8 h-8 text-white/60 mx-auto mb-2" />
                              <p className="text-white/80 text-sm">
                                {videoUploadFile ? videoUploadFile.name : "Click to select video file"}
                              </p>
                            </label>
                          </div>

                          {videoUploadFile && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-white/80">File: {videoUploadFile.name}</span>
                                <span className="text-white/60">{(videoUploadFile.size / 1024 / 1024).toFixed(2)} MB</span>
                              </div>

                              {videoUploadProgress > 0 && videoUploadProgress < 100 && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-white/80">Uploading...</span>
                                    <span className="text-white/60">{videoUploadProgress}%</span>
                                  </div>
                                  <div className="w-full bg-white/20 rounded-full h-2">
                                    <div 
                                      className="bg-custom-btn-gradient h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${videoUploadProgress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}

                              <div className="flex space-x-3">
                                <Button
                                  onClick={uploadVideoFile}
                                  disabled={isVideoUploading || videoUploadFile.size > 150 * 1024 * 1024}
                                  className="flex-1 bg-custom-btn-gradient hover:opacity-90 text-white font-medium"
                                >
                                  {isVideoUploading ? (
                                    <div className="flex items-center space-x-2">
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                      <span>Uploading...</span>
                                    </div>
                                  ) : (
                                    "Upload Video"
                                  )}
                                </Button>
                                <Button
                                  onClick={() => setVideoUploadFile(null)}
                                  disabled={isVideoUploading}
                                  className="flex-1 bg-transparent border border-white/60 text-white hover:bg-white/20 hover:border-white/80 font-medium"
                                >
                                  Cancel
                                </Button>
                              </div>

                              {videoUploadFile.size > 150 * 1024 * 1024 && (
                                <div className="text-red-400 text-sm text-center">
                                  File size exceeds 150MB limit
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Uploaded Videos List */}
                    <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg sm:text-xl font-semibold text-white">Uploaded Videos</h3>
                            <Button
                              onClick={fetchVideos}
                              disabled={isLoadingVideos}
                              variant="ghost"
                              className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingVideos ? 'animate-spin' : ''}`} />
                              Refresh
                            </Button>
                          </div>

                          {isLoadingVideos ? (
                            <div className="text-center py-8">
                              <RefreshCw className="w-8 h-8 text-white/40 mx-auto mb-4 animate-spin" />
                              <p className="text-white/60">Loading videos...</p>
                            </div>
                          ) : uploadedVideos.length === 0 ? (
                            <div className="text-center py-8">
                              <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
                              <p className="text-white/60">No videos uploaded yet</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {uploadedVideos.map((video) => (
                                <div
                                  key={video.id}
                                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      {editingVideoId === video.id ? (
                                        <div className="space-y-3">
                                          <div>
                                            <label className="block text-sm text-white/70 mb-1">Video Name</label>
                                            <input
                                              type="text"
                                              value={editingVideoName}
                                              onChange={(e) => setEditingVideoName(e.target.value)}
                                              className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                              placeholder="Enter video name"
                                              autoFocus
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm text-white/70 mb-1">Description (Optional)</label>
                                            <textarea
                                              value={editingVideoDescription}
                                              onChange={(e) => setEditingVideoDescription(e.target.value)}
                                              className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                                              placeholder="Enter video description"
                                              rows={2}
                                            />
                                          </div>
                                          <div className="flex space-x-2">
                                            <Button
                                              onClick={saveVideoName}
                                              disabled={isSavingVideo}
                                              size="sm"
                                              className="bg-custom-btn-gradient hover:opacity-90 text-white font-medium"
                                            >
                                              {isSavingVideo ? (
                                                <div className="flex items-center space-x-2">
                                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                                  <span>Saving...</span>
                                                </div>
                                              ) : (
                                                "Save"
                                              )}
                                            </Button>
                                            <Button
                                              onClick={cancelEditingVideo}
                                              size="sm"
                                              variant="ghost"
                                              className="text-white/70 hover:text-white hover:bg-white/10"
                                            >
                                              Cancel
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <h4 className="text-white font-medium truncate">{video.filename}</h4>
                                          {video.description && (
                                            <p className="text-white/60 text-sm mt-1 line-clamp-2">{video.description}</p>
                                          )}
                                          <div className="flex items-center space-x-4 text-sm text-white/60 mt-1">
                                            <span>{(video.size / 1024 / 1024).toFixed(2)} MB</span>
                                            <span>{formatVideoDate(video.uploadDate)}</span>
                                            <span>by {video.uploadedBy}</span>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                    {editingVideoId !== video.id && (
                                      <div className="flex items-center space-x-2 ml-4">
                                        <Button
                                          onClick={() => setShowVideoPreview(video.url)}
                                          variant="ghost"
                                          size="sm"
                                          className="text-white/70 hover:text-white hover:bg-white/10"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          onClick={() => startEditingVideo(video.id, video.filename, video.description || "")}
                                          variant="ghost"
                                          size="sm"
                                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                        >
                                          <Edit3 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          onClick={() => deleteVideo(video.id)}
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
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

      {/* Video Preview Modal */}
      {showVideoPreview && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={() => setShowVideoPreview(null)}
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
              onClick={() => setShowVideoPreview(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 hover:scale-110"
              aria-label="Close video preview"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video Player */}
            <div className="relative aspect-video bg-black">
              <video
                className="w-full h-full"
                controls
                autoPlay
                playsInline
                muted
                src={showVideoPreview}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Info */}
            <div className="p-6 bg-white/5">
              <h3 className="text-2xl font-bold text-white mb-2">Video Preview</h3>
              <p className="text-white/70">Click outside the video or press ESC to close</p>
            </div>
          </div>
        </div>
      )}

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
          <p className="text-white/60 mt-2">
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
      </footer>
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}
