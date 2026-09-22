from typing import Literal

from fastapi import APIRouter, Query , Body , HTTPException
from models.vectors import build_user_vector
from config.database import fetch_job_by_id, fetch_user_by_id , save_user_vector
from pipelines.content_based import ContentBasedPipeline
from pipelines.collaborative_user import CollaborativeUserPipeline
from pipelines.collaborative_company import CollaborativeCompanyPipeline
from pipelines.hybrid import HybridRecommendation


router = APIRouter()

content_pipeline = ContentBasedPipeline()
collab_user_pipeline = CollaborativeUserPipeline()
collab_company_pipeline = CollaborativeCompanyPipeline()
hybrid = HybridRecommendation()


@router.get("/recommendations/jobs/{user_id}")
async def recommend_jobs(
    user_id: int,
    limit: int = Query(20, ge=1, le=100),
    method: Literal["content", "collaborative", "hybrid"] = "hybrid",
):
  if method == "content":
    results = content_pipeline.get_job_recommendations_for_user(user_id, limit)
    results = [{"job_id": jid, "score": score} for jid, score in results]
  elif method == "collaborative":
    results = collab_user_pipeline.get_recommendations(user_id, limit)
    results = [{"job_id": jid, "score": score} for jid, score in results]
  else:
    results = hybrid.recommend_jobs_for_user(user_id, limit)

  enriched = []
  for rec in results:
    jid = rec["job_id"]
    job = fetch_job_by_id(jid)
    if job:
      enriched.append({**rec, "job": job})

  return {
    "user_id": user_id,
    "method": method,
    "count": len(enriched),
    "recommendations": enriched,
  }


@router.get("/recommendations/candidates/{job_id}")
async def recommend_candidates(
    job_id: int,
    limit: int = Query(20, ge=1, le=100),
    method: Literal["content", "collaborative", "hybrid"] = "hybrid",
):
  if method == "content":
    results = content_pipeline.get_candidate_recommendations_for_job(job_id, limit)
    results = [{"user_id": uid, "score": score} for uid, score in results]
  elif method == "collaborative":
    results = collab_company_pipeline.get_recommendations(job_id, limit)
    results = [{"user_id": uid, "score": score} for uid, score in results]
  else:
    results = hybrid.recommend_candidates_for_job(job_id, limit)

  enriched = []
  for rec in results:
    uid = rec["user_id"]
    user = fetch_user_by_id(uid)
    if user:
      enriched.append({**rec, "user": user})

  return {
    "job_id": job_id,
    "method": method,
    "count": len(enriched),
    "candidates": enriched,
  }

@router.post("/vectors/user/{user_id}")
async def update_user_vector_endpoint(user_id: int, data: dict = Body(...)):
    try:
        user_skills = data.get("skills", [])
        user_prefs = data.get("preferences") or data.get("user_preferences") or {}
        pref_locations = data.get("preferredLocations") or data.get("preferred_locations") or []

        try:
            from models.vectors import build_user_vector
            new_vector = build_user_vector(data, user_skills, user_prefs, pref_locations)
        except Exception as ve:
            print(f"❌ Error in build_user_vector logic: {ve}")
            raise HTTPException(status_code=500, detail=f"Vector construction failed: {str(ve)}")

        if hasattr(new_vector, 'tolist'):
            vector_list = new_vector.tolist()
        else:
            vector_list = list(new_vector)

        from config.database import save_user_vector
        save_user_vector(user_id, vector_list)
        
        return {"status": "success"}

    except Exception as e:
        print(f"🔥 Critical Error in Python Route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/vectors/job/{job_id}")
async def update_job_vector_endpoint(job_id: int, data: dict = Body(...)):
    try:
        job_skills = data.get("skills", [])

        try:
            from models.vectors import build_job_vector
            new_vector = build_job_vector(data, job_skills)
        except Exception as ve:
            print(f"❌ Error in build_job_vector logic: {ve}")
            raise HTTPException(status_code=500, detail=f"Vector construction failed: {str(ve)}")

        if hasattr(new_vector, 'tolist'):
            vector_list = new_vector.tolist()
        else:
            vector_list = list(new_vector)

        from config.database import save_job_vector
        save_job_vector(job_id, vector_list)

        return {"status": "success"}

    except Exception as e:
        print(f"🔥 Critical Error in Python Route: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))