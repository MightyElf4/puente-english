// ── Student dashboard ─────────────────────────────────────────────────────────

const LEVEL_LABELS = {
  beginner:     { label: 'Principiante', cls: 'beginner' },
  intermediate: { label: 'Intermedio',   cls: 'intermediate' },
  advanced:     { label: 'Avanzado',     cls: 'advanced' }
};

function showFeedback(el, type, message) {
  el.textContent = message;
  el.className = `form-feedback visible ${type}`;
}

function hideFeedback(el) {
  el.textContent = '';
  el.className = 'form-feedback';
}

// ── Sign out ──────────────────────────────────────────────────────────────────

document.getElementById('signout-btn').addEventListener('click', async () => {
  await db.auth.signOut();
  window.location.href = 'index.html';
});

// ── Classes ───────────────────────────────────────────────────────────────────

async function loadClasses(userId) {
  const listEl  = document.getElementById('class-list');
  const emptyEl = document.getElementById('classes-empty');

  const { data: memberships, error } = await db
    .from('class_members')
    .select('classes ( id, name, level, class_code, profiles!classes_teacher_id_fkey ( name ) )')
    .eq('student_id', userId);

  listEl.innerHTML = '';

  const classes = (memberships || []).map(m => m.classes).filter(Boolean);

  if (error || classes.length === 0) {
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;

  classes.forEach(c => {
    const levelInfo = LEVEL_LABELS[c.level];
    const item = document.createElement('div');
    item.className = 'class-item';

    const row = document.createElement('div');
    row.className = 'class-item-row';

    const info = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = c.name;
    const meta = document.createElement('p');
    meta.className = 'class-item-meta';
    const teacherName = c.profiles?.name;
    meta.textContent = teacherName
      ? `Prof. ${teacherName} · ${levelInfo ? levelInfo.label : c.level}`
      : (levelInfo ? levelInfo.label : c.level);
    info.appendChild(title);
    info.appendChild(meta);

    const code = document.createElement('span');
    code.className = 'class-code-chip';
    code.textContent = c.class_code;

    row.appendChild(info);
    row.appendChild(code);
    item.appendChild(row);
    listEl.appendChild(item);
  });
}

// ── Join a class ──────────────────────────────────────────────────────────────

function setupJoinForm(userId) {
  const form       = document.getElementById('join-form');
  const codeInput  = document.getElementById('join-code');
  const feedbackEl = document.getElementById('join-feedback');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFeedback(feedbackEl);

    const code = codeInput.value.trim().toUpperCase();
    if (!/^PNT-[A-Z0-9]{4}$/.test(code)) {
      showFeedback(feedbackEl, 'error', 'El código debe tener el formato PNT-XXXX.');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    // RLS hides classes the student hasn't joined, so the lookup goes
    // through a function that only reveals a class on exact code match.
    const { data: matches, error: findError } = await db
      .rpc('lookup_class_by_code', { p_code: code });

    if (findError) {
      showFeedback(feedbackEl, 'error', 'Error de conexión. Revisa tu internet e intenta de nuevo.');
      btn.disabled = false;
      return;
    }

    const cls = matches && matches[0];
    if (!cls) {
      showFeedback(feedbackEl, 'error', 'No encontramos una clase con ese código. Revísalo e intenta de nuevo.');
      btn.disabled = false;
      return;
    }

    const { error: joinError } = await db
      .from('class_members')
      .insert({ class_id: cls.id, student_id: userId });

    if (joinError) {
      if (joinError.code === '23505') {
        showFeedback(feedbackEl, 'error', `Ya estás en la clase "${cls.name}".`);
      } else {
        showFeedback(feedbackEl, 'error', 'No pudimos unirte a la clase. Intenta de nuevo.');
      }
      btn.disabled = false;
      return;
    }

    showFeedback(feedbackEl, 'success', `¡Listo! Te uniste a la clase "${cls.name}".`);
    codeInput.value = '';
    btn.disabled = false;
    loadClasses(userId);
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────────

(async () => {
  const { data: { user } } = await db.auth.getUser();
  if (!user) { window.location.href = 'login.html'; return; }

  const { data: profile } = await db
    .from('profiles')
    .select('name, role, level')
    .eq('id', user.id)
    .single();

  if (!profile)                   { window.location.href = 'login.html';              return; }
  if (profile.role === 'teacher') { window.location.href = 'teacher/dashboard.html';  return; }
  if (!profile.level)             { window.location.href = 'placement.html';          return; }

  const firstName = (profile.name || '').split(' ')[0];
  document.getElementById('welcome-title').textContent = firstName ? `Hola, ${firstName}` : 'Hola';

  const levelInfo = LEVEL_LABELS[profile.level];
  if (levelInfo) {
    const badge = document.getElementById('level-badge');
    badge.textContent = levelInfo.label;
    badge.className   = `level-badge ${levelInfo.cls}`;
    badge.hidden      = false;
  }

  await loadClasses(user.id);
  setupJoinForm(user.id);

  document.getElementById('dashboard-loading').hidden = true;
  document.getElementById('dashboard-main').hidden    = false;
})();
