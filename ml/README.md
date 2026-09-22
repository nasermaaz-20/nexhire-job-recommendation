# Quick Start

## خطوة واحدة للإعداد الكامل:

```bash
cd ml

# 1. التحقق من البيئة
python setup/check_environment.py

# 2. إنشاء جداول ML
python setup/setup_db.py

# 3. تدريب النماذج
python scripts/run_pipeline.py

# 4. تشغيل API
uvicorn api.app:app --reload
```

انظر [SETUP_GUIDE.md](SETUP_GUIDE.md) للتفاصيل.

# ML Pipeline for Job Recommendation System

This `ml/` project implements the hybrid recommendation engine for the job platform.

## Structure

- `config/database.py` – PostgreSQL connection and DB helper functions.
- `data/mappings.py` – global mappings for skills/locations/fields and vector dimensions.
- `models/vectors.py` – builders for user/job content-based vectors.
- `models/matrix_factorization.py` – ALS implementation for implicit feedback.
- `utils/similarity.py` – cosine similarity utilities.
- `pipelines/content_based.py` – builds and stores user/job vectors and content-based recommendations.
- `pipelines/collaborative_user.py` – ALS CF for User→Job using `interactions`.
- `pipelines/collaborative_company.py` – ALS CF for Job→User using `company_candidate_interactions`.
- `pipelines/hybrid.py` – hybrid combiner (content + collaborative) with dynamic α.
- `api/app.py`, `api/routes.py` – FastAPI app exposing recommendation endpoints.
- `scripts/run_pipeline.py` – runs all pipelines end-to-end.
- `scripts/train_models.py` – alias to run full training.

## Setup

```bash
cd ml
python -m venv venv
venv\Scripts\activate  # on Windows
pip install -r requirements.txt
```

Configure `ml/.env` (already created) to point `DATABASE_URL` to the same DB as the backend.

## Migrations

The root `schema.sql` was updated with tables:

- `user_vectors`, `job_vectors`
- `user_factors_uj`, `job_factors_uj`
- `user_factors_ju`, `job_factors_ju`

Make sure these are applied to your PostgreSQL database.

## Running Pipelines

```bash
cd ml
python scripts/run_pipeline.py
```

This will:

1. Build content-based vectors for all users and jobs.
2. Train ALS for User→Job and save latent factors.
3. Train ALS for Job→User and save latent factors.

## Running the ML API

```bash
cd ml
uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload
```

Endpoints:

- `GET /recommendations/jobs/{user_id}?method=content|collaborative|hybrid&limit=20`
- `GET /recommendations/candidates/{job_id}?method=content|collaborative|hybrid&limit=20`
- `GET /health`

