-- جداول ML للـ Vectors والـ Factors
-- يجب تشغيلها على نفس قاعدة البيانات job_recommendation

-- Content-Based Vectors
CREATE TABLE IF NOT EXISTS user_vectors (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    vector JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_vectors_user_id ON user_vectors(user_id);

CREATE TABLE IF NOT EXISTS job_vectors (
    job_id BIGINT PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
    vector JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_vectors_job_id ON job_vectors(job_id);

-- Collaborative Factors (User → Job)
CREATE TABLE IF NOT EXISTS user_factors_uj (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    factors JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_factors_uj_user_id ON user_factors_uj(user_id);

CREATE TABLE IF NOT EXISTS job_factors_uj (
    job_id BIGINT PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
    factors JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_factors_uj_job_id ON job_factors_uj(job_id);

-- Collaborative Factors (Job → User) للشركات
CREATE TABLE IF NOT EXISTS job_factors_ju (
    job_id BIGINT PRIMARY KEY REFERENCES jobs(id) ON DELETE CASCADE,
    factors JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_factors_ju_job_id ON job_factors_ju(job_id);

CREATE TABLE IF NOT EXISTS user_factors_ju (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    factors JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_factors_ju_user_id ON user_factors_ju(user_id);

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'ML tables created successfully!'; 
END $$;

