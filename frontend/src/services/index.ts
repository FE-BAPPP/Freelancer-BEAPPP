/**
 * Centralized API Services Export
 * 
 * This file exports all API services for easy import throughout the application.
 * 
 * Usage:
 * import { reviewApi, escrowApi, projectApi } from '@/services';
 */

// Core API (from api.ts - legacy file, only essential exports)
export { userApi, API_BASE_URL, authHelper, healthApi } from './api';
export type { ApiResponse, FileResponse } from './api';

// Admin (from adminApi.ts - new file)
export { default as adminApi } from './adminApi';

// Chat & Messaging
export { default as chatApi } from './chatApi';
export { default as conversationApi } from './conversationApi';

// Jobs & Proposals
export { jobApi } from './jobApi';
export { default as proposalApi } from './proposalApi';

// Projects & Milestones
export { projectApi } from './projectApi';
export { milestoneApi } from './milestoneApi';

// Payments & Escrow
export { escrowApi } from './escrowApi';

// Reviews & Ratings
export { reviewApi } from './reviewApi';

// Files
export { filesApi } from './filesApi';

// Notifications
export { notificationApi } from './notificationApi';

// Profiles
export { profileApi } from './profileApi';

/**
 * API Service Summary:
 * 
 * 1. AUTHENTICATION & USER
 *    - api.ts / userApi.ts: Login, register, profile, wallet, transactions
 * 
 * 2. ADMIN
 *    - adminApi.ts: Dashboard, statistics, user management, withdrawals
 * 
 * 3. JOBS & HIRING
 *    - jobApi.ts: Create, browse, search jobs
 *    - proposalApi.ts: Submit, award, withdraw proposals
 * 
 * 4. PROJECTS
 *    - projectApi.ts: Project lifecycle (complete, cancel, get projects)
 *    - milestoneApi.ts: Milestone management (create, submit, approve, release)
 * 
 * 5. PAYMENTS
 *    - escrowApi.ts: Lock, release, refund funds
 * 
 * 6. REVIEWS
 *    - reviewApi.ts: Create reviews, get statistics
 * 
 * 7. DISPUTES
 *    - disputeApi.ts: Create, resolve disputes
 * 
 * 8. COMMUNICATION
 *    - chatApi.ts: Real-time chat (WebSocket), send/get messages
 *    - conversationApi.ts: Conversation management
 * 
 * 9. FILES
 *    - fileApi.ts: Upload, download, delete files
 * 
 * 10. NOTIFICATIONS
 *     - notificationApi.ts: Get, mark as read, subscribe to SSE
 * 
 * 11. PROFILES
 *     - profileApi.ts: Freelancer & employer profiles
 * 
 * 12. FILE MANAGEMENT
 */

// Type exports for convenience
export type {
  // Common
  ApiResponse,
  PageResponse,
  PageInfo,
  
  // Auth & User
  User,
  UserProfile,
  Role,
  
  // Jobs
  Job,
  JobStatus,
  ProjectType,
  CreateJobRequest,
  UpdateJobRequest,
  
  // Proposals
  Proposal,
  ProposalStatus,
  CreateProposalRequest,
  UpdateProposalRequest,
  
  // Projects
  Project,
  ProjectStatus,
  
  // Milestones
  Milestone,
  MilestoneStatus,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
  SubmitMilestoneRequest,
  RejectMilestoneRequest,
  MilestoneStatistics,
  
  // Escrow
  Escrow,
  EscrowStatus,
  EscrowStatistics,
  
  // Reviews
  Review,
  CreateReviewRequest,
  ReviewStatistics,
  
  // Disputes
  Dispute,
  DisputeStatus,
  CreateDisputeRequest,
  ResolveDisputeRequest,
  
  // Messages
  Message,
  MessageType,
  SendMessageRequest,
  Conversation,
  
  // Notifications
  Notification,
  NotificationType,
  
  // Profiles
  FreelancerProfile,
  UpdateFreelancerProfileRequest,
  EmployerProfile,
  CreateEmployerProfileRequest,
  UpdateEmployerProfileRequest,
  
  // Files
  FileAttachment,
  
  // Skills
  Skill,
  CreateSkillRequest,
  
  // Admin Statistics
  SystemOverview,
  FinancialStatistics,
  ActivityStatistics,
  DashboardSummary,
} from '../types/api';
