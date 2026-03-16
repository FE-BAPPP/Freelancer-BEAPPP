import { API_BASE_URL } from './api';
import { ApiResponse, Project, PageResponse } from '../types/api';

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
 * Project API Service
 * Endpoints for managing project lifecycle
 */
export const projectApi = {
  /**
   * Get project by ID
   * Retrieve detailed project information
   */
  getProjectById: async (projectId: string): Promise<ApiResponse<Project>> => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Accept Project Offer
   * Freelancer accepts the project offer to start work
   */
  acceptProject: async (projectId: string): Promise<ApiResponse<Project>> => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/accept`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to accept project: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Complete a project
   * Mark project as completed after all milestones are done
   */
  completeProject: async (projectId: string): Promise<ApiResponse<Project>> => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to complete project: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Cancel a project
   * Cancel project with optional reason
   */
  cancelProject: async (projectId: string, reason?: string): Promise<ApiResponse<Project>> => {
    const url = reason
      ? `${API_BASE_URL}/api/projects/${projectId}/cancel?reason=${encodeURIComponent(reason)}`
      : `${API_BASE_URL}/api/projects/${projectId}/cancel`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to cancel project: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get employer's projects
   * Retrieve all projects where current user is employer
   */
  getEmployerProjects: async (page: number = 0, size: number = 20): Promise<ApiResponse<PageResponse<Project>>> => {
    const response = await fetch(`${API_BASE_URL}/api/projects/employer?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch employer projects: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get freelancer's projects
   * Retrieve all projects where current user is freelancer
   */
  getFreelancerProjects: async (page: number = 0, size: number = 20): Promise<ApiResponse<PageResponse<Project>>> => {
    const response = await fetch(`${API_BASE_URL}/api/projects/freelancer?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch freelancer projects: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Get project milestones
   * Retrieve all milestones for a project (delegates to milestone endpoint)
   */
  getProjectMilestones: async (projectId: string): Promise<ApiResponse<any[]>> => {
    const response = await fetch(`${API_BASE_URL}/api/milestones/project/${projectId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch milestones: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
  /**
   * Upload a file
   * Uploads a file for a specific entity (Milestone, Job, etc.)
   */
  uploadFile: async (file: File, entityType: string, entityId: string): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);

    const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
      method: 'POST',
      headers: {
        ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
};
