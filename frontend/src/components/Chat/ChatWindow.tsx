/**
 * ChatWindow Component
 * Main chat interface with header, message list, and input
 */

import React from 'react';
import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  conversationId: string;
  title?: string;
  onClose?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  title = 'Trò chuyện',
  onClose
}) => {
  const {
    messages,
    isLoading,
    error,
    hasMore,
    isConnected,
    unreadCount,
    sendMessage,
    loadMore,
    refresh
  } = useChat({ conversationId });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4 min-w-0">
          <h2 className="text-lg font-black text-gray-900 truncate" title={title}>{title}</h2>

          {/* Connection status indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 flex-shrink-0">
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-400'
                }`}
              title={isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
            />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
              {isConnected ? 'Online' : 'Loading...'}
            </span>
          </div>

          {/* Unread count badge */}
          {unreadCount > 0 && (
            <span className="bg-[#007fed] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm flex-shrink-0">
              {unreadCount} mới
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Refresh button */}
          <button
            onClick={refresh}
            className="p-2 text-gray-400 hover:text-[#007fed] hover:bg-blue-50 rounded-xl transition-all"
            title="Tải lại tin nhắn"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Đóng trang trò chuyện"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded-r-lg">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-bold text-red-600">{error}</span>
          </div>
        </div>
      )}

      {/* Message List */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />

      {/* Message Input */}
      <MessageInput
        onSend={sendMessage}
        disabled={!isConnected}
        placeholder={isConnected ? 'Nhập nội dung tin nhắn...' : 'Đang kết nối...'}
        conversationId={conversationId}
      />
    </div>
  );
};
