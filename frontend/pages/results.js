/* ============================================
   Results Page
   ============================================ */

registerPage('results', function() {
    const lastResult = JSON.parse(localStorage.getItem('eyegem_last_result') || 'null');

    if (!lastResult) {
        return `<div class="page-full"><div class="text-center">
            <div style="font-size:4rem;margin-bottom:16px;">📊</div>
            <h2 class="heading-lg">Natijalar topilmadi</h2>
            <p style="color:var(--text-secondary);margin-top:8px;">Avval ko'z testini o'tkazing</p>
            <a href="#/camera" class="btn btn-primary mt-lg">Testni boshlash</a>
        </div></div>`;
    }

    const { score, acuity, correct, wrong, answers = [] } = lastResult;
    const total = correct + wrong;

    let recommendation, recColor, recIcon;
    if (score >= 80) {
        recommendation = "Ko'rishingiz yaxshi. Muntazam tekshiruvlarni davom ettiring.";
        recColor = 'var(--success)'; recIcon = '✅';
    } else if (score >= 50) {
        recommendation = "Ko'rishda muammo bor. Shifokorga murojaat qiling.";
        recColor = 'var(--warning)'; recIcon = '⚠️';
    } else {
        recommendation = "Jiddiy muammo aniqlanishi mumkin. Oftalmologga murojaat qiling.";
        recColor = 'var(--danger)'; recIcon = '🔴';
    }

    const rowResults = {};
    answers.forEach(a => {
        if (!rowResults[a.row]) rowResults[a.row] = { correct: 0, wrong: 0, acuity: a.acuity };
        if (a.correct) rowResults[a.row].correct++; else rowResults[a.row].wrong++;
    });

    return `
    <div class="page" style="max-width:900px;">
        <div class="text-center mb-lg">
            <h1 class="heading-xl">📊 Test Natijalari</h1>
            <p style="color:var(--text-secondary);margin-top:8px;">${new Date(lastResult.date).toLocaleString('uz-UZ')}</p>
        </div>

        <div class="grid-3 mb-lg">
            <div class="stat-card text-center">
                <div class="stat-value" style="font-size:3rem;">${score}%</div>
                <div class="stat-label">Umumiy ball</div>
                <div class="progress-bar mt-md"><div class="progress-fill" style="width:${score}%;"></div></div>
            </div>
            <div class="stat-card text-center">
                <div style="font-size:2.5rem;font-weight:800;color:var(--accent-primary);">${acuity}</div>
                <div class="stat-label">Ko'rish o'tkirligi</div>
            </div>
            <div class="stat-card text-center">
                <span style="color:var(--success);font-weight:700;">${correct}</span> /
                <span style="color:var(--danger);font-weight:700;">${wrong}</span>
                <div class="stat-label">To'g'ri / Xato</div>
            </div>
        </div>

        <div class="card mb-lg" style="border-left:4px solid ${recColor};">
            <div class="flex items-center gap-md">
                <span style="font-size:2rem;">${recIcon}</span>
                <div><h3 class="heading-md">Tavsiya</h3>
                <p style="color:var(--text-secondary);margin-top:4px;">${recommendation}</p></div>
            </div>
        </div>

        <div class="card mb-lg">
            <h3 class="heading-md mb-md">📈 Qatorlar bo'yicha</h3>
            <div class="results-chart">
                ${Object.entries(rowResults).map(([row, d]) => {
                    const pct = Math.round((d.correct / (d.correct + d.wrong)) * 100);
                    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
                        <div style="width:100%;display:flex;flex-direction:column;align-items:center;flex:1;justify-content:flex-end;">
                            <div class="chart-bar correct" style="width:70%;height:${pct}%;"></div>
                        </div>
                        <span style="font-size:0.6875rem;color:var(--text-muted);">${d.acuity?.split('/')[1] || ''}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>

        <div class="card mb-lg">
            <h3 class="heading-md mb-md">📋 Batafsil</h3>
            <div style="display:flex;flex-direction:column;gap:6px;max-height:300px;overflow-y:auto;">
                ${answers.map(a => `
                    <div style="display:flex;align-items:center;gap:12px;padding:8px 12px;background:var(--bg-glass);border-radius:var(--radius-sm);border:1px solid var(--border-color);">
                        <span style="color:${a.correct ? 'var(--success)' : 'var(--danger)'};">${a.correct ? '✓' : '✗'}</span>
                        <span style="flex:1;font-size:0.875rem;"><strong>${a.expected}</strong>${!a.correct ? ' → <span style="color:var(--danger);">'+a.given+'</span>' : ''}</span>
                        <span style="font-size:0.75rem;color:var(--text-muted);">${a.acuity}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="flex justify-center gap-md">
            <a href="#/camera" class="btn btn-primary btn-lg">🔄 Qayta test</a>
            <a href="#/chatbot" class="btn btn-secondary btn-lg">🤖 AI Maslahat</a>
            <a href="#/dashboard" class="btn btn-ghost btn-lg">← Dashboard</a>
        </div>
    </div>`;
});
