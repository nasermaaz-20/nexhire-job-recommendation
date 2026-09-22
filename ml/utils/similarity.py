import numpy as np


def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
  dot = float(np.dot(vec1, vec2))
  n1 = float(np.linalg.norm(vec1))
  n2 = float(np.linalg.norm(vec2))
  if n1 == 0.0 or n2 == 0.0:
    return 0.0
  return dot / (n1 * n2)


def batch_cosine_similarity(query_vector: np.ndarray, matrix: np.ndarray) -> np.ndarray:
  """
  Compute cosine similarity between one vector and a matrix of vectors.
  Returns shape (n_rows,)
  """
  q_norm = np.linalg.norm(query_vector)
  if q_norm == 0.0:
    return np.zeros(matrix.shape[0], dtype=float)

  q = query_vector / q_norm
  norms = np.linalg.norm(matrix, axis=1, keepdims=True)
  norms[norms == 0.0] = 1.0
  m_norm = matrix / norms
  return m_norm @ q

