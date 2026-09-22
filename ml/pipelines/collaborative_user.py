from typing import Dict, Tuple, List

from scipy.sparse import csr_matrix
import numpy as np

from config.database import (
  fetch_all_users,
  fetch_all_jobs,
  fetch_all_interactions,
  save_user_factors_uj,
  save_job_factors_uj,
)
from models.matrix_factorization import ALSMatrixFactorization


class CollaborativeUserPipeline:
  """
  Collaborative Filtering: User → Jobs
  Using interactions table.
  """

  WEIGHTS = {
    1: 1,  # View
    2: 3,  # Save
    3: 5,  # Apply
  }

  def __init__(self, n_factors: int = 50):
    self.n_factors = n_factors
    self.model = ALSMatrixFactorization(n_factors=n_factors)
    self.user_id_to_idx: Dict[int, int] = {}
    self.idx_to_user_id: Dict[int, int] = {}
    self.job_id_to_idx: Dict[int, int] = {}
    self.idx_to_job_id: Dict[int, int] = {}
    self._initialize_mappings()
    self._load_factors_if_available()

  def _initialize_mappings(self) -> None:
    """Initialize user and job ID mappings"""
    users = fetch_all_users()
    jobs = fetch_all_jobs()

    for idx, u in enumerate(users):
      self.user_id_to_idx[u["id"]] = idx
      self.idx_to_user_id[idx] = u["id"]

    for idx, j in enumerate(jobs):
      self.job_id_to_idx[j["id"]] = idx
      self.idx_to_job_id[idx] = j["id"]

  def _load_factors_if_available(self) -> None:
    """Load pre-trained factors from database if available"""
    try:
      from config.database import fetch_all
      
      # Try to load user factors
      user_factors_data = fetch_all("SELECT user_id, factors FROM user_factors_uj")
      job_factors_data = fetch_all("SELECT job_id, factors FROM job_factors_uj")
      
      if user_factors_data and job_factors_data:
        n_users = len(self.user_id_to_idx)
        n_jobs = len(self.job_id_to_idx)
        
        self.model.user_factors = np.zeros((n_users, self.n_factors))
        self.model.item_factors = np.zeros((n_jobs, self.n_factors))
        
        for row in user_factors_data:
          uid = row["user_id"]
          if uid in self.user_id_to_idx:
            idx = self.user_id_to_idx[uid]
            self.model.user_factors[idx] = np.array(row["factors"])
        
        for row in job_factors_data:
          jid = row["job_id"]
          if jid in self.job_id_to_idx:
            idx = self.job_id_to_idx[jid]
            self.model.item_factors[idx] = np.array(row["factors"])
        
        print(f"Loaded collaborative factors: {n_users} users, {n_jobs} jobs")
    except Exception as e:
      print(f"Could not load factors: {e}. Model needs training.")

  def run(self) -> None:
    print("Building User→Job interaction matrix...")
    matrix = self.build_interaction_matrix()
    print(f"Matrix shape: {matrix.shape}, nnz={matrix.nnz}")

    if matrix.nnz == 0:
      print("No interactions found, skipping ALS.")
      return

    print("Training ALS model...")
    self.model.fit(matrix)

    print("Saving factors to database...")
    self.save_factors()
    print("Collaborative User pipeline completed.")

  def build_interaction_matrix(self) -> csr_matrix:
    users = fetch_all_users()
    jobs = fetch_all_jobs()

    for idx, u in enumerate(users):
      self.user_id_to_idx[u["id"]] = idx
      self.idx_to_user_id[idx] = u["id"]

    for idx, j in enumerate(jobs):
      self.job_id_to_idx[j["id"]] = idx
      self.idx_to_job_id[idx] = j["id"]

    interactions = fetch_all_interactions()
    aggregated: Dict[Tuple[int, int], float] = {}
    for inter in interactions:
      uid = inter["user_id"]
      jid = inter["job_id"]
      it = inter["interaction_type"]
      w = self.WEIGHTS.get(it, 1)
      key = (uid, jid)
      aggregated[key] = aggregated.get(key, 0.0) + float(w)

    rows: List[int] = []
    cols: List[int] = []
    data: List[float] = []
    for (uid, jid), w in aggregated.items():
      if uid in self.user_id_to_idx and jid in self.job_id_to_idx:
        rows.append(self.user_id_to_idx[uid])
        cols.append(self.job_id_to_idx[jid])
        data.append(w)

    n_users = len(self.user_id_to_idx)
    n_jobs = len(self.job_id_to_idx)
    if not data:
      return csr_matrix((n_users, n_jobs))

    return csr_matrix((data, (rows, cols)), shape=(n_users, n_jobs))

  def save_factors(self) -> None:
    for idx, factors in enumerate(self.model.user_factors):
      uid = self.idx_to_user_id[idx]
      save_user_factors_uj(uid, factors.tolist())

    for idx, factors in enumerate(self.model.item_factors):
      jid = self.idx_to_job_id[idx]
      save_job_factors_uj(jid, factors.tolist())

  def get_recommendations(self, user_id: int, limit: int = 20) -> List[Tuple[int, float]]:
    # مستخدم مش موجود بالـ mapping
    if user_id not in self.user_id_to_idx:
      return []

    uidx = self.user_id_to_idx[user_id]

    # الموديل مش متدرب
    if self.model.user_factors is None:
      return []

    # المستخدم جديد - factors كلها أصفار
    if np.all(self.model.user_factors[uidx] == 0):
      return []

    recs = self.model.recommend_items(uidx, n_items=limit)
    return [(self.idx_to_job_id[i], score) for i, score in recs]

