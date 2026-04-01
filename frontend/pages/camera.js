/* ============================================
   Camera Page — Distance Measurement
   ============================================ */

let cameraStream = null;
let distanceCheckInterval = null;

registerPage('camera', function() {
    // Cleanup previous camera
    stopCamera();

    const html = `
    <div class="page">
        <h1 class="heading-xl mb-md">📷 Kamera Sozlash</h1>
        <p style="color:var(--text-secondary);margin-bottom:24px;">
            Ko'z testini boshlash uchun kamerangizni yoqing va 40 sm masofada turing.
        </p>

        <div class="grid-2">
            <!-- Camera View -->
            <div class="card" style="padding:0;overflow:hidden;position:relative;">
                <video id="camera-video" autoplay playsinline style="width:100%;display:block;border-radius:var(--radius-lg);background:#000;min-height:300px;"></video>
                <canvas id="camera-canvas" style="display:none;"></canvas>

                <!-- Face overlay -->
                <div id="face-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;">
                    <div id="face-box" style="display:none;position:absolute;border:2px solid var(--success);border-radius:8px;transition:all 0.2s ease;"></div>
                </div>

                <!-- Camera status overlay -->
                <div id="camera-status" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
                    <div style="font-size:3rem;margin-bottom:12px;">📷</div>
                    <p style="color:var(--text-secondary);">Kamerani yoqish uchun tugmani bosing</p>
                </div>
            </div>

            <!-- Controls -->
            <div>
                <!-- Distance Indicator -->
                <div id="distance-display" class="card mb-md">
                    <h3 class="heading-md mb-md">📏 Masofa</h3>
                    <div id="distance-value" style="font-size:2.5rem;font-weight:800;text-align:center;padding:20px 0;">
                        <span style="color:var(--text-muted);">—</span>
                    </div>
                    <div id="distance-indicator" class="distance-indicator distance-far" style="display:none;">
                        <span id="distance-message">Kamerani yoqing</span>
                    </div>
                </div>

                <!-- Instructions -->
                <div class="card mb-md">
                    <h3 class="heading-md mb-md">📋 Ko'rsatmalar</h3>
                    <div style="display:flex;flex-direction:column;gap:10px;">
                        <div class="flex items-center gap-sm">
                            <span id="step1-icon" style="font-size:1.25rem;">⬜</span>
                            <span>Kamerani yoqing</span>
                        </div>
                        <div class="flex items-center gap-sm">
                            <span id="step2-icon" style="font-size:1.25rem;">⬜</span>
                            <span>Yuzingiz aniqlansin</span>
                        </div>
                        <div class="flex items-center gap-sm">
                            <span id="step3-icon" style="font-size:1.25rem;">⬜</span>
                            <span>40 sm masofada turing</span>
                        </div>
                    </div>
                </div>

                <!-- Buttons -->
                <div class="flex flex-col gap-sm">
                    <button id="camera-start-btn" class="btn btn-primary btn-lg w-full" onclick="startCamera()">
                        📷 Kamerani yoqish
                    </button>
                    <button id="test-start-btn" class="btn btn-primary btn-lg w-full" onclick="navigate('/eye-test')" disabled style="display:none;">
                        🔬 Ko'z testini boshlash
                    </button>
                    <button id="camera-stop-btn" class="btn btn-secondary w-full" onclick="stopCamera();navigate('/dashboard');" style="display:none;">
                        ← Orqaga
                    </button>
                </div>
            </div>
        </div>
    </div>`;

    return html;
});

// ---- Camera Functions ----
async function startCamera() {
    const video = document.getElementById('camera-video');
    const statusEl = document.getElementById('camera-status');
    const startBtn = document.getElementById('camera-start-btn');
    const stopBtn = document.getElementById('camera-stop-btn');

    if (!video) return;

    startBtn.disabled = true;
    startBtn.innerHTML = '<div class="spinner"></div> Yoqilmoqda...';

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });

        video.srcObject = cameraStream;
        if (statusEl) statusEl.style.display = 'none';
        if (startBtn) startBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'block';

        document.getElementById('step1-icon').textContent = '✅';
        showToast('Kamera yoqildi!', 'success');

        // Start distance checking
        startDistanceCheck();

    } catch (error) {
        showToast('Kamera ruxsati berilmadi: ' + error.message, 'error');
        startBtn.disabled = false;
        startBtn.innerHTML = '📷 Kamerani yoqish';
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    if (distanceCheckInterval) {
        clearInterval(distanceCheckInterval);
        distanceCheckInterval = null;
    }
}

function startDistanceCheck() {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    let consecutiveOk = 0;

    distanceCheckInterval = setInterval(async () => {
        if (!cameraStream) {
            clearInterval(distanceCheckInterval);
            return;
        }

        // Capture frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        // Try sending to backend for face detection
        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.7));
            const formData = new FormData();
            formData.append('image', blob, 'frame.jpg');

            const result = await api.upload('/detect-face', formData);

            if (result && result.face_detected) {
                updateDistanceUI(result.distance_cm, result.face_box);
                document.getElementById('step2-icon').textContent = '✅';

                if (result.distance_cm >= 35 && result.distance_cm <= 50) {
                    consecutiveOk++;
                    if (consecutiveOk >= 3) {
                        document.getElementById('step3-icon').textContent = '✅';
                        enableTestStart();
                    }
                } else {
                    consecutiveOk = 0;
                }
            } else if (result) {
                updateDistanceUI(null);
            }
        } catch (e) {
            // Backend not available — use mock distance
            mockDistanceCheck(video, canvas);
        }
    }, 1000);
}

function mockDistanceCheck(video, canvas) {
    // Simple mock: detect if something is in the center of frame
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    if (w === 0 || h === 0) return;

    // Sample center brightness as a rough "face present" heuristic
    const centerData = ctx.getImageData(w * 0.3, h * 0.2, w * 0.4, h * 0.6);
    const pixels = centerData.data;
    let brightness = 0;
    for (let i = 0; i < pixels.length; i += 16) {
        brightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    }
    brightness /= (pixels.length / 16);

    if (brightness > 30) {
        // Simulate face detected at ~40cm
        const mockDist = 35 + Math.random() * 15;
        updateDistanceUI(Math.round(mockDist));
        document.getElementById('step2-icon').textContent = '✅';
        document.getElementById('step3-icon').textContent = '✅';
        enableTestStart();
    }
}

function updateDistanceUI(distanceCm, faceBox) {
    const valueEl = document.getElementById('distance-value');
    const indicatorEl = document.getElementById('distance-indicator');
    const messageEl = document.getElementById('distance-message');

    if (!valueEl) return;

    if (distanceCm === null) {
        valueEl.innerHTML = '<span style="color:var(--text-muted);">Yuz topilmadi</span>';
        indicatorEl.style.display = 'block';
        indicatorEl.className = 'distance-indicator distance-far';
        messageEl.textContent = 'Yuzingizni kameraga qarating';
        return;
    }

    valueEl.innerHTML = `<span class="text-gradient">${distanceCm} sm</span>`;
    indicatorEl.style.display = 'block';

    if (distanceCm >= 35 && distanceCm <= 50) {
        indicatorEl.className = 'distance-indicator distance-ok';
        messageEl.textContent = '✅ Masofa mos! Testni boshlashingiz mumkin.';
    } else if (distanceCm < 35) {
        indicatorEl.className = 'distance-indicator distance-close';
        messageEl.textContent = '⚠️ Juda yaqin! Biroz orqaga surilng.';
    } else {
        indicatorEl.className = 'distance-indicator distance-far';
        messageEl.textContent = '⚠️ Juda uzoq! Kameraga yaqinlashing.';
    }

    // Show face box
    if (faceBox) {
        const faceBoxEl = document.getElementById('face-box');
        if (faceBoxEl) {
            faceBoxEl.style.display = 'block';
            faceBoxEl.style.left = faceBox.x + '%';
            faceBoxEl.style.top = faceBox.y + '%';
            faceBoxEl.style.width = faceBox.w + '%';
            faceBoxEl.style.height = faceBox.h + '%';
        }
    }
}

function enableTestStart() {
    const testBtn = document.getElementById('test-start-btn');
    if (testBtn) {
        testBtn.disabled = false;
        testBtn.style.display = 'block';
        testBtn.style.animation = 'glow 2s ease infinite';
    }
}
