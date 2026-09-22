# Design Document: NexHire Frontend Setup

## Overview

This design outlines the setup and initialization of the NexHire frontend project, a React-based web application built with Vite. The project will serve as a LinkedIn-style professional job recommendation platform supporting three user roles: Job Seekers, Companies, and Admins.

The setup process involves:
1. Initializing a Vite + React project
2. Installing production and development dependencies
3. Creating a comprehensive folder structure
4. Generating placeholder files for all components, pages, and modules
5. Configuring theming and routing
6. Ensuring the project runs without errors

This is a project scaffolding task focused on establishing the foundation for future feature development.

## Architecture

### Technology Stack

**Build Tool:** Vite 5.x
- Fast HMR (Hot Module Replacement)
- Optimized production builds
- Native ES modules support

**Framework:** React 18.x
- Component-based architecture
- Hooks for state and side effects
- Virtual DOM for efficient rendering

**Language:** JavaScript (with optional TypeScript support)

**Key Libraries:**
- **Routing:** react-router-dom v6+ (declarative routing)
- **HTTP Client:** axios (promise-based HTTP requests)
- **UI Framework:** Material-UI v5 (comprehensive component library)
- **Styling:** Emotion (CSS-in-JS for Material-UI)
- **Forms:** react-hook-form (performant form validation)
- **State Management:** Zustand (lightweight state management)
- **Notifications:** react-toastify (toast notifications)
- **Charts:** recharts (composable charting library)
- **Dates:** dayjs (lightweight date manipulation)

### Project Structure

```
nexhire-frontend/
├── public/                 # Static assets
├── src/
│   ├── api/               # API request modules (7 files)
│   ├── assets/            # Images and logos
│   │   ├── logo/
│   │   └── images/
│   ├── components/        # Reusable components
│   │   ├── common/        # Shared components (Navbar, Footer, etc.)
│   │   ├── layout/        # Layout wrappers
│   │   └── ui/            # Basic UI elements
│   ├── pages/             # Page components
│   │   ├── public/        # Unauthenticated pages
│   │   ├── jobseeker/     # Job seeker pages
│   │   ├── company/       # Company pages
│   │   └── admin/         # Admin pages
│   ├── hooks/             # Custom React hooks
│   ├── store/             # Zustand state stores
│   ├── utils/             # Helper functions
│   ├── styles/            # Theme and global styles
│   ├── routes/            # Routing configuration
│   ├── App.jsx            # Root component
│   └── main.jsx           # Entry point
├── index.html             # HTML template
├── package.json           # Dependencies
└── vite.config.js         # Vite configuration
```

### Architectural Patterns

**Component Organization:**
- **Pages:** Full-screen views mapped to routes
- **Layouts:** Wrapper components providing consistent structure
- **Common Components:** Shared across multiple pages (Navbar, Footer)
- **UI Components:** Basic reusable elements (Button, Card, Input)

**State Management Strategy:**
- **Local State:** Component-level state using useState
- **Global State:** Cross-component state using Zustand stores
- **Server State:** API data managed through custom hooks

**API Layer:**
- Centralized API modules organized by domain
- Axios instance configuration for base URL and interceptors
- Consistent error handling across all requests

## Components and Interfaces

### 1. Project Initialization Module

**Responsibility:** Create the base Vite + React project

**Implementation:**
```bash
npm create vite@latest nexhire-frontend -- --template react
cd nexhire-frontend
npm install
```

**Output:** 
- Project directory with Vite configuration
- Default React template files
- package.json with base dependencies

### 2. Dependency Installation Module

**Responsibility:** Install all required packages

**Production Dependencies:**
```json
{
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.0",
  "@mui/material": "^5.14.0",
  "@mui/icons-material": "^5.14.0",
  "@emotion/react": "^11.11.0",
  "@emotion/styled": "^11.11.0",
  "react-hook-form": "^7.48.0",
  "zustand": "^4.4.0",
  "react-toastify": "^9.1.0",
  "recharts": "^2.10.0",
  "dayjs": "^1.11.0"
}
```

**Dev Dependencies:**
```json
{
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0"
}
```

**Installation Command:**
```bash
npm install react-router-dom axios @mui/material @mui/icons-material @emotion/react @emotion/styled react-hook-form zustand react-toastify recharts dayjs
npm install -D @types/react @types/react-dom
```

### 3. File Cleanup Module

**Responsibility:** Remove unnecessary default Vite files

**Files to Remove:**
- `src/App.css`
- `src/index.css` (will be replaced with custom global styles)
- Default logo and SVG files
- Sample component code in `App.jsx`

**Files to Preserve:**
- `vite.config.js`
- `package.json`
- `index.html`
- `main.jsx` (entry point)

### 4. Font Integration Module

**Responsibility:** Add Inter font to index.html

**Implementation:**
```html
<!-- In index.html <head> section -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### 5. API Modules

**Responsibility:** Create placeholder API request functions

**Module Structure:**
Each API module exports functions for HTTP requests:

```javascript
// api/authApi.js
import axios from 'axios';

export const login = async (credentials) => {
  // Placeholder implementation
  return axios.post('/api/auth/login', credentials);
};

export const register = async (userData) => {
  return axios.post('/api/auth/register', userData);
};

export const logout = async () => {
  return axios.post('/api/auth/logout');
};
```

**API Modules to Create:**
1. `authApi.js` - Authentication (login, register, logout)
2. `jobsApi.js` - Job operations (fetch, create, update, delete)
3. `applicationsApi.js` - Application management (apply, withdraw, status)
4. `companiesApi.js` - Company operations (fetch, update profile)
5. `usersApi.js` - User management (fetch, update, delete)
6. `recommendationsApi.js` - Job recommendations (fetch personalized jobs)
7. `analyticsApi.js` - Analytics data (fetch metrics, charts)

### 6. Component Modules

**Responsibility:** Create placeholder React components

**Component Template:**
```javascript
// components/common/Navbar.jsx
import React from 'react';

const Navbar = () => {
  return (
    <nav>
      <h1>Navbar Placeholder</h1>
    </nav>
  );
};

export default Navbar;
```

**Components to Create:**

**Common Components:**
- `Navbar.jsx` - Top navigation bar
- `Footer.jsx` - Page footer
- `Sidebar.jsx` - Side navigation
- `SearchBar.jsx` - Job search input

**Layout Components:**
- `MainLayout.jsx` - General page layout
- `AuthLayout.jsx` - Login/register layout
- `DashboardLayout.jsx` - Dashboard wrapper

**UI Components:**
- `Button.jsx` - Custom button
- `Card.jsx` - Content card
- `Modal.jsx` - Modal dialog
- `Input.jsx` - Form input
- `Loader.jsx` - Loading spinner

### 7. Page Modules

**Responsibility:** Create placeholder page components

**Page Template:**
```javascript
// pages/public/Home.jsx
import React from 'react';

const Home = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to NexHire</p>
    </div>
  );
};

export default Home;
```

**Pages to Create:**

**Public Pages:**
- `Home.jsx` - Landing page
- `Login.jsx` - Login form
- `Register.jsx` - Registration form
- `JobSearch.jsx` - Public job search

**Job Seeker Pages:**
- `Dashboard.jsx` - Job seeker dashboard
- `Recommendations.jsx` - Personalized job recommendations
- `Applications.jsx` - Application tracking
- `Profile.jsx` - User profile management

**Company Pages:**
- `Dashboard.jsx` - Company dashboard
- `PostJob.jsx` - Job posting form
- `ManageJobs.jsx` - Job listings management
- `Applicants.jsx` - Applicant review
- `CompanyProfile.jsx` - Company profile management

**Admin Pages:**
- `Dashboard.jsx` - Admin dashboard
- `ManageUsers.jsx` - User management
- `ManageCompanies.jsx` - Company management
- `ManageJobs.jsx` - Job moderation
- `Analytics.jsx` - Platform analytics

### 8. Custom Hooks

**Responsibility:** Create reusable React hooks

**Hook Template:**
```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Placeholder implementation
  useEffect(() => {
    setLoading(false);
  }, []);

  return { user, loading };
};
```

**Hooks to Create:**
- `useAuth.js` - Authentication state and methods
- `useApi.js` - Generic API request hook
- `useDebounce.js` - Debounce input values

### 9. State Stores

**Responsibility:** Create Zustand stores for global state

**Store Template:**
```javascript
// store/authStore.js
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

**Stores to Create:**
- `authStore.js` - Authentication state
- `userStore.js` - User data
- `jobStore.js` - Job listings and filters

### 10. Utility Modules

**Responsibility:** Create helper functions and constants

**Utility Template:**
```javascript
// utils/constants.js
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const USER_ROLES = {
  JOB_SEEKER: 'jobseeker',
  COMPANY: 'company',
  ADMIN: 'admin',
};

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
};
```

**Utilities to Create:**
- `constants.js` - Application constants
- `helpers.js` - General helper functions
- `validators.js` - Form validation functions

### 11. Styling System

**Responsibility:** Configure Material-UI theme and global styles

**Theme Configuration:**
```javascript
// styles/theme.js
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});
```

**Global Styles:**
```css
/* styles/global.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 12. Routing Configuration

**Responsibility:** Define application routes

**Router Setup:**
```javascript
// routes/index.jsx
import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
// ... other imports

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/jobseeker',
    children: [
      { path: 'dashboard', element: <JobSeekerDashboard /> },
      { path: 'recommendations', element: <Recommendations /> },
      // ... other routes
    ],
  },
  // ... other route groups
]);
```

### 13. Root Application Component

**Responsibility:** Wire together theme, router, and global providers

**App Component:**
```javascript
// App.jsx
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import { theme } from './styles/theme';
import { router } from './routes';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
}

export default App;
```

## Data Models

### Folder Structure Model

The folder structure is the primary "data model" for this setup task. It defines the organization of all files:

```
Directory Tree:
├── api/                    (7 files)
├── assets/
│   ├── logo/              (empty, ready for assets)
│   └── images/            (empty, ready for assets)
├── components/
│   ├── common/            (4 files: Navbar, Footer, Sidebar, SearchBar)
│   ├── layout/            (3 files: MainLayout, AuthLayout, DashboardLayout)
│   └── ui/                (5 files: Button, Card, Modal, Input, Loader)
├── pages/
│   ├── public/            (4 files: Home, Login, Register, JobSearch)
│   ├── jobseeker/         (4 files: Dashboard, Recommendations, Applications, Profile)
│   ├── company/           (5 files: Dashboard, PostJob, ManageJobs, Applicants, CompanyProfile)
│   └── admin/             (5 files: Dashboard, ManageUsers, ManageCompanies, ManageJobs, Analytics)
├── hooks/                 (3 files: useAuth, useApi, useDebounce)
├── store/                 (3 files: authStore, userStore, jobStore)
├── utils/                 (3 files: constants, helpers, validators)
├── styles/                (2 files: theme, global.css)
└── routes/                (1 file: index)
```

**Total Files to Create:** ~50 placeholder files

### Package Dependency Model

The dependency model defines the relationship between installed packages:

**Core Dependencies:**
- React + React-DOM (UI framework)
- Vite (build tool)

**Routing Layer:**
- react-router-dom → React

**HTTP Layer:**
- axios (standalone)

**UI Layer:**
- @mui/material → @emotion/react, @emotion/styled
- @mui/icons-material → @mui/material

**Form Layer:**
- react-hook-form → React

**State Layer:**
- zustand → React

**Utility Layer:**
- react-toastify → React
- recharts → React
- dayjs (standalone)



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several opportunities to consolidate redundant properties:

**Consolidations Made:**
1. **File existence checks:** Rather than separate properties for each individual file (6.2-6.8 for API files, 8.5-8.16 for components, 9.6-9.23 for pages), I consolidated these into comprehensive properties that check all files of a given type exist in their correct locations.

2. **Export validation:** Requirements 6.9, 8.17, 9.24, 10.5, 11.5, and 12.5 all check that files export appropriate content. These are consolidated into type-specific properties (API modules export functions, components export React components, etc.).

3. **Dependency checks:** Requirements 2.1-2.10 all check for individual packages. These are consolidated into a single property that verifies all required production dependencies are present.

4. **Directory structure:** Multiple requirements check for directory existence (6.1, 7.1, 8.1, etc.). While these remain as examples since they're checking specific paths, they inform the overall folder structure property.

**Properties Retained:**
- Properties that validate universal rules across multiple files (exports, file locations)
- Properties that check collections of related items (all dependencies, all API files)
- Example-based tests for specific configuration checks (project name, font integration)

### Properties

**Property 1: All required production dependencies are installed**

*For any* required production package (react-router-dom, axios, @mui/material, @mui/icons-material, @emotion/react, @emotion/styled, react-hook-form, zustand, react-toastify, recharts, dayjs), the package.json dependencies object should contain that package with an appropriate version.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11**

---

**Property 2: All API module files exist in correct location**

*For any* required API module (authApi, jobsApi, applicationsApi, companiesApi, usersApi, recommendationsApi, analyticsApi), a file with that name should exist in the src/api directory.

**Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8**

---

**Property 3: All API modules export at least one function**

*For any* API module file in the src/api directory, that file should export at least one function (placeholder API request function).

**Validates: Requirements 6.9**

---

**Property 4: All component files exist in correct locations**

*For any* required component (Navbar, Footer, Sidebar, SearchBar in common/; MainLayout, AuthLayout, DashboardLayout in layout/; Button, Card, Modal, Input, Loader in ui/), a file with that name should exist in the correct subdirectory under src/components.

**Validates: Requirements 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 8.11, 8.12, 8.13, 8.14, 8.15, 8.16**

---

**Property 5: All component files export a default React component**

*For any* component file in src/components (including all subdirectories), that file should have a default export that is a React component function.

**Validates: Requirements 8.17**

---

**Property 6: All page files exist in correct locations**

*For any* required page (Home, Login, Register, JobSearch in public/; Dashboard, Recommendations, Applications, Profile in jobseeker/; Dashboard, PostJob, ManageJobs, Applicants, CompanyProfile in company/; Dashboard, ManageUsers, ManageCompanies, ManageJobs, Analytics in admin/), a file with that name should exist in the correct subdirectory under src/pages.

**Validates: Requirements 9.6, 9.7, 9.8, 9.9, 9.10, 9.11, 9.12, 9.13, 9.14, 9.15, 9.16, 9.17, 9.18, 9.19, 9.20, 9.21, 9.22, 9.23**

---

**Property 7: All page files export a default React component**

*For any* page file in src/pages (including all subdirectories), that file should have a default export that is a React component function.

**Validates: Requirements 9.24**

---

**Property 8: All hook files export a custom hook function**

*For any* hook file in src/hooks directory, that file should export at least one function (custom React hook).

**Validates: Requirements 10.5**

---

**Property 9: All store files export a Zustand store**

*For any* store file in src/store directory, that file should export a store created using Zustand's create function.

**Validates: Requirements 11.5**

---

**Property 10: All utility files export at least one function or constant**

*For any* utility file in src/utils directory, that file should have at least one export (function or constant).

**Validates: Requirements 12.5**

---

### Example-Based Tests

The following criteria are best validated through specific example tests rather than universal properties:

**Example 1: Project is created with Vite and React**
- Verify vite.config.js exists
- Verify package.json contains "vite" and "react" dependencies
- **Validates: Requirements 1.1, 1.4**

**Example 2: Project directory is named "nexhire-frontend"**
- Verify the project root directory name matches "nexhire-frontend"
- **Validates: Requirements 1.2**

**Example 3: TypeScript support is configured (if TypeScript template used)**
- If tsconfig.json exists, verify @types/react and @types/react-dom are in devDependencies
- **Validates: Requirements 3.1, 3.2**

**Example 4: Default Vite files are cleaned up**
- Verify default App.css is removed or replaced
- Verify default sample content is removed from App.jsx
- Verify essential files (vite.config.js, package.json, index.html) still exist
- **Validates: Requirements 4.1, 4.2, 4.3**

**Example 5: Inter font is integrated in index.html**
- Parse index.html and verify it contains a <link> tag with href pointing to Google Fonts
- Verify the font URL includes "Inter" and weights "300;400;500;600;700"
- **Validates: Requirements 5.1, 5.2**

**Example 6: Required directories exist**
- Verify src/api directory exists
- Verify src/assets/logo directory exists
- Verify src/assets/images directory exists
- Verify src/components directory with subdirectories (common, layout, ui) exists
- Verify src/pages directory with subdirectories (public, jobseeker, company, admin) exists
- Verify src/hooks directory exists
- Verify src/store directory exists
- Verify src/utils directory exists
- Verify src/styles directory exists
- Verify src/routes directory exists
- **Validates: Requirements 6.1, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 11.1, 12.1, 13.1, 14.1**

**Example 7: Specific utility and style files exist**
- Verify src/utils/constants.js exists
- Verify src/utils/helpers.js exists
- Verify src/utils/validators.js exists
- Verify src/styles/theme.js exists
- Verify src/styles/global.css exists
- **Validates: Requirements 12.2, 12.3, 12.4, 13.2, 13.3**

**Example 8: Theme file exports Material-UI theme**
- Verify src/styles/theme.js exports an object
- Verify the file imports createTheme from @mui/material
- **Validates: Requirements 13.4**

**Example 9: Routing configuration exists and uses React Router v6**
- Verify src/routes/index.jsx (or similar) exists
- Verify the file imports from 'react-router-dom'
- Verify the file uses v6 syntax (createBrowserRouter or similar)
- Verify the file has an export
- **Validates: Requirements 14.2, 14.4, 14.5**

**Example 10: Project compiles without errors**
- Run `npm run build` or `vite build` command
- Verify the command exits with code 0 (success)
- Verify no error messages in output
- **Validates: Requirements 15.1**

## Error Handling

### Build Errors

**Scenario:** Vite build fails due to syntax errors or missing dependencies

**Handling:**
- Display clear error messages indicating which file has issues
- Verify all dependencies are installed (`npm install`)
- Check for typos in import statements
- Ensure all placeholder files have valid JavaScript/JSX syntax

### Missing Dependencies

**Scenario:** Required packages are not installed

**Handling:**
- Run `npm install` to install all dependencies from package.json
- If specific packages are missing, install them individually
- Verify package.json contains all required dependencies

### File System Errors

**Scenario:** Directories or files cannot be created

**Handling:**
- Check file system permissions
- Verify sufficient disk space
- Ensure no conflicting files or directories exist
- Use appropriate path separators for the operating system

### Import Errors

**Scenario:** Components or modules cannot be imported

**Handling:**
- Verify file paths are correct (case-sensitive on Unix systems)
- Ensure all files have proper exports
- Check that file extensions are included where required
- Verify no circular dependencies exist

## Testing Strategy

### Dual Testing Approach

This project setup will be validated using both unit tests and property-based tests:

**Unit Tests:** Focus on specific examples and edge cases
- Verify specific files exist at expected paths
- Check specific configuration values
- Validate specific directory structures
- Test individual file exports

**Property Tests:** Verify universal properties across all inputs
- For all API modules, verify they export functions
- For all components, verify they export React components
- For all pages, verify they export React components
- For all required dependencies, verify they are in package.json

Both testing approaches are complementary and necessary for comprehensive coverage.

### Property-Based Testing Configuration

**Library:** For JavaScript/TypeScript projects, we'll use **fast-check** for property-based testing.

**Installation:**
```bash
npm install -D fast-check @testing-library/react @testing-library/jest-dom vitest
```

**Configuration:**
- Each property test will run a minimum of 100 iterations
- Each test will be tagged with a comment referencing the design property
- Tag format: `// Feature: nexhire-frontend-setup, Property {number}: {property_text}`

**Example Property Test:**
```javascript
// Feature: nexhire-frontend-setup, Property 3: All API modules export at least one function
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import * as authApi from '../api/authApi';
import * as jobsApi from '../api/jobsApi';
// ... other imports

describe('API Module Exports', () => {
  it('should export at least one function from each API module', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(authApi, jobsApi, applicationsApi, companiesApi, usersApi, recommendationsApi, analyticsApi),
        (apiModule) => {
          const exports = Object.values(apiModule);
          const hasFunctions = exports.some(exp => typeof exp === 'function');
          expect(hasFunctions).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Example Unit Test:**
```javascript
// Unit test for specific directory structure
import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';

describe('Project Structure', () => {
  it('should have all required directories', () => {
    const requiredDirs = [
      'src/api',
      'src/assets/logo',
      'src/assets/images',
      'src/components/common',
      'src/components/layout',
      'src/components/ui',
      'src/pages/public',
      'src/pages/jobseeker',
      'src/pages/company',
      'src/pages/admin',
      'src/hooks',
      'src/store',
      'src/utils',
      'src/styles',
      'src/routes'
    ];

    requiredDirs.forEach(dir => {
      expect(existsSync(join(process.cwd(), dir))).toBe(true);
    });
  });
});
```

### Testing Coverage

**What to Test:**
1. File and directory existence (unit tests)
2. Package dependencies in package.json (property test)
3. File exports (property tests for collections, unit tests for specific files)
4. Build compilation success (unit test)
5. Configuration file validity (unit tests)

**What Not to Test:**
- Runtime browser behavior (requires E2E testing)
- Visual appearance (requires visual regression testing)
- Performance metrics (requires performance testing)
- User interactions (requires integration testing)

### Test Execution

Tests should be run after the project setup is complete:

```bash
# Run all tests
npm run test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

All tests should pass before considering the project setup complete.
