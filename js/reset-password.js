// ── Request a password reset email ────────────────────────────────────────────

const resetForm = document.getElementById('reset-form');
const errorEl   = document.getElementById('reset-error');
const successEl = document.getElementById('reset-success');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

resetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  errorEl.classList.remove('visible');
  successEl.textContent = '';
  successEl.className = 'form-feedback';

  const email = document.getElementById('reset-email').value.trim();

  if (!isValidEmail(email)) {
    errorEl.textContent = 'Por favor ingresa un correo electrónico válido.';
    errorEl.classList.add('visible');
    return;
  }

  const btn = resetForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  const { error } = await db.auth.resetPasswordForEmail(email, {
    redirectTo: new URL('update-password.html', window.location.href).href
  });

  btn.disabled = false;
  btn.textContent = 'Enviar enlace';

  if (error) {
    errorEl.textContent = 'No pudimos enviar el correo. Intenta de nuevo en unos minutos.';
    errorEl.classList.add('visible');
    return;
  }

  // Same message whether or not the account exists — don't reveal which emails are registered.
  successEl.textContent = `Si existe una cuenta con ${email}, recibirás un enlace para restablecer tu contraseña. Revisa también tu carpeta de spam.`;
  successEl.className = 'form-feedback visible success';
  successEl.style.marginTop = '0';
  successEl.style.marginBottom = '16px';
});
