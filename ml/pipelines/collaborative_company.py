from typing import Dict, Tuple, List

from scipy.sparse import csr_matrix

from config.database import (
  fetch_all_users,
  fetch_all_jobs,
  fetch_company_candidate_interactions,
  save_job_factors_ju,
  save_user_factors_ju,
)
from models.matrix_factorization import ALSMatrixFactorization


class CollaborativeCompanyPipeline:
  """
  Collaborative Filtering: Job → Users
  Using company_candidate_interactions.
  """

  WEIGHTS = {
    1: 1,  # View
    2: 3,  # Shortlist
    3: 5,  # Invite
    4: 7,  # Contact
  }

  def __init__(self, n_factors: int = 50):
    self.n_factors = n_factors
    self.model = ALSMatrixFactorization(n_factors=n_factors)
    self.job_id_to_idx: Dict[int, int] = {}
    self.idx_to_job_id: Dict[int, int] = {}
    self.user_id_to_idx: Dict[int, int] = {}
    self.idx_to_user_id: Dict[int, int] = {}
    self._initialize_mappings()
    self._load_factors_if_available()

  def _initialize_mappings(self) -> None:
    """Initialize job and user ID mappings"""
    jobs = fetch_all_jobs()
    users = fetch_all_users()

    for idx, j in enumerate(jobs):
      self.job_id_to_idx[j["id"]] = idx
      self.idx_to_job_id[idx] = j["id"]

    for idx, u in enumerate(users):
      self.user_id_to_idx[u["id"]] = idx
      self.idx_to_user_id[idx] = u["id"]

  def _load_factors_if_available(self) -> None:
    """Load pre-trained factors from database if available"""
    try:
      import numpy as np
      from config.database import fetch_all
      
      # Try to load job factors
      job_factors_data = fetch_all("SELECT job_id, factors FROM job_factors_ju")
      user_factors_data = fetch_all("SELECT user_id, factors FROM user_factors_ju")
      
      if job_factors_data and user_factors_data:
        n_jobs = len(self.job_id_to_idx)
        n_users = len(self.user_id_to_idx)
        
        self.model.user_factors = np.zeros((n_jobs, self.n_factors))
        self.model.item_factors = np.zeros((n_users, self.n_factors))
        
        for row in job_factors_data:
          jid = row["job_id"]
          if jid in self.job_id_to_idx:
            idx = self.job_id_to_idx[jid]
            self.model.user_factors[idx] = np.array(row["factors"])
        
        for row in user_factors_data:
          uid = row["user_id"]
          if uid in self.user_id_to_idx:
            idx = self.user_id_to_idx[uid]
            self.model.item_factors[idx] = np.array(row["factors"])
        
        print(f"Loaded collaborative company factors: {n_jobs} jobs, {n_users} users")
    except Exception as e:
      print(f"Could not load factors: {e}. Model needs training.")

  def run(self) -> None:
    print("Building Job→User interaction matrix...")
    matrix = self.build_interaction_matrix()
    print(f"Matrix shape: {matrix.shape}, nnz={matrix.nnz}")

    if matrix.nnz == 0:
      print("No company-candidate interactions found, skipping ALS.")
      return

    print("Training ALS model...")
    self.model.fit(matrix)

    print("Saving factors to database...")
    self.save_factors()
    print("Collaborative Company pipeline completed.")

  def build_interaction_matrix(self) -> csr_matrix:
    jobs = fetch_all_jobs()
    users = fetch_all_users()

    for idx, j in enumerate(jobs):
      self.job_id_to_idx[j["id"]] = idx
      self.idx_to_job_id[idx] = j["id"]

    for idx, u in enumerate(users):
      self.user_id_to_idx[u["id"]] = idx
      self.idx_to_user_id[idx] = u["id"]

    interactions = fetch_company_candidate_interactions()

    aggregated: Dict[Tuple[int, int], float] = {}
    for inter in interactions:
      jid = inter["job_id"]
      uid = inter["user_id"]
      it = inter["interaction_type"]
      w = self.WEIGHTS.get(it, 1)
      key = (jid, uid)
      aggregated[key] = aggregated.get(key, 0.0) + float(w)

    rows: List[int] = []
    cols: List[int] = []
    data: List[float] = []
    for (jid, uid), w in aggregated.items():
      if jid in self.job_id_to_idx and uid in self.user_id_to_idx:
        rows.append(self.job_id_to_idx[jid])
        cols.append(self.user_id_to_idx[uid])
        data.append(w)

    n_jobs = len(self.job_id_to_idx)
    n_users = len(self.user_id_to_idx)
    if not data:
      return csr_matrix((n_jobs, n_users))

    return csr_matrix((data, (rows, cols)), shape=(n_jobs, n_users))

  def save_factors(self) -> None:
    # In this orientation, user_factors -> jobs, item_factors -> users
    for idx, factors in enumerate(self.model.user_factors):
      jid = self.idx_to_job_id[idx]
      save_job_factors_ju(jid, factors.tolist())

    for idx, factors in enumerate(self.model.item_factors):
      uid = self.idx_to_user_id[idx]
      save_user_factors_ju(uid, factors.tolist())

  def get_recommendations(self, job_id: int, limit: int = 20) -> List[Tuple[int, float]]:
    if job_id not in self.job_id_to_idx:
      return []
    jidx = self.job_id_to_idx[job_id]
    recs = self.model.recommend_items(jidx, n_items=limit)
    return [(self.idx_to_user_id[i], score) for i, score in recs]

