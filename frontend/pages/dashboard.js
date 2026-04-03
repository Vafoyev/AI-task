/* ============================================
   Dashboard Page — Premium Glass Design
   ============================================ */

registerPage('dashboard', function() {
    const user = auth.getUser();
    const userName = user ? user.name : 'Foydalanuvchi';
    const mockResults = JSON.parse(localStorage.getItem('eyegem_results') || '[]');
    const lastResult = mockResults.length > 0 ? mockResults[mockResults.length - 1] : null;

    return `
    <div class="page">
        <!-- Welcome -->
        <div style="margin-bottom:36px;">
            <h1 class="heading-xl">Salom, <span class="text-gradient">${userName}</span></h1>
            <p style="color:var(--text-secondary);margin-top:10px;font-size:1.0625rem;">
                <span class="material-icons-round" style="vertical-align:middle;font-size:20px;margin-right:4px;">schedule</span>
                Ko'z salomatligingizni tekshirishga tayyormisiz?
            </p>
        </div>

        <!-- Stats -->
        <div class="grid-3 mb-lg">
            <div class="stat-card">
                <div class="stat-icon purple">
                    <span class="material-icons-round">assignment</span>
                </div>
                <div class="stat-value">${mockResults.length}</div>
                <div class="stat-label">Jami testlar</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon cyan">
                    <span class="material-icons-round">trending_up</span>
                </div>
                <div class="stat-value">${lastResult ? lastResult.score + '%' : '—'}</div>
                <div class="stat-label">Oxirgi natija</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green">
                    <span class="material-icons-round">visibility</span>
                </div>
                <div class="stat-value">${lastResult ? lastResult.acuity : '—'}</div>
                <div class="stat-label">Ko'rish o'tkirligi</div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid-2 mb-lg">
            <div class="action-card" onclick="navigate('/camera')">
                <div class="action-icon purple">
                    <span class="material-icons-round">biotech</span>
                </div>
                <h3 class="heading-md">Ko'z Testini Boshlash</h3>
                <p style="color:var(--text-secondary);margin-top:10px;font-size:0.9375rem;">
                    Kamera orqali masofani o'lchab, Snellen jadvali bilan ko'z tekshiruvi
                </p>
                <div class="mt-md">
                    <span class="btn btn-primary">
                        <span class="material-icons-round">play_arrow</span> Boshlash
                    </span>
                </div>
            </div>

            <div class="action-card" onclick="navigate('/chatbot')">
                <div class="action-icon cyan">
                    <span class="material-icons-round">smart_toy</span>
                </div>
                <h3 class="heading-md">AI Maslahat</h3>
                <p style="color:var(--text-secondary);margin-top:10px;font-size:0.9375rem;">
                    Ko'z simptomlarini tahlil qilish va dastlabki maslahat olish
                </p>
                <div class="mt-md">
                    <span class="btn btn-secondary">
                        <span class="material-icons-round">chat</span> Suhbat
                    </span>
                </div>
            </div>
        </div>

        <!-- Recent Results -->
        <div class="glass-card">
            <div class="flex items-center gap-sm mb-md">
                <span class="material-icons-round" style="color:var(--primary-light);">analytics</span>
                <h3 class="heading-md">Oxirgi natijalar</h3>
            </div>
            ${mockResults.length > 0 ? `
            <div style="display:flex;flex-direction:column;gap:10px;">
                ${mockResults.slice(-5).reverse().map(r => `
                    <div class="glass" style="padding:14px 18px;display:flex;justify-content:space-between;align-items:center;">
                        <div class="flex items-center gap-md">
                            <span class="material-icons-round" style="color:var(--text-muted);">event_note</span>
                            <div>
                                <div style="font-weight:600;">${r.acuity || '—'}</div>
                                <div style="font-size:0.8125rem;color:var(--text-muted);">${new Date(r.date).toLocaleDateString('uz-UZ')}</div>
                            </div>
                        </div>
                        <span class="badge ${r.score >= 80 ? 'badge-success' : r.score >= 50 ? 'badge-warning' : 'badge-danger'}">${r.score}%</span>
                    </div>
                `).join('')}
            </div>
            ` : `
            <div style="text-align:center;padding:48px 20px;">
                <span class="material-icons-round" style="font-size:56px;color:var(--text-muted);margin-bottom:12px;display:block;">bar_chart</span>
                <p style="color:var(--text-secondary);">Hali test natijalari yo'q</p>
                <p style="font-size:0.8125rem;color:var(--text-muted);margin-top:4px;">Birinchi ko'z testini o'tkazing!</p>
            </div>
            `}
        </div>

        <!-- Info Chips -->
        <div class="grid-3 mt-lg">
            <div class="info-chip">
                <span class="material-icons-round">straighten</span>
                <div class="heading-sm">40 sm</div>
                <div style="color:var(--text-muted);font-size:0.8125rem;margin-top:4px;">Tavsiya etilgan masofa</div>
            </div>
            <div class="info-chip">
                <span class="material-icons-round">grid_on</span>
                <div class="heading-sm">Snellen</div>
                <div style="color:var(--text-muted);font-size:0.8125rem;margin-top:4px;">Xalqaro standart</div>
            </div>
            <div class="info-chip">
                <span class="material-icons-round">mic</span>
                <div class="heading-sm">Ovozli</div>
                <div style="color:var(--text-muted);font-size:0.8125rem;margin-top:4px;">Javob berish usuli</div>
            </div>
        </div>
    </div>`;
});
