# Hybrid Recommender Demo (no NLP)

This folder contains a small, self-contained prototype of the hybrid recommender described earlier.

Files:

- `hybrid_demo.py` — runnable Python script that generates synthetic data, computes content and collaborative scores, and prints example recommendations.
- `requirements.txt` — Python package requirements for the demo.

Running (PowerShell on Windows):

```powershell
python -m pip install -r demo/requirements.txt
python demo/hybrid_demo.py
```

Notes:

- This is a small demo intended for local experimentation. It uses TruncatedSVD (dense) for clarity. For larger datasets, use sparse factorization or ALS implementations.
- No NLP or text processing is used — all features are structured and numeric/categorical.
