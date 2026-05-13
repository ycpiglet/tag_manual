-- ================================================================
-- STAR TEAM Robot Manual — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ================================================================

-- ── User Profiles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username  TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email     TEXT UNIQUE NOT NULL,
  role      TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin','staff','user')),
  sites     TEXT[] DEFAULT '{}',
  status    TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon can read profiles for login lookup"
  ON public.user_profiles FOR SELECT TO anon USING (true);
CREATE POLICY "auth users can read all profiles"
  ON public.user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "users can update own profile"
  ON public.user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "admin can update any profile"
  ON public.user_profiles FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "admin can insert profiles"
  ON public.user_profiles FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- ── Access Logs ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.access_logs (
  id             BIGSERIAL PRIMARY KEY,
  user_username  TEXT,
  user_name      TEXT,
  action         TEXT NOT NULL,
  ip             TEXT,
  ts             TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users can insert logs"
  ON public.access_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admin can read logs"
  ON public.access_logs FOR SELECT TO authenticated
  USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- ── Q&A Posts ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.qa_posts (
  id             BIGSERIAL PRIMARY KEY,
  title          TEXT NOT NULL,
  author         TEXT,
  date_posted    DATE DEFAULT CURRENT_DATE,
  status         TEXT DEFAULT 'wait' CHECK (status IN ('wait','done')),
  view_count     INTEGER DEFAULT 0,
  is_secret      BOOLEAN DEFAULT FALSE,
  robot_type     TEXT,
  site_label     TEXT,
  question_type  TEXT,
  body           TEXT NOT NULL,
  answer         TEXT,
  owner_username TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.qa_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users can read non-secret posts"
  ON public.qa_posts FOR SELECT TO authenticated
  USING (NOT is_secret);
CREATE POLICY "owner and admin can read secret posts"
  ON public.qa_posts FOR SELECT TO authenticated
  USING (is_secret AND (
    owner_username = (SELECT username FROM public.user_profiles WHERE id = auth.uid())
    OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
  ));
CREATE POLICY "auth users can insert posts"
  ON public.qa_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "owner and admin can update posts"
  ON public.qa_posts FOR UPDATE TO authenticated
  USING (
    owner_username = (SELECT username FROM public.user_profiles WHERE id = auth.uid())
    OR (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
  );
CREATE POLICY "admin can delete posts"
  ON public.qa_posts FOR DELETE TO authenticated
  USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- ── Contacts (STAR TEAM + Site) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contacts (
  id           TEXT PRIMARY KEY,
  group_name   TEXT NOT NULL,
  site_key     TEXT,
  site_label   TEXT,
  organization TEXT,
  full_name    TEXT NOT NULL,
  position     TEXT,
  role_tags    TEXT,
  email        TEXT,
  mobile       TEXT,
  office_phone TEXT,
  photo_url    TEXT,
  is_senior    BOOLEAN DEFAULT FALSE,
  sort_order   INTEGER DEFAULT 0
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users can read contacts"
  ON public.contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin can modify contacts"
  ON public.contacts FOR ALL TO authenticated
  USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- ── Partner Companies ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.partner_companies (
  company_key  TEXT PRIMARY KEY,
  label_ko     TEXT NOT NULL,
  label_en     TEXT,
  address      TEXT,
  website      TEXT,
  color_code   TEXT DEFAULT '#8e8e93',
  description  TEXT,
  systems      TEXT
);

ALTER TABLE public.partner_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users can read partner companies"
  ON public.partner_companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin can modify partner companies"
  ON public.partner_companies FOR ALL TO authenticated
  USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- ── Partner Contacts ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.partner_contacts (
  id          BIGSERIAL PRIMARY KEY,
  company_key TEXT NOT NULL REFERENCES public.partner_companies(company_key) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  position    TEXT,
  department  TEXT,
  role_tags   TEXT,
  email       TEXT,
  mobile      TEXT,
  landline    TEXT,
  fax         TEXT,
  sort_order  INTEGER DEFAULT 0
);

ALTER TABLE public.partner_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users can read partner contacts"
  ON public.partner_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin can modify partner contacts"
  ON public.partner_contacts FOR ALL TO authenticated
  USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- ── FAQ ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.faq (
  id         BIGSERIAL PRIMARY KEY,
  category   TEXT NOT NULL,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users can read faq"
  ON public.faq FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin can modify faq"
  ON public.faq FOR ALL TO authenticated
  USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- ── Glossary ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.glossary (
  id           BIGSERIAL PRIMARY KEY,
  term         TEXT NOT NULL,
  term_en      TEXT,
  category     TEXT NOT NULL,
  definition   TEXT,
  related_terms TEXT,
  sort_order   INTEGER DEFAULT 0
);

ALTER TABLE public.glossary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users can read glossary"
  ON public.glossary FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin can modify glossary"
  ON public.glossary FOR ALL TO authenticated
  USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- ── Changelog ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.changelog (
  id           BIGSERIAL PRIMARY KEY,
  version      TEXT NOT NULL,
  release_date TEXT,
  change_type  TEXT,
  description  TEXT,
  sort_order   INTEGER DEFAULT 0
);

ALTER TABLE public.changelog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users can read changelog"
  ON public.changelog FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin can modify changelog"
  ON public.changelog FOR ALL TO authenticated
  USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- ── Vendor Docs ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vendor_docs (
  id            BIGSERIAL PRIMARY KEY,
  vendor_group  TEXT NOT NULL,
  robot_name    TEXT,
  document_name TEXT NOT NULL,
  storage_path  TEXT,
  document_type TEXT,
  doc_date      TEXT
);

ALTER TABLE public.vendor_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users can read vendor docs"
  ON public.vendor_docs FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin can modify vendor docs"
  ON public.vendor_docs FOR ALL TO authenticated
  USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- ── Robots ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.robots (
  id          TEXT PRIMARY KEY,
  building    TEXT,
  name        TEXT NOT NULL,
  category    TEXT,
  icon        TEXT,
  robot_type  TEXT,
  floor       TEXT,
  site_key    TEXT,
  specs       JSONB,
  startup     TEXT,
  checklist   TEXT,
  ctrl        TEXT,
  manual_file TEXT,
  vendor_group TEXT,
  vendor_pdf  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.robots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users can read robots"
  ON public.robots FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin can modify robots"
  ON public.robots FOR ALL TO authenticated
  USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- ================================================================
-- Storage Buckets
-- Run these separately in Supabase Dashboard → Storage
-- Or use the Supabase CLI: supabase storage create <bucket>
-- ================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('manuals',     'manuals',     true),
--   ('vendor-docs', 'vendor-docs', true),
--   ('images',      'images',      true);
