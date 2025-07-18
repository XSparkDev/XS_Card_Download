import { getIdToken } from '@/lib/auth';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Generic authenticated API request function
export const authenticatedRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    // Get Firebase ID token
    const token = await getIdToken();
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Parse response
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

// Specific API functions for common operations
export const authApi = {
  // Get user profile
  getProfile: () => authenticatedRequest('/user/profile'),
  
  // Update user profile
  updateProfile: (data: any) => authenticatedRequest('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Get user's business cards
  getBusinessCards: () => authenticatedRequest('/user/business-cards'),
  
  // Create new business card
  createBusinessCard: (data: any) => authenticatedRequest('/user/business-cards', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Update business card
  updateBusinessCard: (id: string, data: any) => authenticatedRequest(`/user/business-cards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Delete business card
  deleteBusinessCard: (id: string) => authenticatedRequest(`/user/business-cards/${id}`, {
    method: 'DELETE',
  }),
  
  // Get analytics
  getAnalytics: () => authenticatedRequest('/user/analytics'),
  
  // Get subscription info
  getSubscription: () => authenticatedRequest('/user/subscription'),
  
  // Update subscription
  updateSubscription: (data: any) => authenticatedRequest('/user/subscription', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Admin API functions (for admin dashboard)
export const adminApi = {
  // Get all users (admin only)
  getUsers: () => authenticatedRequest('/admin/users'),
  
  // Get user by ID (admin only)
  getUser: (id: string) => authenticatedRequest(`/admin/users/${id}`),
  
  // Update user (admin only)
  updateUser: (id: string, data: any) => authenticatedRequest(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Delete user (admin only)
  deleteUser: (id: string) => authenticatedRequest(`/admin/users/${id}`, {
    method: 'DELETE',
  }),
  
  // Get system analytics (admin only)
  getSystemAnalytics: () => authenticatedRequest('/admin/analytics'),
  
  // Get customer requests (admin only)
  getCustomerRequests: () => authenticatedRequest('/admin/requests'),
  
  // Update customer request status (admin only)
  updateCustomerRequest: (id: string, data: any) => authenticatedRequest(`/admin/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Hook for making authenticated API calls
export const useAuthApi = () => {
  return {
    authApi,
    adminApi,
    authenticatedRequest,
  };
}; 