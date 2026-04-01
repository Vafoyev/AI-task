"""
Eye Gem — AI Chatbot Module (Keyword-based)
"""

SYMPTOM_DATABASE = {
    "qizar": {
        "symptom": "Ko'z qizarishi",
        "advice": "Ko'z qizarishi allergiya, charchoq yoki infektsiya belgisi bo'lishi mumkin. Ko'zni sovuq suv bilan yuving. Agar 2-3 kun davom etsa, shifokorga murojaat qiling.",
        "severity": "warning"
    },
    "og'ri": {
        "symptom": "Ko'z og'rig'i",
        "advice": "Ko'z og'rig'i turli sabablarga ega. Dam oling, ekrandan uzoqlashing. Kuchli og'riq bo'lsa darhol shifokorga boring.",
        "severity": "danger"
    },
    "xira": {
        "symptom": "Xira ko'rish",
        "advice": "Xira ko'rish ko'z nurining buzilishi, katarakta yoki boshqa kasalliklar belgisi. Ko'z shifokoriga tekshiruvga boring.",
        "severity": "warning"
    },
    "achish": {
        "symptom": "Ko'z achishi",
        "advice": "Ko'z achishi quruqlik, allergiya yoki tashqi ta'sir natijasi. Sun'iy ko'z yoshi tomchilari yordam berishi mumkin.",
        "severity": "info"
    },
    "quruq": {
        "symptom": "Ko'z quruqligi",
        "advice": "Ko'z quruqligi uzoq vaqt ekranga qarash natijasi. Ko'proq palaklang, namlovchi tomchilar ishlating.",
        "severity": "info"
    },
    "yosh": {
        "symptom": "Ko'z yoshlanishi",
        "advice": "Haddan tashqari yoshlanish allergiya yoki yosh kanali muammosi. Doimiy bo'lsa shifokorga murojaat qiling.",
        "severity": "info"
    },
    "shish": {
        "symptom": "Ko'z shishishi",
        "advice": "Ko'z atrofi shishishi allergiya, uyqusizlik yoki buyrak muammolari belgisi. Sovuq kompres qo'ying.",
        "severity": "warning"
    },
    "ikkilan": {
        "symptom": "Ikkilanib ko'rish",
        "advice": "Ikkilanib ko'rish jiddiy belgi. Asab tizimi yoki ko'z mushaklari bilan bog'liq. Zudlik bilan shifokorga murojaat qiling!",
        "severity": "danger"
    },
    "bosh og'ri": {
        "symptom": "Ko'z bilan bog'liq bosh og'rig'i",
        "advice": "Bosh og'rig'i ko'pincha ko'z charchoqi yoki ko'z nuqi buzilishidan. Ko'z tekshiruvidan o'ting.",
        "severity": "warning"
    },
    "yorug": {
        "symptom": "Yorug'likka sezgirlik",
        "advice": "Fotofobiya ko'z yallig'lanishi yoki migren belgisi. Quyoshdan himoya ko'zoynak taqing.",
        "severity": "warning"
    }
}


def analyze_symptoms(text: str) -> dict:
    """Analyze user text for eye-related symptoms."""
    lower = text.lower()
    found = []

    for keyword, data in SYMPTOM_DATABASE.items():
        if keyword in lower:
            found.append(data)

    if not found:
        return {
            "found": False,
            "message": "Simptomni aniq tushunolmadim. Quyidagi so'zlarni ishlatib ko'ring: qizarish, og'riq, xira ko'rish, achishish, quruqlik, yoshlanish, shishish, bosh og'rig'i"
        }

    return {
        "found": True,
        "symptoms": found,
        "disclaimer": "Bu dastlabki maslahat. Aniq tashxis uchun ko'z shifokoriga murojaat qiling."
    }
