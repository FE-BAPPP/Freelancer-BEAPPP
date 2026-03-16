import { API_BASE_URL } from './api';
import { Conversation, ConversationParticipant } from '../types/chat';

class ConversationApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('userToken') ||
      localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken();
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * 💬 Get conversation by project ID
   */
  async getConversationByProjectId(projectId: string): Promise<Conversation> {
    const response: any = await this.request(`/api/conversations/project/${projectId}`);
    return response.data;
  }

  /**
   * 💬 Get or create conversation for project
   * If conversation doesn't exist, creates a new one
   */
  async getOrCreateConversationByProjectId(projectId: string): Promise<Conversation> {
    try {
      // First try to get existing conversation
      const response: any = await this.request(`/api/conversations/project/${projectId}`);
      return response.data;
    } catch (error: any) {
      // If 403/404, try to create a new conversation
      if (error.message?.includes('403') || error.message?.includes('404') || error.message?.includes('not found')) {
        const createResponse: any = await this.request('/api/conversations', {
          method: 'POST',
          body: JSON.stringify({ projectId })
        });
        return createResponse.data;
      }
      throw error;
    }
  }

  /**
   * 💬 Get conversation by job ID
   */
  async getConversationByJobId(jobId: string): Promise<Conversation> {
    const response: any = await this.request(`/api/conversations/job/${jobId}`);
    return response.data;
  }

  /**
   * ✅ Check if conversation exists for project
   */
  async checkConversationExists(projectId: string): Promise<boolean> {
    const response: any = await this.request(`/api/conversations/project/${projectId}/exists`);
    return response.data;
  }

  /**
   * 📖 Mark conversation as read
   * Updates the last_read_at timestamp and resets unread count for current user
   */
  async markAsRead(conversationId: string): Promise<void> {
    await this.request(`/api/conversations/${conversationId}/read`, {
      method: 'POST'
    });
  }

  /**
   * 🔢 Get total unread messages count across all conversations
   */
  async getTotalUnreadCount(): Promise<number> {
    const response: any = await this.request(`/api/conversations/unread-count`);
    return response.data;
  }

  /**
   * 📋 Get all my conversations
   */
  async getMyConversations(): Promise<Conversation[]> {
    const response: any = await this.request(`/api/conversations/my`);
    return response.data;
  }

  /**
   * 🔇 Mute/Unmute conversation notifications
   */
  async toggleMuteConversation(conversationId: string, muted: boolean): Promise<void> {
    await this.request(`/api/conversations/${conversationId}/mute`, {
      method: 'PUT',
      body: JSON.stringify({ muted })
    });
  }

  /**
   * 👥 Get conversation participants
   */
  async getConversationParticipants(conversationId: string): Promise<ConversationParticipant[]> {
    const response: any = await this.request(`/api/conversations/${conversationId}/participants`);
    return response.data;
  }
}

const conversationApi = new ConversationApiClient(API_BASE_URL);
export default conversationApi;
export { conversationApi };



