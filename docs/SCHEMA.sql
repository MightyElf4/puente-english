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
-- Least-privilege policies, applied to production 2026-07-19 as
-- migration harden_rls_policies. All policies are TO authenticated;
-- anon gets nothing. Absence of a policy for a command = denied.

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_sets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_words       ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_progress     ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_progress ENABLE ROW LEVEL SECURITY;

-- ── RLS helper functions ─────────────────────────────────────────
-- SECURITY DEFINER so policy checks bypass RLS on the tables they
-- consult — this prevents infinite recursion between the
-- classes ↔ class_members policies. Don't inline these as plain
-- subqueries or Postgres will throw "infinite recursion detected".
--
-- They live in the "private" schema so PostgREST doesn't expose them
-- at /rest/v1/rpc/* (security advisor 0029). Policies can still call
-- them because authenticated has EXECUTE.

CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;

-- Current user's role ('student' | 'teacher').
CREATE OR REPLACE FUNCTION private.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

-- Does the current user own this class?
CREATE OR REPLACE FUNCTION private.is_teacher_of_class(p_class_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes
    WHERE id = p_class_id AND teacher_id = auth.uid()
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

-- Is the current user a member (student) of this class?
CREATE OR REPLACE FUNCTION private.is_class_member(p_class_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_members
    WHERE class_id = p_class_id AND student_id = auth.uid()
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

-- Does p_teacher teach a class that p_student belongs to?
CREATE OR REPLACE FUNCTION private.teacher_of_student(p_teacher UUID, p_student UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classes c
    JOIN public.class_members cm ON cm.class_id = c.id
    WHERE c.teacher_id = p_teacher AND cm.student_id = p_student
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

-- Join-by-code lookup: reveals a class ONLY on exact code match.
-- Students can't SELECT classes they haven't joined, so the join
-- screen calls this via db.rpc('lookup_class_by_code', { p_code }).
-- Stays in public on purpose — it IS the app-facing RPC.
CREATE OR REPLACE FUNCTION public.lookup_class_by_code(p_code TEXT)
RETURNS TABLE (id UUID, name TEXT, level TEXT, teacher_name TEXT) AS $$
  SELECT c.id, c.name, c.level, p.name
  FROM public.classes c
  JOIN public.profiles p ON p.id = c.teacher_id
  WHERE upper(c.class_code) = upper(trim(p_code))
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

-- Helpers are for signed-in users only.
REVOKE EXECUTE ON FUNCTION private.current_user_role()              FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.is_teacher_of_class(UUID)        FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.is_class_member(UUID)            FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION private.teacher_of_student(UUID, UUID)   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.lookup_class_by_code(TEXT)        FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION private.current_user_role()              TO authenticated;
GRANT  EXECUTE ON FUNCTION private.is_teacher_of_class(UUID)        TO authenticated;
GRANT  EXECUTE ON FUNCTION private.is_class_member(UUID)            TO authenticated;
GRANT  EXECUTE ON FUNCTION private.teacher_of_student(UUID, UUID)   TO authenticated;
GRANT  EXECUTE ON FUNCTION public.lookup_class_by_code(TEXT)        TO authenticated;

-- ── profiles ─────────────────────────────────────────────────────
-- INSERT: none (handle_new_user trigger is SECURITY DEFINER).
-- DELETE: none (cascades from auth.users deletion).

CREATE POLICY "profiles: read own, roster, or my teacher"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    id = (SELECT auth.uid())                              -- own profile
    OR private.teacher_of_student((SELECT auth.uid()), id) -- teacher → their students
    OR private.teacher_of_student(id, (SELECT auth.uid())) -- student → their teachers
  );

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Block role self-escalation: only name and level are updatable.
-- (WITH CHECK can't compare old vs new, so this is column-level.)
REVOKE UPDATE ON public.profiles FROM authenticated, anon;
GRANT  UPDATE (name, level) ON public.profiles TO authenticated;

-- ── classes ──────────────────────────────────────────────────────

CREATE POLICY "classes: read own or joined"
  ON public.classes FOR SELECT TO authenticated
  USING (
    teacher_id = (SELECT auth.uid())
    OR private.is_class_member(id)
  );

CREATE POLICY "classes: teachers create own"
  ON public.classes FOR INSERT TO authenticated
  WITH CHECK (
    teacher_id = (SELECT auth.uid())
    AND private.current_user_role() = 'teacher'
  );

CREATE POLICY "classes: owner updates"
  ON public.classes FOR UPDATE TO authenticated
  USING (teacher_id = (SELECT auth.uid()))
  WITH CHECK (teacher_id = (SELECT auth.uid()));  -- no ownership transfer

CREATE POLICY "classes: owner deletes"
  ON public.classes FOR DELETE TO authenticated
  USING (teacher_id = (SELECT auth.uid()));

-- ── class_members ────────────────────────────────────────────────
-- UPDATE: none (join rows are insert/delete only).

CREATE POLICY "class_members: read own membership or own class roster"
  ON public.class_members FOR SELECT TO authenticated
  USING (
    student_id = (SELECT auth.uid())
    OR private.is_teacher_of_class(class_id)
  );

CREATE POLICY "class_members: student joins self, teacher adds to own class"
  ON public.class_members FOR INSERT TO authenticated
  WITH CHECK (
    (student_id = (SELECT auth.uid()) AND private.current_user_role() = 'student')
    OR private.is_teacher_of_class(class_id)
  );

CREATE POLICY "class_members: student leaves, teacher removes from own class"
  ON public.class_members FOR DELETE TO authenticated
  USING (
    student_id = (SELECT auth.uid())
    OR private.is_teacher_of_class(class_id)
  );

-- ── assignments ──────────────────────────────────────────────────

CREATE POLICY "assignments: read as class teacher or member"
  ON public.assignments FOR SELECT TO authenticated
  USING (
    private.is_teacher_of_class(class_id)
    OR private.is_class_member(class_id)
  );

CREATE POLICY "assignments: teacher creates for own class"
  ON public.assignments FOR INSERT TO authenticated
  WITH CHECK (private.is_teacher_of_class(class_id));

CREATE POLICY "assignments: teacher updates for own class"
  ON public.assignments FOR UPDATE TO authenticated
  USING (private.is_teacher_of_class(class_id))
  WITH CHECK (private.is_teacher_of_class(class_id));  -- can't move to another teacher's class

CREATE POLICY "assignments: teacher deletes for own class"
  ON public.assignments FOR DELETE TO authenticated
  USING (private.is_teacher_of_class(class_id));

-- ── vocab_sets ───────────────────────────────────────────────────
-- Puente defaults (created_by IS NULL) are managed via service role.

CREATE POLICY "vocab_sets: read public or own"
  ON public.vocab_sets FOR SELECT TO authenticated
  USING (
    is_public = true
    OR created_by = (SELECT auth.uid())
  );

CREATE POLICY "vocab_sets: teachers create own"
  ON public.vocab_sets FOR INSERT TO authenticated
  WITH CHECK (
    created_by = (SELECT auth.uid())              -- can't forge NULL/other creators
    AND private.current_user_role() = 'teacher'
  );

CREATE POLICY "vocab_sets: creator updates"
  ON public.vocab_sets FOR UPDATE TO authenticated
  USING (created_by = (SELECT auth.uid()))
  WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "vocab_sets: creator deletes"
  ON public.vocab_sets FOR DELETE TO authenticated
  USING (created_by = (SELECT auth.uid()));

-- ── vocab_words ──────────────────────────────────────────────────
-- Visibility/ownership flows through the parent set. Direct subquery
-- is safe here (vocab_sets policies never reference vocab_words).

CREATE POLICY "vocab_words: read words of visible sets"
  ON public.vocab_words FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vocab_sets s
      WHERE s.id = set_id
        AND (s.is_public = true OR s.created_by = (SELECT auth.uid()))
    )
  );

CREATE POLICY "vocab_words: set owner inserts"
  ON public.vocab_words FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vocab_sets s
      WHERE s.id = set_id AND s.created_by = (SELECT auth.uid())
    )
  );

CREATE POLICY "vocab_words: set owner updates"
  ON public.vocab_words FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vocab_sets s
      WHERE s.id = set_id AND s.created_by = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vocab_sets s
      WHERE s.id = set_id AND s.created_by = (SELECT auth.uid())
    )
  );

CREATE POLICY "vocab_words: set owner deletes"
  ON public.vocab_words FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vocab_sets s
      WHERE s.id = set_id AND s.created_by = (SELECT auth.uid())
    )
  );

-- ── word_progress ────────────────────────────────────────────────
-- DELETE: none.

CREATE POLICY "word_progress: read own or my students'"
  ON public.word_progress FOR SELECT TO authenticated
  USING (
    student_id = (SELECT auth.uid())
    OR private.teacher_of_student((SELECT auth.uid()), student_id)
  );

CREATE POLICY "word_progress: student inserts own"
  ON public.word_progress FOR INSERT TO authenticated
  WITH CHECK (student_id = (SELECT auth.uid()));

CREATE POLICY "word_progress: student updates own"
  ON public.word_progress FOR UPDATE TO authenticated
  USING (student_id = (SELECT auth.uid()))
  WITH CHECK (student_id = (SELECT auth.uid()));

-- ── activity_progress ────────────────────────────────────────────
-- UPDATE/DELETE: none — scores are immutable once submitted.

CREATE POLICY "activity_progress: read own or my students'"
  ON public.activity_progress FOR SELECT TO authenticated
  USING (
    student_id = (SELECT auth.uid())
    OR private.teacher_of_student((SELECT auth.uid()), student_id)
  );

CREATE POLICY "activity_progress: student inserts own"
  ON public.activity_progress FOR INSERT TO authenticated
  WITH CHECK (
    student_id = (SELECT auth.uid())
    AND (
      assignment_id IS NULL   -- self-directed practice
      OR EXISTS (             -- assignment must be in one of my classes
        SELECT 1 FROM public.assignments a
        WHERE a.id = assignment_id AND private.is_class_member(a.class_id)
      )
    )
  );

-- ── Function hardening ───────────────────────────────────────────

-- Pin search_path (advisor 0011).
ALTER FUNCTION public.generate_class_code() SET search_path = '';

-- Keep handle_new_user out of the public RPC surface (advisors
-- 0028/0029). The auth trigger still fires — trigger privilege is
-- checked against the trigger owner, not the signed-in user.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
