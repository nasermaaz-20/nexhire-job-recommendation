#!/usr/bin/env python3
"""
Simple hybrid recommender demo (no NLP).

Generates synthetic users, jobs and interactions, builds content vectors,
computes cosine content scores, runs TruncatedSVD on the interaction matrix
to obtain collaborative scores, and combines them with a dynamic alpha.

Run: python demo/hybrid_demo.py
"""
import random
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity

SEED = 42
random.seed(SEED)
np.random.seed(SEED)

# Parameters (small so it runs quickly)
NUM_SKILLS = 50
NUM_FIELDS = 6
NUM_LOCATIONS = 8
NUM_USERS = 200
NUM_JOBS = 400
LATENT_K = 20


def generate_entities():
    # 1) Generate skill pools per field
    skills = list(range(NUM_SKILLS))
    field_skill_map = {f: random.sample(skills, k=15) for f in range(NUM_FIELDS)}

    # 2) Create jobs
    jobs = []
    for j in range(NUM_JOBS):
        field = np.random.choice(range(NUM_FIELDS), p=np.ones(NUM_FIELDS) / NUM_FIELDS)
        level = np.random.choice(
            [0, 1, 2], p=[0.4, 0.4, 0.2]
        )  # 0=junior,1=mid,2=senior
        loc = np.random.choice(range(NUM_LOCATIONS))
        req_exp = [0, 2, 5][level] + np.random.rand() * 3
        base_salary = 30000 + field * 10000 + level * 15000
        offered_min = int(base_salary * (0.9 + 0.1 * np.random.rand()))
        offered_max = int(base_salary * (1.0 + 0.2 * np.random.rand()))
        job_skills = random.sample(field_skill_map[field], k=5)
        jobs.append(
            {
                "job_id": j,
                "field": field,
                "level": level,
                "location": loc,
                "req_exp": req_exp,
                "salary_min": offered_min,
                "salary_max": offered_max,
                "skills": job_skills,
            }
        )
    jobs_df = pd.DataFrame(jobs)

    # 3) Create users
    users = []
    for u in range(NUM_USERS):
        field = np.random.choice(range(NUM_FIELDS))
        level = np.random.choice([0, 1, 2], p=[0.5, 0.35, 0.15])
        exp = [0.5, 3, 7][level] + np.random.rand() * 5
        expected_min = int(
            (30000 + field * 10000 + level * 12000) * (0.9 + 0.2 * np.random.rand())
        )
        expected_max = int(expected_min * (1.0 + 0.25 * np.random.rand()))
        user_sk = random.sample(field_skill_map[field], k=7)
        pref_locs = random.sample(range(NUM_LOCATIONS), k=2)
        users.append(
            {
                "user_id": u,
                "field": field,
                "level": level,
                "exp": exp,
                "salary_min": expected_min,
                "salary_max": expected_max,
                "skills": user_sk,
                "pref_locs": pref_locs,
            }
        )
    users_df = pd.DataFrame(users)

    return users, jobs, field_skill_map


def build_skill_matrix(entity_list, num_skills):
    M = np.zeros((len(entity_list), num_skills), dtype=float)
    for i, ent in enumerate(entity_list):
        for s in ent["skills"]:
            M[i, s] = 1.0
    return M


def build_other_features_users(users_list):
    n = len(users_list)
    exp = np.array([u["exp"] for u in users_list]).reshape(-1, 1)
    salary_mean = np.array(
        [(u["salary_min"] + u["salary_max"]) / 2 for u in users_list]
    ).reshape(-1, 1)
    field_oh = np.zeros((n, NUM_FIELDS))
    level_oh = np.zeros((n, 3))
    loc_mh = np.zeros((n, NUM_LOCATIONS))
    for i, u in enumerate(users_list):
        field_oh[i, u["field"]] = 1
        level_oh[i, u["level"]] = 1
        for l in u["pref_locs"]:
            loc_mh[i, l] = 1
    return np.hstack([exp, salary_mean, field_oh, level_oh, loc_mh])


def build_other_features_jobs(jobs_list):
    n = len(jobs_list)
    req_exp = np.array([j["req_exp"] for j in jobs_list]).reshape(-1, 1)
    salary_mean = np.array(
        [(j["salary_min"] + j["salary_max"]) / 2 for j in jobs_list]
    ).reshape(-1, 1)
    field_oh = np.zeros((n, NUM_FIELDS))
    level_oh = np.zeros((n, 3))
    loc_oh = np.zeros((n, NUM_LOCATIONS))
    for i, j in enumerate(jobs_list):
        field_oh[i, j["field"]] = 1
        level_oh[i, j["level"]] = 1
        loc_oh[i, j["location"]] = 1
    return np.hstack([req_exp, salary_mean, field_oh, level_oh, loc_oh])


def normalize_rows(X):
    norms = np.linalg.norm(X, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return X / norms


def generate_interactions(users, jobs, user_vectors_n, job_vectors_n):
    interactions = []
    for u_idx, user in enumerate(users):
        num_views = np.random.poisson(20)
        candidate_job_indices = np.random.choice(
            range(NUM_JOBS), size=min(100, NUM_JOBS), replace=False
        )
        for _ in range(num_views):
            j = np.random.choice(candidate_job_indices)
            cscore = float(np.dot(user_vectors_n[u_idx], job_vectors_n[j]))
            p_save = 0.02 + 0.3 * cscore
            p_apply = 0.005 + 0.1 * cscore
            if np.random.rand() < p_save:
                interactions.append({"user": u_idx, "job": j, "type": 2})
            if np.random.rand() < p_apply:
                interactions.append({"user": u_idx, "job": j, "type": 3})
            if np.random.rand() < 0.6:
                interactions.append({"user": u_idx, "job": j, "type": 1})
    inter_df = pd.DataFrame(interactions)
    return inter_df


def alpha_for_user(num_interactions, t1=5, t2=30):
    if num_interactions <= t1:
        return 1.0
    if num_interactions >= t2:
        return 0.0
    return 1.0 - (num_interactions - t1) / (t2 - t1)


def main():
    print("Generating synthetic data...")
    users, jobs, field_skill_map = generate_entities()

    user_skill_M = build_skill_matrix(users, NUM_SKILLS)
    job_skill_M = build_skill_matrix(jobs, NUM_SKILLS)

    user_other = build_other_features_users(users)
    job_other = build_other_features_jobs(jobs)

    scaler = MinMaxScaler()
    user_other[:, :2] = scaler.fit_transform(user_other[:, :2])
    job_other[:, :2] = scaler.transform(job_other[:, :2])

    user_vectors = np.hstack([user_skill_M, user_other])
    job_vectors = np.hstack([job_skill_M, job_other])

    user_vectors_n = normalize_rows(user_vectors)
    job_vectors_n = normalize_rows(job_vectors)

    print("Generating interactions...")
    inter_df = generate_interactions(users, jobs, user_vectors_n, job_vectors_n)

    # Build interaction matrix
    R = np.zeros((NUM_USERS, NUM_JOBS), dtype=float)
    type_weight = {1: 1.0, 2: 2.0, 3: 3.0, -1: -1.0}
    for _, row in inter_df.iterrows():
        R[int(row["user"]), int(row["job"])] += type_weight.get(int(row["type"]), 0.0)

    # Collaborative: TruncatedSVD on R
    svd = TruncatedSVD(n_components=LATENT_K, random_state=SEED)
    R_mat = np.log1p(R)
    user_latent = svd.fit_transform(R_mat)
    item_latent = svd.components_.T
    r_hat = user_latent.dot(item_latent.T)
    min_r, max_r = r_hat.min(), r_hat.max()
    collab_scores_norm = (r_hat - min_r) / (max_r - min_r + 1e-9)

    # Content scores
    content_scores = cosine_similarity(user_vectors_n, job_vectors_n)
    content_scores = np.clip(content_scores, 0.0, 1.0)

    user_interaction_counts = (R > 0).sum(axis=1)

    def recommend_for_user(u_id, topk=5):
        alpha = alpha_for_user(user_interaction_counts[u_id])
        final = alpha * content_scores[u_id] + (1.0 - alpha) * collab_scores_norm[u_id]
        top_idx = np.argsort(-final)[:topk]
        results = []
        for rank, j in enumerate(top_idx, start=1):
            user_sk = set(users[u_id]["skills"])
            job_sk = set(jobs[j]["skills"])
            skill_match = list(user_sk & job_sk)
            u_min, u_max = users[u_id]["salary_min"], users[u_id]["salary_max"]
            j_min, j_max = jobs[j]["salary_min"], jobs[j]["salary_max"]
            overlap = max(0, min(u_max, j_max) - max(u_min, j_min))
            salary_match = overlap > 0
            results.append(
                {
                    "rank": rank,
                    "job_id": int(j),
                    "final_score": float(final[j]),
                    "content_score": float(content_scores[u_id, j]),
                    "collab_score": float(collab_scores_norm[u_id, j]),
                    "alpha": float(alpha),
                    "skill_match": skill_match,
                    "salary_match": bool(salary_match),
                    "location_match": int(
                        jobs[j]["location"] in users[u_id]["pref_locs"]
                    ),
                }
            )
        return results

    # Demo for a few users
    for uid in [0, 10, 50]:
        recs = recommend_for_user(uid, topk=5)
        print(f"User {uid} (interactions={int(user_interaction_counts[uid])}):")
        for r in recs:
            print(r)
        print("----")

    # Cold-start example
    new_user = {
        "user_id": NUM_USERS,
        "field": 1,
        "level": 0,
        "exp": 1.0,
        "salary_min": 35000,
        "salary_max": 50000,
        "skills": random.sample(list(range(NUM_SKILLS)), k=6),
        "pref_locs": [0, 1],
    }
    new_user_skill = build_skill_matrix([new_user], NUM_SKILLS)
    new_user_other = build_other_features_users([new_user])
    new_user_other[:, :2] = scaler.transform(new_user_other[:, :2])
    new_v = np.hstack([new_user_skill, new_user_other])
    new_v_n = new_v / (np.linalg.norm(new_v, axis=1, keepdims=True) + 1e-9)
    cscores_new = cosine_similarity(new_v_n, job_vectors_n).flatten()
    top_j = np.argsort(-cscores_new)[:5]
    print("Cold-start new user recommendations (content only):")
    for j in top_j:
        print({"job": int(j), "content_score": float(cscores_new[j])})


if __name__ == "__main__":
    main()
