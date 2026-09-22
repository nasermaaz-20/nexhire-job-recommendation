import numpy as np


def min_max_scale(values):
  arr = np.array(values, dtype=float)
  if arr.size == 0:
    return arr
  vmin = arr.min()
  vmax = arr.max()
  if vmax == vmin:
    return np.zeros_like(arr)
  return (arr - vmin) / (vmax - vmin)


def zscore(values):
  arr = np.array(values, dtype=float)
  if arr.size == 0:
    return arr
  mean = arr.mean()
  std = arr.std()
  if std == 0:
    return np.zeros_like(arr)
  return (arr - mean) / std

