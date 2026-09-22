from typing import Tuple, List

import numpy as np
from scipy.sparse import csr_matrix


class ALSMatrixFactorization:
  """
  Simple ALS implementation for implicit feedback.
  interaction_matrix: users x items with positive values.
  """

  def __init__(self, n_factors: int = 50, regularization: float = 0.01, iterations: int = 15, alpha: float = 40.0):
    self.n_factors = n_factors
    self.regularization = regularization
    self.iterations = iterations
    self.alpha = alpha
    self.user_factors: np.ndarray | None = None
    self.item_factors: np.ndarray | None = None

  def fit(self, interaction_matrix: csr_matrix) -> "ALSMatrixFactorization":
    n_users, n_items = interaction_matrix.shape

    # Initialize randomly
    self.user_factors = 0.01 * np.random.randn(n_users, self.n_factors)
    self.item_factors = 0.01 * np.random.randn(n_items, self.n_factors)

    # convert to confidence matrix C = 1 + alpha * R (dense for small dev sizes)
    R = interaction_matrix.toarray().astype(float)
    C = 1.0 + self.alpha * R

    for it in range(self.iterations):
      print(f"  ALS iteration {it + 1}/{self.iterations}")
      self._update(C, self.user_factors, self.item_factors)
      self._update(C.T, self.item_factors, self.user_factors)

    return self

  def _update(self, C: np.ndarray, X: np.ndarray, Y: np.ndarray) -> None:
    """
    Update factors X given fixed factors Y and confidence C.
    X: num_entities x k, Y: num_other x k, C: num_entities x num_other
    """
    num_entities, num_items = C.shape
    YtY = Y.T @ Y
    regI = self.regularization * np.eye(self.n_factors)

    for u in range(num_entities):
      Cu = np.diag(C[u])
      pu = (C[u] > 1).astype(float)
      A = YtY + Y.T @ (Cu - np.eye(num_items)) @ Y + regI
      b = Y.T @ Cu @ pu
      X[u] = np.linalg.solve(A, b)

  def predict(self, user_idx: int, item_idx: int) -> float:
    return float(self.user_factors[user_idx] @ self.item_factors[item_idx])

  def recommend_items(
      self,
      user_idx: int,
      n_items: int = 20,
      exclude_known: bool = True,
      known_items: List[int] | None = None,
  ) -> List[Tuple[int, float]]:
    scores = self.user_factors[user_idx] @ self.item_factors.T
    if exclude_known and known_items:
      scores[known_items] = -np.inf
    top_idx = np.argsort(scores)[::-1][:n_items]
    return [(int(i), float(scores[i])) for i in top_idx]

  def recommend_users(
      self,
      item_idx: int,
      n_users: int = 20,
      exclude_known: bool = True,
      known_users: List[int] | None = None,
  ) -> List[Tuple[int, float]]:
    scores = self.item_factors[item_idx] @ self.user_factors.T
    if exclude_known and known_users:
      scores[known_users] = -np.inf
    top_idx = np.argsort(scores)[::-1][:n_users]
    return [(int(i), float(scores[i])) for i in top_idx]

