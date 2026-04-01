/* ============================================
   Dashboard Page
   ============================================ */

registerPage('dashboard', function() {
    const user = auth.getUser();
    const userName = user ? user.name : 'Foydalanuvchi';

    // Mock test results
    const mockResults = JSON.parse(localStorage.getItem('eyegem_results') || '[]');
    const lastResult = mockResults.length > 0 ? mockResults[mockResults.length - 1] : null;
    const totalTests = mockResults.length;

    const html = `
    <div class="page">
        <!-- Welcome Header -->
        <div style="margin-bottom:32px;">
            <h1 class="heading-xl">Salom, <span class="text-gradient">${userName}</span> 👋</h1>
            <p style="color:var(--text-secondary);margin-top:8px;font-size:1.0625rem;">
                Ko'z salomatligingizni tekshirishga tayyormisiz?
            </p>
        </div>

        <!-- Stats Row -->
        <div class="grid-3 mb-lg">
            <div class="stat-card">
                <div class="stat-value">${totalTests}</div>
                <div class="stat-label">Jami testlar</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${lastResult ? lastResult.score + '%' : '—'}</div>
                <div class="stat-label">Oxirgi natija</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${lastResult ? lastResult.acuity : '—'}</div>
                <div class="stat-label">Ko'rish o'tkirligi</div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid-2 mb-lg">
            <div class="card" style="cursor:pointer;" onclick="navigate('/camera')">
                <div style="font-size:2.5rem;margin-bottom:12px;">🔬</div>
                <h3 class="heading-md">Ko'z Testini Boshlash</h3>
                <p style="color:var(--text-secondary);margin-top:8px;font-size:0.9375rem;">
                    Kamera orqali masofani o'lchab, Snellen jadvali bilan ko'z tekshiruvi
                </p>
                <div class="mt-md">
                    <span class="btn btn-primary">Testni boshlash →</span>
                </div>
            </div>

            <div class="card" style="cursor:pointer;" onclick="navigate('/chatbot')">
                <div style="font-size:2.5rem;margin-bottom:12px;">🤖</div>
                <h3 class="heading-md">AI Maslahat</h3>
                <p style="color:var(--text-secondary);margin-top:8px;font-size:0.9375rem;">
                    Ko'z bilan bog'liq simptomlarni tahlil qilish va dastlabki maslahat olish
                </p>
                <div class="mt-md">
                    <span class="btn btn-secondary">Suhbatni boshlash →</span>
                </div>
            </div>
        </div>

        <!-- Recent Results -->
        <div class="card">
            <h3 class="heading-md mb-md">📋 Oxirgi natijalar</h3>
            ${mockResults.length > 0 ? `
            <div style="display:flex;flex-direction:column;gap:12px;">
                ${mockResults.slice(-5).reverse().map(r => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:var(--bg-glass);border-radius:var(--radius-md);border:1px solid var(--border-color);">
                        <div>
                            <div style="font-weight:600;">${r.acuity || '—'}</div>
                            <div style="font-size:0.8125rem;color:var(--text-muted);">${new Date(r.date).toLocaleDateString('uz-UZ')}</div>
                        </div>
                        <div class="flex items-center gap-sm">
                            <span class="badge ${r.score >= 80 ? 'badge-success' : r.score >= 50 ? 'badge-warning' : 'badge-danger'}">${r.score}%</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : `
            <div style="text-align:center;padding:40px 20px;color:var(--text-muted);">
                <div style="font-size:3rem;margin-bottom:12px;">📊</div>
                <p>Hali test natijalari yo'q</p>
                <p style="font-size:0.875rem;margin-top:4px;">Birinchi ko'z testini o'tkazing!</p>
            </div>
            `}
        </div>

        <!-- Info Section -->
        <div class="grid-3 mt-lg" style="gap:16px;">
            <div class="card-glass" style="text-align:center;padding:20px;">
                <div style="font-size:1.5rem;margin-bottom:8px;">📏</div>
                <div class="heading-sm">40 sm</div>
                <div style="color:var(--text-muted);font-size:0.8125rem;margin-top:4px;">Tavsiya etilgan masofa</div>
            </div>
            <div class="card-glass" style="text-align:center;padding:20px;">
                <div style="font-size:1.5rem;margin-bottom:8px;">🔤</div>
                <div class="heading-sm">Snellen</div>
                <div style="color:var(--text-muted);font-size:0.8125rem;margin-top:4px;">Xalqaro standart</div>
            </div>
            <div class="card-glass" style="text-align:center;padding:20px;">
                <div style="font-size:1.5rem;margin-bottom:8px;">🎤</div>
                <div class="heading-sm">Ovozli</div>
                <div style="color:var(--text-muted);font-size:0.8125rem;margin-top:4px;">Javob berish usuli</div>
            </div>
        </div>
    </div>`;

    return html;
});
