from typing import Dict, List, Optional

import numpy as np


# Lazy loading - data will be loaded on first access
_skills: Optional[List] = None
_locations: Optional[List] = None
_fields: Optional[List] = None
_skill_to_index: Optional[Dict[int, int]] = None
_location_to_index: Optional[Dict[int, int]] = None
_field_to_index: Optional[Dict[int, int]] = None


def _load_data():
    """Load data from database on first access"""
    global _skills, _locations, _fields
    global _skill_to_index, _location_to_index, _field_to_index
    
    if _skills is None:
        from config.database import fetch_all_skills, fetch_all_locations, fetch_all_fields
        
        _skills = fetch_all_skills()
        _locations = fetch_all_locations()
        _fields = fetch_all_fields()
        
        _skill_to_index = {s["id"]: idx for idx, s in enumerate(_skills)}
        _location_to_index = {l["id"]: idx for idx, l in enumerate(_locations)}
        _field_to_index = {f["id"]: idx for idx, f in enumerate(_fields)}


# Initialize data on module import
_load_data()

# Now expose as module-level variables
skills = _skills
locations = _locations
fields = _fields
SKILL_TO_INDEX = _skill_to_index
LOCATION_TO_INDEX = _location_to_index
FIELD_TO_INDEX = _field_to_index

NUM_SKILLS = len(_skills)
NUM_LOCATIONS = len(_locations)
NUM_FIELDS = len(_fields)
CAREER_LEVELS = 4
EMPLOYMENT_TYPES = 4
REMOTE_OPTIONS = 3

# skills (S) + experience (1) + locations (L) + fields (F)
# + career_level (4) + employment_type (4) + remote (3) + salary (1)
VECTOR_SIZE = (
    NUM_SKILLS
    + 1
    + NUM_LOCATIONS
    + NUM_FIELDS
    + CAREER_LEVELS
    + EMPLOYMENT_TYPES
    + REMOTE_OPTIONS
    + 1
)

