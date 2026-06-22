// ── Helpers ──
function showError(el, message) {
  el.textContent = message;
  el.classList.add('visible');
}

function hideError(el) {
  el.textContent = '';
  el.classList.remove('visible');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function friendlyAuthError(message) {
  if (!message) return 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
  const m = message.toLowerCase();
  if (m.includes('already registered'))       return 'Ya existe una cuenta con ese correo electrónico.';
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos. Intenta de nuevo.';
  if (m.includes('email not confirmed'))       return 'Confirma tu correo electrónico antes de iniciar sesión.';
  if (m.includes('password'))                  return 'La contraseña debe tener al menos 8 caracteres.';
  if (m.includes('network'))                   return 'Error de conexión. Revisa tu internet e intenta de nuevo.';
  return 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
}

// ── Role picker (signup page) ──
document.querySelectorAll('.role-option').forEach(option => {
  option.addEventListener('click', () => {
    document.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
    option.classList.add('selected');
  });
});

// ── Signup form ──
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  const errorEl = document.getElementById('signup-error');

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(errorEl);

    const name     = document.getElementById('signup-name').value.trim();
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm  = document.getElementById('signup-confirm').value;
    const role     = signupForm.querySelector('input[name="role"]:checked').value;

    // Client-side validation
    if (!name) {
      showError(errorEl, 'Por favor ingresa tu nombre.');
      return;
    }
    if (!isValidEmail(email)) {
      showError(errorEl, 'Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 8) {
      showError(errorEl, 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      showError(errorEl, 'Las contraseñas no coinciden.');
      return;
    }

    const btn = signupForm.querySelector('button[type="submit"]');
    btn.textContent = 'Creando cuenta...';
    btn.disabled = true;

    const { error } = await db.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });

    if (error) {
      showError(errorEl, friendlyAuthError(error.message));
      btn.textContent = 'Crear cuenta';
      btn.disabled = false;
      return;
    }

    // Redirect based on role
    window.location.href = role === 'teacher' ? 'teacher/dashboard.html' : 'dashboard.html';
  });
}

// ── Login form ──
const loginForm = document.getElementById('login-form');
if (loginForm) {
  const errorEl = document.getElementById('login-error');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(errorEl);

    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!isValidEmail(email)) {
      showError(errorEl, 'Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (!password) {
      showError(errorEl, 'Por favor ingresa tu contraseña.');
      return;
    }

    const btn = loginForm.querySelector('button[type="submit"]');
    btn.textContent = 'Iniciando sesión...';
    btn.disabled = true;

    const { data, error } = await db.auth.signInWithPassword({ email, password });

    if (error) {
      showError(errorEl, friendlyAuthError(error.message));
      btn.textContent = 'Iniciar sesión';
      btn.disabled = false;
      return;
    }

    // Redirect based on stored role
    const role = data.user.user_metadata?.role;
    window.location.href = role === 'teacher' ? 'teacher/dashboard.html' : 'dashboard.html';
  });
}
