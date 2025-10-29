-- Optional: Add email column to farmers table
-- Run this if you want to link farmers to auth users by email
-- If you skip this, the system will still work by creating farmers automatically

ALTER TABLE farmers ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS idx_farmers_email ON farmers(email) WHERE email IS NOT NULL;

