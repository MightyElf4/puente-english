// ── Set a new password after the reset email link ─────────────────────────────
// The reset link lands here with a recovery token in the URL; supabase-js
// processes it automatically and creates a session before the form is used.

const updateForm = document.getElementById('update-form');
const errorEl    = document.getElementById('update-error');

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.add('visible');
}

updateForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  errorEl.classList.remove('visible');

  const password = document.getElementById('new-password').value;
  const confirm  = document.getElementById('confirm-password').value;

  if (password.length < 8) {
    showError('La contraseña debe tener al menos 8 caracteres.');
    return;
  }
  if (password !== confirm) {
    showError('Las contraseñas no coinciden.');
    return;
  }

  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    showError('El enlace expiró o no es válido. Solicita uno nuevo desde "¿Olvidaste tu contraseña?".');
    return;
  }

  const btn = updateForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  const { error } = await db.auth.updateUser({ password });

  if (error) {
    btn.disabled = false;
    btn.textContent = 'Guardar contraseña';
    const m = (error.message || '').toLowerCase();
    if (m.includes('different from the old')) {
      showError('La nueva contraseña debe ser diferente a la anterior.');
    } else {
      showError('No pudimos guardar la contraseña. Intenta de nuevo.');
    }
    return;
  }

  // Send them to their dashboard — the recovery link already signed them in.
  const role = session.user.user_metadata?.role;
  window.location.href = role === 'teacher' ? 'teacher/dashboard.html' : 'dashboard.html';
});
