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
  Shield,
  Menu,
  X,
  History,
  Trash2,
  Edit3,
  Star,
  Users,
} from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import Link from "next/link"
import { UserProfile } from "@/components/auth/user-profile"
import { auth } from "@/lib/firebase"
import { API_BASE_URL, API_ENDPOINTS } from "@/utils/api"
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

interface FirestoreTimestamp {
  _seconds: number
  _nanoseconds: number
}

interface AdminUser {
  id: string
  uid?: string | null
  firstName: string
  lastName: string
  email?: string | null
  plan: string
  status: "active" | "inactive" | "pending"
  createdAt?: string | FirestoreTimestamp
}

interface UserContact {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  createdAt?: string | FirestoreTimestamp
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"requests" | "users" | "video-upload">("requests")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [requests, setRequests] = useState<CustomerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null)
  const [responseText, setResponseText] = useState("")
  const [showMessageTrail, setShowMessageTrail] = useState<CustomerRequest | null>(null)
  const [isResponding, setIsResponding] = useState(false)
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
    isDemo?: boolean;
  }>>([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const [showVideoPreview, setShowVideoPreview] = useState<string | null>(null)
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [editingVideoName, setEditingVideoName] = useState<string>("")
  const [editingVideoDescription, setEditingVideoDescription] = useState<string>("")
  const [isSavingVideo, setIsSavingVideo] = useState(false)
  const [togglingDemoVideo, setTogglingDemoVideo] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null)
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
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [userPage, setUserPage] = useState(1)
  const usersPerPage = 20
  const isDemoUsers = usersError?.toLowerCase().includes('demo data') ?? false
const [contactsUser, setContactsUser] = useState<AdminUser | null>(null)
const [userContacts, setUserContacts] = useState<UserContact[]>([])
const [isContactsLoading, setIsContactsLoading] = useState(false)
const [contactsError, setContactsError] = useState<string | null>(null)
  const [userSearchTerm, setUserSearchTerm] = useState('')

  function formatPlanLabel(plan?: string | null): string {
    if (!plan) return "Unknown"
    const cleaned = String(plan).replace(/_/g, " ").trim()
    if (!cleaned) return "Unknown"
    return cleaned
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  function normaliseStatus(
    rawStatus: unknown,
    activeFlag?: boolean | null
  ): AdminUser["status"] {
    if (typeof rawStatus === "string") {
      const statusLower = rawStatus.toLowerCase()
      if (statusLower === "active") return "active"
      if (statusLower === "inactive" || statusLower === "disabled") return "inactive"
      if (statusLower === "pending") return "pending"
    }
    if (typeof rawStatus === "boolean") {
      return rawStatus ? "active" : "inactive"
    }
    if (typeof activeFlag === "boolean") {
      return activeFlag ? "active" : "inactive"
    }
    return "pending"
  }

  function parseFirestoreDate(value?: string | FirestoreTimestamp): Date | null {
    if (!value) return null
    if (typeof value === "string") {
      const parsed = new Date(value)
      return Number.isNaN(parsed.getTime()) ? null : parsed
    }
    if (
      typeof value === "object" &&
      value !== null &&
      typeof value._seconds === "number" &&
      typeof value._nanoseconds === "number"
    ) {
      const milliseconds =
        value._seconds * 1000 + Math.floor(value._nanoseconds / 1_000_000)
      const parsed = new Date(milliseconds)
      return Number.isNaN(parsed.getTime()) ? null : parsed
    }
    return null
  }
  
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

  const mockUsers: AdminUser[] = [
    { id: "1", uid: "1", firstName: "Lerato", lastName: "Mokoena", email: "lerato@example.com", plan: formatPlanLabel("Premium"), status: "active", createdAt: "2023-01-15T09:30:00Z" },
    { id: "2", uid: "2", firstName: "Michael", lastName: "Naidoo", email: "michael@example.com", plan: formatPlanLabel("Free"), status: "inactive", createdAt: "2022-11-03T12:00:00Z" },
    { id: "3", uid: "3", firstName: "Thandi", lastName: "Petersen", email: "thandi@example.com", plan: formatPlanLabel("Business"), status: "active", createdAt: "2024-02-20T07:15:00Z" },
    { id: "4", uid: "4", firstName: "Kabelo", lastName: "Dlamini", email: "kabelo@example.com", plan: formatPlanLabel("Premium"), status: "pending", createdAt: "2023-06-01T16:45:00Z" },
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
  
  const fetchUsers = async () => {
    if (accessDenied) {
      setUsers([])
      setIsLoadingUsers(false)
      return
    }

    setIsLoadingUsers(true)
    setUsersError(null)

    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        setUsersError('User not authenticated')
        setIsLoadingUsers(false)
        return
      }

      const idToken = await currentUser.getIdToken()

      const endpoint = `${API_BASE_URL}${API_ENDPOINTS.USERS}`

      console.log('🔍 Fetching users from:', endpoint)
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      const rawUsers = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.users)
            ? result.users
            : []

      const normalisedUsers: AdminUser[] = rawUsers.map((user: any, index: number) => {
        const nameValue = typeof user.name === 'string' ? user.name.trim() : ''
        const firstName = nameValue || 'Unknown'
        const surnameValue = typeof user.surname === 'string' ? user.surname.trim() : ''
        const plan = formatPlanLabel(user.plan ?? null)

        let status: AdminUser['status'] = 'pending'
        if (typeof user.status === 'string') {
          status = normaliseStatus(user.status, undefined)
        } else if (typeof user.active === 'boolean') {
          status = normaliseStatus(undefined, user.active)
        }

        return {
          id: String(user.id ?? user.uid ?? `user-${index}`),
          uid: typeof user.uid === 'string' ? user.uid : String(user.id ?? `user-${index}`),
          firstName,
          lastName: surnameValue,
          email: user.email ?? null,
          plan,
          status,
          createdAt: user.createdAt,
        }
      })

      setUsers(normalisedUsers.length > 0 ? normalisedUsers : [])
    } catch (error) {
      console.error('❌ Failed to fetch users:', error)
      let message = 'Failed to load users'
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          message = 'Cannot connect to server. Please ensure the backend is running.'
        } else if (error.message.includes('401')) {
          message = 'Authentication failed. Please log in again.'
        } else if (error.message.includes('403')) {
          message = 'Access denied. You may not have admin privileges.'
        } else {
          message = error.message
        }
      }
      setUsersError(message)
      setUsers(mockUsers)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [accessDenied])
  
  const filteredUsers = users.filter((user) => {
    if (!userSearchTerm.trim()) return true

    const term = userSearchTerm.trim().toLowerCase()
    const valuesToSearch = [
      user.firstName,
      user.lastName,
      user.email,
      user.plan,
      user.status,
      formatUserDate(user.createdAt),
    ]

    return valuesToSearch.some((value) =>
      typeof value === 'string' && value.toLowerCase().includes(term)
    )
  })

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage))
  const usersCurrentPage = Math.min(userPage, totalUserPages)
  const paginatedUsers = filteredUsers.slice((usersCurrentPage - 1) * usersPerPage, usersCurrentPage * usersPerPage)

  const openContactsModal = async (user: AdminUser) => {
    setContactsUser(user)
    setUserContacts([])
    setContactsError(null)
    setIsContactsLoading(true)

    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      const idToken = await currentUser.getIdToken()
      const uid = user.uid ?? user.id
      const endpoint = `${API_BASE_URL}${API_ENDPOINTS.GET_CONTACTS}/${encodeURIComponent(uid)}`

      console.log('🔍 Fetching contacts for user:', uid, endpoint)

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      let contactsData: any[] = []
      if (Array.isArray(result)) {
        contactsData = result
      } else if (Array.isArray(result?.data)) {
        contactsData = result.data
      } else if (Array.isArray(result?.contacts)) {
        contactsData = result.contacts
      } else if (Array.isArray(result?.contactList)) {
        contactsData = result.contactList
      }

      const normalisedContacts: UserContact[] = contactsData.map((contact: any, index: number) => {
        const firstName = typeof contact.name === 'string' ? contact.name.trim() : ''
        const lastName = typeof contact.surname === 'string' ? contact.surname.trim() : ''
        const name = [firstName, lastName].filter(Boolean).join(' ') || firstName || lastName

        return {
          id: String(contact.id ?? contact.uid ?? contact.email ?? `contact-${index}`),
          name,
          email: typeof contact.email === 'string' ? contact.email : '',
          phone: typeof contact.phone === 'string'
            ? contact.phone
            : typeof contact.phoneNumber === 'string'
              ? contact.phoneNumber
              : '',
          company: typeof contact.company === 'string' ? contact.company : undefined,
          createdAt: contact.createdAt,
        }
      })

      setUserContacts(normalisedContacts)
    } catch (error) {
      console.error('❌ Failed to fetch contacts:', error)
      const message =
        error instanceof Error ? error.message : 'Failed to load contacts'
      setContactsError(message)
    } finally {
      setIsContactsLoading(false)
    }
  }

  const closeContactsModal = () => {
    setContactsUser(null)
    setUserContacts([])
    setContactsError(null)
    setIsContactsLoading(false)
  }
  
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

  // Handle escape key for delete confirmation
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteConfirm) {
        setShowDeleteConfirm(null)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showDeleteConfirm])

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
    if (deletingVideo) return // Prevent multiple simultaneous deletions
    
    setDeletingVideo(videoId)
    setShowDeleteConfirm(null)
    
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
    } finally {
      setDeletingVideo(null)
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

  const toggleDemoVideo = async (videoId: string) => {
    if (togglingDemoVideo) return // Prevent multiple simultaneous requests
    
    setTogglingDemoVideo(videoId)
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
        body: JSON.stringify({ isDemo: true })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Update local state - set all videos to isDemo=false, then set the target to true
        setUploadedVideos(prev => prev.map(video => ({
          ...video,
          isDemo: video.id === videoId
        })))
        
        toast({
          title: "Demo Video Updated!",
          description: "The demo video has been changed successfully.",
          variant: "default",
        })
      } else {
        throw new Error(result.message || 'Failed to update demo video')
      }
    } catch (error) {
      console.error('Error toggling demo video:', error)
      toast({
        title: "Failed to Update Demo Video",
        description: error instanceof Error ? error.message : 'Failed to update demo video',
        variant: "destructive",
      })
    } finally {
      setTogglingDemoVideo(null)
    }
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

  function formatUserDate(value?: string | FirestoreTimestamp): string | null {
    if (!value) return null

    if (typeof value === 'string') {
      const parsedDate = parseFirestoreDate(value)
      if (parsedDate) {
        const day = String(parsedDate.getDate()).padStart(2, '0')
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const month = monthNames[parsedDate.getMonth()]
        const year = parsedDate.getFullYear()
        return `${day}/${month}/${year}`
      }
      const fallback = new Date(value)
      if (!Number.isNaN(fallback.getTime())) {
        const day = String(fallback.getDate()).padStart(2, '0')
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const month = monthNames[fallback.getMonth()]
        const year = fallback.getFullYear()
        return `${day}/${month}/${year}`
      }

      // Attempt manual parsing for strings like "September 12 2025 at 10:36:25 AM UTC"
      const monthLookup: Record<string, number> = {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
      }
      const match = value
        .replace(/,/g, '')
        .match(/([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})/)

      if (match) {
        const [, monthNameRaw, dayRaw, yearRaw] = match
        const monthIndex = monthLookup[monthNameRaw.toLowerCase()]
        const dayNum = Number(dayRaw)
        const yearNum = Number(yearRaw)

        if (monthIndex !== undefined && !Number.isNaN(dayNum) && !Number.isNaN(yearNum)) {
          const normalisedDate = new Date(Date.UTC(yearNum, monthIndex, dayNum))
          const day = String(normalisedDate.getUTCDate()).padStart(2, '0')
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          const month = monthNames[monthIndex]
          return `${day}/${month}/${yearNum}`
        }
      }

      return value
    }

    const date = parseFirestoreDate(value)
    if (!date) {
      return null
    }
    const day = String(date.getDate()).padStart(2, '0')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const getStatusClasses = (status: AdminUser['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border border-green-500/40'
      case 'inactive':
        return 'bg-red-500/20 text-red-300 border border-red-500/40'
      default:
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
    }
  }

  const getStatusLabel = (status: AdminUser['status']) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'inactive':
        return 'Inactive'
      default:
        return 'Pending'
    }
  }

  const handleViewUser = (user: AdminUser) => {
    void openContactsModal(user)
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
    
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      })

      const healthOk = healthResponse.ok
      console.log(healthOk ? '✅ Health endpoint is reachable' : `⚠️ Health endpoint responded with status: ${healthResponse.status}`)

      const currentUser = auth.currentUser
      if (!currentUser) {
        toast({
          title: "Authentication Required",
          description: "Please sign in again to test admin endpoints.",
          variant: "destructive",
        })
        return
      }

      const idToken = await currentUser.getIdToken()

      const userEndpoints = [
        `${API_BASE_URL}/api/admin/users`,
        `${API_BASE_URL}/admin/users`,
        `${API_BASE_URL}/api/users`,
        `${API_BASE_URL}/users`
      ]

      let userEndpointSuccess: { endpoint: string; status: number } | null = null

      for (const endpoint of userEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json'
            },
            mode: 'cors'
          })

          if (response.ok) {
            userEndpointSuccess = { endpoint, status: response.status }
            console.log('✅ User endpoint reachable:', endpoint)
            break
          } else {
            console.warn(`⚠️ User endpoint responded with status ${response.status}: ${endpoint}`)
          }
        } catch (userError) {
          console.warn(`⚠️ User endpoint request failed for ${endpoint}:`, userError)
        }
      }

      if (healthOk && userEndpointSuccess) {
        toast({
          title: "Backend Connection Successful",
          description: `Health endpoint and user endpoint (${userEndpointSuccess.endpoint}) are accessible.`,
          variant: "default",
        })
      } else if (healthOk) {
        toast({
          title: "Partial Backend Access",
          description: "Health endpoint is reachable, but user endpoint could not be contacted.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Backend Connection Warning",
          description: `Health endpoint responded with status: ${healthResponse.status}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error)
      toast({
        title: "Backend Connection Failed",
        description: error instanceof Error ? error.message : "Cannot connect to backend server.",
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
          <p className="text-base sm:text-lg md:text-xl text-white/70 px-4">Manage customer requests, users, and media assets</p>
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
                  onClick={() => setActiveTab("users")}
                  className={`px-3 sm:px-6 md:px-8 py-3 sm:py-6 font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === "users"
                      ? "text-white border-b-2 border-purple-400 bg-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base md:text-lg">User Directory</span>
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

                {activeTab === "users" && (
                  <div className="space-y-6 sm:space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-white">User Directory</h2>
                      <div className="text-white/60 text-sm">
                        {isLoadingUsers ? "Loading users..." : `${filteredUsers.length} users`}
                      </div>
                    </div>

                    {usersError && (
                      <div
                        className={`rounded-lg p-4 sm:p-6 ${
                          isDemoUsers
                            ? "bg-yellow-500/10 border border-yellow-500/30"
                            : "bg-red-500/10 border border-red-500/30"
                        }`}
                      >
                        <p
                          className={`text-sm mb-4 ${
                            isDemoUsers ? "text-yellow-300" : "text-red-400"
                          }`}
                        >
                          {usersError}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                          <Button
                            onClick={fetchUsers}
                            className="bg-custom-btn-gradient hover:opacity-90 text-white border-0"
                            disabled={isLoadingUsers}
                          >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                            Retry
                          </Button>
                          <Button
                            onClick={testBackendConnection}
                            className="bg-custom-btn-gradient hover:opacity-90 text-white border-0"
                          >
                            Test Connection
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-white/70 mb-1">
                            Search users
                          </label>
                          <input
                            type="text"
                            value={userSearchTerm}
                            onChange={(e) => {
                              setUserSearchTerm(e.target.value)
                              setUserPage(1)
                            }}
                            placeholder="Search by name, surname, email, plan, status, joined…"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        {userSearchTerm && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setUserSearchTerm('')
                              setUserPage(1)
                            }}
                            className="self-start sm:self-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
                          >
                            Clear
                          </Button>
                        )}
                      </div>

                      {isLoadingUsers && (
                        <div className="space-y-3">
                          {Array.from({ length: 4 }).map((_, index) => (
                            <div
                              key={index}
                              className="animate-pulse bg-white/5 border border-white/10 rounded-lg h-16"
                            ></div>
                          ))}
                        </div>
                      )}

                      {!isLoadingUsers && !usersError && filteredUsers.length === 0 && (
                        <p className="text-white/70 text-center py-8">No users found.</p>
                      )}

                      {!isLoadingUsers && filteredUsers.length > 0 && (
                        <Card className="bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden">
                          <CardContent className="p-0">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-white/10">
                                <thead className="bg-white/5">
                                  <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                                      Name
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                                      Surname
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                                      Email
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                                      Plan
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                                      Status
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                                      Joined
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-white/70">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                  {paginatedUsers.map((user) => {
                                    const joinedLabel = formatUserDate(user.createdAt)
                                    return (
                                      <tr
                                        key={user.id}
                                        className="hover:bg-white/5 transition-colors"
                                      >
                                        <td className="px-4 py-3">
                                          <span className="text-white text-sm font-medium">
                                            {user.firstName || '—'}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-white/80 text-sm">
                                          {user.lastName || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-white/60 text-sm break-all">
                                          {user.email ? (
                                            <a
                                              href={`mailto:${user.email}`}
                                              className="text-purple-300 hover:text-purple-200 underline decoration-dotted break-all"
                                            >
                                              {user.email}
                                            </a>
                                          ) : (
                                            '—'
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-white/70 text-sm">
                                          {user.plan || 'Unknown'}
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center ${getStatusClasses(user.status)}`}>
                                            {getStatusLabel(user.status)}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-white/60">
                                          {joinedLabel ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleViewUser(user)}
                                            className="h-8 w-8 bg-transparent border border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/10 px-4 py-3 bg-white/5">
                              <p className="text-xs text-white/60">
                                Showing {(usersCurrentPage - 1) * usersPerPage + 1} to{" "}
                                {Math.min(usersCurrentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
                                {isDemoUsers && " (demo data)"}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setUserPage((prev) => Math.max(1, prev - 1))}
                                  disabled={usersCurrentPage === 1}
                                  className="bg-transparent border border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                                >
                                  Previous
                                </Button>
                                <span className="text-xs text-white/60">
                                  Page {usersCurrentPage} of {totalUserPages}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setUserPage((prev) => Math.min(totalUserPages, prev + 1))}
                                  disabled={usersCurrentPage === totalUserPages}
                                  className="bg-transparent border border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                                >
                                  Next
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
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
                                  className={`rounded-lg p-4 border transition-colors ${
                                    video.isDemo 
                                      ? "bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20" 
                                      : "bg-white/5 border-white/10 hover:bg-white/10"
                                  }`}
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
                                          <div className="flex items-center space-x-2">
                                            <h4 className="text-white font-medium truncate">{video.filename}</h4>
                                            {video.isDemo && (
                                              <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded-full border border-yellow-500/30">
                                                DEMO
                                              </span>
                                            )}
                                          </div>
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
                                          onClick={() => toggleDemoVideo(video.id)}
                                          disabled={togglingDemoVideo !== null}
                                          variant="ghost"
                                          size="sm"
                                          className={`${
                                            video.isDemo 
                                              ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10" 
                                              : "text-white/70 hover:text-yellow-400 hover:bg-yellow-400/10"
                                          } ${togglingDemoVideo === video.id ? "opacity-50 cursor-not-allowed" : ""}`}
                                          title={
                                            togglingDemoVideo === video.id 
                                              ? "Updating..." 
                                              : video.isDemo 
                                                ? "Remove as demo video" 
                                                : "Set as demo video"
                                          }
                                        >
                                          {togglingDemoVideo === video.id ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <Star className={`w-4 h-4 ${video.isDemo ? "fill-current" : ""}`} />
                                          )}
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
                                          onClick={() => setShowDeleteConfirm(video.id)}
                                          disabled={deletingVideo !== null}
                                          variant="ghost"
                                          size="sm"
                                          className={`text-red-400 hover:text-red-300 hover:bg-red-400/10 ${
                                            deletingVideo === video.id ? "opacity-50 cursor-not-allowed" : ""
                                          }`}
                                          title={deletingVideo === video.id ? "Deleting..." : "Delete video"}
                                        >
                                          {deletingVideo === video.id ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <Trash2 className="w-4 h-4" />
                                          )}
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

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(null)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Video</h3>
              <p className="text-white/70 mb-6">
                Are you sure you want to delete this video? This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowDeleteConfirm(null)}
                  variant="ghost"
                  className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => deleteVideo(showDeleteConfirm)}
                  disabled={deletingVideo !== null}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  {deletingVideo === showDeleteConfirm ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    "Delete Video"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

  {/* User Contacts Modal */}
  {contactsUser && (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeContactsModal}
      />
      <Card className="relative w-full max-w-4xl bg-slate-950/95 border border-white/15 shadow-2xl">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start justify-between space-x-4">
            <div>
              <h3 className="text-xl font-semibold text-white">
                Contacts for {contactsUser.firstName} {contactsUser.lastName}
              </h3>
              {contactsUser.email && (
                <p className="text-white/60 text-sm mt-1 break-all">
                  {contactsUser.email}
                </p>
              )}
            </div>
            <button
              onClick={closeContactsModal}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Close contacts"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isContactsLoading && (
            <p className="text-white/70 text-sm">Loading contacts...</p>
          )}

          {!isContactsLoading && contactsError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-300">
              {contactsError}
            </div>
          )}

          {!isContactsLoading && !contactsError && userContacts.length === 0 && (
            <p className="text-white/60 text-sm">No contacts found for this user.</p>
          )}

          {!isContactsLoading && !contactsError && userContacts.length > 0 && (
            <div className="border border-white/10 rounded-lg overflow-hidden">
              <div className="max-h-[26rem] overflow-y-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                        Company
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                        Added
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {userContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm text-white">
                          {contact.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-white/70 break-all">
                          {contact.email ? (
                            <a
                              href={`mailto:${contact.email}`}
                              className="block max-w-[14rem] truncate text-purple-300 hover:text-purple-200 underline decoration-dotted"
                              title={contact.email}
                            >
                              {contact.email}
                            </a>
                          ) : (
                            <span>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-white/70">
                          {contact.phone || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-white/70">
                          {contact.company || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-white/60">
                          {formatUserDate(contact.createdAt) ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={closeContactsModal}
              className="bg-custom-btn-gradient hover:opacity-90 text-white"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
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
                      <p className="text-white/60">&copy; 2024 X Spark Admin Dashboard. All rights reserved.</p>
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
