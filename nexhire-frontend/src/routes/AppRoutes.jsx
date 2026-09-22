import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { USER_ROLES } from '../utils/constants';

// Public pages
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import SignUpPage from '../pages/public/SignUpPage';

// Job Seeker pages
import Dashboard from '../pages/jobseeker/Dashboard';
import Recommendations from '../pages/jobseeker/Recommendations';
import JobSearch from '../pages/jobseeker/JobSearch';
import JobDetails from '../pages/jobseeker/JobDetails';
import MyApplications from '../pages/jobseeker/MyApplications';
import SavedJobs from '../pages/jobseeker/SavedJobs';
import Profile from '../pages/jobseeker/Profile';
import Settings from '../pages/jobseeker/Settings';

// Company pages
import CompanyDashboard from '../pages/company/CompanyDashboard';
import PostJob from '../pages/company/PostJob';
import MyJobPosts from '../pages/company/MyJobPosts';
import ApplicantsManagement from '../pages/company/ApplicantsManagement';
import CompanyProfile from '../pages/company/CompanyProfile';
import CompanySettings from '../pages/company/CompanySettings';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UsersManagement from '../pages/admin/UsersManagement';
import CompaniesManagement from '../pages/admin/CompaniesManagement';
import JobsManagement from '../pages/admin/JobsManagement';
import SkillsFieldsManagement from '../pages/admin/SkillsFieldsManagement';
import Analytics from '../pages/admin/Analytics';

// 404
import NotFoundPage from '../pages/public/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Job Seeker Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recommendations"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <Recommendations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <JobSearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <JobDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <MyApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved-jobs"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <SavedJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Company Routes */}
      <Route
        path="/company/dashboard"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.COMPANY]}>
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/post-job"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.COMPANY]}>
            <PostJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/my-jobs"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.COMPANY]}>
            <MyJobPosts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/applicants/:jobId"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.COMPANY]}>
            <ApplicantsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/profile"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.COMPANY]}>
            <CompanyProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/settings"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.COMPANY]}>
            <CompanySettings />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <UsersManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/companies"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <CompaniesManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <JobsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/skills-fields"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <SkillsFieldsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
