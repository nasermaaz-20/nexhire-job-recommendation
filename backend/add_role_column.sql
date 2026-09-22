-- Add role column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'job_seeker';

-- Update existing admin user
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@nexhire.com';

-- Verify
SELECT user_id, email, first_name, role FROM users WHERE email = 'admin@nexhire.com';
