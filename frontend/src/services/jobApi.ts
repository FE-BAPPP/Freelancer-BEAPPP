// frontend/src/services/jobApi.ts
import { API_BASE_URL } from './api';

export interface Job {
  id: string;
  employerId: string;
  employerName: string;
  employerAvatar?: string;
  title: string;
  description: string;
  projectType: 'FIXED_PRICE' | 'HOURLY';  // Changed from type
  budgetMin?: number;
  budgetMax?: number;
  duration?: string;
  deadline?: string;
  category?: string;
  status: string;
  skills: string[];
  proposalCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobCreateRequest {
  title: string;
  description: string;
  type: 'FIXED_PRICE' | 'HOURLY';
  budgetMin?: number;
  budgetMax?: number;
  duration?: string;
  deadline?: string;
  category?: string;
  skillIds?: string[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class JobApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('userToken') || localStorage.getItem('token');
    const headers: any = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // POST /api/jobs - Create job (Employer)
  async createJob(request: JobCreateRequest): Promise<{ success: boolean; message: string; data?: Job }> {
    const response = await fetch(`${API_BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });
    return response.json();
  }

  // GET /api/jobs/my-jobs - Employer's jobs
  async getMyJobs(page = 0, size = 10): Promise<PageResponse<Job>> {
    const headers = this.getAuthHeaders();
    console.log('🔍 jobApi.getMyJobs - Headers:', {
      hasAuthorization: !!headers.Authorization,
      userToken: !!localStorage.getItem('userToken'),
      token: !!localStorage.getItem('token')
    });

    const response = await fetch(
      `${API_BASE_URL}/api/jobs/my-jobs?page=${page}&size=${size}`,
      { headers }
    );

    if (!response.ok) {
      console.error('❌ jobApi.getMyJobs - Response not OK:', response.status, response.statusText);
      throw new Error(`Failed to load jobs: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // GET /api/jobs - Browse jobs (Freelancer)
  async browseJobs(page = 0, size = 10): Promise<PageResponse<Job>> {
    const response = await fetch(
      `${API_BASE_URL}/api/jobs?page=${page}&size=${size}`,
      { headers: this.getAuthHeaders() }
    );
    return response.json();
  }

  // GET /api/jobs/search?keyword=React
  async searchJobs(keyword: string, page = 0, size = 10): Promise<PageResponse<Job>> {
    const response = await fetch(
      `${API_BASE_URL}/api/jobs/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`,
      { headers: this.getAuthHeaders() }
    );
    return response.json();
  }

  // GET /api/jobs/{id}
  async getJobById(id: string): Promise<{ success: boolean; data: Job }> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  // PUT /api/jobs/{id} - Update job (Employer)
  async updateJob(id: string, request: Partial<JobCreateRequest>): Promise<{ success: boolean; message: string; data?: Job }> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });
    return response.json();
  }

  // DELETE /api/jobs/{id} - Delete job (Employer)
  async deleteJob(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return response.json();
  }

  // POST /api/jobs/{id}/close - Close job to stop accepting proposals (Employer)
  async closeJob(id: string): Promise<{ success: boolean; message: string; data?: Job }> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${id}/close`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return response.json();
  }
}

export const jobApi = new JobApi();