// ── Teacher dashboard ─────────────────────────────────────────────────────────

const LEVEL_LABELS = {
  beginner:     'Principiante',
  intermediate: 'Intermedio',
  advanced:     'Avanzado'
};

function showFeedback(el, type, message) {
  el.textContent = message;
  el.className = `form-feedback visible ${type}`;
}

function hideFeedback(el) {
  el.textContent = '';
  el.className = 'form-feedback';
}

// Mirrors generate_class_code() in SCHEMA.sql — no lookalike characters (I/1, O/0).
function generateClassCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'PNT-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── Sign out ──────────────────────────────────────────────────────────────────

document.getElementById('signout-btn').addEventListener('click', async () => {
  await db.auth.signOut();
  window.location.href = '../index.html';
});

// ── Class list + rosters ──────────────────────────────────────────────────────

async function loadClasses(userId) {
  const listEl  = document.getElementById('class-list');
  const emptyEl = document.getElementById('classes-empty');

  const { data: classes, error } = await db
    .from('classes')
    .select('id, name, level, class_code, class_members ( profiles ( name, level ) )')
    .eq('teacher_id', userId)
    .order('created_at', { ascending: false });

  listEl.innerHTML = '';

  if (error || !classes || classes.length === 0) {
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;

  classes.forEach(c => {
    const students = (c.class_members || []).map(m => m.profiles).filter(Boolean);

    const item = document.createElement('div');
    item.className = 'class-item';

    const row = document.createElement('div');
    row.className = 'class-item-row';

    const info = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = c.name;
    const meta = document.createElement('p');
    meta.className = 'class-item-meta';
    meta.textContent = `${LEVEL_LABELS[c.level] || c.level} · ${students.length} estudiante${students.length === 1 ? '' : 's'}`;
    info.appendChild(title);
    info.appendChild(meta);

    const code = document.createElement('span');
    code.className = 'class-code-chip';
    code.textContent = c.class_code;
    code.title = 'Comparte este código con tus estudiantes';

    row.appendChild(info);
    row.appendChild(code);
    item.appendChild(row);

    if (students.length > 0) {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = 'Ver estudiantes';
      details.appendChild(summary);

      const roster = document.createElement('ul');
      roster.className = 'roster-list';
      students
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        .forEach(s => {
          const li = document.createElement('li');
          const name = document.createElement('span');
          name.textContent = s.name;
          const level = document.createElement('span');
          level.className = 'roster-level';
          level.textContent = s.level ? (LEVEL_LABELS[s.level] || s.level) : 'Sin examen';
          li.appendChild(name);
          li.appendChild(level);
          roster.appendChild(li);
        });

      details.appendChild(roster);
      item.appendChild(details);
    }

    listEl.appendChild(item);
  });
}

// ── Create a class ────────────────────────────────────────────────────────────

function setupCreateForm(userId) {
  const form       = document.getElementById('create-form');
  const nameInput  = document.getElementById('class-name');
  const levelInput = document.getElementById('class-level');
  const feedbackEl = document.getElementById('create-feedback');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFeedback(feedbackEl);

    const name = nameInput.value.trim();
    if (!name) {
      showFeedback(feedbackEl, 'error', 'Por favor ingresa un nombre para la clase.');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Creando...';

    // Retry on the rare chance a generated code collides with an existing one.
    let created = null;
    let lastError = null;
    for (let attempt = 0; attempt < 3 && !created; attempt++) {
      const { data, error } = await db
        .from('classes')
        .insert({
          teacher_id: userId,
          name,
          level: levelInput.value,
          class_code: generateClassCode()
        })
        .select('id, name, class_code')
        .single();

      if (!error) { created = data; break; }
      lastError = error;
      if (error.code !== '23505') break;
    }

    btn.disabled = false;
    btn.textContent = 'Crear clase';

    if (!created) {
      showFeedback(feedbackEl, 'error', 'No pudimos crear la clase. Intenta de nuevo.');
      console.error(lastError);
      return;
    }

    showFeedback(feedbackEl, 'success', `¡Clase creada! Código: ${created.class_code} — compártelo con tus estudiantes.`);
    nameInput.value = '';
    loadClasses(userId);
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────────

(async () => {
  const { data: { user } } = await db.auth.getUser();
  if (!user) { window.location.href = '../login.html'; return; }

  const { data: profile } = await db
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single();

  if (!profile)                   { window.location.href = '../login.html';     return; }
  if (profile.role !== 'teacher') { window.location.href = '../dashboard.html'; return; }

  const firstName = (profile.name || '').split(' ')[0];
  document.getElementById('welcome-title').textContent = firstName ? `Hola, ${firstName}` : 'Hola';

  await loadClasses(user.id);
  setupCreateForm(user.id);

  document.getElementById('dashboard-loading').hidden = true;
  document.getElementById('dashboard-main').hidden    = false;
})();
