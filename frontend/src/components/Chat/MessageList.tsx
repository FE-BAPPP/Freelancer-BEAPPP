/**
 * MessageList Component
 * Scrollable list of messages with auto-scroll and load more
 */

import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../../types/chat';
import { MessageBubble } from './MessageBubble';
import { useAuth } from '../../hooks/useAuth';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  hasMore,
  onLoadMore
}) => {
  const { user } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const previousScrollHeight = useRef<number>(0);

  /**
   * Auto scroll to bottom on new messages
   */
  useEffect(() => {
    if (shouldAutoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, shouldAutoScroll]);

  /**
   * Handle scroll to detect if user scrolled up
   */
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Auto-scroll if near bottom (within 100px)
    setShouldAutoScroll(distanceFromBottom < 100);

    // Load more when scrolled to top
    if (scrollTop === 0 && hasMore && !isLoading) {
      previousScrollHeight.current = scrollHeight;
      onLoadMore();
    }
  };

  /**
   * Maintain scroll position after loading more messages
   */
  useEffect(() => {
    if (scrollContainerRef.current && previousScrollHeight.current > 0) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - previousScrollHeight.current;
      scrollContainerRef.current.scrollTop = scrollDiff;
      previousScrollHeight.current = 0;
    }
  }, [messages.length]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f7f7f7]">
        <div className="text-center px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
            <svg className="w-10 h-10 text-[#007fed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-gray-900 font-black text-lg">Chưa có tin nhắn nào</h3>
          <p className="text-sm text-gray-500 mt-2 font-medium">Hãy bắt đầu cuộc trò chuyện ngay!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden relative bg-[#f7f7f7]">
      {/* Load more indicator */}
      {hasMore && (
        <div className="absolute top-0 left-0 right-0 text-center py-2 bg-white/80 border-b border-gray-100 backdrop-blur-md z-10 shadow-sm">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-xs font-black text-[#007fed] hover:text-[#006bb3] disabled:text-gray-400 transition-colors uppercase tracking-widest"
          >
            {isLoading ? 'Đang tải...' : 'Tải tin nhắn cũ'}
          </button>
        </div>
      )}

      {/* Messages container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`h-full overflow-y-auto px-6 py-4 custom-scrollbar ${hasMore ? 'pt-14' : ''}`}
      >
        {/* Reverse order: newest at bottom */}
        {[...messages].reverse().map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === user?.id}
          />
        ))}

        {/* Loading indicator */}
        {isLoading && messages.length === 0 && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#007fed] border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {!shouldAutoScroll && (
        <button
          onClick={() => {
            setShouldAutoScroll(true);
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
            }
          }}
          className="absolute bottom-6 right-6 bg-[#007fed] text-white rounded-full p-3 shadow-lg shadow-blue-500/30 hover:bg-[#006bb3] hover:scale-110 transition-all duration-300 group"
          title="Cuộn xuống dưới"
        >
          <svg className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
};
