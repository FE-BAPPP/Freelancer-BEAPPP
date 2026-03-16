"use client"

import React, { useState, useEffect } from 'react';
import {
  Briefcase, Search,
  Heart, Clock, Calendar,
  ChevronDown, Tag
} from 'lucide-react';
import { jobApi, Job } from '../../services/jobApi';
import { Skill } from '../../types/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FilterState, SortOption, initialFilters, JOB_CATEGORIES } from '../../components/Jobs/types';
import { formatBudget, getRelativeTime } from '../../components/Jobs/types';

const formatDuration = (d: string) => {
  if (!d) return '';
  const map: any = {
    'LESS_THAN_1_WEEK': 'Dưới 1 tuần',
    '1_TO_2_WEEKS': '1-2 tuần',
    '2_TO_4_WEEKS': '2-4 tuần',
    '1_TO_3_MONTHS': '1-3 tháng',
    '3_TO_6_MONTHS': '3-6 tháng',
    'MORE_THAN_6_MONTHS': 'Trên 6 tháng'
  };
  return map[d] || d;
};

// --- Shared Components for this Page ---

// 1. Compact Job List Item (Freelancer Style)
const JobListItem: React.FC<{
  job: Job;
  onClick: () => void;
  isSaved: boolean;
  onSave: () => void;
  user: any;
  onPropose: () => void;
}> = ({ job, onClick, isSaved, onSave, user, onPropose }) => {
  return (
    <div className="bg-white border border-gray-200 p-6 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg -mb-px">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3
            onClick={onClick}
            className="text-lg font-bold text-[#5B8DEF] hover:underline cursor-pointer mb-1 truncate"
          >
            {job.title}
          </h3>

          <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>{formatBudget(job)}</span>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
            {job.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills?.slice(0, 5).map((skill, idx) => (
              <span key={idx} className="text-[#5B8DEF] hover:bg-[#5B8DEF]/10 hover:underline px-2 py-1 rounded text-xs transition-colors cursor-pointer">
                {skill}
              </span>
            ))}
            {job.skills && job.skills.length > 5 && (
              <span className="text-gray-500 text-xs py-1 px-2">+{job.skills.length - 5} thêm</span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{getRelativeTime(job.createdAt)}</span>
            </div>

            {job.duration && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDuration(job.duration)}</span>
              </div>
            )}

            {job.proposalCount !== undefined && (
              <div className="flex items-center gap-1">
                <span>{job.proposalCount} đề xuất </span>
              </div>
            )}

            {job.category && (
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                <Tag className="w-3 h-3" />
                <span>{job.category}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end justify-between min-w-[140px]">
          <div className="text-right">
            {job.proposalCount === 0 && (
              <span className="inline-block bg-[#f0ad4e] text-white text-[10px] font-bold px-2 py-1 uppercase rounded mb-2">
                Người đầu tiên
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className="text-gray-400 hover:text-pink-500 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-pink-500 text-pink-500' : ''}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onPropose(); }}
              className="bg-[#5B8DEF] hover:bg-[#4A90E2] text-white text-sm font-bold py-2 px-6 rounded transition-colors whitespace-nowrap"
            >
              {user ? 'Đề xuất' : 'Đăng nhập để đề xuất'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// 2. Sidebar Filter Component
const SidebarFilters: React.FC<{
  filters: FilterState;
  onFilterChange: (f: FilterState) => void;
  skills: Skill[];
  categories: typeof JOB_CATEGORIES;
}> = ({ filters, onFilterChange, skills, categories }) => {

  // Helper to handle project type checkbox logic
  const handleTypeToggle = (type: 'HOURLY' | 'FIXED_PRICE') => {
    let current = filters.projectType;

    const isFixedChecked = current === 'ALL' || current === 'FIXED_PRICE';
    const isHourlyChecked = current === 'ALL' || current === 'HOURLY';

    if (type === 'FIXED_PRICE') {
      if (isFixedChecked) {
        onFilterChange({ ...filters, projectType: 'HOURLY' });
      } else {
        onFilterChange({ ...filters, projectType: isHourlyChecked ? 'ALL' : 'FIXED_PRICE' });
      }
    } else {
      // HOURLY
      if (isHourlyChecked) {
        // Unchecking Hourly -> Set to FIXED_PRICE
        onFilterChange({ ...filters, projectType: 'FIXED_PRICE' });
      } else {
        // Checking Hourly -> If Fixed checked -> ALL. Else -> HOURLY.
        onFilterChange({ ...filters, projectType: isFixedChecked ? 'ALL' : 'HOURLY' });
      }
    }
  };

  const isFixedActive = filters.projectType === 'ALL' || filters.projectType === 'FIXED_PRICE';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900 text-lg">Bộ lọc</h3>
        {/* Overall Clear (optional) */}
      </div>

      {/* Project Type */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-800 text-sm">Loại dự án</h4>
          <button onClick={() => onFilterChange({ ...filters, projectType: 'ALL' })} className="text-xs text-[#5B8DEF] hover:underline">Xóa</button>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFixedActive}
              onChange={() => handleTypeToggle('FIXED_PRICE')}
              className="rounded border-gray-300 text-[#5B8DEF] focus:ring-[#5B8DEF]"
            />
            <span className="text-sm text-gray-700">Giá cố định</span>
          </label>
        </div>
      </div>

      {/* Fixed Price */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-800 text-sm">Ngân sách</h4>
          <button onClick={() => onFilterChange({ ...filters, budgetMin: '', budgetMax: '' })} className="text-xs text-[#5B8DEF] hover:underline">Xóa</button>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
            <input
              type="number"
              placeholder="Thấp"
              value={filters.budgetMin}
              onChange={e => onFilterChange({ ...filters, budgetMin: e.target.value })}
              className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded text-sm focus:border-[#5B8DEF] focus:ring-1 focus:ring-[#5B8DEF] outline-none"
            />
          </div>
          <span className="text-gray-400">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
            <input
              type="number"
              placeholder="Cao"
              value={filters.budgetMax}
              onChange={e => onFilterChange({ ...filters, budgetMax: e.target.value })}
              className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded text-sm focus:border-[#5B8DEF] focus:ring-1 focus:ring-[#5B8DEF] outline-none"
            />
          </div>
        </div>
        <div className="text-right text-xs text-gray-400">PTS</div>
        {/* Note: Keeping UI as USD per image request, though values are PTS in logic.
            User can assume 1 PTS = 1 USD or similar for UI purposes. */}
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-800 text-sm">Danh mục</h4>
          <button onClick={() => onFilterChange({ ...filters, category: 'ALL' })} className="text-xs text-[#5B8DEF] hover:underline">Xóa</button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={filters.category === 'ALL'}
              onChange={() => onFilterChange({ ...filters, category: 'ALL' })}
              className="rounded-full border-gray-300 text-[#5B8DEF] focus:ring-[#5B8DEF]"
            />
            <span className="text-sm text-gray-700">Tất cả danh mục</span>
          </label>
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={filters.category === cat.vi}
                onChange={() => onFilterChange({ ...filters, category: cat.vi })}
                className="rounded-full border-gray-300 text-[#5B8DEF] focus:ring-[#5B8DEF]"
              />
              <span className="text-sm text-gray-700">{cat.vi}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-0">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-800 text-sm">Kỹ năng</h4>
          <button onClick={() => onFilterChange({ ...filters, selectedSkills: [] })} className="text-xs text-[#5B8DEF] hover:underline">Xóa</button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
          {skills.slice(0, 10).map(skill => (
            <label key={skill.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.selectedSkills.includes(skill.id)}
                onChange={() => {
                  const newSkills = filters.selectedSkills.includes(skill.id)
                    ? filters.selectedSkills.filter(id => id !== skill.id)
                    : [...filters.selectedSkills, skill.id];
                  onFilterChange({ ...filters, selectedSkills: newSkills });
                }}
                className="rounded border-gray-300 text-[#5B8DEF] focus:ring-[#5B8DEF]"
              />
              <span className="text-sm text-gray-700">{skill.name}</span>
            </label>
          ))}
        </div>
      </div>

    </div >
  );
};

// --- Page Main Component ---

export function BrowseJobsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchKeyword), 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Reset page
  useEffect(() => { setPage(0); }, [debouncedSearch, filters, sortBy]);

  // 1. Initial Sync from URL to Local State (and handle URL changes)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || 'ALL';

    if (q !== searchKeyword) setSearchKeyword(q);
    if (cat !== filters.category) {
      setFilters(prev => ({ ...prev, category: cat }));
    }
  }, [searchParams]);

  // 2. Sync Local State back to URL
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    if (debouncedSearch) {
      newParams.set('q', debouncedSearch);
    } else {
      newParams.delete('q');
    }

    if (filters.category !== 'ALL') {
      newParams.set('category', filters.category);
    } else {
      newParams.delete('category');
    }

    // Only update if params actually changed to avoid redundant re-renders
    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true });
    }
  }, [debouncedSearch, filters.category]);

  // Load jobs based on local state
  useEffect(() => {
    loadJobs();
  }, [page, debouncedSearch, filters, sortBy]);

  const loadJobs = async () => {
    try {
      setLoading(true);

      // Determine the API search keyword (Search Input takes priority, then Category as a broad fallback)
      const apiKeyword = debouncedSearch || (filters.category !== 'ALL' ? filters.category : '');

      const response = apiKeyword
        ? await jobApi.searchJobs(apiKeyword, page, 20)
        : await jobApi.browseJobs(page, 20);

      let filteredJobs = response.content || [];

      // derive skills
      try {
        const skillMap = new Map<string, string>();
        (response.content || []).forEach((j: any) => {
          (j.skills || []).forEach((s: string) => {
            const key = s.toLowerCase();
            if (!skillMap.has(key)) skillMap.set(key, s);
          });
        });
        setSkills(Array.from(skillMap.values()).map(v => ({ id: v, name: v })));
      } catch (e) { }

      // Apply filters
      if (filters.projectType !== 'ALL') filteredJobs = filteredJobs.filter(j => j.projectType === filters.projectType);
      if (filters.category !== 'ALL') filteredJobs = filteredJobs.filter(j => j.category === filters.category);
      if (filters.budgetMin) {
        const min = parseFloat(filters.budgetMin);
        filteredJobs = filteredJobs.filter(j => (j.budgetMin && j.budgetMin >= min) || (j.budgetMax && j.budgetMax >= min));
      }
      if (filters.budgetMax) {
        const max = parseFloat(filters.budgetMax);
        filteredJobs = filteredJobs.filter(j => (j.budgetMax && j.budgetMax <= max) || (j.budgetMin && j.budgetMin <= max));
      }
      if (filters.selectedSkills.length > 0) {
        const selected = filters.selectedSkills.map(id => skills.find(s => s.id === id)?.name?.toLowerCase()).filter(Boolean);
        filteredJobs = filteredJobs.filter(j => j.skills?.some(s => selected.some(sel => s.toLowerCase().includes(sel || ''))));
      }

      setJobs(sortJobs(filteredJobs, sortBy));
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortJobs = (items: Job[], sort: SortOption): Job[] => {
    const sorted = [...items];
    switch (sort) {
      case 'newest': return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest': return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'budget_high': return sorted.sort((a, b) => (b.budgetMax || b.budgetMin || 0) - (a.budgetMax || a.budgetMin || 0));
      case 'budget_low': return sorted.sort((a, b) => (a.budgetMin || a.budgetMax || 0) - (b.budgetMin || b.budgetMax || 0));
      case 'proposals_low': return sorted.sort((a, b) => (a.proposalCount || 0) - (b.proposalCount || 0));
      default: return sorted;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans text-[#4d525b]">
      {/* Custom Header Area (Freelancer Style) */}
      <div className="bg-[#1f2125] text-white pt-8 pb-0 px-4 md:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Tìm việc</h1>

          {/* Search Bar */}
          <div className="relative max-w-4xl mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm dự án"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-md border-0 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#5B8DEF]"
              />
            </div>
            <button className="bg-[#5B8DEF] hover:bg-[#006bb3] text-white font-bold py-3 px-8 rounded-md transition-colors">
              Lưu
            </button>
          </div>

          <div className="max-w-4xl flex justify-end mb-8">
            <button className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Hiển thị tùy chọn nâng cao</button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-8 text-sm font-bold">
            <button className="pb-3 border-b-2 border-transparent text-gray-400 hover:text-white transition-colors">Freelancer</button>
            <button className="pb-3 border-b-2 border-white text-white">Dự án</button>
            <button className="pb-3 border-b-2 border-transparent text-gray-400 hover:text-white transition-colors">Cuộc thi</button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Sidebar (Filters) */}
          <div className="lg:w-72 flex-shrink-0">
            <SidebarFilters
              filters={filters}
              onFilterChange={setFilters}
              skills={skills}
              categories={JOB_CATEGORIES}
            />
          </div>

          {/* Right Content (Job List) */}
          <div className="flex-1 min-w-0">
            {/* Result Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="font-bold text-gray-800 text-sm flex items-center gap-4">
                <span>Kết quả hàng đầu <span className="font-normal text-gray-500">1-{jobs.length} trên {totalElements} kết quả</span></span>

                {/* Receive Alerts Toggle */}
                <div className="flex items-center gap-2 border-l border-gray-300 pl-4 ml-2">
                  <div className="relative w-8 h-4 bg-gray-200 rounded-full cursor-pointer transition-colors hover:bg-gray-300">
                    <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                  </div>
                  <span className="font-normal text-gray-500 text-xs">Nhận thông báo</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Sắp xếp</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none bg-white border border-gray-300 hover:border-gray-400 pl-3 pr-8 py-1.5 rounded text-sm text-gray-700 font-bold focus:outline-none focus:border-[#5B8DEF]"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="budget_high">Ngân sách cao</option>
                    <option value="budget_low">Ngân sách thấp</option>
                    <option value="proposals_low">Ít đề xuất </option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Job List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="bg-white border border-gray-200 p-6 rounded-lg animate-pulse">
                    <div className="h-6 bg-gray-200 w-3/4 mb-4 rounded"></div>
                    <div className="h-4 bg-gray-200 w-1/2 mb-6 rounded"></div>
                    <div className="h-20 bg-gray-200 w-full mb-4 rounded"></div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white border border-gray-200 p-12 text-center rounded-lg">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy công việc</h3>
                <p className="text-gray-500 mb-6">Hãy thử điều chỉnh từ khóa hoặc bộ lọc để tìm kết quả phù hợp.</p>
                <button
                  onClick={() => {
                    setFilters(initialFilters);
                    setSearchKeyword('');
                    navigate('/browse-jobs');
                  }}
                  className="text-[#5B8DEF] font-bold hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="flex flex-col shadow-sm rounded-lg overflow-hidden">
                {jobs.map(job => (
                  <JobListItem
                    key={job.id}
                    job={job}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    isSaved={savedJobs.has(job.id)}
                    user={user}
                    onSave={() => {
                      if (!user) {
                        navigate(`/login?redirect=/browse-jobs`);
                        return;
                      }
                      setSavedJobs(prev => {
                        const next = new Set(prev);
                        if (next.has(job.id)) next.delete(job.id); else next.add(job.id);
                        return next;
                      });
                    }}
                    onPropose={() => {
                      if (!user) {
                        navigate(`/login?redirect=/jobs/${job.id}`);
                      } else {
                        navigate(`/jobs/${job.id}`);
                      }
                    }}
                  />
                ))}
              </div>
            )}

            {/* Simple Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="px-4 py-2 text-gray-600 font-bold">
                  Trang {page + 1} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
