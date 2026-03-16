/**
 * Chat & Messaging Type Definitions
 */

export enum MessageType {
  TEXT = 'TEXT',
  FILE = 'FILE',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT'
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: MessageType;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface Conversation {
  id: string;
  jobId?: string;
  projectId?: string;
  createdAt: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount?: number;
  title?: string;
}

// Conversation Participant types
export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  userName?: string;
  role: ParticipantRole;
  joinedAt: string;
  lastReadAt?: string;
  unreadCount: number;
  isMuted: boolean;
}

export enum ParticipantRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN'
}

export interface MessageSendRequest {
  conversationId: string;
  content: string;
  messageType?: MessageType;
  attachmentUrl?: string;
}

export interface MessagePageResponse {
  messages: Message[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  unreadCount: number;
}

export interface ConversationWithDetails extends Conversation {
  otherPartyName?: string;
  otherPartyId?: string;
}
