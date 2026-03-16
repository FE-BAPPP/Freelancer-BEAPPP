import { API_BASE_URL } from './api';
import { Escrow, EscrowStatistics } from '../types/api';

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
 * Escrow API Service
 * Endpoints for managing escrow payments for milestone-based projects
 */
export const escrowApi = {
  /**
   * Lock funds into escrow for a milestone
   * Employer locks funds into escrow when milestone is created
   */
  lockFunds: async (milestoneId: string): Promise<Escrow> => {
    const response = await fetch(`${API_BASE_URL}/api/escrow/lock/${milestoneId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Release funds from escrow to freelancer
   * Employer releases funds when milestone is completed satisfactorily
   */
  releaseFunds: async (milestoneId: string): Promise<Escrow> => {
    const response = await fetch(`${API_BASE_URL}/api/escrow/release/${milestoneId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Refund funds from escrow back to employer
   * Admin can refund funds in case of dispute or rejection
   */
  refundFunds: async (milestoneId: string): Promise<Escrow> => {
    const response = await fetch(`${API_BASE_URL}/api/escrow/refund/${milestoneId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get escrow statistics for current user
   * View total locked, released, refunded, and disputed amounts
   */
  getStatistics: async (): Promise<EscrowStatistics> => {
    const response = await fetch(`${API_BASE_URL}/api/escrow/statistics`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get all escrow records for a project
   * View all escrow transactions related to a specific project
   */
  getEscrowsByProject: async (projectId: string): Promise<Escrow[]> => {
    const response = await fetch(`${API_BASE_URL}/api/escrow/project/${projectId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get total locked amount for a project
   * Calculate total funds currently locked in escrow for the project
   */
  getTotalLockedAmount: async (projectId: string): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/api/escrow/project/${projectId}/total-locked`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  /**
   * Get escrow by milestone ID
   * View escrow information for a specific milestone
   */
  getEscrowByMilestone: async (milestoneId: string): Promise<Escrow> => {
    const response = await fetch(`${API_BASE_URL}/api/escrow/milestone/${milestoneId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
