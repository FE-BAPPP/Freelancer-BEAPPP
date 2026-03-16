import React, { useState, useRef, KeyboardEvent } from 'react';
import { MessageType } from '../../types/chat';
import { FileUpload } from '../Common/FileUpload';
import { FileResponse } from '../../services/api';

interface MessageInputProps {
  onSend: (content: string, type?: MessageType, attachmentUrl?: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  conversationId: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  conversationId
}) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Handle send message
   */
  const handleSend = async () => {
    if ((!content.trim()) || isSending || disabled) return;

    try {
      setIsSending(true);
      await onSend(content, MessageType.TEXT);
      setContent('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUploadSuccess = async (file: FileResponse) => {
    try {
      setIsSending(true);
      const type = file.mimeType.startsWith('image/') ? MessageType.IMAGE : MessageType.FILE;
      // Send file message immediately
      await onSend('', type, file.fileUrl);
    } catch (err) {
      console.error('Failed to send file message:', err);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle Enter key (Shift+Enter for new line)
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Auto-resize textarea
   */
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  return (
    <div className="border-t border-gray-100 bg-white p-6">
      <div className="flex items-end gap-3">
        {/* File Upload */}
        <FileUpload
          entityType="CONVERSATION"
          entityId={conversationId}
          onUploadSuccess={handleFileUploadSuccess}
          compact={true}
          className="flex-shrink-0"
          acceptedTypes="image/*,.pdf,.doc,.docx"
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          rows={1}
          className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007fed]/20 focus:border-[#007fed] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          style={{ maxHeight: '150px' }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!content.trim() || disabled || isSending}
          className="bg-[#007fed] text-white p-3.5 rounded-xl hover:bg-[#006bb3] transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md shadow-blue-500/10"
          title="Gửi tin nhắn (Enter)"
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {/* Hint text */}
      <div className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider px-1">
        Nhấn Enter để gửi, Shift+Enter để xuống dòng
      </div>
    </div>
  );
};
