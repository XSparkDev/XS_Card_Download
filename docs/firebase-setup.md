# Firebase Authentication Setup

This document outlines the Firebase Authentication setup for the XS Card web application.

## Overview

The application uses Firebase Authentication v9+ with modular imports for user authentication. The setup includes:

- Email/password authentication
- User registration and login
- Password reset functionality
- Protected routes
- Authentication state management
- API token authentication

## Configuration

### Firebase Config

The Firebase configuration is located in `lib/firebase.ts`:

```typescript
const firebaseConfig = {
    apiKey: "AIzaSyAHxd3TGf8v9DVUevw6p5F47EBV7ihYTuk",
    authDomain: "xscard-addd4.firebaseapp.com", 
    projectId: "xscard-addd4",
    storageBucket: "xscard-addd4.firebasestorage.app",
    messagingSenderId: "628567737496",
    appId: "NEED_FROM_CONSOLE" // ⚠️ Missing from console
};
```

**Important**: You need to add the `appId` from your Firebase console.

### Environment Variables

Add the following environment variables to your `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Components

### Authentication Components

1. **AuthModal** (`components/auth/auth-modal.tsx`)
   - Login and registration modal
   - Email/password authentication
   - Form validation and error handling
   - Password visibility toggle

2. **UserProfile** (`components/auth/user-profile.tsx`)
   - User profile dropdown
   - Sign out functionality
   - Password reset dialog

3. **ProtectedRoute** (`components/auth/protected-route.tsx`)
   - Route protection component
   - Authentication state checking
   - Fallback UI for unauthenticated users

### Hooks

1. **useAuth** (`hooks/use-auth.tsx`)
   - Authentication context provider
   - User state management
   - Authentication methods (register, signIn, signOut, etc.)

2. **useAuthApi** (`utils/auth-api.ts`)
   - Authenticated API request utilities
   - Firebase ID token handling
   - Pre-built API functions for common operations

## Usage

### Basic Authentication

```typescript
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.email}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Protected Routes

```typescript
import { ProtectedRoute } from '@/components/auth/protected-route';

function AdminPage() {
  return (
    <ProtectedRoute>
      <div>Admin content here</div>
    </ProtectedRoute>
  );
}
```

### Authentication Modal

```typescript
import { AuthModal } from '@/components/auth/auth-modal';

function LoginButton() {
  return (
    <AuthModal
      trigger={<button>Sign In</button>}
      defaultTab="login"
      onSuccess={() => console.log('User signed in!')}
    />
  );
}
```

### Authenticated API Calls

```typescript
import { authApi } from '@/utils/auth-api';

async function getUserProfile() {
  const response = await authApi.getProfile();
  
  if (response.success) {
    console.log('User profile:', response.data);
  } else {
    console.error('Error:', response.error);
  }
}
```

## Error Handling

The authentication system includes comprehensive error handling:

- **User-friendly error messages** for common Firebase errors
- **Network error handling** for API requests
- **Loading states** for better UX
- **Toast notifications** for success/error feedback

### Common Error Codes

- `auth/user-not-found`: No account found with this email
- `auth/wrong-password`: Incorrect password
- `auth/email-already-in-use`: Email already registered
- `auth/weak-password`: Password too weak
- `auth/invalid-email`: Invalid email format
- `auth/too-many-requests`: Too many failed attempts

## Security Features

1. **Firebase ID Tokens**: All API requests include Firebase ID tokens for server-side verification
2. **Password Requirements**: Minimum 6 characters for passwords
3. **Email Verification**: Built-in email verification support
4. **Rate Limiting**: Firebase handles rate limiting for authentication attempts
5. **Secure Token Storage**: Tokens are managed securely by Firebase

## Backend Integration

For backend API integration, verify Firebase ID tokens on the server:

```typescript
// Example backend verification (Node.js)
import { getAuth } from 'firebase-admin/auth';

async function verifyToken(req, res) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

## Testing

### Manual Testing

1. **Registration Flow**:
   - Open the app
   - Click "Sign In" in navigation
   - Switch to "Create Account" tab
   - Fill in registration form
   - Verify account creation

2. **Login Flow**:
   - Use existing credentials
   - Test error handling with wrong password
   - Test "forgot password" functionality

3. **Protected Routes**:
   - Try accessing `/admin` without authentication
   - Verify redirect to login
   - Test access after authentication

4. **API Integration**:
   - Check browser network tab for authenticated requests
   - Verify Authorization headers include Firebase tokens

### Automated Testing

```typescript
// Example test with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '@/hooks/use-auth';
import { AuthModal } from '@/components/auth/auth-modal';

test('shows login form', () => {
  render(
    <AuthProvider>
      <AuthModal />
    </AuthProvider>
  );
  
  expect(screen.getByText('Sign In')).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

1. **"Firebase App named '[DEFAULT]' already exists"**
   - Ensure Firebase is only initialized once
   - Check for duplicate imports

2. **"auth/network-request-failed"**
   - Check internet connection
   - Verify Firebase project configuration

3. **"auth/invalid-api-key"**
   - Verify Firebase config in `lib/firebase.ts`
   - Check API key in Firebase console

4. **Protected routes not working**
   - Ensure `AuthProvider` wraps the app in `layout.tsx`
   - Check authentication state in browser dev tools

### Debug Mode

Enable Firebase debug mode for development:

```typescript
// Add to lib/firebase.ts
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase initialized with config:', firebaseConfig);
}
```

## Next Steps

1. **Complete Firebase Setup**:
   - Add missing `appId` to configuration
   - Configure Firebase Authentication in console
   - Set up email templates for password reset

2. **Backend Integration**:
   - Implement Firebase Admin SDK on backend
   - Create API endpoints that verify Firebase tokens
   - Set up user profile and business card APIs

3. **Additional Features**:
   - Social authentication (Google, Facebook)
   - Email verification flow
   - Two-factor authentication
   - User roles and permissions

4. **Production Deployment**:
   - Update Firebase config for production
   - Set up proper environment variables
   - Configure Firebase hosting if needed 