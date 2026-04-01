/* ============================================
   Profile Page
   ============================================ */

registerPage('profile', function() {
    const user = auth.getUser();
    if (!user) { navigate('/'); return ''; }

    const mockResults = JSON.parse(localStorage.getItem('eyegem_results') || '[]');
    const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Noma\'lum';

    const html = `
    <div class="page">
        <h1 class="heading-xl mb-lg">👤 Profil</h1>

        <div class="grid-2">
            <!-- User Info Card -->
            <div class="card">
                <div style="text-align:center;margin-bottom:24px;">
                    <div style="width:80px;height:80px;border-radius:50%;background:var(--accent-gradient);display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 16px;box-shadow:var(--shadow-glow);">
                        ${user.name ? user.name[0].toUpperCase() : '?'}
                    </div>
                    <h2 class="heading-md">${user.name || 'Foydalanuvchi'}</h2>
                    <p style="color:var(--text-secondary);font-size:0.875rem;margin-top:4px;">${user.email || ''}</p>
                </div>

                <div style="display:flex;flex-direction:column;gap:12px;">
                    <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border-color);">
                        <span style="color:var(--text-secondary);">Ro'yxatdan o'tgan</span>
                        <span style="font-weight:500;">${joinDate}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border-color);">
                        <span style="color:var(--text-secondary);">Jami testlar</span>
                        <span style="font-weight:500;">${mockResults.length}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:12px 0;">
                        <span style="color:var(--text-secondary);">O'rtacha natija</span>
                        <span style="font-weight:500;">${mockResults.length > 0 ? Math.round(mockResults.reduce((s, r) => s + r.score, 0) / mockResults.length) + '%' : '—'}</span>
                    </div>
                </div>

                <div class="mt-lg">
                    <button class="btn btn-danger w-full" onclick="if(confirm('Chiqishni xohlaysizmi?')){auth.clearSession();navigate('/');}">
                        Tizimdan chiqish
                    </button>
                </div>
            </div>

            <!-- Test History -->
            <div class="card">
                <h3 class="heading-md mb-md">📊 Testlar tarixi</h3>
                ${mockResults.length > 0 ? `
                <div style="display:flex;flex-direction:column;gap:10px;max-height:400px;overflow-y:auto;">
                    ${mockResults.slice().reverse().map((r, i) => `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:var(--bg-glass);border-radius:var(--radius-md);border:1px solid var(--border-color);">
                            <div>
                                <div style="font-weight:600;">Test #${mockResults.length - i}</div>
                                <div style="font-size:0.8125rem;color:var(--text-muted);">${new Date(r.date).toLocaleString('uz-UZ')}</div>
                            </div>
                            <div style="text-align:right;">
                                <div class="badge ${r.score >= 80 ? 'badge-success' : r.score >= 50 ? 'badge-warning' : 'badge-danger'}">${r.score}%</div>
                                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">${r.acuity || ''}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : `
                <div style="text-align:center;padding:60px 20px;color:var(--text-muted);">
                    <div style="font-size:3rem;margin-bottom:12px;">📋</div>
                    <p>Hali testlar o'tkazilmagan</p>
                    <button class="btn btn-primary mt-md" onclick="navigate('/camera')">Birinchi testni boshlang</button>
                </div>
                `}
            </div>
        </div>
    </div>`;

    return html;
});
