// API Configuration and Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
  captchaToken?: string;
}

export interface SalesFormData {
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  companySize: string;
  budget?: string;
  timeline: string;
  requirements: string;
  captchaToken?: string;
}

export interface QueryRequest {
  name: string;
  email: string;
  message: string;
  to: string;
  type?: string; // Add type field
  captchaToken?: string;
}

// Environment-based configuration
// Automatically detect environment based on deployment context
const getApiBaseUrl = (): string => {
  // Check if there's a custom base URL set (manual override)
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return (window as any).__API_BASE_URL__;
  }
  
  // Auto-detect environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    console.log('🔍 DEBUG: API Config - Current hostname:', hostname);
    
    // Production detection
    if (hostname === 'xscard-app.onrender.com' || 
        hostname === 'xscard.co.za' || 
        hostname === 'www.xscard.co.za' ||
        hostname.includes('vercel.app') ||
        hostname.includes('netlify.app') ||
        hostname.includes('github.io') ||
        hostname.includes('firebaseapp.com')) {
      console.log('🔍 DEBUG: API Config - Using production URL');
      return 'https://xscard-app.onrender.com';
    }
    
    // Ngrok detection - when using ngrok for development
    if (hostname.includes('ngrok-free.app') || hostname.includes('ngrok.io')) {
      console.log('🔍 DEBUG: API Config - Using Render production URL (ngrok detected)');
      // Temporarily pointing to production backend while in development
      return 'https://xscard-app.onrender.com';
     // return 'http://localhost:8383';

    }
    
    // Localhost or development domains
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' ||
        hostname.includes('.local') ||
        hostname.includes('dev.') ||
        hostname.includes('staging.')) {
      console.log('🔍 DEBUG: API Config - Using Render production URL (localhost detected)');
      // Temporarily pointing to production backend while in development
      return 'https://xscard-app.onrender.com';
    }
  }
  
  // Fallback: Check for environment variables (for SSR/SSG)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NODE_ENV === 'production') {
      return 'https://xscard-app.onrender.com';
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 DEBUG: API Config - Using Render production URL (development env)');
      // Temporarily pointing to production backend while in development
      return 'https://xscard-app.onrender.com';
    }
  }
  
  // Default to production for safety (temporary)
  console.log('🔍 DEBUG: API Config - Using Render production URL (fallback)');
  return 'https://xscard-app.onrender.com';
};

// Base URL configuration
export const API_BASE_URL = getApiBaseUrl();

// Environment detection
export const isDevelopment = API_BASE_URL.includes('localhost');
export const isProduction = !isDevelopment;

// Log the final API configuration for debugging
if (typeof window !== 'undefined') {
  console.log('🔍 API Configuration:', {
    baseUrl: API_BASE_URL,
    hostname: window.location.hostname,
    isDevelopment,
    isProduction
  });
}

// API endpoints
export const API_ENDPOINTS = {
  SUBMIT_QUERY: '/submit-query',
  DOWNLOAD_APK: '/download-apk',
  HEALTH_CHECK: '/health',
  USER_PROFILE: '/user/profile',
  BUSINESS_CARDS: '/business-cards',
  ANALYTICS: '/analytics',
} as const;

// Request configuration
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Utility function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Base request function with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = buildApiUrl(endpoint);
  
  const config: RequestInit = {
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle non-2xx responses
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If error response is not JSON, use default message
      }
      
      throw new ApiError(errorMessage, response.status);
    }

    // Parse response
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0,
      'NETWORK_ERROR'
    );
  }
}

// API Functions

/**
 * Submit a general contact form query
 */
export async function submitQuery(data: QueryRequest): Promise<ApiResponse> {
  console.log('🔍 Submitting query with data:', {
    ...data,
    captchaToken: data.captchaToken ? `${data.captchaToken.substring(0, 20)}...` : 'undefined'
  });
  
  return apiRequest<ApiResponse>(API_ENDPOINTS.SUBMIT_QUERY, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Submit contact form data
 */
export async function submitContactForm(formData: ContactFormData): Promise<ApiResponse> {
  const messageContent = `Contact Form Inquiry from ${formData.name}

Contact Information:
- Name: ${formData.name}
- Email: ${formData.email}
${formData.company ? `- Company: ${formData.company}` : ''}

Message:
${formData.message}`;

  const requestData: QueryRequest = {
    name: formData.name,
    email: formData.email,
    message: messageContent,
    to: "xscard@xspark.co.za",
    type: "contact", // Add type field
    captchaToken: formData.captchaToken,
  };

  return submitQuery(requestData);
}

/**
 * Submit enterprise sales form data
 */
export async function submitSalesForm(formData: SalesFormData): Promise<ApiResponse> {
  const messageContent = `Enterprise Sales Inquiry from ${formData.company}

Contact Information:
- Name: ${formData.name}
- Job Title: ${formData.jobTitle}
- Business Email: ${formData.email}
- Company Name: ${formData.company}

Business Details:
- Company Size: ${formData.companySize}
- Implementation Timeline: ${formData.timeline}
${formData.budget ? `- Annual Budget Range: ${formData.budget}` : ''}

Specific Requirements:
${formData.requirements}`;

  const requestData: QueryRequest = {
    name: formData.name,
    email: formData.email,
    message: messageContent,
    to: "xscard@xspark.co.za",
    type: "inquiry", // Add type field
    captchaToken: formData.captchaToken,
  };

  return submitQuery(requestData);
}

/**
 * Get download URL for APK
 */
export function getApkDownloadUrl(): string {
  return buildApiUrl(API_ENDPOINTS.DOWNLOAD_APK);
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<ApiResponse> {
  return apiRequest<ApiResponse>(API_ENDPOINTS.HEALTH_CHECK, {
    method: 'GET',
  });
}

/**
 * Get user profile (if authenticated)
 */
export async function getUserProfile(token?: string): Promise<ApiResponse> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return apiRequest<ApiResponse>(API_ENDPOINTS.USER_PROFILE, {
    method: 'GET',
    headers,
  });
}

/**
 * Get business cards for user
 */
export async function getBusinessCards(token?: string): Promise<ApiResponse> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return apiRequest<ApiResponse>(API_ENDPOINTS.BUSINESS_CARDS, {
    method: 'GET',
    headers,
  });
}

/**
 * Get analytics data
 */
export async function getAnalytics(token?: string): Promise<ApiResponse> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return apiRequest<ApiResponse>(API_ENDPOINTS.ANALYTICS, {
    method: 'GET',
    headers,
  });
}

/**
 * Verify hCaptcha token on server side
 * This is CRITICAL for production security
 */
export async function verifyHCaptchaToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET_KEY || '', // You'll need to add this to your backend
        response: token,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('hCaptcha verification failed:', error);
    return false;
  }
}

// Utility functions for common operations

/**
 * Handle API errors in a consistent way
 */
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Check if the API is available
 */
export async function checkApiAvailability(): Promise<boolean> {
  try {
    await healthCheck();
    return true;
  } catch {
    return false;
  }
}

/**
 * Retry function for failed requests
 */
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
}

// Export configuration for debugging
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  isDevelopment,
  isProduction,
  endpoints: API_ENDPOINTS,
} as const; 