import os
from typing import List, Dict, Any, Optional
from psycopg2.extras import RealDictCursor
import psycopg2
from psycopg2.extensions import connection as PGConnection
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from datetime import datetime , timezone


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
  raise RuntimeError("DATABASE_URL is not set in ml/.env")


def get_engine() -> Engine:
  return create_engine(DATABASE_URL)


def get_connection() -> PGConnection:
    """إرجاع اتصال psycopg2 خام... (كودك القديم)"""
    return psycopg2.connect(DATABASE_URL)

# --- الإضافة الآمنة هنا ---
# هذا السطر يجعل بايثون يفهم أن get_db_connection هي نفسها get_connection
get_db_connection = get_connection

LAST_MODEL_TRAINING_DATE = datetime(2026, 2, 13, 15, 53, 0)


def get_user_created_at(user_id: int):
  rows = fetch_all(
    "SELECT created_at FROM users WHERE id = :user_id",
    {"user_id": user_id},
  )
  if not rows:
    return None

  created_at = rows[0]["created_at"]
  if created_at and getattr(created_at, "tzinfo", None) is not None:
    created_at = created_at.replace(tzinfo=None)

  return created_at


def get_job_created_at(job_id: int):
  rows = fetch_all(
    "SELECT created_at FROM jobs WHERE id = :job_id",
    {"job_id": job_id},
  )
  if not rows:
    return None

  created_at = rows[0]["created_at"]
  if created_at and getattr(created_at, "tzinfo", None) is not None:
    created_at = created_at.replace(tzinfo=None)

  return created_at


def is_user_new(user_id: int) -> bool:
  created_at = get_user_created_at(user_id)
  if created_at is None:
    return True
  return created_at > LAST_MODEL_TRAINING_DATE


def is_job_new(job_id: int) -> bool:
  created_at = get_job_created_at(job_id)
  if created_at is None:
    return True
  return created_at > LAST_MODEL_TRAINING_DATE
engine = get_engine()

def get_user_vector_numpy(user_id: int):
    """جلب شعاع المستخدم وتحويله مباشرة لمصفوفة Numpy للحسابات"""
    import numpy as np
    row = get_user_vector(user_id)
    if row:
        return np.array(row)
    return None

def get_all_job_vectors_list() -> List[Dict[str, Any]]:
    """جلب كل الوظائف مع أشعتها للمقارنة الجماعية"""
    return fetch_all("SELECT job_id, vector FROM job_vectors")

def is_user_in_als_model(user_id: int) -> bool:
    """فحص إذا كان المستخدم يمتلك عوامل (Factors) ناتجة عن تدريب ALS"""
    rows = fetch_all(
        "SELECT 1 FROM user_factors_uj WHERE user_id = :user_id LIMIT 1",
        {"user_id": user_id}
    )
    return len(rows) > 0

    

def fetch_all(query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
  with engine.connect() as conn:
    result = conn.execute(text(query), params or {})
    rows = [dict(row._mapping) for row in result.fetchall()]
  return rows


def execute(query: str, params: Optional[Dict[str, Any]] = None) -> None:
  with engine.begin() as conn:
    conn.execute(text(query), params or {})


def fetch_all_skills() -> List[Dict[str, Any]]:
  return fetch_all("SELECT id, name, field_id FROM skills")


def fetch_all_locations() -> List[Dict[str, Any]]:
  return fetch_all("SELECT id, country, city FROM locations")


def fetch_all_fields() -> List[Dict[str, Any]]:
  return fetch_all("SELECT id, name FROM fields")


def fetch_all_users() -> List[Dict[str, Any]]:
  return fetch_all(
    """
    SELECT id, years_of_experience, career_level, field_id,
           current_location_id, desired_salary_min, desired_salary_max
    FROM users
    WHERE is_active = 1
    """
  )


def fetch_all_active_jobs() -> List[Dict[str, Any]]:
  return fetch_all(
    """
    SELECT id, field_id, job_level, location_id,
           min_experience, max_experience, salary_min, salary_max,
           employment_type, remote_option
    FROM jobs
    WHERE is_active = 1
    """
  )


def fetch_all_jobs() -> List[Dict[str, Any]]:
  return fetch_all(
    """
    SELECT id, field_id, job_level, location_id,
           min_experience, max_experience, salary_min, salary_max,
           employment_type, remote_option
    FROM jobs
    """
  )


def fetch_user_skills(user_id: int) -> List[Dict[str, Any]]:
  return fetch_all(
    """
    SELECT skill_id, level
    FROM user_skills
    WHERE user_id = :user_id
    """,
    {"user_id": user_id},
  )


def fetch_job_skills(job_id: int) -> List[Dict[str, Any]]:
  return fetch_all(
    """
    SELECT skill_id, importance, is_required
    FROM job_skills
    WHERE job_id = :job_id
    """,
    {"job_id": job_id},
  )


def fetch_user_preferences(user_id: int) -> Optional[Dict[str, Any]]:
  rows = fetch_all(
    """
    SELECT preferred_field_id, preferred_job_level,
           preferred_employment_type, remote_preference, min_salary
    FROM user_preferences
    WHERE user_id = :user_id
    """,
    {"user_id": user_id},
  )
  return rows[0] if rows else None


def fetch_user_preferred_locations(user_id: int) -> List[Dict[str, Any]]:
  return fetch_all(
    """
    SELECT location_id, priority
    FROM user_preferred_locations
    WHERE user_id = :user_id
    """,
    {"user_id": user_id},
  )


def save_user_vector(user_id: int, vector: List[float]) -> None:
  import json

  vector_json = json.dumps(vector)
  execute(
    """
    INSERT INTO user_vectors (user_id, vector)
    VALUES (:user_id, CAST(:vector AS jsonb))
    ON CONFLICT (user_id)
    DO UPDATE SET vector = CAST(EXCLUDED.vector AS jsonb),
                  updated_at = CURRENT_TIMESTAMP
    """,
    {"user_id": user_id, "vector": vector_json},
  )


def save_job_vector(job_id: int, vector: List[float]) -> None:
  import json

  vector_json = json.dumps(vector)
  execute(
    """
    INSERT INTO job_vectors (job_id, vector)
    VALUES (:job_id, CAST(:vector AS jsonb))
    ON CONFLICT (job_id)
    DO UPDATE SET vector = CAST(EXCLUDED.vector AS jsonb),
                  updated_at = CURRENT_TIMESTAMP
    """,
    {"job_id": job_id, "vector": vector_json},
  )


def get_user_vector(user_id: int) -> Optional[List[float]]:
  rows = fetch_all(
    "SELECT vector FROM user_vectors WHERE user_id = :user_id", {"user_id": user_id}
  )
  if not rows:
    return None
  return rows[0]["vector"]


def get_job_vector(job_id: int) -> Optional[List[float]]:
  rows = fetch_all(
    "SELECT vector FROM job_vectors WHERE job_id = :job_id", {"job_id": job_id}
  )
  if not rows:
    return None
  return rows[0]["vector"]


def get_all_user_vectors() -> Dict[int, List[float]]:
  rows = fetch_all("SELECT user_id, vector FROM user_vectors")
  return {row["user_id"]: row["vector"] for row in rows}


def get_all_job_vectors() -> Dict[int, List[float]]:
  rows = fetch_all("SELECT job_id, vector FROM job_vectors")
  return {row["job_id"]: row["vector"] for row in rows}


def fetch_all_interactions() -> List[Dict[str, Any]]:
  return fetch_all(
    """
    SELECT user_id, job_id, interaction_type
    FROM interactions
    """
  )


def fetch_company_candidate_interactions() -> List[Dict[str, Any]]:
  return fetch_all(
    """
    SELECT company_id, user_id, job_id, interaction_type
    FROM company_candidate_interactions
    WHERE job_id IS NOT NULL
    """
  )


def save_user_factors_uj(user_id: int, factors: List[float]) -> None:
  import json

  factors_json = json.dumps(factors)
  execute(
    """
    INSERT INTO user_factors_uj (user_id, factors)
    VALUES (:user_id, CAST(:factors AS jsonb))
    ON CONFLICT (user_id)
    DO UPDATE SET factors = CAST(EXCLUDED.factors AS jsonb),
                  created_at = CURRENT_TIMESTAMP
    """,
    {"user_id": user_id, "factors": factors_json},
  )


def save_job_factors_uj(job_id: int, factors: List[float]) -> None:
  import json

  factors_json = json.dumps(factors)
  execute(
    """
    INSERT INTO job_factors_uj (job_id, factors)
    VALUES (:job_id, CAST(:factors AS jsonb))
    ON CONFLICT (job_id)
    DO UPDATE SET factors = CAST(EXCLUDED.factors AS jsonb),
                  created_at = CURRENT_TIMESTAMP
    """,
    {"job_id": job_id, "factors": factors_json},
  )


def save_job_factors_ju(job_id: int, factors: List[float]) -> None:
  import json

  factors_json = json.dumps(factors)
  execute(
    """
    INSERT INTO job_factors_ju (job_id, factors)
    VALUES (:job_id, CAST(:factors AS jsonb))
    ON CONFLICT (job_id)
    DO UPDATE SET factors = CAST(EXCLUDED.factors AS jsonb),
                  created_at = CURRENT_TIMESTAMP
    """,
    {"job_id": job_id, "factors": factors_json},
  )


def save_user_factors_ju(user_id: int, factors: List[float]) -> None:
  import json

  factors_json = json.dumps(factors)
  execute(
    """
    INSERT INTO user_factors_ju (user_id, factors)
    VALUES (:user_id, CAST(:factors AS jsonb))
    ON CONFLICT (user_id)
    DO UPDATE SET factors = CAST(EXCLUDED.factors AS jsonb),
                  created_at = CURRENT_TIMESTAMP
    """,
    {"user_id": user_id, "factors": factors_json},
  )


def get_user_interaction_count(user_id: int) -> int:
  rows = fetch_all(
    "SELECT COUNT(*) AS c FROM interactions WHERE user_id = :user_id AND created_at < '2026-02-12 15:52:59.762703'::timestamp",
    {"user_id": user_id},
  )
  return int(rows[0]["c"]) if rows else 0


def get_job_interaction_count(job_id: int) -> int:
  rows = fetch_all(
    "SELECT COUNT(*) AS c FROM interactions WHERE job_id = :job_id",
    {"job_id": job_id},
  )
  return int(rows[0]["c"]) if rows else 0


def fetch_job_by_id(job_id: int) -> Optional[Dict[str, Any]]:
  rows = fetch_all("SELECT * FROM jobs WHERE id = :job_id", {"job_id": job_id})
  if not rows:
    return None
  
  job = rows[0]
  
  # Fetch job skills
  job_skills = fetch_all(
    """
    SELECT js.skill_id, js.importance, js.is_required, s.name
    FROM job_skills js
    JOIN skills s ON js.skill_id = s.id
    WHERE js.job_id = :job_id
    """,
    {"job_id": job_id}
  )
  
  # Format skills
  job['skills'] = [
    {
      'id': skill['skill_id'],
      'name': skill['name'],
      'importance': skill['importance'],
      'is_required': skill['is_required']
    }
    for skill in job_skills
  ]
  
  # Fetch location
  if job.get('location_id'):
    location = fetch_all(
      "SELECT id, country, city FROM locations WHERE id = :location_id",
      {"location_id": job['location_id']}
    )
    job['location'] = location[0] if location else None
  
  # Fetch company
  if job.get('company_id'):
    company = fetch_all(
      "SELECT id, name FROM companies WHERE id = :company_id",
      {"company_id": job['company_id']}
    )
    job['company'] = company[0] if company else None
  
  return job


def fetch_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
  rows = fetch_all("SELECT * FROM users WHERE id = :user_id", {"user_id": user_id})
  if not rows:
    return None
  
  user = rows[0]
  
  # Fetch user skills
  user_skills = fetch_all(
    """
    SELECT us.skill_id, us.level, s.name
    FROM user_skills us
    JOIN skills s ON us.skill_id = s.id
    WHERE us.user_id = :user_id
    """,
    {"user_id": user_id}
  )
  
  # Format skills
  user['skills'] = [
    {
      'id': skill['skill_id'],
      'name': skill['name'],
      'level': skill['level']
    }
    for skill in user_skills
  ]
  
  # Fetch location
  if user.get('current_location_id'):
    location = fetch_all(
      "SELECT id, country, city FROM locations WHERE id = :location_id",
      {"location_id": user['current_location_id']}
    )
    user['location'] = location[0] if location else None
  
  return user

