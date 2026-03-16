/**
 * MessageBubble Component
 * Displays a single message with sender info and timestamp
 */

import React from 'react';
import { Message, MessageType } from '../../types/chat';
import { format } from 'date-fns';
import { Avatar } from '../Common';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const formattedTime = format(new Date(message.createdAt), 'HH:mm');

  const renderContent = () => {
    switch (message.messageType) {
      case MessageType.IMAGE:
        return (
          <div className="space-y-2">
            {message.attachmentUrl && (
              <img
                src={message.attachmentUrl}
                alt="Đính kèm"
                className="max-w-sm rounded-xl shadow-lg border border-gray-100"
              />
            )}
            {message.content && <p className="font-medium">{message.content}</p>}
          </div>
        );

      case MessageType.FILE:
      case MessageType.DOCUMENT:
        // Extract filename from URL
        const getFilename = (url: string | undefined): string => {
          if (!url) return 'Tệp không rõ';
          const parts = url.split('/');
          const fullName = parts[parts.length - 1] || 'Tệp không rõ';
          const underscoreIdx = fullName.indexOf('_');
          if (underscoreIdx > 30) {
            return fullName.substring(underscoreIdx + 1);
          }
          return fullName;
        };

        const filename = getFilename(message.attachmentUrl);
        const fileExtension = filename.split('.').pop()?.toLowerCase() || '';

        return (
          <div className="space-y-2">
            {message.attachmentUrl && (
              <a
                href={message.attachmentUrl.startsWith('http') ? message.attachmentUrl : `http://localhost:8080${message.attachmentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                download={filename}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isOwn
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  : 'bg-blue-50/50 border-blue-100 text-[#007fed] hover:bg-blue-50'
                  }`}
              >
                {/* File icon */}
                <div className={`p-2 rounded-lg ${isOwn ? 'bg-white/10' : 'bg-white'}`}>
                  <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 3v6h6" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-black truncate ${isOwn ? 'text-white' : 'text-gray-900'}`}>
                    {filename}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                    {fileExtension.toUpperCase()} • Nhấn để tải về
                  </p>
                </div>
                <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            )}
            {message.content && message.content !== 'Sent a file' && (
              <p className="mt-1 font-medium">{message.content}</p>
            )}
          </div>
        );

      default:
        return <p className="whitespace-pre-wrap break-words font-medium">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-6 group`}>
      {/* Avatar for received messages */}
      {!isOwn && (
        <Avatar
          src={message.senderAvatar}
          name={message.senderName}
          size="sm"
          className="mr-3 mt-1 flex-shrink-0 animate-in fade-in slide-in-from-left-2 duration-300"
        />
      )}

      <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Sender name */}
        {!isOwn && (
          <div className="text-[10px] text-gray-500 mb-1.5 px-1 font-black uppercase tracking-wider">
            {message.senderName}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`
            rounded-2xl px-5 py-3 shadow-sm border transition-all hover:shadow-md
            ${isOwn
              ? 'bg-[#007fed] text-white border-[#007fed] rounded-br-sm'
              : 'bg-white text-gray-900 border-gray-200 rounded-bl-sm'
            }
          `}
        >
          {renderContent()}
        </div>

        {/* Timestamp and read status */}
        <div className={`flex items-center gap-2 mt-1.5 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{formattedTime}</span>
          {isOwn && (
            <div className="flex items-center">
              {message.isRead ? (
                <span className="text-emerald-500 font-black text-[10px]" title="Đã xem">✓✓</span>
              ) : (
                <span className="text-gray-300 font-black text-[10px]" title="Đã gửi">✓</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
