/* ============================================
   Eye Test Page — Snellen + Speech (Glass)
   ============================================ */

const SNELLEN_LETTERS = ['C', 'D', 'E', 'F', 'L', 'O', 'P', 'T', 'Z'];
const SNELLEN_ROWS = [
    { size: 120, acuity: '20/200', count: 1 },
    { size: 100, acuity: '20/160', count: 2 },
    { size: 84, acuity: '20/125', count: 2 },
    { size: 70, acuity: '20/100', count: 3 },
    { size: 58, acuity: '20/80', count: 3 },
    { size: 48, acuity: '20/63', count: 4 },
    { size: 40, acuity: '20/50', count: 4 },
    { size: 34, acuity: '20/40', count: 5 },
    { size: 28, acuity: '20/32', count: 5 },
    { size: 22, acuity: '20/25', count: 5 },
    { size: 18, acuity: '20/20', count: 5 },
];

let testState = { currentRow: 0, currentLetter: 0, lettersInRow: [], answers: [], totalCorrect: 0, totalWrong: 0, isActive: false, recognition: null, isListening: false };

registerPage('eye-test', function() {
    stopCamera();
    testState = { currentRow: 0, currentLetter: 0, lettersInRow: [], answers: [], totalCorrect: 0, totalWrong: 0, isActive: false, recognition: null, isListening: false };

    return `
    <div class="page" style="max-width:920px;">
        <div class="text-center mb-lg">
            <span class="material-icons-round" style="font-size:40px;color:var(--primary-light);display:block;margin-bottom:8px;">biotech</span>
            <h1 class="heading-xl">Ko'z Testi</h1>
            <p style="color:var(--text-secondary);margin-top:8px;">Snellen jadvali standarti bo'yicha</p>
        </div>

        <div class="glass-card mb-lg" style="min-height:320px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <div id="test-intro" class="text-center">
                <span class="material-icons-round" style="font-size:72px;color:var(--primary-light);display:block;margin-bottom:20px;">visibility</span>
                <h2 class="heading-lg mb-md">Testga tayyormisiz?</h2>
                <p style="color:var(--text-secondary);margin-bottom:6px;">Ekrangizdan 40 sm masofada turing</p>
                <p style="color:var(--text-secondary);margin-bottom:28px;">Har bir harfni ovoz bilan ayting yoki tugma bosing</p>
                <button class="btn btn-primary btn-lg" onclick="startEyeTest()" style="animation:glow 2s ease infinite;">
                    <span class="material-icons-round">play_arrow</span> Testni boshlash
                </button>
            </div>

            <div id="test-active" style="display:none;width:100%;text-align:center;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <span style="color:var(--text-secondary);font-size:0.875rem;">Qator: <span id="test-row-num">1</span>/11</span>
                    <span class="badge badge-info" id="test-acuity">20/200</span>
                </div>
                <div class="progress-bar mb-lg">
                    <div class="progress-fill" id="test-progress" style="width:0%"></div>
                </div>
                <div class="snellen-letter" id="snellen-display" style="font-size:120px;height:200px;">E</div>
                <div id="answer-feedback" style="height:40px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:600;margin:16px 0;"></div>
            </div>

            <div id="test-complete" style="display:none;text-align:center;">
                <span class="material-icons-round" style="font-size:72px;color:var(--success);display:block;margin-bottom:16px;">emoji_events</span>
                <h2 class="heading-lg mb-md">Test yakunlandi!</h2>
                <button class="btn btn-primary btn-lg" onclick="finishTest()">
                    <span class="material-icons-round">bar_chart</span> Natijalarni ko'rish
                </button>
            </div>
        </div>

        <div id="test-controls" style="display:none;">
            <div class="glass-card mb-md">
                <div class="flex items-center justify-between mb-md">
                    <div class="flex items-center gap-sm">
                        <span class="material-icons-round" style="color:var(--primary-light);">mic</span>
                        <h3 class="heading-md">Ovoz bilan javob</h3>
                    </div>
                    <span id="speech-status" class="badge badge-danger" style="display:none;animation:breathe 1s ease infinite;">
                        <span class="material-icons-round" style="font-size:14px;">fiber_manual_record</span> Tinglanmoqda
                    </span>
                </div>
                <div class="text-center">
                    <button id="mic-button" class="mic-btn" onclick="toggleSpeech()">
                        <span class="material-icons-round">mic</span>
                    </button>
                    <p style="color:var(--text-muted);font-size:0.8125rem;margin-top:14px;">Tugmani bosing va harfni ayting</p>
                    <div id="speech-result" style="font-size:1.5rem;font-weight:700;margin-top:12px;min-height:40px;"></div>
                </div>
            </div>

            <div class="glass-card">
                <div class="flex items-center gap-sm mb-md">
                    <span class="material-icons-round" style="color:var(--primary-light);">keyboard</span>
                    <h3 class="heading-md">Tugmalar bilan javob</h3>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
                    ${SNELLEN_LETTERS.map(l => `
                        <button class="btn btn-secondary" style="width:60px;height:60px;font-size:1.3rem;font-weight:700;border-radius:var(--r-md);"
                                onclick="submitAnswer('${l}')" id="key-${l}">${l}</button>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>`;
});

function startEyeTest() {
    document.getElementById('test-intro').style.display = 'none';
    document.getElementById('test-active').style.display = 'block';
    document.getElementById('test-controls').style.display = 'block';
    testState.isActive = true;
    testState.currentRow = 0; testState.currentLetter = 0; testState.answers = []; testState.totalCorrect = 0; testState.totalWrong = 0;
    generateRowLetters(); showCurrentLetter(); initSpeechRecognition();
}

function generateRowLetters() {
    const row = SNELLEN_ROWS[testState.currentRow];
    testState.lettersInRow = Array.from({ length: row.count }, () => SNELLEN_LETTERS[Math.floor(Math.random() * SNELLEN_LETTERS.length)]);
    testState.currentLetter = 0;
}

function showCurrentLetter() {
    const display = document.getElementById('snellen-display');
    const row = SNELLEN_ROWS[testState.currentRow];
    if (display) { display.style.fontSize = row.size + 'px'; display.textContent = testState.lettersInRow[testState.currentLetter]; display.style.animation = 'scaleIn 0.3s ease'; }
    const rn = document.getElementById('test-row-num'); if (rn) rn.textContent = testState.currentRow + 1;
    const ac = document.getElementById('test-acuity'); if (ac) ac.textContent = row.acuity;
    const pr = document.getElementById('test-progress'); if (pr) pr.style.width = ((testState.currentRow / SNELLEN_ROWS.length) * 100) + '%';
}

function submitAnswer(userLetter) {
    if (!testState.isActive) return;
    const correct = testState.lettersInRow[testState.currentLetter];
    const ok = userLetter.toUpperCase() === correct;
    const fb = document.getElementById('answer-feedback');
    testState.answers.push({ row: testState.currentRow, expected: correct, given: userLetter.toUpperCase(), correct: ok, acuity: SNELLEN_ROWS[testState.currentRow].acuity });
    if (ok) { testState.totalCorrect++; if (fb) fb.innerHTML = '<span style="color:var(--success);">✓ To\'g\'ri!</span>'; }
    else { testState.totalWrong++; if (fb) fb.innerHTML = `<span style="color:var(--danger);">✗ Noto'g'ri (${correct})</span>`; }
    const kb = document.getElementById('key-' + userLetter.toUpperCase());
    if (kb) { kb.style.background = ok ? 'var(--success)' : 'var(--danger)'; kb.style.color = 'white'; setTimeout(() => { kb.style.background = ''; kb.style.color = ''; }, 500); }
    setTimeout(() => { if (fb) fb.innerHTML = ''; advanceTest(); }, 800);
}

function advanceTest() {
    testState.currentLetter++;
    if (testState.currentLetter >= testState.lettersInRow.length) {
        testState.currentRow++;
        if (testState.currentRow >= SNELLEN_ROWS.length) {
            testState.isActive = false;
            document.getElementById('test-active').style.display = 'none';
            document.getElementById('test-controls').style.display = 'none';
            document.getElementById('test-complete').style.display = 'block';
            stopSpeech(); return;
        }
        generateRowLetters();
    }
    showCurrentLetter();
}

function finishTest() {
    const total = testState.totalCorrect + testState.totalWrong;
    const score = total > 0 ? Math.round((testState.totalCorrect / total) * 100) : 0;
    let lastRow = 0;
    testState.answers.forEach(a => { if (a.correct && a.row > lastRow) lastRow = a.row; });
    const acuity = SNELLEN_ROWS[lastRow]?.acuity || '20/200';
    const result = { date: new Date().toISOString(), score, acuity, correct: testState.totalCorrect, wrong: testState.totalWrong, answers: testState.answers };
    const results = JSON.parse(localStorage.getItem('eyegem_results') || '[]');
    results.push(result);
    localStorage.setItem('eyegem_results', JSON.stringify(results));
    localStorage.setItem('eyegem_last_result', JSON.stringify(result));
    navigate('/results');
}

function initSpeechRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    testState.recognition = new SR();
    testState.recognition.continuous = false; testState.recognition.interimResults = false; testState.recognition.lang = 'en-US';
    testState.recognition.onresult = (e) => {
        const t = e.results[0][0].transcript.trim().toUpperCase();
        const f = t.charAt(0);
        const r = document.getElementById('speech-result');
        if (r) r.textContent = `"${t}" → ${f}`;
        if (SNELLEN_LETTERS.includes(f)) submitAnswer(f);
        else showToast(`"${t}" tanib bo'lmadi`, 'warning');
        stopSpeech();
    };
    testState.recognition.onerror = (e) => { if (e.error !== 'aborted') showToast("Ovoz aniqlanmadi", 'warning'); stopSpeech(); };
    testState.recognition.onend = () => stopSpeech();
}

function toggleSpeech() { testState.isListening ? stopSpeech() : startSpeech(); }

function startSpeech() {
    if (!testState.recognition) { showToast("Brauzer qo'llab-quvvatlamaydi", 'error'); return; }
    try { testState.recognition.start(); testState.isListening = true;
        const m = document.getElementById('mic-button'); if (m) m.classList.add('recording');
        const s = document.getElementById('speech-status'); if (s) s.style.display = 'inline-flex';
    } catch(e) {}
}

function stopSpeech() {
    if (testState.recognition && testState.isListening) try { testState.recognition.stop(); } catch(e) {}
    testState.isListening = false;
    const m = document.getElementById('mic-button'); if (m) m.classList.remove('recording');
    const s = document.getElementById('speech-status'); if (s) s.style.display = 'none';
}
