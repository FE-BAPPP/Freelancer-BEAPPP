// ====== COMMON TYPES ======

export type Role = 'FREELANCER' | 'EMPLOYER' | 'ADMIN';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
}

export interface UserProfile extends User {
  walletAddress?: string;
  balance?: {
    usdt: string;
    points: number;
  };
}

// ====== WALLET / DEPOSIT ======

export interface WalletInfo {
  address: string;
  usdtBalance: string;
  trxBalance: string;
  pointsBalance: number;
  lastUpdated: string;
}

export interface DepositInfo {
  address: string;
  qrCode: string;
  network: string;
  tokenContract: string;
}

// ====== TRANSACTIONS ======

export interface TransactionHistory {
  transactions: Transaction[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'SWEEP' | 'TRANSFER';
export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'BROADCASTING' | 'SENT' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';

export interface Transaction {
  id: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  transactionType: TransactionType;
  status: TransactionStatus;
  createdAt: string;
  confirmedAt?: string;
  blockNumber?: number;
}

export interface TransactionSummary {
  totalCount: number;
  totalVolume: string;
  startDate: string;
  endDate: string;
}

// ====== WITHDRAWALS ======

export interface WithdrawalRequest {
  toAddress: string;
  amount: string;
  note?: string;
}

export interface Withdrawal {
  id: string;
  amount: string;
  toAddress: string;
  status: TransactionStatus;
  createdAt: string;
  processedAt?: string;
  confirmedAt?: string;
  fee?: string;
  netAmount?: string;
  txHash?: string;
}

// ====== DASHBOARD (ADMIN) ======

export interface DashboardData {
  masterWallet: {
    address: string;
    trxBalance: string;
    usdtBalance: string;
    isLowTrxBalance: boolean;
    isLowUsdtBalance: boolean;
  };
  walletPool: {
    total: number;
    free: number;
    assigned: number;
    active: number;
    utilizationRate: number;
  };
  withdrawals: WithdrawalStats;
  withdrawalQueue: QueueStats;
  depositScanner: ScannerStats;
  systemHealth: SystemHealth;
  timestamp: string;
}

export interface WithdrawalStats {
  totalProcessed: number;
  pendingCount: number;
  failedCount: number;
  avgProcessingTime: number;
  totalVolume: string;
}

export interface QueueStats {
  queueSize: number;
  processingRate: number;
  averageWaitTime: number;
}

export interface ScannerStats {
  lastScannedBlock: number;
  totalDepositsDetected: number;
  scanningRate: number;
  isScanning: boolean;
}

export interface SystemHealth {
  status: 'HEALTHY' | 'WARNING' | 'ERROR';
  services: {
    database: 'UP' | 'DOWN';
    blockchain: 'UP' | 'DOWN';
    redis: 'UP' | 'DOWN';
    sweepService: 'UP' | 'DOWN';
  };
  alerts: Alert[];
}

export interface Alert {
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  timestamp: string;
}

// ====== SYSTEM ======

export interface MasterWalletInfo {
  address: string;
  trxBalance: string;
  createdAt: string;
  isLowBalance: boolean;
}

export interface PoolStats {
  total: number;
  free: number;
  assigned: number;
  active: number;
}

// ====== TOKEN SWEEP ======

export interface TokenSweepData {
  totalCount: number;
  showingCount: number;
  statusFilter: string;
  sweeps: TokenSweep[];
  timestamp: string;
}

export interface TokenSweep {
  id: number;
  childIndex: number;
  fromAddress: string;
  toAddress: string;
  amount: string;
  txHash: string;
  status: TransactionStatus;
  createdAt: string;
  confirmedAt?: string;
}

// ====== GAS TOP-UP ======

export interface GasTopupData {
  totalCount: number;
  showingCount: number;
  statusFilter: string;
  topups: GasTopup[];
  timestamp: string;
}

export type GasTopupStatus = 'PENDING' | 'SENT' | 'CONFIRMED' | 'FAILED';

export interface GasTopup {
  id: number;
  childIndex: number;
  toAddress: string;
  amount: string;
  txHash: string;
  status: GasTopupStatus;
  createdAt: string;
  confirmedAt?: string;
}

// ====== REQUEST TYPES ======

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
}

export type CreateAdminRequest = RegisterRequest;

export interface TransferPointsRequest {
  toUsername: string;
  amount: number;
  note?: string;
}

// ====== POINTS ======

export interface PointsBalance {
  balance: number;
  lastUpdated: string;
}

export interface PointsHistory {
  transactions: PointsTransaction[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export type PointsTransactionType = 'TRANSFER' | 'BONUS' | 'DEDUCTION';

export interface PointsTransaction {
  id: string;
  fromUser: string;
  toUser: string;
  amount: number;
  type: PointsTransactionType;
  note?: string;
  createdAt: string;
}

// ====== REVIEWS ======

export interface Review {
  id: string;
  projectId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  revieweeId: string;
  revieweeName: string;
  revieweeAvatar: string;
  rating: number;
  qualityRating?: number;
  communicationRating?: number;
  professionalismRating?: number;
  deadlineRating?: number;
  comment: string;
  createdAt: string;
  projectTitle: string;
}

export interface CreateReviewRequest {
  projectId: string;
  revieweeId: string;
  rating: number;
  qualityRating?: number;
  communicationRating?: number;
  professionalismRating?: number;
  deadlineRating?: number;
  comment: string;
}

export interface ReviewStatistics {
  userId: string;
  averageRating: number;
  totalReviews: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
}

// ====== ESCROW ======

export type EscrowStatus = 'LOCKED' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';

export interface Escrow {
  id: string;
  projectId: string;
  milestoneId: string;
  milestoneTitle: string;
  employerId: string;
  freelancerId: string;
  amount: number;
  platformFee: number;
  status: EscrowStatus;
  lockedAt: string;
  releasedAt?: string;
  refundedAt?: string;
  releasedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EscrowStatistics {
  userId: string;
  totalLocked: number;
  totalReleased: number;
  totalRefunded: number;
  totalDisputed: number;
}

// ====== ADMIN STATISTICS ======

export interface SystemOverview {
  totalUsers: number;
  activeUsers: number;
  totalEmployers: number;
  totalFreelancers: number;
  totalJobs: number;
  openJobs: number;
  closedJobs: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  disputedProjects: number;
  totalProposals: number;
  pendingProposals: number;
  awardedProposals: number;  // Changed from acceptedProposals
}

export interface FinancialStatistics {
  totalDeposits: number;
  depositCount: number;
  totalWithdrawals: number;
  withdrawalCount: number;
  pendingWithdrawals: number;
  totalEscrowLocked: number;
  totalEscrowReleased: number;
  totalWithdrawalFees: number; // ✅ Platform revenue = withdrawal fees only (no escrow platform fee)
  systemBalance: number;
}

export interface ActivityStatistics {
  startDate: string;
  endDate: string;
  newUsers: number;
  newJobs: number;
  newProjects: number;
  completedProjects: number;
  newDisputes: number;
  depositTransactions: number;
  withdrawalTransactions: number;
}

export interface DashboardSummary {
  overview: SystemOverview;
  financial: FinancialStatistics;
  recentActivity: ActivityStatistics;
  lastUpdated: string;
}

// ====== PROPOSALS ======

export type ProposalStatus = 'PENDING' | 'REJECTED' | 'WITHDRAWN' | 'SHORTLISTED' | 'AWARDED';

export interface Proposal {
  id: string;
  jobId: string;
  jobTitle: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerRating: number;
  freelancerCompletedJobs: number;
  coverLetter: string;
  proposedAmount: number;
  estimatedDurationDays: number;
  status: ProposalStatus;
  awardedAt?: string;  // Changed from acceptedAt
  createdAt: string;
  updatedAt: string;
}

export interface CreateProposalRequest {
  jobId: string;
  coverLetter: string;
  proposedAmount: number;
  estimatedDurationDays: number;
}

export interface UpdateProposalRequest {
  jobId: string;
  coverLetter: string;
  proposedAmount: number;
  estimatedDurationDays: number;
}

// ====== NOTIFICATIONS ======

export type NotificationType =
  | 'DEPOSIT_SUCCESS'
  | 'WITHDRAWAL_SUCCESS'
  | 'WITHDRAWAL_PENDING'
  | 'JOB_POSTED'
  | 'PROPOSAL_RECEIVED'
  | 'PROPOSAL_ACCEPTED'
  | 'PROJECT_STARTED'
  | 'MILESTONE_CREATED'
  | 'MILESTONE_SUBMITTED'
  | 'MILESTONE_APPROVED'
  | 'MILESTONE_REJECTED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_SENT'
  | 'DISPUTE_OPENED'
  | 'DISPUTE_RESOLVED'
  | 'MESSAGE_RECEIVED'
  | 'SYSTEM_ALERT';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// ====== MILESTONES ======

export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'RELEASED';

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  sequenceOrder: number;
  status: MilestoneStatus;
  dueDate: string;
  fundedAt?: string;  // Added - when escrow was funded
  submittedAt?: string;
  approvedAt?: string;
  releasedAt?: string;
  deliverables?: string;
  completionNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestoneRequest {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
}

export interface UpdateMilestoneRequest {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
}

export interface SubmitMilestoneRequest {
  deliverables: string;
  notes: string;
}

export interface RejectMilestoneRequest {
  reason: string;
}

export interface MilestoneStatistics {
  totalMilestones: number;
  releasedMilestones: number;
  pendingMilestones: number;
  totalAmount: number;
  releasedAmount: number;
  pendingAmount: number;
}

// ====== MESSAGES ======

export type MessageType = 'TEXT' | 'FILE' | 'IMAGE';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  messageType: MessageType;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType: MessageType;
  attachmentUrl?: string;
}

export interface Conversation {
  id: string;
  jobId?: string;
  projectId?: string;
  createdAt: string;
  lastMessageAt: string;
  lastMessagePreview: string;
}

// ====== JOBS ======

export type JobStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';
export type ProjectType = 'FIXED_PRICE' | 'HOURLY';

export interface Job {
  id: string;
  employerId: string;
  employerName: string;
  title: string;
  description: string;
  projectType: ProjectType;  // Changed from type
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;  // Optional, defaults to USDT
  duration: string;
  deadline?: string;
  status: JobStatus;
  skills: string[];
  proposalCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  type: string;  // FIXED_PRICE or HOURLY
  budgetMin?: number;
  budgetMax?: number;
  duration: string;
  deadline?: string;
  skills: string[];
}

export interface UpdateJobRequest {
  title: string;
  description: string;
  type: string;
  budgetMin?: number;
  budgetMax?: number;
  duration: string;
  deadline?: string;
  skills: string[];
}

// ====== PROFILES ======

export interface FreelancerProfile {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  avatar: string;
  professionalTitle: string;
  bio: string;
  hourlyRate: number;
  availability: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  totalEarnings: number;
  jobsCompleted: number;
  avgRating: number;
  activeProjects: number;
  skills: string[]; // List of skill names
  createdAt: string;
  updatedAt: string;
}


export interface UpdateFreelancerProfileRequest {
  professionalTitle: string;
  bio: string;
  hourlyRate: number;
  availability: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  skills?: string[];
}

export interface EmployerProfile {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  avatar?: string;
  companyName: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
  jobsPosted: number;
  activeProjects: number;
  totalSpent: number;
  avgRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployerProfileRequest {
  companyName: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
}

export interface UpdateEmployerProfileRequest {
  companyName: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
}

// ====== PROJECTS ======

export type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

export interface Project {
  id: string;
  jobId: string;
  jobTitle: string;
  employerId: string;
  employerName: string;
  employerAvatar: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  awardedProposalId: string;
  agreedAmount: number;
  status: ProjectStatus;
  totalMilestones: number;
  completedMilestones: number;
  completionPercentage: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ====== FILES ======

export interface FileAttachment {
  id: string;
  uploadedBy: string;
  uploaderName: string;
  entityType: 'JOB' | 'PROPOSAL' | 'PROJECT' | 'MILESTONE';
  entityId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

// ====== DISPUTES ======

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';

export interface Dispute {
  id: string;
  projectId: string;
  projectTitle: string;
  raisedBy: string;
  raisedByName: string;
  reason: string;
  evidence: string;
  status: DisputeStatus;
  adminNotes?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolution?: string;
  refundAmount?: number;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisputeRequest {
  projectId: string;
  reason: string;
  evidence: string;
}

export interface ResolveDisputeRequest {
  resolution: string;
  refundAmount: number;
  adminNotes: string;
}

// ====== SKILLS ======

export interface Skill {
  id: string;
  name: string;
}

export interface CreateSkillRequest {
  name: string;
}

// ====== PAGINATION ======

export interface PageInfo {
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PageResponse<T> extends PageInfo {
  content: T[];
  pageable: {
    offset: number;
    pageSize: number;
    pageNumber: number;
    unpaged: boolean;
    paged: boolean;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
  };
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
}
