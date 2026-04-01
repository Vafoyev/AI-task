/* ============================================
   Eye Gem — SPA Router & API Client
   ============================================ */

// ---- Configuration ----
const API_BASE = 'http://localhost:8000/api';

// ---- API Client ----
const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('eyegem_token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || data.message || 'Xatolik yuz berdi');
            }

            return data;
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                console.warn('Backend ulanmagan, mock rejimda ishlamoqda');
                return null;
            }
            throw error;
        }
    },

    get(endpoint) { return this.request(endpoint); },
    post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); },
    put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); },
    delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); },

    // Form data (for file/image uploads)
    async upload(endpoint, formData) {
        const token = localStorage.getItem('eyegem_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Upload xatolik');
        return data;
    }
};

// ---- Auth State ----
const auth = {
    getUser() {
        const user = localStorage.getItem('eyegem_user');
        return user ? JSON.parse(user) : null;
    },

    getToken() {
        return localStorage.getItem('eyegem_token');
    },

    setSession(user, token) {
        localStorage.setItem('eyegem_user', JSON.stringify(user));
        localStorage.setItem('eyegem_token', token);
    },

    clearSession() {
        localStorage.removeItem('eyegem_user');
        localStorage.removeItem('eyegem_token');
    },

    isLoggedIn() {
        return !!this.getToken();
    }
};

// ---- Toast Notifications ----
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ---- SPA Router ----
const pages = {};

function registerPage(name, renderFn) {
    pages[name] = renderFn;
}

function navigate(path) {
    window.location.hash = path;
}

function getCurrentPath() {
    return window.location.hash.slice(1) || '/';
}

function updateNavActive(pageName) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageName);
    });
}

async function router() {
    const path = getCurrentPath();
    const container = document.getElementById('app-container');
    const nav = document.getElementById('main-nav');

    // Protected routes check
    const publicRoutes = ['/', '/login', '/register'];
    if (!publicRoutes.includes(path) && !auth.isLoggedIn()) {
        navigate('/');
        return;
    }

    // Show/hide nav
    if (auth.isLoggedIn() && path !== '/' && path !== '/login' && path !== '/register') {
        nav.classList.remove('hidden');
    } else {
        nav.classList.add('hidden');
    }

    // Route mapping
    let pageName;
    switch (path) {
        case '/':
        case '/login':
        case '/register':
            pageName = 'auth';
            break;
        case '/dashboard':
            pageName = 'dashboard';
            break;
        case '/profile':
            pageName = 'profile';
            break;
        case '/camera':
            pageName = 'camera';
            break;
        case '/eye-test':
            pageName = 'eye-test';
            break;
        case '/results':
            pageName = 'results';
            break;
        case '/chatbot':
            pageName = 'chatbot';
            break;
        default:
            pageName = 'dashboard';
    }

    updateNavActive(pageName);

    // Render page
    if (pages[pageName]) {
        container.innerHTML = '';
        const pageEl = await pages[pageName](path);
        if (typeof pageEl === 'string') {
            container.innerHTML = pageEl;
        } else if (pageEl instanceof HTMLElement) {
            container.appendChild(pageEl);
        }
    } else {
        container.innerHTML = `
            <div class="page-full">
                <div class="text-center">
                    <div style="font-size:4rem;margin-bottom:16px;">🔧</div>
                    <h2 class="heading-lg">Sahifa tayyorlanmoqda</h2>
                    <p style="color:var(--text-secondary);margin-top:8px;">"${pageName}" sahifasi tez orada tayyor bo'ladi</p>
                    <a href="#/dashboard" class="btn btn-primary mt-lg">Dashboardga qaytish</a>
                </div>
            </div>
        `;
    }
}

// ---- Logout ----
document.getElementById('logout-btn')?.addEventListener('click', () => {
    auth.clearSession();
    showToast('Tizimdan chiqdingiz', 'info');
    navigate('/');
});

// ---- Init ----
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', () => {
    if (!window.location.hash) {
        window.location.hash = auth.isLoggedIn() ? '#/dashboard' : '#/';
    }
    router();
});
