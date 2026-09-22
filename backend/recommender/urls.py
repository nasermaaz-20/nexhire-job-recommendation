from django.urls import path
from . import views

urlpatterns = [
    # Job recommendations for a user
    path(
        "recommendations/jobs/<int:user_id>",
        views.recommend_jobs,
        name="recommend-jobs",
    ),

    # Candidate recommendations for a job
    path(
        "recommendations/candidates/<int:job_id>",
        views.recommend_candidates,
        name="recommend-candidates",
    ),

    # Trigger pipeline re-training
    path(
        "pipeline/run",
        views.run_pipeline,
        name="run-pipeline",
    ),

    # Health check
    path(
        "health",
        views.health_check,
        name="health-check",
    ),
]