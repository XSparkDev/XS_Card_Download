# Backend Video Upload CRUD Implementation Prompt

## Overview
Create a complete CRUD (Create, Read, Update, Delete) system for feature demo videos in the admin dashboard. This should follow the same patterns as existing profile image uploads but with specific configurations for video files and full CRUD operations.

## API Endpoints Required

### 1. Upload Video (CREATE)
- **Route**: `POST /api/feature-videos/upload`
- **Authentication**: Require Firebase JWT token validation (same as existing endpoints)
- **Content-Type**: Handle `multipart/form-data` for file uploads
- **Method**: Use same authentication middleware as other admin endpoints

### 2. Get All Videos (READ)
- **Route**: `GET /api/feature-videos`
- **Authentication**: Public endpoint (no authentication required)
- **Response**: Return array of all uploaded videos with metadata

### 3. Update Video Metadata (UPDATE)
- **Route**: `PATCH /api/feature-videos/:videoId`
- **Authentication**: Require Firebase JWT token validation
- **Body**: JSON with updatable fields (filename, description, etc.)

### 4. Delete Video (DELETE)
- **Route**: `DELETE /api/feature-videos/:videoId`
- **Authentication**: Require Firebase JWT token validation
- **Action**: Remove both file from storage and database record

## File Storage Configuration
- **Storage Service**: Use Firebase Storage (same as profile images)
- **Bucket**: Create dedicated bucket for feature videos (separate from profile images)
- **Bucket Name**: `xscard-feature-videos` or similar naming convention
- **Path Structure**: Organize videos with timestamps or UUIDs for unique naming

## File Validation
- **Size Limit**: Maximum 150MB per video file
- **File Types**: Accept only MP4, MOV, AVI formats
- **Validation**: Check both MIME type and file extension
- **Error Handling**: Return appropriate HTTP status codes and error messages

## Database Schema
Store video metadata in database with fields:
- `id`: Unique identifier (UUID)
- `filename`: Original filename
- `url`: Firebase Storage download URL
- `size`: File size in bytes
- `uploadDate`: Timestamp of upload
- `uploadedBy`: Admin user ID/email who uploaded
- `mimeType`: Video MIME type
- `description`: Optional description field

## Response Formats

### Upload Success Response:
```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "video": {
    "id": "unique-video-id",
    "filename": "demo.mp4",
    "url": "https://storage.googleapis.com/bucket/path/video.mp4",
    "size": 15728640,
    "uploadDate": "2024-01-01T00:00:00Z",
    "uploadedBy": "admin@example.com"
  }
}
```

### Get Videos Response:
```json
{
  "success": true,
  "videos": [
    {
      "id": "video-id-1",
      "filename": "demo.mp4",
      "url": "https://storage.googleapis.com/bucket/path/video.mp4",
      "size": 15728640,
      "uploadDate": "2024-01-01T00:00:00Z",
      "uploadedBy": "admin@example.com"
    }
  ]
}
```

### Update Success Response:
```json
{
  "success": true,
  "message": "Video updated successfully",
  "video": {
    "id": "video-id",
    "filename": "updated-name.mp4",
    "url": "https://storage.googleapis.com/bucket/path/video.mp4",
    "size": 15728640,
    "uploadDate": "2024-01-01T00:00:00Z",
    "uploadedBy": "admin@example.com"
  }
}
```

### Delete Success Response:
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Specific error message",
  "error": "ERROR_CODE"
}
```

## Authentication Requirements
- **GET /api/feature-videos**: Public endpoint (no authentication required) - for Feature Library page
- **POST/PATCH/DELETE endpoints**: Require Firebase JWT token validation - for Admin Dashboard
- **Use Firebase Admin SDK to verify ID tokens for protected endpoints**
- **Only authenticated admin users can upload/manage videos**

## Implementation Details
- **Reference**: Examine existing profile image upload implementation
- **Pattern**: Follow same authentication, validation, and error handling patterns
- **CORS**: Ensure CORS headers are properly configured for all endpoints
- **Logging**: Add appropriate logging for all CRUD operations
- **Security**: Validate file headers to prevent malicious file uploads
- **Database**: Use same database patterns as other admin features

## Error Scenarios to Handle
- File too large (>150MB)
- Invalid file type
- Authentication failure
- Storage service errors
- Network timeouts
- Malformed requests
- Video not found (for update/delete)
- Permission denied (only admin users)

## Expected Behavior
The system should provide complete video management capabilities for admin users, allowing them to upload, view, update metadata, and delete feature demo videos while maintaining the same security and error handling standards as the current system.
