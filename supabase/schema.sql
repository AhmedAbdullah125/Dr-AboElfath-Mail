-- ============================================================
-- Dr. Abo Elfath Mail Manager — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Mails Table ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mails (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category     TEXT NOT NULL CHECK (category IN ('inbox', 'sent', 'spam', 'important')),
  subject      TEXT NOT NULL,
  body         TEXT NOT NULL DEFAULT '',
  from_address TEXT NOT NULL,
  to_address   TEXT NOT NULL,
  mail_date    DATE NOT NULL,
  mail_time    TIME NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Mail Attachments Table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mail_attachments (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mail_id   UUID NOT NULL REFERENCES mails(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url  TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mails_updated_at
  BEFORE UPDATE ON mails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security (RLS) ─────────────────────────────────────────────────
-- Disable RLS so API routes with service key can manage all rows.
-- If you add authentication later, enable RLS and write policies.
ALTER TABLE mails           DISABLE ROW LEVEL SECURITY;
ALTER TABLE mail_attachments DISABLE ROW LEVEL SECURITY;

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_mails_category ON mails(category);
CREATE INDEX IF NOT EXISTS idx_mails_date ON mails(mail_date DESC, mail_time DESC);
CREATE INDEX IF NOT EXISTS idx_attachments_mail_id ON mail_attachments(mail_id);

-- ─── Storage Bucket ───────────────────────────────────────────────────────────
-- Run in Supabase Dashboard → Storage → New Bucket
-- Name: mail-attachments
-- Public: true (so files can be downloaded via public URL)
-- Or run:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('mail-attachments', 'mail-attachments', true);
