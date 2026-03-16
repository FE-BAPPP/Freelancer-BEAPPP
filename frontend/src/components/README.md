# Components Documentation

## Overview
This directory contains all reusable React components organized by feature.

## Directory Structure

```
components/
├── Admin/              # Admin-specific components
├── Chat/               # Chat and messaging components
├── Escrow/            # Payment escrow components
├── FileAttachments/   # File upload and management
├── Layout/            # Layout components (Header, Sidebar)
├── Milestones/        # Milestone management
├── notifications/     # Notification system
├── Proposals/         # Proposal submission
├── ProtectedRoute.tsx # Route protection
└── Reviews/           # Review system
```

---

## Component Categories

### 🔐 Authentication & Authorization
- **ProtectedRoute.tsx**: Protects routes based on user roles

### 🎨 Layout
- **Header.tsx**: Main navigation header with notifications
- **Layout.tsx**: Overall page layout wrapper
- **Sidebar.tsx**: Side navigation menu

### 💬 Communication
- **Chat/**: Real-time chat components
  - ChatButton.tsx - Quick chat access
  - ChatWindow.tsx - Main chat interface
  - MessageBubble.tsx - Individual messages
  - MessageInput.tsx - Message input field
  - MessageList.tsx - Message history

### 💰 Payment & Escrow
- **Escrow/**: Payment escrow display
  - EscrowCard.tsx - Full escrow details
  - EscrowStatusBadge.tsx - Compact status indicator

### 📋 Project Management
- **Milestones/**: Milestone components
  - MilestoneCard.tsx - Milestone display with actions
  - SubmitWorkModal.tsx - Submit work modal
  - RejectMilestoneModal.tsx - Rejection feedback modal

- **Proposals/**: Proposal submission
  - SubmitProposalModal.tsx - Create/submit proposals

### ⭐ Reviews
- **Reviews/**: Review system
  - ReviewCard.tsx - Individual review display
  - ReviewForm.tsx - Create review modal
  - ReviewList.tsx - List of reviews
  - ReviewStatistics.tsx - Aggregate statistics

### 🔔 Notifications
- **notifications/**: Real-time notifications
  - NotificationBell.tsx - Bell icon with badge
  - NotificationDropdown.tsx - Notification list
  - NotificationContainer.tsx - Toast container
  - NotificationToast.tsx - Toast messages

### 📎 File Management
- **FileAttachments/**: File upload and display
  - (Ready for fileApi integration)

### 👨‍💼 Admin
- **Admin/**: Admin-specific components
  - (Admin dashboard components)

---

## Usage Examples

### Layout Components
```tsx
import { Layout } from '@/components/Layout';

function App() {
  return (
    <Layout>
      <YourContent />
    </Layout>
  );
}
```

### Review System
```tsx
import { ReviewForm, ReviewList, ReviewStatistics } from '@/components/Reviews';

function ProjectPage() {
  return (
    <>
      <ReviewStatistics userId={userId} />
      <ReviewList projectId={projectId} />
      {canReview && (
        <ReviewForm
          projectId={projectId}
          revieweeId={revieweeId}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      )}
    </>
  );
}
```

### Escrow Display
```tsx
import { EscrowCard, EscrowStatusBadge } from '@/components/Escrow';

function MilestoneView() {
  return (
    <>
      <EscrowCard escrow={escrowData} />
      <EscrowStatusBadge status="LOCKED" amount={1000} currency="USDT" />
    </>
  );
}
```

### Notifications
```tsx
import { NotificationBell, NotificationDropdown } from '@/components/notifications';

function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  
  return (
    <>
      <NotificationBell onClick={() => setShowNotifications(true)} />
      <NotificationDropdown
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
```

### Milestones
```tsx
import { MilestoneCard, SubmitWorkModal } from '@/components/Milestones';

function ProjectDetail() {
  return (
    <>
      {milestones.map(milestone => (
        <MilestoneCard
          key={milestone.id}
          milestone={milestone}
          isFreelancer={isFreelancer}
          isEmployer={isEmployer}
          onStartMilestone={handleStart}
          onSubmitWork={handleSubmit}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}
    </>
  );
}
```

---

## Component Props

### Common Patterns

#### Modal Components
All modal components follow this pattern:
```tsx
interface ModalProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  // ... specific props
}
```

#### Card Components
All card components follow this pattern:
```tsx
interface CardProps {
  data: DataType;
  className?: string;
  onClick?: () => void;
}
```

#### List Components
All list components follow this pattern:
```tsx
interface ListProps {
  items?: ItemType[];
  loading?: boolean;
  onItemClick?: (item: ItemType) => void;
}
```

---

## Styling

All components use:
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

### Color Scheme
```css
/* Status Colors */
.status-completed: text-green-400 bg-green-500/20
.status-in-progress: text-blue-400 bg-blue-500/20
.status-pending: text-yellow-400 bg-yellow-500/20
.status-rejected: text-red-400 bg-red-500/20

/* Gradients */
.gradient-primary: from-yellow-600 to-yellow-500
.gradient-secondary: from-purple-500 to-blue-500
.gradient-success: from-green-600 to-green-500
```

---

## State Management

### Local State
Most components use local state with `useState`:
```tsx
const [data, setData] = useState<DataType | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### Data Loading Pattern
```tsx
useEffect(() => {
  async function loadData() {
    try {
      setLoading(true);
      const response = await api.getData();
      setData(response.data || response);
    } catch (error) {
      console.error('Failed to load:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }
  loadData();
}, [dependency]);
```

---

## Best Practices

### 1. Error Handling
Always wrap API calls in try-catch:
```tsx
try {
  const response = await api.getData();
  setData(response.data);
} catch (error) {
  console.error('Error:', error);
  // Show error to user
}
```

### 2. Loading States
Always show loading indicators:
```tsx
if (loading) {
  return <LoadingSpinner />;
}
```

### 3. Empty States
Always handle empty data:
```tsx
if (items.length === 0) {
  return <EmptyState message="No items found" />;
}
```

### 4. Cleanup
Always cleanup subscriptions:
```tsx
useEffect(() => {
  const unsubscribe = subscribe();
  return () => unsubscribe();
}, []);
```

---

## Testing

### Component Testing
```bash
# Run tests
npm test

# Run specific test
npm test ComponentName
```

### Integration Testing
```bash
# Run all integration tests
npm run test:integration
```

---

## Contributing

When adding new components:

1. **Create component file**: `ComponentName.tsx`
2. **Add TypeScript types**: Define props interface
3. **Implement component**: Follow existing patterns
4. **Add to barrel export**: Update `index.ts`
5. **Document usage**: Add to this README
6. **Add tests**: Create `ComponentName.test.tsx`

---

## API Integration

Components integrate with these services:
- `reviewApi` - Review system
- `escrowApi` - Payment escrow
- `notificationApi` - Notifications
- `projectApi` - Projects
- `milestoneApi` - Milestones
- `disputeApi` - Disputes

See `services/README.md` for API documentation.

---

## Performance

### Optimizations Applied
- ✅ Lazy loading of modals
- ✅ Memoization of expensive computations
- ✅ Debounced inputs
- ✅ Virtualized long lists
- ✅ Image lazy loading
- ✅ Code splitting

### Performance Tips
```tsx
// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => computeExpensive(data), [data]);

// Use useCallback for stable function references
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

---

## Accessibility

All components follow accessibility best practices:
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Color contrast
- ✅ Screen reader support

---

## Future Components

Planned components:
- [ ] FileUploadDropzone
- [ ] AdvancedFilters
- [ ] DataExport
- [ ] ChartComponents
- [ ] AdminDashboard widgets
- [ ] ProfileEditor
- [ ] SkillSelector
- [ ] PortfolioGallery

---

## Support

For questions or issues:
1. Check component documentation
2. Review usage examples
3. Check API integration guide
4. Contact development team
