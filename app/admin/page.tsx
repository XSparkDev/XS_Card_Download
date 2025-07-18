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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"requests" | "uploads">("requests")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [requests, setRequests] = useState([
    {
      id: 1,
      type: "demo",
      name: "John Smith",
      email: "john@company.com",
      company: "Tech Corp",
      message: "Interested in a demo for our 50-person team",
      date: "2024-01-15",
      status: "pending",
    },
    {
      id: 2,
      type: "inquiry",
      name: "Sarah Johnson",
      email: "sarah@startup.co",
      company: "StartupCo",
      message: "Questions about enterprise pricing and features",
      date: "2024-01-14",
      status: "responded",
    },
    {
      id: 3,
      type: "call",
      name: "Mike Wilson",
      email: "mike@business.com",
      company: "Business Solutions",
      message: "Request for sales call to discuss implementation",
      date: "2024-01-13",
      status: "pending",
    },
  ])
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [responseText, setResponseText] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith(".apk")) {
      setUploadFile(file)
    }
  }

  const handleUpload = () => {
    if (!uploadFile) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadFile(null)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleResponse = (requestId: number) => {
    setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "responded" } : req)))
    setSelectedRequest(null)
    setResponseText("")
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 px-4 sm:px-6 py-2 sm:py-4 rounded-full bg-white/20 backdrop-blur-lg border border-white/10">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
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
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors font-medium text-sm sm:text-base"
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

                    {/* Requests List */}
                    <div className="grid gap-4 sm:gap-6">
                      {requests.map((request) => (
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
                                  <p className="text-white/90 mb-3 text-sm sm:text-base">{request.message}</p>
                                  <p className="text-white/50 text-xs">{request.date}</p>
                                </div>
                              </div>
                              <div className="flex justify-start sm:justify-end">
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedRequest(request)}
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full sm:w-auto"
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
                    </div>

                    {/* Response Modal */}
                    {selectedRequest && (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedRequest(null)}></div>
                        <div className="relative bg-white/25 backdrop-blur-lg border border-white/30 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Respond to {selectedRequest.name}</h3>
                            <button
                          onClick={() => setSelectedRequest(null)}
                              className="text-white/70 hover:text-white transition-colors"
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
                                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                              >
                                Send Response
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedRequest(null)}
                                className="flex-1 border-white/40 text-white hover:bg-white/10"
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
    </div>
  )
}
