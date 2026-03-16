// Types for Job components
import { Job } from '../../services/jobApi';

export type SortOption = 'newest' | 'oldest' | 'budget_high' | 'budget_low' | 'proposals_low';
export type ProjectType = 'ALL' | 'FIXED_PRICE' | 'HOURLY';
export type Complexity = 'ALL' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'COMPLEX';

export interface FilterState {
  projectType: ProjectType;
  complexity: Complexity;
  budgetMin: string;
  budgetMax: string;
  selectedSkills: string[];
  duration: string;
  category: string;
}

export const initialFilters: FilterState = {
  projectType: 'ALL',
  complexity: 'ALL',
  budgetMin: '',
  budgetMax: '',
  selectedSkills: [],
  duration: '',
  category: 'ALL'
};

export const JOB_CATEGORIES = [
  { id: 'web-dev', en: 'Web Development', vi: 'Phát triển Web' },
  { id: 'mobile-app', en: 'Mobile Apps', vi: 'App Di động' },
  { id: 'desktop-soft', en: 'Desktop Software', vi: 'Phần mềm Desktop' },
  { id: 'ui-ux', en: 'UI/UX Design', vi: 'Thiết kế UI/UX' },
  { id: 'graphics', en: 'Graphics Design', vi: 'Thiết kế Đồ họa' },
  { id: 'content', en: 'Content Writing', vi: 'Viết nội dung' },
  { id: 'marketing', en: 'Social Media & Marketing', vi: 'Mạng xã hội & Marketing' },
  { id: 'seo', en: 'SEO', vi: 'SEO' },
  { id: 'scripts', en: 'Scripts & Bots', vi: 'Scripts & Bots' },
  { id: 'logo', en: 'Logo & Identity', vi: 'Logo & Thương hiệu' },
  { id: 'data', en: 'Data Science', vi: 'Phân tích Dữ liệu' },
  { id: 'ai-ml', en: 'AI & Machine Learning', vi: 'AI & ML' },
  { id: 'devops', en: 'DevOps', vi: 'DevOps' },
  { id: 'other', en: 'Other', vi: 'Khác' }
];

// Utility function for relative time
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
  return `${diffMonths} tháng trước`;
};

// Format budget display
export const formatBudget = (job: Job): string => {
  if (job.budgetMin && job.budgetMax) {
    if (job.budgetMin === job.budgetMax) {
      return `${job.budgetMax.toLocaleString()} PTS`;
    }
    return `${job.budgetMin.toLocaleString()} - ${job.budgetMax.toLocaleString()} PTS`;
  }
  if (job.budgetMax) return `Lên đến ${job.budgetMax.toLocaleString()} PTS`;
  if (job.budgetMin) return `Từ ${job.budgetMin.toLocaleString()} PTS`;
  return 'Ngân sách chưa xác định';
};

// Budget presets for filters
export const BUDGET_PRESETS = [
  { label: '< 100 PTS', min: '', max: '100' },
  { label: '100-500 PTS', min: '100', max: '500' },
  { label: '500-1K PTS', min: '500', max: '1000' },
  { label: '1K-5K PTS', min: '1000', max: '5000' },
  { label: '5K+ PTS', min: '5000', max: '' }
];

// Duration options
export const DURATION_OPTIONS = [
  { value: '', label: 'Mọi thời hạn' },
  { value: 'less_than_week', label: 'Dưới 1 tuần' },
  { value: 'less_than_month', label: 'Dưới 1 tháng' },
  { value: '1_to_3_months', label: '1 đến 3 tháng' },
  { value: '3_to_6_months', label: '3 đến 6 tháng' },
  { value: '3_to_6_months', label: '3 đến 6 tháng' },
  { value: 'more_than_6_months', label: 'Trên 6 tháng' }
];

export const formatDuration = (d: string) => {
  if (!d) return 'N/A';
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
