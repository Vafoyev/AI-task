/* ============================================
   Profile Page — Premium Glass Design
   ============================================ */

registerPage('profile', function() {
    const user = auth.getUser();
    if (!user) { navigate('/'); return ''; }
    const mockResults = JSON.parse(localStorage.getItem('eyegem_results') || '[]');
    const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' }) : "Noma'lum";

    return `
    <div class="page">
        <div class="flex items-center gap-md mb-lg">
            <span class="material-icons-round" style="font-size:32px;color:var(--primary-light);">account_circle</span>
            <h1 class="heading-xl">Profil</h1>
        </div>

        <div class="grid-2">
            <div class="glass-card">
                <div style="text-align:center;margin-bottom:28px;">
                    <div style="width:88px;height:88px;border-radius:50%;background:var(--hero-gradient);display:flex;align-items:center;justify-content:center;font-size:2.25rem;font-weight:700;margin:0 auto 18px;box-shadow:var(--shadow-glow);">
                        ${user.name ? user.name[0].toUpperCase() : '?'}
                    </div>
                    <h2 class="heading-md">${user.name || 'Foydalanuvchi'}</h2>
                    <p style="color:var(--text-secondary);font-size:0.875rem;margin-top:6px;">${user.email || ''}</p>
                </div>

                <div style="display:flex;flex-direction:column;gap:0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid var(--glass-border);">
                        <span class="flex items-center gap-sm" style="color:var(--text-secondary);"><span class="material-icons-round" style="font-size:18px;">calendar_today</span>Ro'yxatdan o'tgan</span>
                        <span style="font-weight:500;">${joinDate}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid var(--glass-border);">
                        <span class="flex items-center gap-sm" style="color:var(--text-secondary);"><span class="material-icons-round" style="font-size:18px;">assignment</span>Jami testlar</span>
                        <span style="font-weight:500;">${mockResults.length}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;">
                        <span class="flex items-center gap-sm" style="color:var(--text-secondary);"><span class="material-icons-round" style="font-size:18px;">show_chart</span>O'rtacha natija</span>
                        <span style="font-weight:500;">${mockResults.length > 0 ? Math.round(mockResults.reduce((s, r) => s + r.score, 0) / mockResults.length) + '%' : '—'}</span>
                    </div>
                </div>

                <div class="mt-lg">
                    <button class="btn btn-danger w-full" onclick="if(confirm('Chiqishni xohlaysizmi?')){auth.clearSession();navigate('/');}">
                        <span class="material-icons-round">logout</span> Tizimdan chiqish
                    </button>
                </div>
            </div>

            <div class="glass-card">
                <div class="flex items-center gap-sm mb-md">
                    <span class="material-icons-round" style="color:var(--primary-light);">history</span>
                    <h3 class="heading-md">Testlar tarixi</h3>
                </div>
                ${mockResults.length > 0 ? `
                <div style="display:flex;flex-direction:column;gap:10px;max-height:400px;overflow-y:auto;">
                    ${mockResults.slice().reverse().map((r, i) => `
                        <div class="glass" style="padding:14px 18px;display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <div style="font-weight:600;">Test #${mockResults.length - i}</div>
                                <div style="font-size:0.8125rem;color:var(--text-muted);">${new Date(r.date).toLocaleString('uz-UZ')}</div>
                            </div>
                            <div style="text-align:right;">
                                <span class="badge ${r.score >= 80 ? 'badge-success' : r.score >= 50 ? 'badge-warning' : 'badge-danger'}">${r.score}%</span>
                                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">${r.acuity || ''}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ` : `
                <div style="text-align:center;padding:56px 20px;">
                    <span class="material-icons-round" style="font-size:56px;color:var(--text-muted);display:block;margin-bottom:12px;">description</span>
                    <p style="color:var(--text-secondary);">Hali testlar o'tkazilmagan</p>
                    <button class="btn btn-primary mt-md" onclick="navigate('/camera')">
                        <span class="material-icons-round">play_arrow</span> Birinchi testni boshlang
                    </button>
                </div>
                `}
            </div>
        </div>
    </div>`;
});
