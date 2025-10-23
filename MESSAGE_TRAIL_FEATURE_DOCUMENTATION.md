# Message Trail Feature - Complete Implementation Guide

## Overview
The Message Trail feature is a comprehensive communication tracking system in the admin dashboard that allows administrators to view the complete history of all interactions with customer requests, including status changes, timestamps, admin responses, and notes.

## Data Structure

### CustomerRequest Interface
```typescript
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
```

## State Management

### Required State Variables
```typescript
const [showMessageTrail, setShowMessageTrail] = useState<CustomerRequest | null>(null)
const [isResponding, setIsResponding] = useState(false)
const [responseText, setResponseText] = useState("")
```

## Core Functions

### 1. Open Message Trail Function
```typescript
const openMessageTrail = (request: CustomerRequest) => {
  setShowMessageTrail(request)
}
```

### 2. Handle Response Function
```typescript
const handleResponse = async (requestId: number) => {
  if (!responseText.trim()) return
  
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
```

### 3. Timestamp Formatting Function
```typescript
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
```

### 4. Status Color Helper Function
```typescript
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
```

## UI Components

### 1. Message Trail Button (Collapsed View)
```tsx
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
```

### 2. Message Trail Button (Expanded View)
```tsx
<Button
  size="sm"
  onClick={() => openMessageTrail(request)}
  disabled={!request.statusHistory || request.statusHistory.length === 0}
  className={`font-medium shadow-lg transition-all duration-300 w-full sm:w-auto order-2 sm:order-3 ${
    request.statusHistory && request.statusHistory.length > 0
      ? 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-xl'
      : 'bg-gray-500 text-white/50 cursor-not-allowed'
  }`}
>
  <History className="w-4 h-4 mr-2" />
  Message Trail
</Button>
```

### 3. Complete Message Trail Modal
```tsx
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
```

## Backend Integration

### API Endpoints
1. **Fetch Requests**: `GET ${API_BASE_URL}/api/contact-requests/frontend`
2. **Update Request**: `PATCH ${API_BASE_URL}/api/contact-requests/${requestId}`

### Request Headers
```typescript
headers: {
  'Authorization': `Bearer ${idToken}`,
  'Content-Type': 'application/json'
}
```

### Request Body for Updates
```typescript
{
  status: "responded",
  response: currentResponseText.trim(),
  notes: "Response sent via admin dashboard"
}
```

## Styling and CSS

### Required CSS Classes
```css
/* Custom gradient for buttons */
.custom-btn-gradient {
  background: linear-gradient(90deg, #92278F 0%, #A62365 34.26%, #BE1E2D 100%);
}

/* Glass effect for modals */
.bg-white/25 {
  background-color: rgba(255, 255, 255, 0.25);
}

.backdrop-blur-lg {
  backdrop-filter: blur(16px);
}

/* Status colors */
.text-yellow-400.bg-yellow-400/20 {
  color: rgb(250 204 21);
  background-color: rgb(250 204 21 / 0.2);
}

.text-green-400.bg-green-400/20 {
  color: rgb(74 222 128);
  background-color: rgb(74 222 128 / 0.2);
}

.text-gray-400.bg-gray-400/20 {
  color: rgb(156 163 175);
  background-color: rgb(156 163 175 / 0.2);
}
```

### Tailwind Configuration
```typescript
// tailwind.config.ts
backgroundImage: {
  'custom-btn-gradient': 'linear-gradient(90deg, #92278F 0%, #A62365 34.26%, #BE1E2D 100%)',
}
```

## Required Dependencies

### React Hooks
```typescript
import { useState, useEffect } from "react"
```

### UI Components
```typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
```

### Icons
```typescript
import { 
  History,
  X,
  RefreshCw
} from "lucide-react"
```

### Authentication
```typescript
import { auth } from "@/lib/firebase"
```

## Key Features

### 1. **Real-time Updates**
- Optimistic UI updates for immediate feedback
- Automatic reversion on API failure
- Live updates to message trail when responses are sent

### 2. **Accessibility**
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly

### 3. **Responsive Design**
- Mobile-first approach
- Adaptive button layouts
- Flexible modal sizing

### 4. **Error Handling**
- Comprehensive error catching
- User-friendly error messages
- Graceful fallbacks

### 5. **User Experience**
- Smooth animations and transitions
- Loading states with spinners
- Disabled states for invalid actions

## Implementation Steps

1. **Add State Variables**: Add the required state variables to your component
2. **Implement Core Functions**: Add the `openMessageTrail`, `handleResponse`, and `formatTimestamp` functions
3. **Add UI Components**: Implement the message trail buttons and modal
4. **Configure Backend**: Set up the API endpoints for fetching and updating requests
5. **Add Styling**: Include the required CSS classes and Tailwind configuration
6. **Test Integration**: Ensure proper error handling and optimistic updates

## Notes

- The feature requires Firebase authentication
- The modal uses a fixed height of 600px for consistent layout
- The feature gracefully handles both string and Firebase timestamp formats
- Button states change based on whether status history exists
- The modal can be closed by clicking the backdrop or the X button
- All responses are automatically added to the status history
- The feature includes email links for admin attribution
