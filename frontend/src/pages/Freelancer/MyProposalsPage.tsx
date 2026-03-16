"use client"

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Clock,
  Briefcase, Eye, Paperclip, CheckCircle2,
  AlertCircle,
  MessageCircle, RefreshCw
} from 'lucide-react';
import { proposalApi, ProposalResponse } from '../../services/proposalApi';
import { projectApi, FileResponse } from '../../services/api';

export function MyProposalsPage() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<ProposalResponse[]>([]);
  const [proposalFiles, setProposalFiles] = useState<Record<string, FileResponse[]>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadProposals();
    window.scrollTo(0, 0);
  }, [page]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const response = await proposalApi.getMyProposals(page, 20);

      let pageData;
      if (response.data) {
        pageData = response.data;
      } else if (response.content) {
        pageData = response;
      } else {
        pageData = { content: [], totalPages: 0 };
      }

      const content = pageData.content || [];
      setProposals(content);
      setTotalPages(pageData.totalPages || 0);

      const filesMap: Record<string, FileResponse[]> = {};
      await Promise.all(content.map(async (p: ProposalResponse) => {
        try {
          const files = await projectApi.getFiles('PROPOSAL', p.id);
          if (files && files.length > 0) {
            filesMap[p.id] = files;
          }
        } catch (e) {
          console.warn(`Failed to fetch files for proposal ${p.id}`, e);
        }
      }));
      setProposalFiles(filesMap);

    } catch (error: any) {
      console.error('❌ Failed to load proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Chờ duyệt',
          className: 'bg-amber-50 text-amber-600 border-amber-200',
          icon: <Clock className="w-3 h-3" />
        };
      case 'ACCEPTED':
      case 'AWARDED':
        return {
          label: 'Trúng thầu',
          className: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          icon: <CheckCircle2 className="w-3 h-3" />
        };
      case 'REJECTED':
        return {
          label: 'Từ chối',
          className: 'bg-red-50 text-red-600 border-red-200',
          icon: <AlertCircle className="w-3 h-3" />
        };
      default:
        return {
          label: status,
          className: 'bg-gray-50 text-gray-600 border-gray-200',
          icon: <FileText className="w-3 h-3" />
        };
    }
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-2 mt-8 pb-8">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          Trang trước
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = totalPages <= 5 ? i : (page < 3 ? i : (page > totalPages - 4 ? totalPages - 5 + i : page - 2 + i));
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${page === pageNum
                  ? 'bg-[#007fed] text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {pageNum + 1}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          Trang sau
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#007fed] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="bg-[#1f2125] text-white py-12 px-4 md:px-8 border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Đề xuất của tôi</h1>
            <p className="text-gray-400">Quản lý các đề xuất và trạng thái dự án.</p>
          </div>
          <button
            onClick={() => loadProposals()}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-lg transition-all disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Proposals List */}
        {proposals.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có đề xuất nào</h3>
            <p className="text-gray-500 mb-6">
              Bạn chưa gửi đề xuất cho dự án nào. Hãy bắt đầu hành trình của bạn ngay!
            </p>
            <button
              onClick={() => navigate('/freelancer/jobs')}
              className="px-6 py-3 bg-[#007fed] hover:bg-[#006bb3] text-white rounded font-bold transition-colors"
            >
              Khám phá công việc
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => {
              const status = getStatusConfig(proposal.status);
              return (
                <div
                  key={proposal.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    {/* Left Side: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3
                          onClick={() => navigate(`/freelancer/jobs/${proposal.jobId}`)}
                          className="text-lg font-bold text-[#007fed] hover:underline cursor-pointer truncate"
                        >
                          {proposal.jobTitle || 'Dự án không tên'}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border flex items-center gap-1 ${status.className}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Số tiền đề xuất</span>
                          <span className="font-bold text-gray-900">{proposal.proposedAmount.toLocaleString()} PTS</span>
                        </div>
                        <div>
                          <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Thời gian</span>
                          <span className="font-bold text-gray-900">{proposal.estimatedDurationDays} ngày</span>
                        </div>
                        <div>
                          <span className="block text-gray-500 text-xs uppercase font-bold mb-1">Ngày gửi</span>
                          <span className="font-bold text-gray-900">{new Date(proposal.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-gray-100 rounded p-3 mb-4">
                        <p className="text-gray-600 text-sm italic line-clamp-2">
                          "{proposal.coverLetter}"
                        </p>
                      </div>

                      {/* Files */}
                      {proposalFiles[proposal.id] && proposalFiles[proposal.id].length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {proposalFiles[proposal.id].map(file => (
                            <a
                              key={file.id}
                              href={file.fileUrl.startsWith('http') ? file.fileUrl : `http://localhost:8080${file.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-xs text-[#007fed] hover:underline transition-colors"
                            >
                              <Paperclip className="w-3 h-3" />
                              <span>{file.fileName}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Side: Actions */}
                    <div className="flex flex-col items-end justify-center min-w-[140px] gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                      {(proposal.status === 'AWARDED' || proposal.status === 'ACCEPTED') ? (
                        <button
                          onClick={() => navigate('/freelancer/my-projects')}
                          className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <Briefcase className="w-4 h-4" />
                          Đến dự án
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/freelancer/jobs/${proposal.jobId}`)}
                          className="w-full px-4 py-2 bg-white border border-[#007fed] text-[#007fed] hover:bg-blue-50 rounded font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Xem chi tiết
                        </button>
                      )}
                      <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-bold text-sm transition-colors flex items-center justify-center gap-2">
                        <MessageCircle className="w-4 h-4" /> Nhắn tin
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination />
      </div>
    </div>
  );
}