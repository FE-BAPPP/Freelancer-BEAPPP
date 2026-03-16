import { API_BASE_URL } from './api';
import {
  ApiResponse,
  Milestone,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
  SubmitMilestoneRequest,
  RejectMilestoneRequest,
  MilestoneStatistics,
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
 * Milestone API Service
 * Endpoints for managing project milestones
 */
export const milestoneApi = {
  /**
   * Create a new milestone for a project
   * Employer creates milestones for project tracking
   */
  createMilestone: async (projectId: string, request: CreateMilestoneRequest): Promise<ApiResponse<Milestone>> => {
    const response = await fetch(`${API_BASE_URL}/api/milestones/project/${projectId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Update milestone details
   * Modify milestone title, description, amount, or due date
   */
  updateMilestone: async (milestoneId: string, request: UpdateMilestoneRequest): Promise<ApiResponse<Milestone>> => {
    const response = await fetch(`${API_BASE_URL}/api/milestones/${milestoneId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Delete a milestone
   * Remove milestone from project (only if not started)
   */
  deleteMilestone: async (milestoneId: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/api/milestones/${milestoneId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Start working on a milestone
   * Freelancer marks milestone as in progress
   */
  startMilestone: async (milestoneId: string): Promise<ApiResponse<Milestone>> => {
    const response = await fetch(`${API_BASE_URL}/api/milestones/${milestoneId}/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Submit milestone work
   * Freelancer submits completed work for review
   */
  submitMilestone: async (milestoneId: string, request: SubmitMilestoneRequest): Promise<ApiResponse<Milestone>> => {
    const response = await fetch(`${API_BASE_URL}/api/milestones/${milestoneId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Approve milestone
   * Employer approves submitted work
   */
  approveMilestone: async (milestoneId: string): Promise<ApiResponse<Milestone>> => {
    const response = await fetch(`${API_BASE_URL}/api/milestones/${milestoneId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Reject milestone
   * Employer rejects submitted work with reason
   */
  rejectMilestone: async (milestoneId: string, request: RejectMilestoneRequest): Promise<ApiResponse<Milestone>> => {
    const response = await fetch(`${API_BASE_URL}/api/milestones/${milestoneId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Release milestone payment
   * Release funds from escrow to freelancer
   */
  releaseMilestone: async (milestoneId: string): Promise<ApiResponse<Milestone>> => {
    const response = await fetch(`${API_BASE_URL}/api/milestones/${milestoneId}/release`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get all milestones for a project
   * View project's milestone breakdown
   */
  getMilestonesByProject: async (projectId: string): Promise<ApiResponse<Milestone[]>> => {
    const response = await fetch(`${API_BASE_URL}/api/milestones/project/${projectId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get milestone statistics for a project
   * Summary of total, released, pending milestones and amounts
   */
  getMilestoneStatistics: async (projectId: string): Promise<ApiResponse<MilestoneStatistics>> => {
    const response = await fetch(`${API_BASE_URL}/api/milestones/project/${projectId}/stats`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
