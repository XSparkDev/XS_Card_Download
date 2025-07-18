import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
  AuthError,
  AuthErrorCodes
} from 'firebase/auth';
import { auth } from './firebase';

// Authentication error types
export interface AuthErrorType {
  code: string;
  message: string;
  userFriendlyMessage: string;
}

// User registration data
export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
}

// Login data
export interface LoginData {
  email: string;
  password: string;
}

// Authentication response
export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: AuthErrorType;
}

// Map Firebase error codes to user-friendly messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case AuthErrorCodes.USER_DELETED:
      return 'No account found with this email address.';
    case AuthErrorCodes.INVALID_PASSWORD:
      return 'Incorrect password. Please try again.';
    case AuthErrorCodes.EMAIL_EXISTS:
      return 'An account with this email already exists.';
    case AuthErrorCodes.WEAK_PASSWORD:
      return 'Password should be at least 6 characters long.';
    case AuthErrorCodes.INVALID_EMAIL:
      return 'Please enter a valid email address.';
    case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
      return 'Too many failed attempts. Please try again later.';
    case AuthErrorCodes.NETWORK_REQUEST_FAILED:
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
};

// Convert Firebase AuthError to our custom error type
const convertAuthError = (error: AuthError): AuthErrorType => ({
  code: error.code,
  message: error.message,
  userFriendlyMessage: getAuthErrorMessage(error.code)
});

// Register new user
export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    console.log('🔐 Attempting to register user:', data.email);
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    // Update profile with display name if provided
    if (data.displayName && userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: data.displayName
      });
    }

    console.log('✅ User registered successfully:', userCredential.user.email);
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    const authError = error as AuthError;
    return {
      success: false,
      error: convertAuthError(authError)
    };
  }
};

// Sign in existing user
export const signInUser = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    const authError = error as AuthError;
    return {
      success: false,
      error: convertAuthError(authError)
    };
  }
};

// Sign out user
export const signOutUser = async (): Promise<AuthResponse> => {
  try {
    await signOut(auth);
    return {
      success: true
    };
  } catch (error) {
    const authError = error as AuthError;
    return {
      success: false,
      error: convertAuthError(authError)
    };
  }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<AuthResponse> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true
    };
  } catch (error) {
    const authError = error as AuthError;
    return {
      success: false,
      error: convertAuthError(authError)
    };
  }
};

// Check if email exists (by attempting to sign in)
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    // This is a workaround since Firebase doesn't provide a direct way to check email existence
    // We'll try to sign in with a dummy password to see if the account exists
    await signInWithEmailAndPassword(auth, email, 'dummy-password-for-check');
    return false; // This should never reach here if email exists
  } catch (error) {
    const authError = error as AuthError;
    // If we get INVALID_PASSWORD, the email exists
    // If we get USER_DELETED, the email doesn't exist
    return authError.code === AuthErrorCodes.INVALID_PASSWORD;
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Get Firebase ID token for API calls
export const getIdToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
}; 