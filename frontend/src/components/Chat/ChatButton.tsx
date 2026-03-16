/**
 * ChatButton Component
 * Opens chat window for a project conversation
 */

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import conversationApi from '../../services/conversationApi';
import { ChatWindow } from './ChatWindow';

interface ChatButtonProps {
  projectId: string;
  projectTitle?: string;
  className?: string;
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  projectId,
  projectTitle,
  className = ''
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load or create conversation when button is clicked
   */
  const handleOpenChat = async () => {
    if (conversationId) {
      setIsChatOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      // Use getOrCreate to handle new projects that don't have a conversation yet
      const conversation = await conversationApi.getOrCreateConversationByProjectId(projectId);
      setConversationId(conversation.id);
      setIsChatOpen(true);
    } catch (err: any) {
      console.error('Failed to load conversation:', err);
      setError(err.message || 'Failed to load conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={handleOpenChat}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-6 py-3
          bg-[#007fed] text-white rounded-xl
          hover:bg-[#006bb3] hover:shadow-lg hover:-translate-y-0.5
          transition-all duration-200
          shadow-md shadow-blue-500/20 font-black text-sm
          disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
          ${className}
        `}
      >
        <MessageSquare className="w-4 h-4" />
        {isLoading ? 'Đang chuẩn bị...' : 'Trò chuyện'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="text-xs font-bold text-red-500 mt-3 bg-red-50 p-3 rounded-xl border border-red-100 italic flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Chat Modal/Overlay */}
      {isChatOpen && conversationId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[75vh] flex flex-col border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden">
            <ChatWindow
              conversationId={conversationId}
              title={projectTitle ? `Trao đổi: ${projectTitle}` : 'Trao đổi công việc'}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};
