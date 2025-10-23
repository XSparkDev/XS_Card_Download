"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Play, X as CloseIcon, RefreshCw } from "lucide-react"
import Link from "next/link"
import { API_BASE_URL } from "@/utils/api"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface VideoFeature {
  id: string;
  filename: string;
  url: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  description?: string;
}

export default function FeatureLibrary() {
  const { toast } = useToast()
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [videos, setVideos] = useState<VideoFeature[]>([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)

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

  // Load videos on component mount
  useEffect(() => {
    fetchVideos()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Feature Library</h1>
              <p className="text-white/70 mt-2">Explore XS Card features through interactive demos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid Section */}
      <section className="px-6 py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in-up animation-delay-200">
              Feature Demos
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
              Watch short clips showcasing XS Card's key features
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

      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}
