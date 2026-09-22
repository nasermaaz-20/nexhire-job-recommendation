# NexHire API Endpoints Documentation

## Base URLs
- **Backend API**: `http://localhost:3000/api`
- **ML API**: `http://localhost:8000`

---

## Authentication Endpoints (`/api/auth`)

### Register User
- **POST** `/api/auth/register/user`
- **Body**: `{ email, password, name, phone, date_of_birth, field_id, career_level, years_of_experience, location_id }`
- **Response**: `{ success, data: { user, tokens }, message }`

### Register Company
- **POST** `/api/auth/register/company`
- **Body**: `{ email, password, company_name, phone, industry, company_size, location_id, website, description }`
- **Response**: `{ success, data: { company, tokens }, message }`

### Login
- **POST** `/api/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ success, data: { user/company, tokens }, message }`

### Refresh Token
- **POST** `/api/auth/refresh`
- **Body**: `{ refresh_token }`
- **Response**: `{ success, data: { access_token }, message }`

### Logout
- **POST** `/api/auth/logout`
- **Response**: `{ success, message }`

---

## User Endpoints (`/api/users`)

### Get User Profile
- **GET** `/api/users/profile`
- **Auth**: Required (User)
- **Response**: `{ success, data: { user, skills, preferred_locations }, message }`

### Get User by ID (Public)
- **GET** `/api/users/public/:userId`
- **Response**: `{ success, data: { user }, message }`

### Update Profile
- **PUT** `/api/users/profile`
- **Auth**: Required (User)
- **Body**: `{ name, phone, date_of_birth, field_id, career_level, years_of_experience, location_id, bio, resume_url, linkedin_url, github_url }`
- **Response**: `{ success, data: { user }, message }`

### Add User Skills
- **POST** `/api/users/skills`
- **Auth**: Required (User)
- **Body**: `{ skills: [{ skill_id, proficiency_level }] }`
- **Response**: `{ success, data: { skills }, message }`

### Delete User Skill
- **DELETE** `/api/users/skills/:skill_id`
- **Auth**: Required (User)
- **Response**: `{ success, message }`

### Update User Preferences
- **POST** `/api/users/preferences`
- **Auth**: Required (User)
- **Body**: `{ preferred_job_types, preferred_work_mode, min_salary, max_salary, willing_to_relocate }`
- **Response**: `{ success, data: { preferences }, message }`

### Add Preferred Locations
- **POST** `/api/users/preferred-locations`
- **Auth**: Required (User)
- **Body**: `{ location_ids: [1, 2, 3] }`
- **Response**: `{ success, data: { locations }, message }`

---

## Job Endpoints (`/api/jobs`)

### List Jobs (Public)
- **GET** `/api/jobs`
- **Query Params**: `page, limit, field_id, location_id, job_level, employment_type, remote, min_salary, max_salary, search`
- **Response**: `{ success, data: { jobs, pagination }, message }`

### Get Job by ID (Public)
- **GET** `/api/jobs/:id`
- **Response**: `{ success, data: { job, company, required_skills }, message }`

### Create Job
- **POST** `/api/jobs`
- **Auth**: Required (Company)
- **Body**: `{ title, description, field_id, location_id, job_level, employment_type, remote, salary_min, salary_max, requirements }`
- **Response**: `{ success, data: { job }, message }`

### Update Job
- **PUT** `/api/jobs/:id`
- **Auth**: Required (Company)
- **Body**: `{ title, description, field_id, location_id, job_level, employment_type, remote, salary_min, salary_max, requirements, is_active }`
- **Response**: `{ success, data: { job }, message }`

### Delete Job
- **DELETE** `/api/jobs/:id`
- **Auth**: Required (Company)
- **Response**: `{ success, message }`

### Add Job Skills
- **POST** `/api/jobs/:id/skills`
- **Auth**: Required (Company)
- **Body**: `{ skills: [{ skill_id, required_level }] }`
- **Response**: `{ success, data: { skills }, message }`

### Get My Jobs
- **GET** `/api/jobs/my-jobs/list`
- **Auth**: Required (Company)
- **Response**: `{ success, data: { jobs }, message }`

---

## Application Endpoints (`/api/applications`)

### Apply for Job
- **POST** `/api/applications`
- **Auth**: Required (User)
- **Body**: `{ job_id, cover_letter }`
- **Response**: `{ success, data: { application }, message }`

### Get My Applications
- **GET** `/api/applications/my-applications`
- **Auth**: Required (User)
- **Response**: `{ success, data: { applications }, message }`

### Get Job Applications
- **GET** `/api/applications/job/:job_id`
- **Auth**: Required (Company)
- **Response**: `{ success, data: { applications }, message }`

### Update Application Status
- **PUT** `/api/applications/:id/status`
- **Auth**: Required (Company)
- **Body**: `{ status: "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted" }`
- **Response**: `{ success, data: { application }, message }`

---

## Company Endpoints (`/api/companies`)

### Get Company Public Profile
- **GET** `/api/companies/:id`
- **Response**: `{ success, data: { company }, message }`

### Get Company Profile
- **GET** `/api/companies/profile/me`
- **Auth**: Required (Company)
- **Response**: `{ success, data: { company }, message }`

### Update Company Profile
- **PUT** `/api/companies/profile`
- **Auth**: Required (Company)
- **Body**: `{ company_name, phone, industry, company_size, location_id, website, description, logo_url }`
- **Response**: `{ success, data: { company }, message }`

---

## Recommendation Endpoints (`/api/recommendations`)

### Get My Job Recommendations
- **GET** `/api/recommendations/jobs/me`
- **Auth**: Required (User)
- **Query Params**: `limit, method (content|collaborative|hybrid)`
- **Response**: `{ success, data: { recommendations }, message }`

### Get Job Candidates
- **GET** `/api/recommendations/candidates/:jobId`
- **Auth**: Required (Company)
- **Query Params**: `limit, method (content|collaborative|hybrid)`
- **Response**: `{ success, data: { candidates }, message }`

### Get Job Recommendations for User (Admin)
- **GET** `/api/recommendations/jobs/user/:userId`
- **Query Params**: `limit, method (content|collaborative|hybrid)`
- **Response**: `{ success, data: { recommendations }, message }`

### ML Service Health Check
- **GET** `/api/recommendations/ml/health`
- **Response**: `{ success, data: { status }, message }`

---

## Reference Data Endpoints (`/api/references`)

### Get Locations
- **GET** `/api/references/locations`
- **Response**: `{ success, data: { locations }, message }`

### Get Fields
- **GET** `/api/references/fields`
- **Response**: `{ success, data: { fields }, message }`

### Get Skills
- **GET** `/api/references/skills`
- **Response**: `{ success, data: { skills }, message }`

### Get Enums
- **GET** `/api/references/enums`
- **Response**: `{ success, data: { job_levels, employment_types, career_levels, proficiency_levels, application_statuses, interaction_types }, message }`

---

## Interaction Endpoints (`/api/interactions`)

### Create User Interaction
- **POST** `/api/interactions`
- **Auth**: Required (User)
- **Body**: `{ job_id, interaction_type: "view" | "save" | "apply" | "share" }`
- **Response**: `{ success, data: { interaction }, message }`

### Get My Interactions
- **GET** `/api/interactions/my-history`
- **Auth**: Required (User)
- **Response**: `{ success, data: { interactions }, message }`

### Create Company Interaction
- **POST** `/api/interactions/company-interactions`
- **Auth**: Required (Company)
- **Body**: `{ user_id, interaction_type: "view" | "shortlist" | "contact" | "reject" }`
- **Response**: `{ success, data: { interaction }, message }`

### Get Company Interactions History
- **GET** `/api/interactions/company-interactions/history`
- **Auth**: Required (Company)
- **Response**: `{ success, data: { interactions }, message }`

---

## ML API Endpoints (Direct)

### Recommend Jobs for User
- **GET** `/recommendations/jobs/:user_id`
- **Query Params**: `limit (1-100), method (content|collaborative|hybrid)`
- **Response**: `{ user_id, method, count, recommendations: [{ job_id, score, job }] }`

### Recommend Candidates for Job
- **GET** `/recommendations/candidates/:job_id`
- **Query Params**: `limit (1-100), method (content|collaborative|hybrid)`
- **Response**: `{ job_id, method, count, candidates: [{ user_id, score, user }] }`

### ML Health Check
- **GET** `/health`
- **Response**: `{ status: "ok" }`

---

## Health Check

### Backend Health
- **GET** `/health`
- **Response**: `{ success: true, data: { status: "ok" }, message: "Health check" }`

---

## Authentication Headers

For protected routes, include:
```
Authorization: Bearer <access_token>
```

## Response Format

All responses follow this structure:
```json
{
  "success": true/false,
  "data": { ... },
  "message": "Success/Error message"
}
```

## Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error
