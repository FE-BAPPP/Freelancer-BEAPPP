import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Login } from "./pages/Auth/Login";
import { Register } from "./pages/Auth/EnhancedRegister"; // Using Enhanced Register
import { WalletPage } from "./pages/Wallet/WalletPage";
import { TransactionsPage } from "./pages/Transactions/TransactionsPage";
import { ProfilePage } from "./pages/Profile/ProfilePage";
import { AdminDashboardPage } from "./pages/Admin/AdminDashboardPage";
import { AdminTrackingPage } from "./pages/Admin/AdminTrackingPage";
import { AdminWithdrawalsPage } from "./pages/Admin/AdminWithdrawalsPage";
import AdminUsersPage from "./pages/Admin/AdminUserPage";
import { AdminSweepMonitoring } from "./pages/Admin/AdminSweepMonitoring";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthContext, useAuthProvider, useAuth } from "./hooks/useAuth";
import { ForgotPassword } from "./pages/Auth/ForgotPassword";
import { ResetPassword } from "./pages/Auth/ResetPassword";
import { NotificationContainer } from './components/notifications/NotificationContainer';
import { FreelancerDashboard } from './pages/Freelancer/FreelancerDashboard';
import { EmployerDashboard } from './pages/Employer/EmployerDashboard';
import { BrowseJobsPage } from './pages/Freelancer/BrowseJobsPage';
import { MyJobsPage } from './pages/Employer/MyJobsPage';
import { JobDetailPage } from './pages/Freelancer/JobDetailPage';
import { MyProposalsPage } from './pages/Freelancer/MyProposalsPage';
import { ViewProposalsPage } from './pages/Employer/ViewProposalsPage';
import { EmployerJobDetailPage } from './pages/Employer/EmployerJobDetailPage';
import { EditJobPage } from './pages/Employer/EditJobPage';
import { ProjectsPage } from './pages/Projects/ProjectsPage';
import { ProjectDetailPage } from './pages/Projects/ProjectDetailPage';
import { FreelancerProfilePage } from './pages/Freelancer/FreelancerProfilePage';
import { FreelancerPublicProfilePage } from './pages/Freelancer/FreelancerPublicProfilePage';
import { EmployerProfilePage } from './pages/Employer/EmployerProfilePage';
import { EmployerPublicProfilePage } from './pages/Employer/EmployerPublicProfilePage';
import { ManageMilestonesPage } from './pages/Projects/ManageMilestonesPage';
import { ChatPage } from './pages/Chat/ChatPage';
import { ReviewsPage } from './pages/Reviews/ReviewsPage';
import { HomePage } from './pages/Public/HomePage';

function AppRoutes() {
  const { role, user } = useAuth();

  return (
    <Routes>
      {/* ============= PUBLIC ROUTES (No login required) ============= */}
      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public landing page - accessible to everyone */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />

      {/* Public browse jobs/projects - anyone can view */}
      <Route path="/browse-jobs" element={<Layout><BrowseJobsPage /></Layout>} />

      {/* Public job detail - anyone can view */}
      <Route path="/jobs/:id" element={<Layout><JobDetailPage /></Layout>} />

      {/* Public freelancer profiles - anyone can view */}
      <Route path="/freelancer/profile/:freelancerId" element={<Layout><FreelancerPublicProfilePage /></Layout>} />

      {/* Public employer profiles - anyone can view */}
      <Route path="/employer/profile/:employerId" element={<Layout><EmployerPublicProfilePage /></Layout>} />

      {/* Redirect authenticated users from root to their dashboard */}
      <Route
        path="/dashboard"
        element={
          user ? (
            role === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> :
              role === 'FREELANCER' ? <Navigate to="/freelancer/dashboard" replace /> :
                role === 'EMPLOYER' ? <Navigate to="/employer/dashboard" replace /> :
                  <Navigate to="/login" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <Layout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="tracking" element={<AdminTrackingPage />} />
                <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="sweep-monitoring" element={<AdminSweepMonitoring />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 🆕 Freelancer routes */}
      <Route
        path="/freelancer/*"
        element={
          <ProtectedRoute requiredRole="FREELANCER">
            <Layout>
              <Routes>
                <Route path="dashboard" element={<FreelancerDashboard />} />
                <Route path="jobs" element={<BrowseJobsPage />} />
                <Route path="jobs/:id" element={<JobDetailPage />} />
                <Route path="my-proposals" element={<MyProposalsPage />} />
                <Route path="my-projects" element={<ProjectsPage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="reviews" element={<ReviewsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="freelancer-profile" element={<FreelancerProfilePage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Employer routes */}
      <Route
        path="/employer/*"
        element={
          <ProtectedRoute requiredRole="EMPLOYER">
            <Layout>
              <Routes>
                <Route path="dashboard" element={<EmployerDashboard />} />
                <Route path="my-jobs" element={<MyJobsPage />} />
                <Route path="jobs/:jobId" element={<EmployerJobDetailPage />} />
                <Route path="jobs/:jobId/edit" element={<EditJobPage />} />
                <Route path="jobs/:jobId/proposals" element={<ViewProposalsPage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="reviews" element={<ReviewsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="employer-profile" element={<EmployerProfilePage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 🆕 Project Routes (Both Employer & Freelancer) */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Employer-specific project routes */}
      <Route
        path="/employer/my-projects"
        element={
          <ProtectedRoute requiredRole="EMPLOYER">
            <Layout>
              <ProjectsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Freelancer-specific project routes */}
      <Route
        path="/freelancer/my-projects"
        element={
          <ProtectedRoute requiredRole="FREELANCER">
            <Layout>
              <ProjectsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 🆕 Public Freelancer Profile Route (accessible by all authenticated users) */}
      <Route
        path="/freelancer/profile/:freelancerId"
        element={
          <ProtectedRoute>
            <Layout>
              <FreelancerPublicProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 🆕 Employer Profile Route (accessible by all authenticated users) */}
      <Route
        path="/employer/profile/:employerId"
        element={
          <ProtectedRoute>
            <Layout>
              <EmployerPublicProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* 🆕 Milestone Management Route */}
      <Route
        path="/projects/:projectId/milestones"
        element={
          <ProtectedRoute>
            <Layout>
              <ManageMilestonesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 🆕 Chat Route */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Layout>
              <ChatPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const authValue = useAuthProvider();

  if (authValue.loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <AppRoutes />

          <NotificationContainer onBalanceUpdate={(balance) => {
            window.dispatchEvent(new CustomEvent('balanceUpdate', { detail: balance }));
          }} />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;