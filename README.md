# NexHire — AI Job Recommendation Platform

<div align="center">

**منصة توصية وظائف ذكية مدعومة بالذكاء الاصطناعي**

Graduation Project · Full-Stack Web Application · Two-person team

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-FastAPI-3776AB?logo=python&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

---

## 📋 نظرة عامة | Overview

**NexHire** is a full-stack job recommendation platform that connects job seekers with relevant opportunities using a **hybrid AI recommendation engine**. The system supports three user roles — job seekers, companies, and administrators — each with dedicated dashboards and workflows.

**NexHire** منصة وظائف متكاملة تربط الباحثين عن عمل بالفرص المناسبة عبر **محرك توصيات هجين** يجمع بين التصفية بالمحتوى والتصفية التعاونية (Collaborative Filtering).

### ✨ Key Features

| Job Seeker | Company | Admin |
|---|---|---|
| AI-powered job recommendations | Post & manage job listings | User & company management |
| Advanced search with filters | View & manage applicants | Job moderation |
| Application tracking | AI candidate recommendations | Skills, fields & locations CRUD |
| Save jobs for later | Company profile management | Platform analytics |
| Profile & skills management | Applicant filtering & sorting | Reference data management |

---

## 🏗 Architecture

```
┌─────────────────────┐     REST API      ┌─────────────────────┐
│   nexhire-frontend  │ ───────────────► │   backend (Express)  │
│   React + Vite      │   :5173 → :3000  │   Prisma + JWT       │
└─────────────────────┘                   └──────────┬──────────┘
                                                     │ ML_API_URL
                                                     ▼
                                          ┌─────────────────────┐
                                          │   ml (FastAPI)       │
                                          │   Hybrid Recommender │
                                          └──────────┬──────────┘
                                                     │
                                                     ▼
                                          ┌─────────────────────┐
                                          │   PostgreSQL         │
                                          │   Core + ML Tables   │
                                          └─────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 7, Material UI 7, Zustand, React Router 7, Axios, Recharts |
| **Backend** | Node.js, Express 4, Prisma ORM, JWT Auth, Joi Validation, Helmet |
| **ML Service** | Python 3, FastAPI, NumPy, SciPy, Pandas, scikit-learn, SQLAlchemy |
| **Database** | PostgreSQL |
| **Auth** | JWT (Access + Refresh tokens), bcrypt, Role-based access control |

---

## 🤖 Recommendation Engine

The ML pipeline implements a **hybrid recommender** with three methods:

| Method | Algorithm | Data Source |
|---|---|---|
| **Content-Based** | Feature vectors + cosine similarity | Skills, experience, location, field, career level, salary |
| **Collaborative (User→Job)** | ALS matrix factorization (implicit feedback) | User interactions (view=1, save=3, apply=5) |
| **Collaborative (Job→User)** | ALS matrix factorization | Company–candidate interactions |
| **Hybrid** | Weighted blend with dynamic α | New users → content-only; more data → more collaborative weight |

**ML API Endpoints** (port `8000`):

| Endpoint | Description |
|---|---|
| `GET /health` | Health check |
| `GET /recommendations/jobs/{user_id}` | Job recommendations for a user |
| `GET /recommendations/candidates/{job_id}` | Candidate recommendations for a job |
| `POST /vectors/user/{user_id}` | Update user vector in real-time |
| `POST /vectors/job/{job_id}` | Update job vector in real-time |

---

## 📁 Project Structure

```
job-recommendation/
├── backend/              # Express.js REST API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/     # ML API proxy
│   │   ├── middlewares/
│   │   └── validators/
│   └── prisma/           # Database schema & seed
│
├── nexhire-frontend/     # React SPA (main frontend)
│   └── src/
│       ├── api/
│       ├── pages/        # admin, company, jobseeker, public
│       ├── components/
│       └── store/
│
├── ml/                   # Python ML pipeline + FastAPI
│   ├── api/
│   ├── models/
│   ├── pipelines/
│   └── scripts/
│
├── demo/                 # Standalone hybrid recommender demo
├── schema.sql            # Full PostgreSQL schema
└── README.md
```

> **Note:** The `src/` folder at root is an early frontend prototype. The active frontend is `nexhire-frontend/`.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Python](https://www.python.org/) 3.10+
- [PostgreSQL](https://www.postgresql.org/) 14+
- [Git](https://git-scm.com/)

### 1. Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE job_recommendation;"

# Apply schema
psql -U postgres -d job_recommendation -f schema.sql
```

### 2. Backend

```bash
cd backend
copy .env.example .env        # Edit DATABASE_URL and JWT secrets
npm install
npx prisma generate
npm run seed                  # Optional: generate synthetic test data
npm run dev                   # http://localhost:3000
```

### 3. ML Service

```bash
cd ml
python -m venv venv
venv\Scripts\activate         # Windows
# source venv/bin/activate    # Linux / macOS
pip install -r requirements.txt
copy .env.example .env        # Set DATABASE_URL
python setup/check_environment.py
python setup/setup_db.py
python scripts/run_pipeline.py
uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Frontend

```bash
cd nexhire-frontend
copy .env.example .env        # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev                   # http://localhost:5173
```

### Service Ports

| Service | Port |
|---|---|
| Frontend (Vite) | `5173` |
| Backend (Express) | `3000` |
| ML API (FastAPI) | `8000` |
| PostgreSQL | `5432` |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/job_recommendation?schema=public
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
ML_API_URL=http://localhost:8000
```

### Frontend (`nexhire-frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

### ML Service (`ml/.env`)

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/job_recommendation
ML_API_PORT=8000
```

---

## 📡 API Overview

| Group | Endpoints |
|---|---|
| **Auth** | `POST /api/auth/register/user`, `/register/company`, `/login`, `/refresh` |
| **Jobs** | `GET /api/jobs`, `POST /api/jobs`, `GET /api/jobs/:id` |
| **Applications** | `POST /api/applications`, `GET /api/applications/my-applications` |
| **Recommendations** | `GET /api/recommendations/jobs/me`, `/candidates/:jobId` |
| **Admin** | Stats, analytics, CRUD for users, companies, jobs, skills, fields |
| **References** | `GET /api/references/locations`, `/fields`, `/skills` |

Full API documentation: [`nexhire-frontend/API_ENDPOINTS.md`](nexhire-frontend/API_ENDPOINTS.md)

---

## 🧪 Seeding & Admin

```bash
# Generate synthetic data (~2000 users, 300 companies, jobs, interactions)
cd backend
npm run seed

# Create admin account
node create_admin.js
```

---

## 📚 Additional Documentation

| File | Description |
|---|---|
| [`nexhire-frontend/README.md`](nexhire-frontend/README.md) | Frontend setup & structure |
| [`nexhire-frontend/API_ENDPOINTS.md`](nexhire-frontend/API_ENDPOINTS.md) | Full API reference |
| [`ml/README.md`](ml/README.md) | ML pipeline overview |
| [`ml/SETUP_GUIDE.md`](ml/SETUP_GUIDE.md) | ML setup guide (Arabic) |
| [`demo/README.md`](demo/README.md) | Standalone recommender demo |
| [`backend/requests.http`](backend/requests.http) | REST Client test requests |

---

## 👥 Team & My Contribution

This university capstone was co-developed by **[Naser Maaz](https://github.com/nasermaaz-20)** and one teammate. We worked jointly across the frontend, backend, recommendation service, and database rather than assigning separate layers to each person.

**My contribution:** shared implementation and integration across the React frontend, Express API, FastAPI recommendation service, and database. This repository presents our collaborative work.

[My portfolio](https://portfolio.nasermaaz20.workers.dev/) · [LinkedIn](https://www.linkedin.com/in/naser-maaz)

---

## 📄 License

This project was developed as a graduation project. All rights reserved.

---

<div align="center">

**Built with ❤️ using React, Node.js, Python & PostgreSQL**

</div>
