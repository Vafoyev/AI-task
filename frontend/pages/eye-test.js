/* ============================================
   Eye Test Page — Snellen Chart + Speech-to-Text
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

let testState = {
    currentRow: 0,
    currentLetter: 0,
    lettersInRow: [],
    answers: [],
    totalCorrect: 0,
    totalWrong: 0,
    isActive: false,
    recognition: null,
    isListening: false
};

registerPage('eye-test', function() {
    // Stop camera
    stopCamera();

    // Reset test state
    testState = {
        currentRow: 0,
        currentLetter: 0,
        lettersInRow: [],
        answers: [],
        totalCorrect: 0,
        totalWrong: 0,
        isActive: false,
        recognition: null,
        isListening: false
    };

    const html = `
    <div class="page" style="max-width:900px;">
        <div class="text-center mb-lg">
            <h1 class="heading-xl">🔬 Ko'z Testi</h1>
            <p style="color:var(--text-secondary);margin-top:8px;">Snellen jadvali standarti bo'yicha</p>
        </div>

        <!-- Test Area -->
        <div class="card mb-lg" style="min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;">
            <!-- Pre-test Info -->
            <div id="test-intro" class="text-center">
                <div style="font-size:4rem;margin-bottom:20px;">👁️</div>
                <h2 class="heading-lg mb-md">Testga tayyormisiz?</h2>
                <p style="color:var(--text-secondary);margin-bottom:8px;">Ekrangizdan 40 sm masofada turing</p>
                <p style="color:var(--text-secondary);margin-bottom:24px;">Har bir harfni ovoz bilan ayting yoki tugma bosing</p>
                <button class="btn btn-primary btn-lg" onclick="startEyeTest()" style="animation:glow 2s ease infinite;">
                    Testni boshlash
                </button>
            </div>

            <!-- Active Test -->
            <div id="test-active" style="display:none;width:100%;text-align:center;">
                <!-- Progress Bar -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <span style="color:var(--text-secondary);font-size:0.875rem;">Qator: <span id="test-row-num">1</span>/11</span>
                    <span style="color:var(--text-secondary);font-size:0.875rem;" id="test-acuity">20/200</span>
                </div>
                <div class="progress-bar mb-lg">
                    <div class="progress-fill" id="test-progress" style="width:0%"></div>
                </div>

                <!-- Letter Display -->
                <div class="snellen-letter" id="snellen-display" style="font-size:120px;height:200px;">
                    E
                </div>

                <!-- Answer Feedback -->
                <div id="answer-feedback" style="height:40px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:600;margin:16px 0;">
                </div>
            </div>

            <!-- Test Complete -->
            <div id="test-complete" style="display:none;text-align:center;">
                <div style="font-size:4rem;margin-bottom:16px;">🎉</div>
                <h2 class="heading-lg mb-md">Test yakunlandi!</h2>
                <button class="btn btn-primary btn-lg" onclick="finishTest()">
                    Natijalarni ko'rish →
                </button>
            </div>
        </div>

        <!-- Controls -->
        <div id="test-controls" style="display:none;">
            <!-- Speech-to-Text -->
            <div class="card mb-md">
                <div class="flex items-center justify-between mb-md">
                    <h3 class="heading-md">🎤 Ovoz bilan javob</h3>
                    <span id="speech-status" class="badge badge-info" style="display:none;">Tinglanmoqda...</span>
                </div>
                <div class="text-center">
                    <button id="mic-button" class="mic-btn" onclick="toggleSpeech()">
                        🎤
                    </button>
                    <p style="color:var(--text-muted);font-size:0.8125rem;margin-top:12px;">
                        Tugmani bosing va harfni ayting
                    </p>
                    <div id="speech-result" style="font-size:1.5rem;font-weight:700;margin-top:12px;min-height:40px;"></div>
                </div>
            </div>

            <!-- Keyboard Input -->
            <div class="card">
                <h3 class="heading-md mb-md">⌨️ Tugmalar bilan javob</h3>
                <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">
                    ${SNELLEN_LETTERS.map(letter => `
                        <button class="btn btn-secondary" style="width:56px;height:56px;font-size:1.25rem;font-weight:700;"
                                onclick="submitAnswer('${letter}')" id="key-${letter}">
                            ${letter}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>`;

    return html;
});

// ---- Test Logic ----
function startEyeTest() {
    document.getElementById('test-intro').style.display = 'none';
    document.getElementById('test-active').style.display = 'block';
    document.getElementById('test-controls').style.display = 'block';

    testState.isActive = true;
    testState.currentRow = 0;
    testState.currentLetter = 0;
    testState.answers = [];
    testState.totalCorrect = 0;
    testState.totalWrong = 0;

    generateRowLetters();
    showCurrentLetter();
    initSpeechRecognition();
}

function generateRowLetters() {
    const row = SNELLEN_ROWS[testState.currentRow];
    testState.lettersInRow = [];
    for (let i = 0; i < row.count; i++) {
        const randomLetter = SNELLEN_LETTERS[Math.floor(Math.random() * SNELLEN_LETTERS.length)];
        testState.lettersInRow.push(randomLetter);
    }
    testState.currentLetter = 0;
}

function showCurrentLetter() {
    const display = document.getElementById('snellen-display');
    const row = SNELLEN_ROWS[testState.currentRow];
    const letter = testState.lettersInRow[testState.currentLetter];

    if (display) {
        display.style.fontSize = row.size + 'px';
        display.textContent = letter;
        display.style.animation = 'scaleIn 0.3s ease';
    }

    // Update progress info
    const rowNum = document.getElementById('test-row-num');
    const acuity = document.getElementById('test-acuity');
    const progress = document.getElementById('test-progress');

    if (rowNum) rowNum.textContent = testState.currentRow + 1;
    if (acuity) acuity.textContent = row.acuity;
    if (progress) progress.style.width = ((testState.currentRow / SNELLEN_ROWS.length) * 100) + '%';
}

function submitAnswer(userLetter) {
    if (!testState.isActive) return;

    const correctLetter = testState.lettersInRow[testState.currentLetter];
    const isCorrect = userLetter.toUpperCase() === correctLetter;
    const feedbackEl = document.getElementById('answer-feedback');

    testState.answers.push({
        row: testState.currentRow,
        expected: correctLetter,
        given: userLetter.toUpperCase(),
        correct: isCorrect,
        acuity: SNELLEN_ROWS[testState.currentRow].acuity
    });

    if (isCorrect) {
        testState.totalCorrect++;
        if (feedbackEl) {
            feedbackEl.innerHTML = '<span style="color:var(--success);">✅ To\'g\'ri!</span>';
        }
    } else {
        testState.totalWrong++;
        if (feedbackEl) {
            feedbackEl.innerHTML = `<span style="color:var(--danger);">❌ Noto'g'ri! (${correctLetter})</span>`;
        }
    }

    // Highlight key
    const keyBtn = document.getElementById('key-' + userLetter.toUpperCase());
    if (keyBtn) {
        keyBtn.style.background = isCorrect ? 'var(--success)' : 'var(--danger)';
        keyBtn.style.color = 'white';
        setTimeout(() => {
            keyBtn.style.background = '';
            keyBtn.style.color = '';
        }, 500);
    }

    // Next letter/row
    setTimeout(() => {
        if (feedbackEl) feedbackEl.innerHTML = '';
        advanceTest();
    }, 800);
}

function advanceTest() {
    testState.currentLetter++;

    if (testState.currentLetter >= testState.lettersInRow.length) {
        // Next row
        testState.currentRow++;

        if (testState.currentRow >= SNELLEN_ROWS.length) {
            // Test complete
            testState.isActive = false;
            document.getElementById('test-active').style.display = 'none';
            document.getElementById('test-controls').style.display = 'none';
            document.getElementById('test-complete').style.display = 'block';
            stopSpeech();
            return;
        }

        generateRowLetters();
    }

    showCurrentLetter();
}

function finishTest() {
    // Calculate results
    const total = testState.totalCorrect + testState.totalWrong;
    const score = total > 0 ? Math.round((testState.totalCorrect / total) * 100) : 0;

    // Find last correct row for acuity
    let lastCorrectRow = 0;
    for (const ans of testState.answers) {
        if (ans.correct && ans.row > lastCorrectRow) {
            lastCorrectRow = ans.row;
        }
    }
    const acuity = SNELLEN_ROWS[lastCorrectRow]?.acuity || '20/200';

    // Save result
    const result = {
        date: new Date().toISOString(),
        score,
        acuity,
        correct: testState.totalCorrect,
        wrong: testState.totalWrong,
        answers: testState.answers
    };

    const results = JSON.parse(localStorage.getItem('eyegem_results') || '[]');
    results.push(result);
    localStorage.setItem('eyegem_results', JSON.stringify(results));
    localStorage.setItem('eyegem_last_result', JSON.stringify(result));

    navigate('/results');
}

// ---- Speech-to-Text ----
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn('Speech Recognition API qo\'llab-quvvatlanmaydi');
        return;
    }

    testState.recognition = new SpeechRecognition();
    testState.recognition.continuous = false;
    testState.recognition.interimResults = false;
    testState.recognition.lang = 'en-US'; // Letters are in English

    testState.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim().toUpperCase();
        const firstLetter = transcript.charAt(0);
        const resultEl = document.getElementById('speech-result');

        if (resultEl) resultEl.textContent = `"${transcript}" → ${firstLetter}`;

        if (SNELLEN_LETTERS.includes(firstLetter)) {
            submitAnswer(firstLetter);
        } else {
            showToast(`"${transcript}" tanib bo'lmadi, qaytadan urinib ko'ring`, 'warning');
        }

        stopSpeech();
    };

    testState.recognition.onerror = (event) => {
        console.warn('Speech error:', event.error);
        if (event.error !== 'aborted') {
            showToast('Ovoz aniqlanmadi, qaytadan urinib ko\'ring', 'warning');
        }
        stopSpeech();
    };

    testState.recognition.onend = () => {
        stopSpeech();
    };
}

function toggleSpeech() {
    if (testState.isListening) {
        stopSpeech();
    } else {
        startSpeech();
    }
}

function startSpeech() {
    if (!testState.recognition) {
        showToast('Brauzeringiz ovozni aniqlashni qo\'llab-quvvatlamaydi', 'error');
        return;
    }

    try {
        testState.recognition.start();
        testState.isListening = true;

        const micBtn = document.getElementById('mic-button');
        const statusEl = document.getElementById('speech-status');
        if (micBtn) micBtn.classList.add('recording');
        if (statusEl) statusEl.style.display = 'inline-flex';
    } catch (e) {
        console.warn('Speech start error:', e);
    }
}

function stopSpeech() {
    if (testState.recognition && testState.isListening) {
        try { testState.recognition.stop(); } catch(e) {}
    }
    testState.isListening = false;

    const micBtn = document.getElementById('mic-button');
    const statusEl = document.getElementById('speech-status');
    if (micBtn) micBtn.classList.remove('recording');
    if (statusEl) statusEl.style.display = 'none';
}
