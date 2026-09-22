import traceback
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

# ============================================================
#  Lazy-load the heavy ML pipelines once (Singleton)
# ============================================================
_hybrid = None
_content = None
_collab_user = None


def _get_hybrid():
    global _hybrid
    if _hybrid is None:
        from pipelines.hybrid import HybridRecommendation
        _hybrid = HybridRecommendation()
        print("✅ HybridRecommendation initialized")
    return _hybrid


def _get_content():
    global _content
    if _content is None:
        from pipelines.content_based import ContentBasedPipeline
        _content = ContentBasedPipeline()
        print("✅ ContentBasedPipeline initialized")
    return _content


def _get_collab_user():
    global _collab_user
    if _collab_user is None:
        from pipelines.collaborative_user import CollaborativeUserPipeline
        _collab_user = CollaborativeUserPipeline()
        print("✅ CollaborativeUserPipeline initialized")
    return _collab_user


# ============================================================
#  Helper: clean results for JSON serialization
# ============================================================
def _clean_results(results):
    """Convert numpy floats / ints to Python native types"""
    clean = []
    for r in results:
        if isinstance(r, dict):
            clean.append({
                "job_id": int(r.get("job_id", 0)),
                "score": round(float(r.get("score", 0)), 6),
                "content_score": round(float(r.get("content_score", 0)), 6),
                "collab_score": round(float(r.get("collab_score", 0)), 6),
                "alpha": round(float(r.get("alpha", 0.5)), 4),
            })
        elif isinstance(r, (list, tuple)) and len(r) == 2:
            clean.append({
                "job_id": int(r[0]),
                "score": round(float(r[1]), 6),
                "content_score": round(float(r[1]), 6),
                "collab_score": 0.0,
                "alpha": 1.0,
            })
    return clean


def _clean_candidate_results(results):
    """Same but for candidate recommendations (user_id instead of job_id)"""
    clean = []
    for r in results:
        if isinstance(r, dict):
            clean.append({
                "user_id": int(r.get("user_id", 0)),
                "score": round(float(r.get("score", 0)), 6),
                "content_score": round(float(r.get("content_score", 0)), 6),
                "collab_score": round(float(r.get("collab_score", 0)), 6),
                "alpha": round(float(r.get("alpha", 0.5)), 4),
            })
        elif isinstance(r, (list, tuple)) and len(r) == 2:
            clean.append({
                "user_id": int(r[0]),
                "score": round(float(r[1]), 6),
                "content_score": round(float(r[1]), 6),
                "collab_score": 0.0,
                "alpha": 1.0,
            })
    return clean


# ============================================================
#  VIEW 1: Job Recommendations for a User
#  GET /recommendations/jobs/<user_id>?limit=20&method=hybrid
# ============================================================
@csrf_exempt
@require_http_methods(["GET"])
def recommend_jobs(request, user_id):
    try:
        limit = int(request.GET.get("limit", 20))
        method = request.GET.get("method", "hybrid")

        print(f"📨 Recommendation request: user_id={user_id}, method={method}, limit={limit}")

        if method == "content":
            pipeline = _get_content()
            raw = pipeline.get_job_recommendations_for_user(user_id, limit=limit)
            results = _clean_results(raw)

        elif method == "collaborative":
            pipeline = _get_collab_user()
            raw = pipeline.get_recommendations(user_id, limit=limit)
            results = _clean_results(raw)

        else:  # hybrid (default)
            hybrid = _get_hybrid()
            raw = hybrid.recommend_jobs_for_user(user_id, limit=limit)
            results = _clean_results(raw)

        print(f"✅ Returning {len(results)} recommendations for user {user_id}")

        return JsonResponse({
            "success": True,
            "user_id": user_id,
            "method": method,
            "count": len(results),
            "recommendations": results,
        })

    except Exception as e:
        traceback.print_exc()
        print(f"❌ Error recommending jobs for user {user_id}: {e}")
        return JsonResponse({
            "success": False,
            "error": str(e),
            "recommendations": [],
        }, status=500)


# ============================================================
#  VIEW 2: Candidate Recommendations for a Job
#  GET /recommendations/candidates/<job_id>?limit=20&method=hybrid
# ============================================================
@csrf_exempt
@require_http_methods(["GET"])
def recommend_candidates(request, job_id):
    try:
        limit = int(request.GET.get("limit", 20))
        method = request.GET.get("method", "hybrid")

        print(f"📨 Candidate request: job_id={job_id}, method={method}, limit={limit}")

        if method == "content":
            pipeline = _get_content()
            raw = pipeline.get_candidate_recommendations_for_job(job_id, limit=limit)
            results = _clean_candidate_results(raw)

        else:  # hybrid (default)
            hybrid = _get_hybrid()
            raw = hybrid.recommend_candidates_for_job(job_id, limit=limit)
            results = _clean_candidate_results(raw)

        print(f"✅ Returning {len(results)} candidates for job {job_id}")

        return JsonResponse({
            "success": True,
            "job_id": job_id,
            "method": method,
            "count": len(results),
            "recommendations": results,
        })

    except Exception as e:
        traceback.print_exc()
        print(f"❌ Error recommending candidates for job {job_id}: {e}")
        return JsonResponse({
            "success": False,
            "error": str(e),
            "recommendations": [],
        }, status=500)


# ============================================================
#  VIEW 3: Trigger Pipeline Re-training
#  POST /pipeline/run?pipeline=all
# ============================================================
@csrf_exempt
@require_http_methods(["POST"])
def run_pipeline(request):
    try:
        pipeline_name = request.GET.get("pipeline", "all")

        print(f"🔄 Pipeline run requested: {pipeline_name}")

        if pipeline_name in ("content", "all"):
            print("  → Running Content-Based pipeline...")
            content = _get_content()
            content.run()
            print("  ✅ Content-Based done")

        if pipeline_name in ("collaborative", "all"):
            print("  → Running Collaborative User pipeline...")
            collab = _get_collab_user()
            collab.run()
            print("  ✅ Collaborative User done")

        # Reset hybrid so it picks up new factors
        global _hybrid
        _hybrid = None

        return JsonResponse({
            "success": True,
            "message": f"Pipeline '{pipeline_name}' completed successfully",
        })

    except Exception as e:
        traceback.print_exc()
        return JsonResponse({
            "success": False,
            "error": str(e),
        }, status=500)


# ============================================================
#  VIEW 4: Health Check
#  GET /health
# ============================================================
@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    status = {
        "status": "healthy",
        "service": "recommendation-engine",
        "models": {
            "hybrid": _hybrid is not None,
            "content": _content is not None,
            "collaborative": _collab_user is not None,
        }
    }
    return JsonResponse(status)