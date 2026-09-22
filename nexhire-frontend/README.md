# NexHire Frontend

AI-powered job recommendation platform built with React and Material UI.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Material UI (MUI)** - Component library
- **Zustand** - State management
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **React Hook Form** - Form validation
- **React Toastify** - Toast notifications
- **Day.js** - Date formatting

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running on port 5000

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd nexhire-frontend
```

2. Copy environment file
```bash
copy .env.example .env
```

3. Install dependencies
```bash
npm install
```

4. Start development server
```bash
npm run dev
```

5. Open http://localhost:5173

## Project Structure

```
nexhire-frontend/
├── src/
│   ├── api/              # API service files
│   │   ├── adminApi.js
│   │   ├── applicationsApi.js
│   │   ├── authApi.js
│   │   ├── axiosInstance.js
│   │   ├── companiesApi.js
│   │   ├── jobsApi.js
│   │   ├── recommendationsApi.js
│   │   └── usersApi.js
│   ├── assets/           # Static assets (images, logos)
│   ├── components/       # Reusable components
│   │   ├── common/       # Common components (Loading, EmptyState, etc.)
│   │   ├── layout/       # Layout components (Navbar, DashboardLayout)
│   │   └── ui/           # UI components (JobCard, StatCard, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   │   ├── admin/        # Admin pages
│   │   ├── company/      # Company pages
│   │   ├── jobseeker/    # Job seeker pages
│   │   └── public/       # Public pages (Landing, Login, Signup)
│   ├── routes/           # Route configuration
│   ├── store/            # Zustand stores
│   ├── styles/           # Global styles
│   ├── utils/            # Utility functions and constants
│   ├── App.jsx           # Root component
│   └── main.jsx          # Entry point
├── public/               # Public assets
├── .env                  # Environment variables
├── .env.example          # Environment variables template
├── index.html            # HTML template
├── package.json          # Dependencies
└── vite.config.js        # Vite configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

### For Job Seekers
- AI-powered job recommendations
- Advanced job search with filters
- Application tracking
- Save jobs for later
- Profile management with skills
- Job preferences configuration

### For Companies
- Post and manage job listings
- View and manage applicants
- Track application status
- Company profile management
- Applicant filtering and sorting

### For Admins
- User management
- Company management
- Job moderation
- Skills and fields management
- Platform analytics
- Location management

## Environment Variables

- `VITE_API_URL` - Backend API base URL (default: http://localhost:5000/api)

## Build

To create a production build:

```bash
npm run build
```

The build output will be in the `dist/` directory.

## License

Private - All rights reserved
