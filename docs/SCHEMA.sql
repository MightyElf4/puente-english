-- ═══════════════════════════════════════════════════════════════
-- Puente — Database Schema
-- Run this in Supabase: SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════


-- ── Profiles ─────────────────────────────────────────────────────
-- Extends Supabase auth.users with display name, role, and level.
-- A trigger creates a profile row automatically on every signup.

CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  level      TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-insert a profile whenever a new auth user signs up.
-- Pulls name and role from the metadata passed in signUp().
-- Must schema-qualify and pin search_path: the auth service connection
-- doesn't have "public" in its search_path, so unqualified names fail.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'role'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ── Classes ──────────────────────────────────────────────────────

CREATE TABLE classes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  level      TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  class_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generates a PNT-XXXX code, avoiding characters that look alike (I/1, O/0).
CREATE OR REPLACE FUNCTION generate_class_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code  TEXT := 'PNT-';
  i     INT;
BEGIN
  FOR i IN 1..4 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;


-- ── Class Members ────────────────────────────────────────────────
-- Students join a class by entering its class_code.

CREATE TABLE class_members (
  class_id   UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (class_id, student_id)
);


-- ── Assignments ──────────────────────────────────────────────────

CREATE TABLE assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('vocabulary', 'grammar', 'reading')),
  topic         TEXT NOT NULL,
  due_date      DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ── Vocabulary ───────────────────────────────────────────────────
-- All vocab lives here — both Puente defaults (created_by IS NULL)
-- and teacher-uploaded sets (created_by = teacher's profile id).

CREATE TABLE vocab_sets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  level      TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  is_public  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vocab_words (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id     UUID NOT NULL REFERENCES vocab_sets(id) ON DELETE CASCADE,
  word       TEXT NOT NULL,
  spanish    TEXT,
  definition TEXT,
  example    TEXT,
  emoji      TEXT
);


-- ── Word Progress ────────────────────────────────────────────────
-- One row per student-word pair. Updated (not inserted) on each review.
-- next_review is the foundation for spaced repetition.

CREATE TABLE word_progress (
  student_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  word_id       UUID REFERENCES vocab_words(id) ON DELETE CASCADE,
  times_seen    INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  last_seen     TIMESTAMPTZ,
  next_review   TIMESTAMPTZ,
  PRIMARY KEY (student_id, word_id)
);


-- ── Activity Progress ────────────────────────────────────────────
-- One row per completed grammar or reading session.
-- assignment_id is NULL for self-directed practice.

CREATE TABLE activity_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('grammar', 'reading')),
  topic         TEXT NOT NULL,
  score         INTEGER CHECK (score BETWEEN 0 AND 100),
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  completed_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ── Indexes ──────────────────────────────────────────────────────

CREATE INDEX ON classes        (teacher_id);
CREATE INDEX ON class_members  (student_id);
CREATE INDEX ON vocab_words    (set_id);
CREATE INDEX ON word_progress  (student_id);
CREATE INDEX ON word_progress  (word_id);
CREATE INDEX ON activity_progress (student_id);
CREATE INDEX ON activity_progress (topic);


-- ── Row Level Security ───────────────────────────────────────────
-- Enable RLS on all tables. Policies will be added before production.
-- Until then, use Supabase's service role key for any admin operations.

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_sets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_words       ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_progress     ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_progress ENABLE ROW LEVEL SECURITY;

-- Temporary open policies for development — REMOVE before launch.
CREATE POLICY "dev: allow all" ON profiles          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev: allow all" ON classes           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev: allow all" ON class_members     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev: allow all" ON assignments       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev: allow all" ON vocab_sets        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev: allow all" ON vocab_words       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev: allow all" ON word_progress     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev: allow all" ON activity_progress FOR ALL USING (true) WITH CHECK (true);
