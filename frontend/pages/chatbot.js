/* ============================================
   AI Chatbot Page
   ============================================ */

const SYMPTOM_DB = {
    'qizar': { symptom: "Ko'z qizarishi", advice: "Ko'z qizarishi allergiya, charchoq yoki infektsiya belgisi bo'lishi mumkin. Ko'zni sovuq suv bilan yuving. Agar 2-3 kun davom etsa, shifokorga murojaat qiling.", severity: 'warning' },
    'og\'ri': { symptom: "Ko'z og'rig'i", advice: "Ko'z og'rig'i turli sabablarga ega. Dam oling, ekrandan uzoqlashing. Kuchli og'riq bo'lsa darhol shifokorga boring.", severity: 'danger' },
    'xira': { symptom: "Xira ko'rish", advice: "Xira ko'rish ko'z nurining buzilishi, katarakta yoki boshqa kasalliklar belgisi. Ko'z shifokoriga tekshiruvga boring.", severity: 'warning' },
    'achish': { symptom: "Ko'z achishi", advice: "Ko'z achishi quruqlik, allergiya yoki tashqi ta'sir natijasi bo'lishi mumkin. Sun'iy ko'z yoshi tomchilari yordam berishi mumkin.", severity: 'info' },
    'quruq': { symptom: "Ko'z quruqligi", advice: "Ko'z quruqligi uzoq vaqt ekranga qarash, quruq havo yoki dori vositalar ta'sirida bo'lishi mumkin. Ko'proq palaklang, namlovchi tomchilar ishlating.", severity: 'info' },
    'yosh': { symptom: "Ko'z yoshlanishi", advice: "Haddan tashqari yoshlanish allergiya, shamol yoki yosh kanalining berkitilishi belgisi. Agar doimiy bo'lsa, shifokorga murojaat qiling.", severity: 'info' },
    'shish': { symptom: "Ko'z shishishi", advice: "Ko'z atrofi shishishi allergiya, uyqusizlik yoki buyrak muammolari belgisi bo'lishi mumkin. Sovuq kompres qo'ying.", severity: 'warning' },
    'ikkilanish': { symptom: "Ikkilanib ko'rish", advice: "Ikkilanib ko'rish jiddiy belgi. Bu asab tizimi yoki ko'z mushaklari bilan bog'liq bo'lishi mumkin. Zudlik bilan shifokorga murojaat qiling!", severity: 'danger' },
    'bosh og\'ri': { symptom: "Bosh og'rig'i", advice: "Ko'z bilan bog'liq bosh og'rig'i ko'pincha ko'z charchoqi yoki ko'z nuqi buzilishidan kelib chiqadi. Ko'z tekshiruvidan o'ting.", severity: 'warning' },
    'yorug': { symptom: "Yorug'likka sezgirlik", advice: "Fotofobiya (yorug'likka sezgirlik) ko'z yallig'lanishi yoki migren belgisi bo'lishi mumkin. Quyoshdan himoya ko'zoynak taqing.", severity: 'warning' }
};

let chatMessages = [];

registerPage('chatbot', function() {
    chatMessages = [
        { role: 'bot', text: "Assalomu alaykum! Men Eye Gem AI maslahatchi botiman. 👁️\n\nKo'z bilan bog'liq simptomlaringizni yozing, men dastlabki maslahat beraman.\n\nMasalan: \"Ko'zim qizarib ketdi\" yoki \"Xira ko'ryapman\"" }
    ];

    return `
    <div class="page" style="max-width:800px;">
        <h1 class="heading-xl mb-md text-center">🤖 AI Maslahat</h1>
        <p style="color:var(--text-secondary);text-align:center;margin-bottom:24px;">Ko'z simptomlaringizni yozing — dastlabki maslahat oling</p>

        <div class="card" style="padding:0;overflow:hidden;">
            <div class="chat-container" id="chat-messages" style="min-height:400px;">
                <div class="chat-bubble bot">${chatMessages[0].text.replace(/\n/g, '<br>')}</div>
            </div>

            <div style="border-top:1px solid var(--border-color);padding:16px;display:flex;gap:8px;">
                <input type="text" class="form-input" id="chat-input" placeholder="Simptomingizni yozing..." style="flex:1;margin:0;"
                       onkeypress="if(event.key==='Enter')sendChatMessage()">
                <button class="btn btn-primary" onclick="sendChatMessage()" id="chat-send-btn">Yuborish</button>
            </div>
        </div>

        <div class="card-glass mt-md" style="padding:16px;">
            <p style="font-size:0.8125rem;color:var(--text-muted);text-align:center;">
                ⚠️ Bu AI maslahatchi shifokor o'rnini bosmaydi. Jiddiy holatlarda albatta ko'z shifokoriga murojaat qiling.
            </p>
        </div>
    </div>`;
});

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const container = document.getElementById('chat-messages');
    if (!input || !container) return;

    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    // Add user message
    addChatBubble(container, text, 'user');

    // Analyze and respond
    setTimeout(() => {
        const response = analyzeSymptoms(text);
        addChatBubble(container, response, 'bot');
    }, 600);
}

function addChatBubble(container, text, role) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    bubble.innerHTML = text.replace(/\n/g, '<br>');
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    chatMessages.push({ role, text });
}

function analyzeSymptoms(text) {
    const lower = text.toLowerCase();
    const found = [];

    for (const [keyword, data] of Object.entries(SYMPTOM_DB)) {
        if (lower.includes(keyword)) {
            found.push(data);
        }
    }

    if (found.length === 0) {
        return "Kechirasiz, simptomni aniq tushunolmadim. 🤔\n\nQuyidagi so'zlarni ishlatib ko'ring:\n• qizarish\n• og'riq\n• xira ko'rish\n• achishish\n• quruqlik\n• yoshlanish\n• shishish\n• bosh og'rig'i";
    }

    let response = `🔍 Tahlil natijalari:\n\n`;
    found.forEach(f => {
        const icon = f.severity === 'danger' ? '🔴' : f.severity === 'warning' ? '🟡' : '🔵';
        response += `${icon} <strong>${f.symptom}</strong>\n${f.advice}\n\n`;
    });
    response += "💡 <em>Bu dastlabki maslahat. Aniq tashxis uchun ko'z shifokoriga murojaat qiling.</em>";
    return response;
}
