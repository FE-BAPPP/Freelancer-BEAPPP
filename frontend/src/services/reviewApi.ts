import { API_BASE_URL } from './api';
import {
  ApiResponse,
  Review,
  CreateReviewRequest,
  ReviewStatistics,
  PageResponse,
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
 * Review API Service
 * Endpoints for managing post-project reviews between employers and freelancers
 */
export const reviewApi = {
  /**
   * Create a review
   * Employer or Freelancer can review each other after project completion
   */
  createReview: async (request: CreateReviewRequest): Promise<ApiResponse<Review>> => {
    const token = getAuthToken();
    console.log('🔑 Review API - Token present:', !!token, 'Token preview:', token?.substring(0, 20) + '...');

    const headers = getAuthHeaders();
    console.log('📤 Review API - Headers:', headers);
    console.log('📦 Review API - Request body:', JSON.stringify(request));

    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Review API error:', response.status, errorText);
      throw new Error(errorText || `Failed to create review: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get reviews received by a user
   * View all reviews that this user has received
   */
  getReviewsForUser: async (
    userId: string,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<Review>> => {
    const response = await fetch(
      `${API_BASE_URL}/api/reviews/user/${userId}?page=${page}&size=${size}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.json();
  },

  /**
   * Get review statistics for a user
   * Retrieve detailed statistics about user reviews (average, star distribution)
   */
  getReviewStatistics: async (userId: string): Promise<ReviewStatistics> => {
    const response = await fetch(`${API_BASE_URL}/api/reviews/statistics/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get reviews for a specific project
   * View all reviews related to this project
   */
  getReviewsForProject: async (projectId: string): Promise<Review[]> => {
    const response = await fetch(`${API_BASE_URL}/api/reviews/project/${projectId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get my reviews
   * View all reviews that I have received
   */
  getMyReviews: async (page: number = 0, size: number = 10): Promise<PageResponse<Review>> => {
    const response = await fetch(
      `${API_BASE_URL}/api/reviews/my-reviews?page=${page}&size=${size}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.json();
  },

  /**
   * Check if user has reviewed a project
   * Check whether the user has already reviewed this project
   */
  checkReviewExists: async (projectId: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/api/reviews/check/${projectId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get reviews written by a user
   * View all reviews that this user has written for others
   */
  getReviewsByUser: async (
    userId: string,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<Review>> => {
    const response = await fetch(
      `${API_BASE_URL}/api/reviews/by-user/${userId}?page=${page}&size=${size}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.json();
  },
};
