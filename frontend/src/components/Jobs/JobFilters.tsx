import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, SlidersHorizontal, X, Target, DollarSign, Clock, Zap } from 'lucide-react';
import { Skill } from '../../types/api';
import { FilterState, ProjectType, BUDGET_PRESETS, DURATION_OPTIONS } from './types';

interface JobFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  skills: Skill[];
  onClearAll: () => void;
  activeFilterCount: number;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onFilterChange,
  skills,
  onClearAll,
  activeFilterCount
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    projectType: true,
    budget: true,
    skills: true,
    duration: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSkillToggle = (skillId: string) => {
    const newSkills = filters.selectedSkills.includes(skillId)
      ? filters.selectedSkills.filter(id => id !== skillId)
      : [...filters.selectedSkills, skillId];
    onFilterChange({ ...filters, selectedSkills: newSkills });
  };

  const FilterSection: React.FC<{
    title: string;
    id: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    badge?: number;
  }> = ({ title, id, icon, children, badge }) => (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between py-5 text-left hover:bg-white/[0.03] transition-colors px-2 rounded-xl group"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-colors ${expandedSections[id] ? 'bg-pink-500/10 text-pink-400' : 'bg-white/5 text-gray-500Group-hover:text-gray-300'}`}>
            {icon}
          </div>
          <span className={`font-bold transition-colors ${expandedSections[id] ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{title}</span>
          {badge !== undefined && badge > 0 && (
            <span className="px-2 py-0.5 bg-pink-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-pink-500/20">
              {badge}
            </span>
          )}
        </div>
        {expandedSections[id] ? (
          <ChevronUp className="w-4 h-4 text-pink-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {expandedSections[id] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6 px-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl rounded-[24px] border border-white/10 shadow-2xl sticky top-24 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-white/5">
            <SlidersHorizontal className="w-5 h-5 text-pink-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-white uppercase tracking-wider text-xs">Bộ lọc</span>
            {activeFilterCount > 0 && (
              <span className="text-[10px] text-pink-500 font-bold uppercase tracking-widest leading-none mt-1">
                {activeFilterCount} đang áp dụng
              </span>
            )}
          </div>
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-[11px] uppercase font-black tracking-widest text-gray-500 hover:text-pink-400 transition-colors"
          >
            Làm mới
          </button>
        )}
      </div>

      <div className="p-4 space-y-1">
        {/* Project Type */}
        <FilterSection title="Loại Dự án" id="projectType" icon={<Target className="w-4 h-4" />}>
          <div className="grid grid-cols-1 gap-2">
            {[
              { value: 'ALL', label: 'Tất cả dự án' },
              { value: 'FIXED_PRICE', label: 'Giá cố định' }
            ].map(option => (
              <label
                key={option.value}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer transition-all border ${filters.projectType === option.value
                  ? 'bg-pink-500/10 border-pink-500/30'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                  }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${filters.projectType === option.value ? 'border-pink-500 bg-pink-500' : 'border-gray-600'}`}>
                  {filters.projectType === option.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <input
                  type="radio"
                  name="projectType"
                  className="hidden"
                  checked={filters.projectType === option.value}
                  onChange={() => onFilterChange({ ...filters, projectType: option.value as ProjectType })}
                />
                <span className={`text-sm font-semibold ${filters.projectType === option.value ? 'text-white' : 'text-gray-400'}`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Budget Range */}
        <FilterSection title="Ngân sách (PTS)" id="budget" icon={<DollarSign className="w-4 h-4" />}>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="Từ"
                  value={filters.budgetMin}
                  onChange={(e) => onFilterChange({ ...filters, budgetMin: e.target.value })}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 focus:outline-none transition-all"
                />
              </div>
              <div className="flex items-center text-gray-700 font-bold">—</div>
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder="Đến"
                  value={filters.budgetMax}
                  onChange={(e) => onFilterChange({ ...filters, budgetMax: e.target.value })}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 focus:outline-none transition-all"
                />
              </div>
            </div>
            {/* Quick budget presets */}
            <div className="grid grid-cols-2 gap-2">
              {BUDGET_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => onFilterChange({
                    ...filters,
                    budgetMin: preset.min,
                    budgetMax: preset.max
                  })}
                  className={`px-3 py-2 text-[11px] font-bold rounded-lg border transition-all ${filters.budgetMin === preset.min && filters.budgetMax === preset.max
                    ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/20'
                    : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20 hover:text-gray-300'
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Skills */}
        <FilterSection
          title="Kỹ năng"
          id="skills"
          icon={<Zap className="w-4 h-4" />}
          badge={filters.selectedSkills.length}
        >
          <div className="space-y-1 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {skills.slice(0, 20).map(skill => (
              <label
                key={skill.id}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-xl cursor-pointer transition-all border ${filters.selectedSkills.includes(skill.id)
                  ? 'bg-pink-500/10 border-pink-500/30'
                  : 'bg-transparent border-transparent hover:bg-white/[0.03]'
                  }`}
              >
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${filters.selectedSkills.includes(skill.id) ? 'border-pink-500 bg-pink-500' : 'border-gray-700'}`}>
                  {filters.selectedSkills.includes(skill.id) && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={filters.selectedSkills.includes(skill.id)}
                  onChange={() => handleSkillToggle(skill.id)}
                />
                <span className={`text-sm font-medium ${filters.selectedSkills.includes(skill.id) ? 'text-white' : 'text-gray-400'}`}>
                  {skill.name}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Duration */}
        <FilterSection title="Thời hạn" id="duration" icon={<Clock className="w-4 h-4" />}>
          <div className="grid grid-cols-1 gap-2">
            {DURATION_OPTIONS.map(option => (
              <label
                key={option.value}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer transition-all border ${filters.duration === option.value
                  ? 'bg-pink-500/10 border-pink-500/30'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                  }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${filters.duration === option.value ? 'border-pink-500 bg-pink-500' : 'border-gray-600'}`}>
                  {filters.duration === option.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <input
                  type="radio"
                  name="duration"
                  className="hidden"
                  checked={filters.duration === option.value}
                  onChange={() => onFilterChange({ ...filters, duration: option.value })}
                />
                <span className={`text-sm font-semibold ${filters.duration === option.value ? 'text-white' : 'text-gray-400'}`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

// Mobile Filter Wrapper
interface MobileFiltersProps extends JobFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileFilters: React.FC<MobileFiltersProps> = ({
  isOpen,
  onClose,
  ...filterProps
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 lg:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="absolute left-0 top-0 bottom-0 w-80 bg-[#0e0e10] overflow-y-auto border-r border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-pink-500" />
                <span className="font-black text-white uppercase tracking-wider text-sm">Lọc Dự án</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <JobFilters {...filterProps} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
