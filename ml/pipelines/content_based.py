from typing import List, Dict, Tuple
import json
import numpy as np
from config.database import get_user_vector, get_db_connection, is_user_in_als_model
from config.database import (
  fetch_all_users,
  fetch_all_active_jobs,
  fetch_user_skills,
  fetch_user_preferences,
  fetch_user_preferred_locations,
  fetch_job_skills,
  save_user_vector,
  save_job_vector,
  get_user_vector,
  get_job_vector,
  get_all_user_vectors,
  get_all_job_vectors,
)
from models.vectors import build_user_vector, build_job_vector
from utils.similarity import cosine_similarity
from data.mappings import VECTOR_SIZE


class ContentBasedPipeline:
  """Build and store content-based vectors for users and jobs."""

  def run(self) -> None:
    print("Building user vectors...")
    self.build_all_user_vectors()
    print("Building job vectors...")
    self.build_all_job_vectors()
    print("Content-Based pipeline completed.")

  def build_all_user_vectors(self) -> None:
    users = fetch_all_users()
    for u in users:
      uid = u["id"]
      skills = fetch_user_skills(uid)
      prefs = fetch_user_preferences(uid)
      pref_locs = fetch_user_preferred_locations(uid)
      vec = build_user_vector(u, skills, prefs, pref_locs)
      save_user_vector(uid, vec.tolist())

  def build_all_job_vectors(self) -> None:
    jobs = fetch_all_active_jobs()
    for j in jobs:
      jid = j["id"]
      skills = fetch_job_skills(jid)
      vec = build_job_vector(j, skills)
      save_job_vector(jid, vec.tolist())

  def get_job_recommendations_for_user(self, user_id: int, limit: int = 20) -> List[Tuple[int, float]]:
    uvec_list = get_user_vector(user_id)
    if uvec_list is None:
      return []
    uvec = np.array(uvec_list, dtype=float)
    job_vectors = get_all_job_vectors()
    scores: List[Tuple[int, float]] = []
    for jid, jv in job_vectors.items():
      jvec = np.array(jv, dtype=float)
      score = cosine_similarity(uvec, jvec)
      scores.append((jid, score))
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:limit]

  def get_candidate_recommendations_for_job(self, job_id: int, limit: int = 20) -> List[Tuple[int, float]]:
    jvec_list = get_job_vector(job_id)
    if jvec_list is None:
      return []
    jvec = np.array(jvec_list, dtype=float)
    user_vectors = get_all_user_vectors()
    scores: List[Tuple[int, float]] = []
    for uid, uv in user_vectors.items():
      uvec = np.array(uv, dtype=float)
      score = cosine_similarity(jvec, uvec)
      scores.append((uid, score))
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:limit]

def get_recommendations(user_id: int):
    # 1. جلب الشعاع باستخدام دالتك الجاهزة (الأرقام ستتغير هنا فوراً الآن)
    user_vec_raw = get_user_vector(user_id)
    
    if not user_vec_raw:
        return [] 
        
    user_vector = np.array(user_vec_raw)

    # 2. جلب أشعة الوظائف
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT job_id, vector FROM job_vectors")
    jobs = cur.fetchall()
    cur.close()
    conn.close()
    
    recommendations = []
    for row in jobs:
        # ملاحظة: لأنك تستخدم RealDictCursor، الوصول للبيانات يكون بالاسم
        job_id = row['job_id']
        job_vector = np.array(row['vector'])
        
        # 3. حساب التشابه
        score = calculate_cosine_similarity(user_vector, job_vector)
        recommendations.append({"job_id": job_id, "score": score})
    
    return sorted(recommendations, key=lambda x: x['score'], reverse=True)
    

