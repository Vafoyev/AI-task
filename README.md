# 👁️ Eye Gem — Ko'z Tekshiruv Ilovasi

Ko'z ko'rish o'tkirligini onlayn tekshirish uchun web ilova.

## Imkoniyatlar

- 🔐 **Ro'yxatdan o'tish / Tizimga kirish** (JWT autentifikatsiya)
- 📷 **Kamera orqali yuz aniqlash** (OpenCV)
- 📏 **Masofani o'lchash** (40 sm standart)
- 🔬 **Snellen jadvali ko'z testi** (11 qator, 9 harf)
- 🎤 **Ovozli javob** (Web Speech API)
- 📊 **Natijalar tahlili** (ko'rish o'tkirligi foizda)
- 🤖 **AI Chatbot** (ko'z simptomlari bo'yicha maslahat)

## Ishga tushirish

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
`frontend/index.html` faylni brauzerda oching yoki:
```bash
cd frontend
python -m http.server 3000
```

Keyin brauzerda: `http://localhost:3000`

## Texnologiyalar

| Qatlam | Texnologiya |
|--------|-------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Python FastAPI |
| Database | SQLite |
| AI/ML | OpenCV, Web Speech API |

## Loyiha tuzilmasi

```
aiTask/
├── docs/           # SRS va Flowchart
├── backend/        # FastAPI + OpenCV + SQLite
├── frontend/       # HTML + CSS + JS (SPA)
└── README.md
```
