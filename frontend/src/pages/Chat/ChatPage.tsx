/**
 * ChatPage Component
 * Full page chat interface with conversation list
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatWindow } from '../../components/Chat/ChatWindow';
import { conversationApi } from '../../services/conversationApi';
import { Conversation } from '../../types/chat';
import { MessageSquare, Search, Inbox, Loader2 } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    searchParams.get('conversationId')
  );

  /**
   * Load user conversations
   */
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true);
        const data = await conversationApi.getMyConversations();
        setConversations(data);

        // Auto-select first conversation if none selected
        if (!selectedConversation && data.length > 0) {
          setSelectedConversation(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, []);

  /**
   * Update URL when conversation changes
   */
  useEffect(() => {
    if (selectedConversation) {
      setSearchParams({ conversationId: selectedConversation });
    }
  }, [selectedConversation, setSearchParams]);

  // Find info for the selected conversation
  const selectedConvDetails = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Header Section */}
      <div className="bg-[#1f2125] text-white py-12 px-4 md:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tin nhắn</h1>
              <p className="text-gray-400">Trao đổi và thảo luận trực tiếp với đối tác của bạn.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(110vh-12rem)] min-h-[600px]">
        <div className="flex h-full gap-6">
          {/* Conversation List Sidebar */}
          <div className="w-96 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/30">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#007fed] transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm kiếm hội thoại..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#007fed] focus:ring-4 focus:ring-[#007fed]/10 transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center h-48 gap-3">
                  <Loader2 className="w-8 h-8 text-[#007fed] animate-spin" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <Inbox className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-900 font-bold">Chưa có hội thoại nào</p>
                  <p className="text-xs text-gray-500 mt-2 font-medium">Bắt đầu trò chuyện với đối tác từ trang dự án của bạn.</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`
                      w-full text-left px-6 py-5 border-b border-gray-50 hover:bg-gray-50 transition-all relative group
                      ${selectedConversation === conv.id ? 'bg-blue-50/30' : ''}
                    `}
                  >
                    {selectedConversation === conv.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#007fed] rounded-r-full shadow-[2px_0_8px_rgba(0,127,237,0.3)]"></div>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`font-black text-gray-900 truncate transition-colors ${selectedConversation === conv.id ? 'text-[#007fed]' : 'group-hover:text-[#007fed]'}`}>
                          {conv.title || `Dự án #${conv.projectId?.substring(conv.projectId.length - 6).toUpperCase()}`}
                        </p>
                        <p className="text-sm text-gray-500 truncate mt-1.5 font-medium">
                          {conv.lastMessagePreview || 'Chưa có tin nhắn nào'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                            {new Date(conv.lastMessageAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                        {conv.unreadCount !== undefined && conv.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-[#007fed] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
            {selectedConversation ? (
              <ChatWindow
                conversationId={selectedConversation}
                title={selectedConvDetails?.title || `Dự án #${selectedConversation.substring(selectedConversation.length - 6).toUpperCase()}`}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50/30">
                <div className="text-center max-w-sm px-8">
                  <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-8 animate-in zoom-in-90 duration-500">
                    <MessageSquare className="w-12 h-12 text-[#007fed]/20" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">Tin nhắn của bạn</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu trao đổi với đối tác của bạn.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
