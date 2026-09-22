from typing import List, Dict, Tuple

from config.database import (
    get_user_interaction_count, 
    get_job_interaction_count,
    is_user_new,
    is_job_new
)
from pipelines.content_based import ContentBasedPipeline
from pipelines.collaborative_user import CollaborativeUserPipeline
from pipelines.collaborative_company import CollaborativeCompanyPipeline


class HybridRecommendation:

    def __init__(self):
        self.content_pipeline = ContentBasedPipeline()
        self.collab_user_pipeline = CollaborativeUserPipeline()
        self.collab_company_pipeline = CollaborativeCompanyPipeline()

    @staticmethod
    def calculate_alpha(interaction_count: int) -> float:
        """
        حساب alpha بناءً على عدد التفاعلات
        """
        if interaction_count == 0:
            return 1.0
        if interaction_count < 5:
         return 0.9
        if interaction_count < 10:
            return 0.8
        if interaction_count < 15:
            return 0.7
        if interaction_count < 20:
            return 0.6
        if interaction_count < 30:
            return 0.5
        return 0.4

    @staticmethod
    def normalize_content_scores(scores: List[Tuple[int, float]]) -> List[Tuple[int, float]]:
        if not scores:
            return []
        return [(i, max(0.0, min(1.0, s))) for i, s in scores]

    @staticmethod
    def normalize_collab_scores(scores: List[Tuple[int, float]]) -> List[Tuple[int, float]]:
        if not scores:
            return []
        values = [s for _, s in scores]
        vmin = min(values)
        vmax = max(values)
        if vmax == vmin:
            return [(i, 0.5) for i, _ in scores]
        return [(i, (s - vmin) / (vmax - vmin)) for i, s in scores]

    # ============================================================
    #  توصيات وظائف للمستخدم (User → Jobs)
    # ============================================================
    def recommend_jobs_for_user(self, user_id: int, limit: int = 20) -> List[Dict]:
        
        # 1️⃣ فحص إذا المستخدم جديد (سجّل بعد آخر تدريب)
        user_is_new = is_user_new(user_id)
        
        # 2️⃣ دائماً نحسب Content-Based
        content = self.content_pipeline.get_job_recommendations_for_user(user_id, limit=100)
        content = self.normalize_content_scores(content)
        content_map = dict(content)

        # =============================================
        # 3️⃣ مستخدم جديد → Content-Based فقط
        # =============================================
        if user_is_new:
            print(f"DEBUG: User {user_id} is NEW (registered after model training) - Content-Based ONLY")
            combined: List[Dict] = []
            for jid, cs in content_map.items():
                combined.append({
                    "job_id": jid,
                    "score": cs,
                    "content_score": cs,
                    "collab_score": 0.0,
                    "alpha": 1.0,
                    "is_new_user": True,
                })
            combined.sort(key=lambda x: x["score"], reverse=True)
            return combined[:limit]

        # =============================================
        # 4️⃣ مستخدم قديم → Hybrid
        # =============================================
        inter_count = get_user_interaction_count(user_id)
        alpha = self.calculate_alpha(inter_count)
        
        print(f"DEBUG: User {user_id} is OLD - Hybrid (interactions={inter_count}, alpha={alpha})")

        collab = self.collab_user_pipeline.get_recommendations(user_id, limit=100)
        collab = self.normalize_collab_scores(collab)
        collab_map = dict(collab)

        job_ids = set(content_map.keys()) | set(collab_map.keys())
        combined: List[Dict] = []
        for jid in job_ids:
            cs = content_map.get(jid, 0.0)
            ms = collab_map.get(jid, 0.0)
            final = alpha * cs + (1.0 - alpha) * ms
            combined.append({
                "job_id": jid,
                "score": final,
                "content_score": cs,
                "collab_score": ms,
                "alpha": alpha,
                "is_new_user": False,
            })
        combined.sort(key=lambda x: x["score"], reverse=True)
        return combined[:limit]

    # ============================================================
    #  توصيات مرشحين للوظيفة (Job → Candidates)
    # ============================================================
    def recommend_candidates_for_job(self, job_id: int, limit: int = 20) -> List[Dict]:
        
        # 1️⃣ فحص إذا الوظيفة جديدة
        job_is_new = is_job_new(job_id)

        # 2️⃣ دائماً نحسب Content-Based
        content = self.content_pipeline.get_candidate_recommendations_for_job(job_id, limit=100)
        content = self.normalize_content_scores(content)
        content_map = dict(content)

        # =============================================
        # 3️⃣ وظيفة جديدة → Content-Based فقط
        # =============================================
        if job_is_new:
            print(f"DEBUG: Job {job_id} is NEW - Content-Based ONLY")
            combined: List[Dict] = []
            for uid, cs in content_map.items():
                combined.append({
                    "user_id": uid,
                    "score": cs,
                    "content_score": cs,
                    "collab_score": 0.0,
                    "alpha": 1.0,
                    "is_new_job": True,
                })
            combined.sort(key=lambda x: x["score"], reverse=True)
            return combined[:limit]

        # =============================================
        # 4️⃣ وظيفة قديمة → Hybrid
        # =============================================
        inter_count = get_job_interaction_count(job_id)
        alpha = self.calculate_alpha(inter_count)
        
        print(f"DEBUG: Job {job_id} is OLD - Hybrid (interactions={inter_count}, alpha={alpha})")

        collab = self.collab_company_pipeline.get_recommendations(job_id, limit=100)
        collab = self.normalize_collab_scores(collab)
        collab_map = dict(collab)

        user_ids = set(content_map.keys()) | set(collab_map.keys())
        combined: List[Dict] = []
        for uid in user_ids:
            cs = content_map.get(uid, 0.0)
            ms = collab_map.get(uid, 0.0)
            final = alpha * cs + (1.0 - alpha) * ms
            combined.append({
                "user_id": uid,
                "score": final,
                "content_score": cs,
                "collab_score": ms,
                "alpha": alpha,
                "is_new_job": False,
            })
        combined.sort(key=lambda x: x["score"], reverse=True)
        return combined[:limit]