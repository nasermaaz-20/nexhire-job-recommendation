import { createBrowserRouter } from 'react-router-dom';

// Public pages
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import JobSearch from '../pages/public/JobSearch';

// Job Seeker pages
import JobSeekerDashboard from '../pages/jobseeker/Dashboard';
import Recommendations from '../pages/jobseeker/Recommendations';
import Applications from '../pages/jobseeker/Applications';
import JobSeekerProfile from '../pages/jobseeker/Profile';

// Company pages
import CompanyDashboard from '../pages/company/Dashboard';
import PostJob from '../pages/company/PostJob';
import ManageJobs from '../pages/company/ManageJobs';
import Applicants from '../pages/company/Applicants';
import CompanyProfile from '../pages/company/CompanyProfile';

// Admin pages
import AdminDashboard from '../pages/admin/Dashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageCompanies from '../pages/admin/ManageCompanies';
import AdminManageJobs from '../pages/admin/ManageJobs';
import Analytics from '../pages/admin/Analytics';

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/jobs',
    element: <JobSearch />,
  },
  
  // Job Seeker routes
  {
    path: '/jobseeker',
    children: [
      {
        path: 'dashboard',
        element: <JobSeekerDashboard />,
      },
      {
        path: 'recommendations',
        element: <Recommendations />,
      },
      {
        path: 'applications',
        element: <Applications />,
      },
      {
        path: 'profile',
        element: <JobSeekerProfile />,
      },
    ],
  },
  
  // Company routes
  {
    path: '/company',
    children: [
      {
        path: 'dashboard',
        element: <CompanyDashboard />,
      },
      {
        path: 'post-job',
        element: <PostJob />,
      },
      {
        path: 'manage-jobs',
        element: <ManageJobs />,
      },
      {
        path: 'applicants',
        element: <Applicants />,
      },
      {
        path: 'profile',
        element: <CompanyProfile />,
      },
    ],
  },
  
  // Admin routes
  {
    path: '/admin',
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'users',
        element: <ManageUsers />,
      },
      {
        path: 'companies',
        element: <ManageCompanies />,
      },
      {
        path: 'jobs',
        element: <AdminManageJobs />,
      },
      {
        path: 'analytics',
        element: <Analytics />,
      },
    ],
  },
]);
