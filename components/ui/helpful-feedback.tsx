"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface HelpfulFeedbackProps {
  articleId: string
  helpfulCount?: number
  className?: string
}

export function HelpfulFeedback({ 
  articleId, 
  helpfulCount = 0, 
  className = "" 
}: HelpfulFeedbackProps) {
  const [hasVoted, setHasVoted] = useState(false)
  const [voteType, setVoteType] = useState<"helpful" | "not-helpful" | null>(null)
  const [localCount, setLocalCount] = useState(helpfulCount)

  const handleVote = async (type: "helpful" | "not-helpful") => {
    if (hasVoted) return

    setHasVoted(true)
    setVoteType(type)
    
    if (type === "helpful") {
      setLocalCount(prev => prev + 1)
    }

    // Here you would typically send the feedback to your backend
    try {
      // await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ articleId, feedback: type })
      // })
      console.log(`Feedback submitted for ${articleId}: ${type}`)
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  return (
    <div className={`flex items-center space-x-4 mt-6 ${className}`}>
      <span className="text-white/80 text-sm font-medium">Was this article helpful?</span>
      
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant={voteType === "helpful" ? "default" : "outline"}
          className={`${
            voteType === "helpful" 
              ? "bg-green-700 hover:bg-green-800 text-white border-green-700" 
              : "border-white/30 text-white hover:bg-white/10 bg-white/5"
          } transition-colors`}
          onClick={() => handleVote("helpful")}
          disabled={hasVoted}
        >
          <ThumbsUp className="w-4 h-4 mr-1" />
          Yes
        </Button>
        
        <Button
          size="sm"
          variant={voteType === "not-helpful" ? "default" : "outline"}
          className={`${
            voteType === "not-helpful" 
              ? "bg-red-700 hover:bg-red-800 text-white border-red-700" 
              : "border-white/30 text-white hover:bg-white/10 bg-white/5"
          } transition-colors`}
          onClick={() => handleVote("not-helpful")}
          disabled={hasVoted}
        >
          <ThumbsDown className="w-4 h-4 mr-1" />
          No
        </Button>
      </div>
      
      <span className="text-white/60 text-sm flex items-center">
        <span className="mr-1">📈</span>
        {localCount} people found this article helpful
      </span>
    </div>
  )
}
