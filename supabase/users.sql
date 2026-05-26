-- ============================================================
-- Users Table — Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username     TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  role         TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login   TIMESTAMPTZ
);

-- Disable RLS (API routes use service_role key)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Index for fast username lookup
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ─── Insert the first admin user ──────────────────────────────────────────────
-- Password: Admin@1234  (bcrypt hash — change after first login!)
-- To generate a new hash: https://bcrypt-generator.com (rounds: 10)
INSERT INTO users (username, password_hash, display_name, role)
VALUES (
  'dr.aboelfath',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Dr. Abo Elfath',
  'admin'
)
ON CONFLICT (username) DO NOTHING;
