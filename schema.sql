

BEGIN;

-- 1. Locations
CREATE TABLE locations (
    id           BIGSERIAL PRIMARY KEY,
    country      VARCHAR(100) NOT NULL,
    city         VARCHAR(100) NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locations_country_city ON locations (country, city);
CREATE INDEX idx_locations_created_at ON locations (created_at);


-- 2. Fields
CREATE TABLE fields (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fields_created_at ON fields (created_at);


-- 3. Skills
CREATE TABLE skills (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    field_id   BIGINT REFERENCES fields(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skills_field_id ON skills (field_id);
CREATE INDEX idx_skills_created_at ON skills (created_at);


-- 4. Companies
CREATE TABLE companies (
    id             BIGSERIAL PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    industry       SMALLINT NOT NULL,
    company_size   SMALLINT NOT NULL,
    location_id    BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    founded_year   SMALLINT,
    website        VARCHAR(255),
    is_verified    SMALLINT NOT NULL DEFAULT 0,
    is_active      SMALLINT NOT NULL DEFAULT 1,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_companies_industry CHECK (industry BETWEEN 1 AND 7),
    CONSTRAINT chk_companies_company_size CHECK (company_size BETWEEN 1 AND 5),
    CONSTRAINT chk_companies_is_verified CHECK (is_verified IN (0, 1)),
    CONSTRAINT chk_companies_is_active CHECK (is_active IN (0, 1))
);

CREATE INDEX idx_companies_email ON companies (email);
CREATE INDEX idx_companies_location_id ON companies (location_id);
CREATE INDEX idx_companies_created_at ON companies (created_at);
CREATE INDEX idx_companies_is_active ON companies (is_active);


-- 5. Users
CREATE TABLE users (
    id                    BIGSERIAL PRIMARY KEY,
    name                  VARCHAR(255) NOT NULL,
    email                 VARCHAR(255) NOT NULL UNIQUE,
    password_hash         VARCHAR(255) NOT NULL,
    years_of_experience   SMALLINT NOT NULL DEFAULT 0,
    career_level          SMALLINT NOT NULL,
    field_id              BIGINT REFERENCES fields(id) ON DELETE SET NULL,
    current_location_id   BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    desired_salary_min    INTEGER,
    desired_salary_max    INTEGER,
    is_active             SMALLINT NOT NULL DEFAULT 1,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_users_career_level CHECK (career_level BETWEEN 1 AND 4),
    CONSTRAINT chk_users_is_active CHECK (is_active IN (0, 1)),
    CONSTRAINT chk_users_salary_range CHECK (
        desired_salary_min IS NULL
        OR desired_salary_max IS NULL
        OR desired_salary_min <= desired_salary_max
    )
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_field_id ON users (field_id);
CREATE INDEX idx_users_current_location_id ON users (current_location_id);
CREATE INDEX idx_users_created_at ON users (created_at);
CREATE INDEX idx_users_is_active ON users (is_active);


-- 6. Jobs
CREATE TABLE jobs (
    id               BIGSERIAL PRIMARY KEY,
    company_id       BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title            VARCHAR(255) NOT NULL,
    field_id         BIGINT NOT NULL REFERENCES fields(id) ON DELETE SET NULL,
    job_level        SMALLINT NOT NULL,
    location_id      BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    min_experience   SMALLINT,
    max_experience   SMALLINT,
    salary_min       INTEGER,
    salary_max       INTEGER,
    employment_type  SMALLINT NOT NULL,
    remote_option    SMALLINT NOT NULL,
    is_active        SMALLINT NOT NULL DEFAULT 1,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at       TIMESTAMPTZ,
    CONSTRAINT chk_jobs_job_level CHECK (job_level BETWEEN 1 AND 4),
    CONSTRAINT chk_jobs_employment_type CHECK (employment_type BETWEEN 1 AND 4),
    CONSTRAINT chk_jobs_remote_option CHECK (remote_option IN (0, 1, 2)),
    CONSTRAINT chk_jobs_is_active CHECK (is_active IN (0, 1)),
    CONSTRAINT chk_jobs_exp_range CHECK (
        min_experience IS NULL
        OR max_experience IS NULL
        OR min_experience <= max_experience
    ),
    CONSTRAINT chk_jobs_salary_range CHECK (
        salary_min IS NULL
        OR salary_max IS NULL
        OR salary_min <= salary_max
    )
);

CREATE INDEX idx_jobs_company_id ON jobs (company_id);
CREATE INDEX idx_jobs_field_id ON jobs (field_id);
CREATE INDEX idx_jobs_location_id ON jobs (location_id);
CREATE INDEX idx_jobs_is_active ON jobs (is_active);
CREATE INDEX idx_jobs_created_at ON jobs (created_at);
CREATE INDEX idx_jobs_expires_at ON jobs (expires_at);


-- 7. User_Skills
CREATE TABLE user_skills (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id   BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    level      SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_skills UNIQUE (user_id, skill_id),
    CONSTRAINT chk_user_skills_level CHECK (level BETWEEN 1 AND 5)
);

CREATE INDEX idx_user_skills_user_id ON user_skills (user_id);
CREATE INDEX idx_user_skills_skill_id ON user_skills (skill_id);
CREATE INDEX idx_user_skills_created_at ON user_skills (created_at);


-- 8. Job_Skills
CREATE TABLE job_skills (
    id          BIGSERIAL PRIMARY KEY,
    job_id      BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id    BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    importance  SMALLINT NOT NULL,
    is_required SMALLINT NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_job_skills UNIQUE (job_id, skill_id),
    CONSTRAINT chk_job_skills_importance CHECK (importance BETWEEN 1 AND 5),
    CONSTRAINT chk_job_skills_is_required CHECK (is_required IN (0, 1))
);

CREATE INDEX idx_job_skills_job_id ON job_skills (job_id);
CREATE INDEX idx_job_skills_skill_id ON job_skills (skill_id);
CREATE INDEX idx_job_skills_created_at ON job_skills (created_at);


-- 9. User_Preferences
CREATE TABLE user_preferences (
    id                         BIGSERIAL PRIMARY KEY,
    user_id                    BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    preferred_field_id         BIGINT REFERENCES fields(id) ON DELETE SET NULL,
    preferred_job_level        SMALLINT,
    preferred_employment_type  SMALLINT,
    remote_preference          SMALLINT,
    min_salary                 INTEGER,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_user_pref_job_level CHECK (
        preferred_job_level IS NULL OR preferred_job_level BETWEEN 1 AND 4
    ),
    CONSTRAINT chk_user_pref_employment_type CHECK (
        preferred_employment_type IS NULL OR preferred_employment_type BETWEEN 1 AND 4
    ),
    CONSTRAINT chk_user_pref_remote_preference CHECK (
        remote_preference IS NULL OR remote_preference IN (0, 1, 2)
    )
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences (user_id);
CREATE INDEX idx_user_preferences_preferred_field_id ON user_preferences (preferred_field_id);
CREATE INDEX idx_user_preferences_created_at ON user_preferences (created_at);


-- 10. User_Preferred_Locations
CREATE TABLE user_preferred_locations (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    priority    SMALLINT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_preferred_locations UNIQUE (user_id, location_id),
    CONSTRAINT chk_user_pref_locations_priority CHECK (priority BETWEEN 1 AND 5)
);

CREATE INDEX idx_user_preferred_locations_user_id ON user_preferred_locations (user_id);
CREATE INDEX idx_user_preferred_locations_location_id ON user_preferred_locations (location_id);
CREATE INDEX idx_user_preferred_locations_created_at ON user_preferred_locations (created_at);


-- 11. Interactions
CREATE TABLE interactions (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id           BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    interaction_type SMALLINT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_interactions_type CHECK (interaction_type IN (1, 2, 3))
);

CREATE INDEX idx_interactions_user_id ON interactions (user_id);
CREATE INDEX idx_interactions_job_id ON interactions (job_id);
CREATE INDEX idx_interactions_type ON interactions (interaction_type);
CREATE INDEX idx_interactions_created_at ON interactions (created_at);


-- 12. Company_Candidate_Interactions
CREATE TABLE company_candidate_interactions (
    id               BIGSERIAL PRIMARY KEY,
    company_id       BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id           BIGINT REFERENCES jobs(id) ON DELETE SET NULL,
    interaction_type SMALLINT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_company_candidate_interactions_type CHECK (interaction_type IN (1, 2, 3, 4))
);

CREATE INDEX idx_cc_interactions_company_id ON company_candidate_interactions (company_id);
CREATE INDEX idx_cc_interactions_user_id ON company_candidate_interactions (user_id);
CREATE INDEX idx_cc_interactions_job_id ON company_candidate_interactions (job_id);
CREATE INDEX idx_cc_interactions_type ON company_candidate_interactions (interaction_type);
CREATE INDEX idx_cc_interactions_created_at ON company_candidate_interactions (created_at);


-- 13. Applications
CREATE TABLE applications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id      BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    company_id  BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    status      SMALLINT NOT NULL,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_applications_user_job UNIQUE (user_id, job_id),
    CONSTRAINT chk_applications_status CHECK (status BETWEEN 1 AND 5)
);

CREATE INDEX idx_applications_user_id ON applications (user_id);
CREATE INDEX idx_applications_job_id ON applications (job_id);
CREATE INDEX idx_applications_company_id ON applications (company_id);
CREATE INDEX idx_applications_status ON applications (status);
CREATE INDEX idx_applications_applied_at ON applications (applied_at);


COMMIT;


-- ============================================
-- Additional tables for ML pipeline
-- ============================================

BEGIN;

-- Content-Based Vectors
CREATE TABLE IF NOT EXISTS user_vectors (
    user_id   BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    vector    JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_vectors (
    job_id    BIGINT PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
    vector    JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collaborative Factors (User → Job)
CREATE TABLE IF NOT EXISTS user_factors_uj (
    user_id   BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    factors   JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_factors_uj (
    job_id    BIGINT PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
    factors   JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collaborative Factors (Job → User)
CREATE TABLE IF NOT EXISTS job_factors_ju (
    job_id    BIGINT PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
    factors   JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_factors_ju (
    user_id   BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    factors   JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;


