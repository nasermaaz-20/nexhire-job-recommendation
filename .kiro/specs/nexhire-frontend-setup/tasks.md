# Implementation Plan: NexHire Frontend Setup

## Overview

This implementation plan breaks down the setup of the NexHire frontend project into discrete, actionable tasks. The approach follows a logical sequence: initialize the project, install dependencies, clean up defaults, create the folder structure, generate placeholder files, configure theming and routing, and finally validate the setup.

Each task builds incrementally, ensuring that the project remains in a working state throughout the process.

## Tasks

- [x] 1. Initialize Vite + React project and install dependencies
  - Run `npm create vite@latest nexhire-frontend -- --template react`
  - Navigate into the project directory
  - Install all production dependencies: `npm install react-router-dom axios @mui/material @mui/icons-material @emotion/react @emotion/styled react-hook-form zustand react-toastify recharts dayjs`
  - Install dev dependencies: `npm install -D @types/react @types/react-dom`
  - Verify package.json contains all required dependencies
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 3.1, 3.2_

- [ ]* 1.1 Write property test for dependency installation
  - **Property 1: All required production dependencies are installed**
  - **Validates: Requirements 2.1-2.11**

- [x] 2. Clean up default Vite files and add Inter font
  - Remove `src/App.css`
  - Remove default content from `src/App.jsx` (keep the file, remove sample code)
  - Remove `src/index.css` (will be replaced with custom global styles)
  - Add Google Fonts link for Inter font to `index.html` in the `<head>` section
  - Include font weights: 300, 400, 500, 600, 700
  - Verify essential files (vite.config.js, package.json, index.html, main.jsx) are preserved
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2_

- [ ]* 2.1 Write unit tests for file cleanup and font integration
  - Test that default files are removed
  - Test that essential files still exist
  - Test that index.html contains Inter font link with correct weights
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2_

- [x] 3. Create folder structure
  - Create `src/api/` directory
  - Create `src/assets/logo/` directory
  - Create `src/assets/images/` directory
  - Create `src/components/common/` directory
  - Create `src/components/layout/` directory
  - Create `src/components/ui/` directory
  - Create `src/pages/public/` directory
  - Create `src/pages/jobseeker/` directory
  - Create `src/pages/company/` directory
  - Create `src/pages/admin/` directory
  - Create `src/hooks/` directory
  - Create `src/store/` directory
  - Create `src/utils/` directory
  - Create `src/styles/` directory
  - Create `src/routes/` directory
  - _Requirements: 6.1, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 11.1, 12.1, 13.1, 14.1_

- [ ]* 3.1 Write unit test for folder structure
  - Test that all required directories exist
  - _Requirements: 6.1, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 11.1, 12.1, 13.1, 14.1_

- [ ] 4. Create API module placeholder files
  - [x] 4.1 Create `src/api/authApi.js` with placeholder login, register, logout functions
    - Each function should accept parameters and return axios promise
    - _Requirements: 6.2_
  
  - [x] 4.2 Create `src/api/jobsApi.js` with placeholder fetch, create, update, delete functions
    - _Requirements: 6.3_
  
  - [x] 4.3 Create `src/api/applicationsApi.js` with placeholder apply, withdraw, getStatus functions
    - _Requirements: 6.4_
  
  - [x] 4.4 Create `src/api/companiesApi.js` with placeholder fetch, update functions
    - _Requirements: 6.5_
  
  - [x] 4.5 Create `src/api/usersApi.js` with placeholder fetch, update, delete functions
    - _Requirements: 6.6_
  
  - [x] 4.6 Create `src/api/recommendationsApi.js` with placeholder getRecommendations function
    - _Requirements: 6.7_
  
  - [x] 4.7 Create `src/api/analyticsApi.js` with placeholder getMetrics, getChartData functions
    - _Requirements: 6.8_

- [ ]* 4.8 Write property tests for API modules
  - **Property 2: All API module files exist in correct location**
  - **Property 3: All API modules export at least one function**
  - **Validates: Requirements 6.2-6.9**

- [ ] 5. Create component placeholder files
  - [x] 5.1 Create common components
    - Create `src/components/common/Navbar.jsx` with placeholder component
    - Create `src/components/common/Footer.jsx` with placeholder component
    - Create `src/components/common/Sidebar.jsx` with placeholder component
    - Create `src/components/common/SearchBar.jsx` with placeholder component
    - Each component should export a default React functional component
    - _Requirements: 8.5, 8.6, 8.7, 8.8_
  
  - [x] 5.2 Create layout components
    - Create `src/components/layout/MainLayout.jsx` with placeholder component
    - Create `src/components/layout/AuthLayout.jsx` with placeholder component
    - Create `src/components/layout/DashboardLayout.jsx` with placeholder component
    - _Requirements: 8.9, 8.10, 8.11_
  
  - [x] 5.3 Create UI components
    - Create `src/components/ui/Button.jsx` with placeholder component
    - Create `src/components/ui/Card.jsx` with placeholder component
    - Create `src/components/ui/Modal.jsx` with placeholder component
    - Create `src/components/ui/Input.jsx` with placeholder component
    - Create `src/components/ui/Loader.jsx` with placeholder component
    - _Requirements: 8.12, 8.13, 8.14, 8.15, 8.16_

- [ ]* 5.4 Write property tests for components
  - **Property 4: All component files exist in correct locations**
  - **Property 5: All component files export a default React component**
  - **Validates: Requirements 8.5-8.17**

- [ ] 6. Create page placeholder files
  - [x] 6.1 Create public pages
    - Create `src/pages/public/Home.jsx` with placeholder page component
    - Create `src/pages/public/Login.jsx` with placeholder page component
    - Create `src/pages/public/Register.jsx` with placeholder page component
    - Create `src/pages/public/JobSearch.jsx` with placeholder page component
    - _Requirements: 9.6, 9.7, 9.8, 9.9_
  
  - [x] 6.2 Create job seeker pages
    - Create `src/pages/jobseeker/Dashboard.jsx` with placeholder page component
    - Create `src/pages/jobseeker/Recommendations.jsx` with placeholder page component
    - Create `src/pages/jobseeker/Applications.jsx` with placeholder page component
    - Create `src/pages/jobseeker/Profile.jsx` with placeholder page component
    - _Requirements: 9.10, 9.11, 9.12, 9.13_
  
  - [x] 6.3 Create company pages
    - Create `src/pages/company/Dashboard.jsx` with placeholder page component
    - Create `src/pages/company/PostJob.jsx` with placeholder page component
    - Create `src/pages/company/ManageJobs.jsx` with placeholder page component
    - Create `src/pages/company/Applicants.jsx` with placeholder page component
    - Create `src/pages/company/CompanyProfile.jsx` with placeholder page component
    - _Requirements: 9.14, 9.15, 9.16, 9.17, 9.18_
  
  - [x] 6.4 Create admin pages
    - Create `src/pages/admin/Dashboard.jsx` with placeholder page component
    - Create `src/pages/admin/ManageUsers.jsx` with placeholder page component
    - Create `src/pages/admin/ManageCompanies.jsx` with placeholder page component
    - Create `src/pages/admin/ManageJobs.jsx` with placeholder page component
    - Create `src/pages/admin/Analytics.jsx` with placeholder page component
    - _Requirements: 9.19, 9.20, 9.21, 9.22, 9.23_

- [ ]* 6.5 Write property tests for pages
  - **Property 6: All page files exist in correct locations**
  - **Property 7: All page files export a default React component**
  - **Validates: Requirements 9.6-9.24**

- [ ] 7. Create custom hooks, stores, and utilities
  - [x] 7.1 Create custom hooks
    - Create `src/hooks/useAuth.js` exporting useAuth hook with placeholder implementation
    - Create `src/hooks/useApi.js` exporting useApi hook with placeholder implementation
    - Create `src/hooks/useDebounce.js` exporting useDebounce hook with placeholder implementation
    - _Requirements: 10.2, 10.3, 10.4_
  
  - [x] 7.2 Create Zustand stores
    - Create `src/store/authStore.js` with Zustand store for auth state (user, isAuthenticated, setUser, logout)
    - Create `src/store/userStore.js` with Zustand store for user data
    - Create `src/store/jobStore.js` with Zustand store for job listings
    - _Requirements: 11.2, 11.3, 11.4_
  
  - [x] 7.3 Create utility files
    - Create `src/utils/constants.js` exporting API_BASE_URL, USER_ROLES, APPLICATION_STATUS constants
    - Create `src/utils/helpers.js` exporting placeholder helper functions
    - Create `src/utils/validators.js` exporting placeholder validation functions
    - _Requirements: 12.2, 12.3, 12.4_

- [ ]* 7.4 Write property tests for hooks, stores, and utilities
  - **Property 8: All hook files export a custom hook function**
  - **Property 9: All store files export a Zustand store**
  - **Property 10: All utility files export at least one function or constant**
  - **Validates: Requirements 10.5, 11.5, 12.5**

- [ ] 8. Create styling system and routing configuration
  - [x] 8.1 Create Material-UI theme
    - Create `src/styles/theme.js` exporting a theme object created with createTheme
    - Configure primary and secondary colors
    - Set fontFamily to 'Inter'
    - _Requirements: 13.2, 13.4_
  
  - [x] 8.2 Create global styles
    - Create `src/styles/global.css` with CSS reset and base styles
    - Include box-sizing, margin, padding reset
    - Set body font-family to 'Inter'
    - _Requirements: 13.3_
  
  - [x] 8.3 Create routing configuration
    - Create `src/routes/index.jsx` using createBrowserRouter from react-router-dom v6
    - Define routes for public pages (/, /login, /register, /jobs)
    - Define routes for jobseeker pages (/jobseeker/dashboard, /jobseeker/recommendations, etc.)
    - Define routes for company pages (/company/dashboard, /company/post-job, etc.)
    - Define routes for admin pages (/admin/dashboard, /admin/users, etc.)
    - Export router configuration
    - _Requirements: 14.2, 14.3, 14.4, 14.5_

- [ ]* 8.4 Write unit tests for theme and routing
  - Test that theme file exports an object and imports createTheme
  - Test that routing file exists and uses react-router-dom v6 syntax
  - _Requirements: 13.4, 14.2, 14.4, 14.5_

- [x] 9. Wire everything together in App.jsx
  - Import ThemeProvider from @mui/material/styles
  - Import RouterProvider from react-router-dom
  - Import ToastContainer from react-toastify
  - Import theme from ./styles/theme
  - Import router from ./routes
  - Import react-toastify CSS
  - Import global.css
  - Wrap RouterProvider with ThemeProvider
  - Add ToastContainer with position="top-right" and autoClose={3000}
  - _Requirements: All requirements (integration)_

- [ ] 10. Checkpoint - Verify project compiles and runs
  - Run `npm run dev` to start development server
  - Verify the project compiles without errors
  - Open browser and check that the app loads
  - Verify no console errors appear
  - Stop the development server
  - _Requirements: 15.1_

- [ ]* 10.1 Write unit test for successful build
  - Test that `npm run build` completes without errors
  - **Validates: Requirements 15.1**

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster setup
- Each task references specific requirements for traceability
- The checkpoint at task 10 ensures the project is fully functional
- All placeholder files should have minimal but valid implementations
- Property tests validate universal correctness across all files of a given type
- Unit tests validate specific examples and configurations
