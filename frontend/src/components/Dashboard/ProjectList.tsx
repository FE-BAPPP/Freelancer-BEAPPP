import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, ChevronRight, FileText, Folder } from 'lucide-react';

interface Project {
  id: string;
  title?: string;
  jobTitle?: string;
  status: string;
  agreedAmount?: number;
  deadline?: string;
  startedAt?: string;
  employerName?: string;
  freelancerName?: string;
}

interface ProjectListProps {
  projects: Project[];
  title?: string;
  viewAllLink?: string;
  viewAllLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyActionLink?: string;
  showEmployer?: boolean;
  showFreelancer?: boolean;
  icon?: React.ReactNode;
}

export function ProjectList({
  projects,
  title = 'Active Projects',
  viewAllLink,
  viewAllLabel = 'View All',
  emptyTitle = 'No projects yet',
  emptyDescription = 'Start by finding work',
  emptyActionLabel,
  emptyActionLink,
  showEmployer = false,
  showFreelancer = false,
  icon
}: ProjectListProps) {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; border: string }> = {
      'IN_PROGRESS': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
      'COMPLETED': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
      'PENDING': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
      'CANCELLED': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    };
    return statusMap[status] || { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };
  };

  return (
    <div className="bg-[#1c1c1e] rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          {icon || <Folder className="w-5 h-5 text-pink-500" />}
          {title}
        </h2>
        {viewAllLink && (
          <button
            onClick={() => navigate(viewAllLink)}
            className="text-sm text-gray-500 font-medium hover:text-pink-500 flex items-center gap-1 transition-colors"
          >
            {viewAllLabel} <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-0">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-white font-medium">{emptyTitle}</p>
            <p className="text-gray-500 text-sm mb-4">{emptyDescription}</p>
            {emptyActionLabel && emptyActionLink && (
              <button
                onClick={() => navigate(emptyActionLink)}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-pink-500/25 transition-all"
              >
                {emptyActionLabel}
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {projects.map((project, idx) => {
              const statusStyle = getStatusBadge(project.status);
              return (
                <div
                  key={project.id || idx}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="p-4 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-1.5 h-12 bg-gradient-to-b from-pink-500 to-purple-600 rounded-full self-center hidden sm:block"></div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-pink-500 transition-colors mb-0.5">
                        {project.title || project.jobTitle}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {showEmployer && project.employerName && (
                          <>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" /> {project.employerName}
                            </span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                          </>
                        )}
                        {showFreelancer && project.freelancerName && (
                          <>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" /> {project.freelancerName}
                            </span>
                            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                          </>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> 
                          {project.deadline 
                            ? `Due: ${project.deadline}` 
                            : project.startedAt 
                              ? new Date(project.startedAt).toLocaleDateString()
                              : 'No deadline'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {project.agreedAmount !== undefined && (
                      <div className="font-bold text-white">{project.agreedAmount} <span className="text-pink-500 text-sm">PTS</span></div>
                    )}
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full mt-1 ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
