import { API_BASE_URL } from './api';
import {
  ApiResponse,
  FreelancerProfile,
  UpdateFreelancerProfileRequest,
  EmployerProfile,
  CreateEmployerProfileRequest,
  UpdateEmployerProfileRequest,
} from '../types/api';

const getAuthToken = (): string | null => {
  return localStorage.getItem('userToken') || localStorage.getItem('token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Profile API Service
 * Endpoints for managing freelancer and employer profiles
 */
export const profileApi = {
  // ====== AVATAR ======

  /**
   * Upload user avatar
   */
  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/auth/avatar`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return response.json();
  },

  /**
   * Delete user avatar
   */
  deleteAvatar: async (): Promise<ApiResponse<{ deleted: boolean }>> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/auth/avatar`, {
      method: 'DELETE',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return response.json();
  },

  // ====== FREELANCER PROFILE ======

  /**
   * Get current freelancer profile
   * Retrieve logged-in freelancer's profile
   */
  getMyFreelancerProfile: async (): Promise<ApiResponse<FreelancerProfile>> => {
    const response = await fetch(`${API_BASE_URL}/api/freelancer/profile`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get all freelancer profiles with pagination
   * For browsing/searching freelancers
   */
  getAllFreelancerProfiles: async (page = 0, size = 20): Promise<ApiResponse<FreelancerProfile[]>> => {
    const response = await fetch(`${API_BASE_URL}/api/freelancer/profiles?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Update freelancer profile
   * Update logged-in freelancer's profile information
   */
  updateFreelancerProfile: async (request: UpdateFreelancerProfileRequest): Promise<ApiResponse<FreelancerProfile>> => {
    const response = await fetch(`${API_BASE_URL}/api/freelancer/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Get freelancer profile by ID
   * View any freelancer's public profile
   */
  getFreelancerProfile: async (freelancerId: string): Promise<ApiResponse<FreelancerProfile>> => {
    const response = await fetch(`${API_BASE_URL}/api/freelancer/profile/${freelancerId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // ====== EMPLOYER PROFILE ======

  /**
   * Get current employer profile
   * Retrieve logged-in employer's profile
   */
  getMyEmployerProfile: async (): Promise<ApiResponse<EmployerProfile>> => {
    const response = await fetch(`${API_BASE_URL}/api/employer/profile`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Create employer profile
   * Create profile when user registers as employer
   */
  createEmployerProfile: async (request: CreateEmployerProfileRequest): Promise<ApiResponse<EmployerProfile>> => {
    const response = await fetch(`${API_BASE_URL}/api/employer/profile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Update employer profile
   * Update logged-in employer's profile information
   */
  updateEmployerProfile: async (request: UpdateEmployerProfileRequest): Promise<ApiResponse<EmployerProfile>> => {
    const response = await fetch(`${API_BASE_URL}/api/employer/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Get employer profile by ID
   * View any employer's public profile
   */
  getEmployerProfile: async (employerId: string): Promise<ApiResponse<EmployerProfile>> => {
    const response = await fetch(`${API_BASE_URL}/api/employer/profile/${employerId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
