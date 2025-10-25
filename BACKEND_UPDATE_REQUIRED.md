# Backend Update Required: Video Schema Change

We're adding a new "isDemo" boolean field to the video/feature-videos schema.

## Required Changes:

### 1. Database Schema:
- Add `isDemo: boolean` field to video documents (default: false)
- Add validation to ensure only ONE video can have isDemo=true at a time

### 2. API Endpoints to Update:

**a) GET /api/feature-videos**
- Include `isDemo` field in response for each video

**b) PATCH /api/feature-videos/:videoId**
- Accept `isDemo` boolean in request body
- When setting isDemo=true for a video:
  * Set isDemo=false for ALL other videos first
  * Then set isDemo=true for the target video
- Return updated video object

**c) POST /api/feature-videos (video upload)**
- Set isDemo=false by default for new uploads

### 3. Existing Videos:
- Run migration to add isDemo=false to all existing videos
- Optionally set the first/oldest video as isDemo=true

### 4. Response Format:
Ensure video objects include:
```json
{
  "id": "string",
  "filename": "string", 
  "url": "string",
  "size": "number",
  "uploadDate": "string",
  "uploadedBy": "string",
  "description": "string",
  "isDemo": "boolean"  // NEW FIELD
}
```

## Frontend Implementation Status:
✅ Type definitions updated
✅ Demo video selection logic updated  
✅ Admin panel UI with star toggle button
✅ Visual indicators for demo videos
⏳ Waiting for backend implementation

## Testing:
- Verify only one video can be marked as demo at a time
- Confirm homepage shows correct demo video after toggling
- Test fallback behavior when no video is marked as demo
- Verify admin UI star icon reflects current demo status

