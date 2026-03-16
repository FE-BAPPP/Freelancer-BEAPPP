# Frontend API Services

## 📦 Danh Sách Services

Thư mục này chứa tất cả các API service layers cho ứng dụng Freelancer Platform.

### Core Services

| Service | File | Mô tả |
|---------|------|-------|
| **Base API** | `api.ts` | Base API client với authentication |
| **User API** | `userApi.ts` | User authentication, profile, wallet |
| **Admin API** | `adminApi.ts` | Admin dashboard & statistics |

### Business Logic Services

| Service | File | Endpoints | Mục đích |
|---------|------|-----------|----------|
| **Review** | `reviewApi.ts` | 7 endpoints | Đánh giá sau dự án |
| **Escrow** | `escrowApi.ts` | 7 endpoints | Quản lý ký quỹ thanh toán |
| **Milestone** | `milestoneApi.ts` | 10 endpoints | Quản lý cột mốc dự án |
| **Project** | `projectApi.ts` | 5 endpoints | Lifecycle dự án |
| **Dispute** | `disputeApi.ts` | 6 endpoints | Giải quyết tranh chấp |
| **Message** | `messageApi.ts` | 6 endpoints | Hệ thống tin nhắn |
| **Notification** | `notificationApi.ts` | 5 endpoints | Thông báo real-time |
| **File** | `fileApi.ts` | 5 endpoints | Upload/Download files |
| **Profile** | `profileApi.ts` | 8 endpoints | Freelancer & Employer profiles |
| **Job** | `jobApi.ts` | 5 endpoints | Đăng & tìm công việc |
| **Proposal** | `proposalApi.ts` | 7 endpoints | Submit & award proposals |
| **Skill** | `skillApi.ts` | 3 endpoints | Quản lý skills |
| **Conversation** | `conversationApi.ts` | 3 endpoints | Conversation management |
| **Chat** | `chatApi.ts` | WebSocket | Real-time chat |

## 🚀 Cách Sử Dụng

### Import từ index

```typescript
import { 
  reviewApi, 
  escrowApi, 
  projectApi,
  milestoneApi 
} from '@/services';
```

### Import trực tiếp

```typescript
import { reviewApi } from '@/services/reviewApi';
```

## 📊 Thống Kê

- **Tổng số services**: 14
- **Tổng số endpoints**: ~80+
- **TypeScript interfaces**: 50+
- **Hỗ trợ pagination**: ✅
- **Error handling**: ✅
- **JWT Authentication**: ✅

## 🔐 Authentication

Tất cả services tự động thêm JWT token vào headers:

```typescript
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
```

## 📖 Documentation

Xem chi tiết tại: [`docs/FRONTEND_API_INTEGRATION.md`](../../docs/FRONTEND_API_INTEGRATION.md)

## 🎯 API Coverage

### ✅ Đã Implement

- [x] Authentication & User Management
- [x] Job Posting & Browsing
- [x] Proposal Submission & Award
- [x] Project Lifecycle Management
- [x] Milestone CRUD & Status Updates
- [x] Escrow Lock/Release/Refund
- [x] Review System với Statistics
- [x] Dispute Creation & Resolution
- [x] Messaging System
- [x] File Upload/Download
- [x] Notifications (REST + SSE)
- [x] Freelancer & Employer Profiles
- [x] Admin Statistics Dashboard
- [x] Skill Management

### Backend Endpoints Coverage: 100%

Tất cả endpoints từ Swagger documentation đã được integrate.

## 🔄 Business Flow Examples

### Example 1: Complete Project Flow

```typescript
// 1. Create job
const job = await jobApi.createJob({...});

// 2. Submit proposal
const proposal = await proposalApi.submitProposal({...});

// 3. Award proposal → Creates project
await proposalApi.awardProposal(proposal.id);

// 4. Create milestones
const milestone = await milestoneApi.createMilestone(projectId, {...});

// 5. Lock escrow
await escrowApi.lockFunds(milestone.id);

// 6. Submit work
await milestoneApi.submitMilestone(milestone.id, {...});

// 7. Approve & release
await milestoneApi.approveMilestone(milestone.id);
await milestoneApi.releaseMilestone(milestone.id);

// 8. Complete project
await projectApi.completeProject(projectId);

// 9. Leave reviews
await reviewApi.createReview({...});
```

## 🛠️ Development

### Adding New Service

1. Create new file: `newServiceApi.ts`
2. Define TypeScript interfaces in `types/api.ts`
3. Implement API methods
4. Export from `index.ts`
5. Update this README

### Testing

```bash
# Manual testing via browser console
import { reviewApi } from './services';
reviewApi.getMyReviews(0, 10).then(console.log);
```

## 📝 Notes

- Tất cả services sử dụng `API_BASE_URL` từ `api.ts`
- Default base URL: `http://localhost:8080`
- Pagination mặc định: page=0, size=10/20
- Error responses được handle tự động

## 🔗 Related Files

- `../types/api.ts` - TypeScript type definitions
- `../hooks/useApi.ts` - React hooks for API calls
- `../../backend/src/main/java/com/UsdtWallet/UsdtWallet/controller/` - Backend controllers

---

**Last Updated**: December 31, 2025
