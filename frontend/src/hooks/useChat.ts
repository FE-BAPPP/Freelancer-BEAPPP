/**
 * Chat Hook
 * Manages chat state, message fetching, and sending
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, MessageSendRequest, MessageType } from '../types/chat';
import {
  getConversationMessages,
  sendMessage as sendMessageApi,
  markAllAsRead,
  getNewMessages
} from '../services/chatApi';
import { useAuth } from './useAuth';
import { useWebSocket } from './useWebSocket';

interface UseChatProps {
  conversationId: string;
  autoMarkAsRead?: boolean;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  isConnected: boolean;
  unreadCount: number;
  sendMessage: (content: string, type?: MessageType) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useChat = ({
  conversationId,
  autoMarkAsRead = true
}: UseChatProps): UseChatReturn => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const isFetchingRef = useRef(false);

  const hasMore = currentPage < totalPages - 1;

  /**
   * 🔌 WebSocket connection
   */
  const handleMessageReceived = useCallback((newMessage: Message) => {
    setMessages((prev) => {
      // Avoid duplicates
      if (prev.some(m => m.id === newMessage.id)) return prev;
      return [newMessage, ...prev];
    });

    // Update unread count if message is not from self
    if (newMessage.senderId !== user?.id) {
      setUnreadCount(c => c + 1);
      if (autoMarkAsRead) markAsRead();
    }
  }, [user?.id, autoMarkAsRead]);

  // Use the WebSocket hook
  const { isConnected } = useWebSocket({
    topic: conversationId ? `/topic/conversation/${conversationId}` : undefined,
    onMessageReceived: handleMessageReceived,
    enabled: !!conversationId
  });

  /**
   * 🔄 Fallback Polling (only if WS disconnected)
   */
  useEffect(() => {
    if (!conversationId || isConnected) return; // Stop polling if connected via WS

    const intervalId = setInterval(async () => {
      // Don't poll if fetching history
      if (isFetchingRef.current) return;

      try {
        const lastMsg = messages.length > 0 ? messages[0] : null;
        const since = lastMsg ? lastMsg.createdAt : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const newMessages = await getNewMessages(conversationId, since);

        if (newMessages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map(m => m.id));
            const uniqueNewMsgs = newMessages.filter(m => !existingIds.has(m.id));
            if (uniqueNewMsgs.length === 0) return prev;
            return [...uniqueNewMsgs.reverse(), ...prev];
          });
        }
      } catch (err) {
        // Silent error
      }
    }, 5000); // Slower polling (5s) as fallback

    return () => clearInterval(intervalId);
  }, [conversationId, messages, isConnected]);

  /**
   * 📥 Fetch messages (paginated)
   */
  const fetchMessages = useCallback(async (page: number = 0) => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      const response = await getConversationMessages(conversationId, page, 50);

      setMessages((prev) => {
        if (page === 0) {
          return response.messages;
        }
        // Merge with existing, avoid duplicates
        const newMessages = response.messages.filter(
          newMsg => !prev.some(existingMsg => existingMsg.id === newMsg.id)
        );
        return [...prev, ...newMessages];
      });

      setTotalPages(response.totalPages);
      setCurrentPage(page);
      setUnreadCount(response.unreadCount);
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [conversationId]);

  /**
   * 📤 Send message
   */
  const sendMessage = useCallback(async (
    content: string,
    type: MessageType = MessageType.TEXT,
    attachmentUrl?: string
  ) => {
    if (!content.trim() && !attachmentUrl) return;

    try {
      setError(null);
      const request: MessageSendRequest = {
        conversationId,
        content: content.trim() || (type === MessageType.IMAGE ? 'Sent an image' : 'Sent a file'),
        messageType: type,
        attachmentUrl
      };

      const sentMessage = await sendMessageApi(request);

      // Add to message list, but avoid duplicates (WebSocket may have already added it)
      setMessages((prev) => {
        if (prev.some(m => m.id === sentMessage.id)) return prev;
        return [sentMessage, ...prev];
      });
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
      throw err;
    }
  }, [conversationId]);

  /**
   * 📖 Load more messages (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchMessages(currentPage + 1);
  }, [hasMore, isLoading, currentPage, fetchMessages]);

  /**
   * ✅ Mark all messages as read
   */
  const markAsRead = useCallback(async () => {
    try {
      await markAllAsRead(conversationId);
      setUnreadCount(0);

      // Update local messages
      setMessages(prev => prev.map(msg => ({
        ...msg,
        isRead: msg.senderId !== user?.id ? true : msg.isRead
      })));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [conversationId, user?.id]);

  /**
   * 🔄 Refresh messages
   */
  const refresh = useCallback(async () => {
    setMessages([]);
    setCurrentPage(0);
    await fetchMessages(0);
  }, [fetchMessages]);

  /**
   * Initial load
   */
  useEffect(() => {
    if (conversationId) {
      fetchMessages(0);
    }
  }, [conversationId, fetchMessages]);

  /**
   * Auto mark as read when conversation opens
   */
  useEffect(() => {
    if (conversationId && autoMarkAsRead) {
      const timer = setTimeout(() => markAsRead(), 1000);
      return () => clearTimeout(timer);
    }
  }, [conversationId, autoMarkAsRead, markAsRead]);

  return {
    messages,
    isLoading,
    error,
    hasMore,
    isConnected,
    unreadCount,
    sendMessage,
    loadMore,
    markAsRead,
    refresh
  };
};
