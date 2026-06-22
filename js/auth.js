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

    // TODO: Firebase signup
    // Replace this block when Firebase is configured:
    // try {
    //   const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    //   await updateProfile(userCredential.user, { displayName: name });
    //   await setDoc(doc(db, 'users', userCredential.user.uid), {
    //     name, email, role, createdAt: serverTimestamp()
    //   });
    //   window.location.href = role === 'teacher' ? 'teacher/dashboard.html' : 'dashboard.html';
    // } catch (err) {
    //   showError(errorEl, friendlyAuthError(err.code));
    //   btn.textContent = 'Crear cuenta';
    //   btn.disabled = false;
    // }

    // Placeholder until Firebase is wired up:
    console.log('Signup ready — Firebase not yet configured.', { name, email, role });
    btn.textContent = 'Crear cuenta';
    btn.disabled = false;
    showError(errorEl, 'Firebase aún no está configurado. Próximamente.');
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

    // TODO: Firebase login
    // Replace this block when Firebase is configured:
    // try {
    //   await signInWithEmailAndPassword(auth, email, password);
    //   window.location.href = 'dashboard.html';
    // } catch (err) {
    //   showError(errorEl, friendlyAuthError(err.code));
    //   btn.textContent = 'Iniciar sesión';
    //   btn.disabled = false;
    // }

    // Placeholder until Firebase is wired up:
    console.log('Login ready — Firebase not yet configured.', { email });
    btn.textContent = 'Iniciar sesión';
    btn.disabled = false;
    showError(errorEl, 'Firebase aún no está configurado. Próximamente.');
  });
}

// ── Friendly Firebase error messages (Spanish) ──
// Used once Firebase is active
function friendlyAuthError(code) {
  const messages = {
    'auth/email-already-in-use':   'Ya existe una cuenta con ese correo electrónico.',
    'auth/invalid-email':          'El correo electrónico no es válido.',
    'auth/weak-password':          'La contraseña es muy débil. Usa al menos 8 caracteres.',
    'auth/user-not-found':         'No encontramos una cuenta con ese correo.',
    'auth/wrong-password':         'Contraseña incorrecta. Intenta de nuevo.',
    'auth/too-many-requests':      'Demasiados intentos. Espera un momento e intenta de nuevo.',
    'auth/network-request-failed': 'Error de conexión. Revisa tu internet e intenta de nuevo.',
  };
  return messages[code] || 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
}
