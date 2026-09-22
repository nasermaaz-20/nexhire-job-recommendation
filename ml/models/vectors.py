from typing import List, Dict, Optional
import numpy as np

from data.mappings import (
    SKILL_TO_INDEX,
    LOCATION_TO_INDEX,
    FIELD_TO_INDEX,
    NUM_SKILLS,
    NUM_LOCATIONS,
    NUM_FIELDS,
    CAREER_LEVELS,
    EMPLOYMENT_TYPES,
    REMOTE_OPTIONS,
    VECTOR_SIZE,
)

def build_user_vector(
    user: Dict,
    user_skills: List[Dict],
    user_preferences: Optional[Dict],
    preferred_locations: List[Dict],
) -> np.ndarray:
    """
    Vector Structure:
    [skills (S) | experience (1) | locations (L) | field (F) |
     career_level (4) | employment_type (4) | remote (3) | salary (1)]
    """
    v = np.zeros(VECTOR_SIZE, dtype=float)

    # 1. Skills (Multi-Hot with Level weights)
    for s in user_skills:
        skill_id = s.get("skill_id") or s.get("skillId") or s.get("id")
        if not skill_id:
            continue
        try:
            skill_id = int(skill_id)
        except (ValueError, TypeError):
            continue
        if skill_id not in SKILL_TO_INDEX:
            continue
        idx = SKILL_TO_INDEX[skill_id]
        level = float(s.get("level", 1)) / 5.0
        v[idx] = max(v[idx], level)

    # 2. Experience (normalized)
    exp_idx = NUM_SKILLS
    years = user.get("years_of_experience") or user.get("yearsOfExperience") or 0
    v[exp_idx] = min(float(years) / 15.0, 1.0)

    # 3. Preferred locations (multi-hot, always 1.0)
    loc_start = NUM_SKILLS + 1
    for pl in preferred_locations:
        loc_id = pl.get("location_id") or pl.get("locationId") or pl.get("id")
        if not loc_id:
            continue
        try:
            loc_id = int(loc_id)
        except (ValueError, TypeError):
            continue
        if loc_id not in LOCATION_TO_INDEX:
            continue
        idx = LOCATION_TO_INDEX[loc_id]
        v[loc_start + idx] = 1.0  # Always 1.0 regardless of priority

    # 4. Field (one-hot)
    field_start = loc_start + NUM_LOCATIONS
    field_id = user.get("field_id") or user.get("fieldId")
    if field_id:
        try:
            field_id = int(field_id)
            if field_id in FIELD_TO_INDEX:
                fidx = FIELD_TO_INDEX[field_id]
                v[field_start + fidx] = 1.0
        except (ValueError, TypeError):
            pass

    # 5. Career level (one-hot)
    level_start = field_start + NUM_FIELDS
    cl = user.get("career_level") or user.get("careerLevel") or 1
    try:
        cl = int(cl)
        if 1 <= cl <= CAREER_LEVELS:
            v[level_start + (cl - 1)] = 1.0
    except:
        pass

    # 6. Preferred employment type (one-hot)
    emp_start = level_start + CAREER_LEVELS
    if user_preferences:
        et = user_preferences.get("preferred_employment_type") or user_preferences.get("preferredEmploymentType")
        if et:
            try:
                et = int(et)
                if 1 <= et <= EMPLOYMENT_TYPES:
                    v[emp_start + (et - 1)] = 1.0
            except:
                pass

    # 7. Remote preference (one-hot, 0/1/2)
    remote_start = emp_start + EMPLOYMENT_TYPES
    if user_preferences:
        r = user_preferences.get("remote_preference") or user_preferences.get("remotePreference")
        if r is not None:
            try:
                r = int(r)
                if 0 <= r < REMOTE_OPTIONS:
                    v[remote_start + r] = 1.0
            except:
                pass

    # 8. Desired salary (normalized)
    salary_idx = remote_start + REMOTE_OPTIONS
    dmin = user.get("desired_salary_min") or user.get("desiredSalaryMin")
    dmax = user.get("desired_salary_max") or user.get("desiredSalaryMax")
    if dmin is not None and dmax is not None:
        avg = (float(dmin) + float(dmax)) / 2.0
        v[salary_idx] = min(avg / 50000.0, 1.0)

    return v

def build_job_vector(job: Dict, job_skills: List[Dict]) -> np.ndarray:
    v = np.zeros(VECTOR_SIZE, dtype=float)

    # 1. Skills
    for s in job_skills:
        skill_id = s.get("skill_id") or s.get("skillId") or s.get("id")
        if not skill_id:
            continue
        try:
            skill_id = int(skill_id)
        except (ValueError, TypeError):
            continue
        if skill_id not in SKILL_TO_INDEX:
            continue
        idx = SKILL_TO_INDEX[skill_id]
        v[idx] = 1.0  # Always 1.0 regardless of importance or is_required

    # 2. Experience
    exp_idx = NUM_SKILLS
    min_exp = job.get("min_experience") or job.get("minExperience") or 0
    max_exp = job.get("max_experience") or job.get("maxExperience") or min_exp
    mid = (float(min_exp) + float(max_exp)) / 2.0
    v[exp_idx] = min(mid / 15.0, 1.0)

    # 3. Location
    loc_start = NUM_SKILLS + 1
    loc_id = job.get("location_id") or job.get("locationId")
    if loc_id:
        try:
            loc_id = int(loc_id)
            if loc_id in LOCATION_TO_INDEX:
                lidx = LOCATION_TO_INDEX[loc_id]
                v[loc_start + lidx] = 1.0
        except (ValueError, TypeError):
            pass

    # 4. Field
    field_start = loc_start + NUM_LOCATIONS
    field_id = job.get("field_id") or job.get("fieldId")
    if field_id:
        try:
            field_id = int(field_id)
            if field_id in FIELD_TO_INDEX:
                fidx = FIELD_TO_INDEX[field_id]
                v[field_start + fidx] = 1.0
        except (ValueError, TypeError):
            pass

    # 5. Job level
    level_start = field_start + NUM_FIELDS
    jl = job.get("job_level") or job.get("jobLevel") or 1
    try:
        jl = int(jl)
        if 1 <= jl <= CAREER_LEVELS:
            v[level_start + (jl - 1)] = 1.0
    except:
        pass

    # 6. Employment type
    emp_start = level_start + CAREER_LEVELS
    et = job.get("employment_type") or job.get("employmentType") or 1
    try:
        et = int(et)
        if 1 <= et <= EMPLOYMENT_TYPES:
            v[emp_start + (et - 1)] = 1.0
    except:
        pass

    # 7. Remote option
    remote_start = emp_start + EMPLOYMENT_TYPES
    ro = job.get("remote_option") or job.get("remoteOption") or 0
    try:
        ro = int(ro)
        if 0 <= ro < REMOTE_OPTIONS:
            v[remote_start + ro] = 1.0
    except:
        pass

    # 8. Salary
    salary_idx = remote_start + REMOTE_OPTIONS
    smin = job.get("salary_min") or job.get("salaryMin")
    smax = job.get("salary_max") or job.get("salaryMax")
    if smin is not None and smax is not None:
        avg = (float(smin) + float(smax)) / 2.0
        v[salary_idx] = min(avg / 50000.0, 1.0)

    return v