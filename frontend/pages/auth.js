/* ============================================
   Auth Page — Login & Register
   ============================================ */

registerPage('auth', function(path) {
    const isRegister = path === '/register';

    return `
    <div class="page-full">
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <div class="auth-logo-icon">
                        <span class="material-icons-round">visibility</span>
                    </div>
                    <h1 class="heading-lg">Eye<span class="text-gradient">Gem</span></h1>
                    <p style="color:var(--text-secondary);margin-top:8px;">Ko'z ko'rish o'tkirligini tekshiring</p>
                </div>

                <div class="auth-tabs">
                    <button class="auth-tab ${!isRegister ? 'active' : ''}" onclick="navigate('/login')">Kirish</button>
                    <button class="auth-tab ${isRegister ? 'active' : ''}" onclick="navigate('/register')">Ro'yxatdan o'tish</button>
                </div>

                ${isRegister ? `
                <form id="register-form" onsubmit="handleRegister(event)">
                    <div class="form-group">
                        <label class="form-label"><span class="material-icons-round">person</span>Ism-familiya</label>
                        <input type="text" class="form-input" id="reg-name" placeholder="Ismingizni kiriting" required minlength="2">
                        <div class="form-error" id="reg-name-error"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label"><span class="material-icons-round">email</span>Email</label>
                        <input type="email" class="form-input" id="reg-email" placeholder="email@misol.uz" required>
                        <div class="form-error" id="reg-email-error"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label"><span class="material-icons-round">lock</span>Parol</label>
                        <input type="password" class="form-input" id="reg-password" placeholder="Kamida 6 ta belgi" required minlength="6">
                        <div class="form-error" id="reg-password-error"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label"><span class="material-icons-round">verified_user</span>Parolni tasdiqlang</label>
                        <input type="password" class="form-input" id="reg-confirm" placeholder="Parolni qaytadan kiriting" required>
                        <div class="form-error" id="reg-confirm-error"></div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg w-full" id="reg-submit-btn">
                        <span class="material-icons-round">how_to_reg</span> Ro'yxatdan o'tish
                    </button>
                </form>
                ` : `
                <form id="login-form" onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label class="form-label"><span class="material-icons-round">email</span>Email</label>
                        <input type="email" class="form-input" id="login-email" placeholder="email@misol.uz" required>
                        <div class="form-error" id="login-email-error"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label"><span class="material-icons-round">lock</span>Parol</label>
                        <input type="password" class="form-input" id="login-password" placeholder="Parolingizni kiriting" required>
                        <div class="form-error" id="login-password-error"></div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg w-full" id="login-submit-btn">
                        <span class="material-icons-round">login</span> Tizimga kirish
                    </button>
                </form>
                `}

                <div style="text-align:center;margin-top:28px;">
                    <p style="color:var(--text-muted);font-size:0.8125rem;">
                        ${isRegister ? "Akkauntingiz bormi?" : "Akkount yo'qmi?"}
                        <a href="#/${isRegister ? 'login' : 'register'}" style="color:var(--primary-light);font-weight:600;">
                            ${isRegister ? "Kirish" : "Ro'yxatdan o'ting"}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    </div>`;
});

// ---- Form Helpers ----
function showFieldError(id, message) {
    const el = document.getElementById(id);
    if (el) { el.textContent = message; el.classList.add('visible'); el.previousElementSibling?.classList.add('error'); }
}

function clearFieldErrors() {
    document.querySelectorAll('.form-error').forEach(el => { el.classList.remove('visible'); el.textContent = ''; });
    document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
}

async function handleLogin(e) {
    e.preventDefault();
    clearFieldErrors();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-submit-btn');

    if (!email) { showFieldError('login-email-error', 'Email kiriting'); return; }
    if (!password) { showFieldError('login-password-error', 'Parol kiriting'); return; }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Tekshirilmoqda...';

    try {
        const result = await api.post('/login', { email, password });
        if (result) {
            auth.setSession(result.user, result.token);
        } else {
            auth.setSession({ id: 1, name: 'Foydalanuvchi', email, created_at: new Date().toISOString() }, 'mock_' + Date.now());
        }
        showToast('Xush kelibsiz!', 'success');
        navigate('/dashboard');
    } catch (error) {
        showToast(error.message, 'error');
        showFieldError('login-password-error', error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-icons-round">login</span> Tizimga kirish';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    clearFieldErrors();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const btn = document.getElementById('reg-submit-btn');

    let valid = true;
    if (name.length < 2) { showFieldError('reg-name-error', 'Ism kamida 2 harf'); valid = false; }
    if (!email.includes('@')) { showFieldError('reg-email-error', "To'g'ri email kiriting"); valid = false; }
    if (password.length < 6) { showFieldError('reg-password-error', 'Parol kamida 6 belgi'); valid = false; }
    if (password !== confirm) { showFieldError('reg-confirm-error', 'Parollar mos kelmadi'); valid = false; }
    if (!valid) return;

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Yaratilyapti...';

    try {
        const result = await api.post('/register', { name, email, password });
        if (result) {
            auth.setSession(result.user, result.token);
        } else {
            auth.setSession({ id: Date.now(), name, email, created_at: new Date().toISOString() }, 'mock_' + Date.now());
        }
        showToast("Muvaffaqiyatli ro'yxatdan o'tdingiz!", 'success');
        navigate('/dashboard');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-icons-round">how_to_reg</span> Ro\'yxatdan o\'tish';
    }
}
