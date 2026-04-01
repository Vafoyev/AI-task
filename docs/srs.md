# Eye Gem — Software Requirements Specification (SRS)

## 1. Loyiha haqida

**Eye Gem** — Ko'z ko'rish o'tkirligini onlayn tekshirish uchun web ilova.

## 2. Funksional talablar

| # | Funksiya | Tavsif |
|---|----------|--------|
| F1 | Ro'yxatdan o'tish | Foydalanuvchi ism, email, parol bilan ro'yxatdan o'tadi |
| F2 | Tizimga kirish | Email va parol orqali JWT token bilan autentifikatsiya |
| F3 | Kamera ruxsati | Brauzer orqali qurilma kamerasidan foydalanish |
| F4 | Yuz aniqlash | OpenCV Haar cascade bilan yuzni real vaqtda aniqlash |
| F5 | Masofa o'lchash | D=(W×F)/P formulasi bilan masofani hisoblash |
| F6 | Ko'z testi | Snellen jadvali bo'yicha 11 qator, tasodifiy harflar |
| F7 | Ovozli javob | Web Speech API orqali foydalanuvchi javobini aniqlash |
| F8 | Natijalar tahlili | Ko'rish o'tkirligi foizda va Snellen acuity |
| F9 | AI Chatbot | Kalit so'z asosida simptom tahlili va maslahat |
| F10 | Profil | Foydalanuvchi ma'lumotlari va test tarixi |

## 3. Nofunksional talablar

- **Performance**: Sahifalar 2 sekundda yuklanishi kerak
- **Security**: Parollar hash qilinadi, JWT token bilan autentifikatsiya
- **Compatibility**: Chrome, Firefox, Edge, Safari
- **Responsive**: Mobil va desktop qurilmalarda ishlaydi

## 4. Texnologiya steki

| Qatlam | Texnologiya |
|--------|-------------|
| Frontend | HTML5 + CSS3 + Vanilla JS |
| Backend | Python FastAPI |
| Database | SQLite |
| AI/ML | OpenCV, Web Speech API |
| Auth | JWT + SHA-256 hash |
