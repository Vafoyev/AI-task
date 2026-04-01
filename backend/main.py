"""
Eye Gem — FastAPI Main Server
"""
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import json
import os

from database import init_db, create_user, get_user_by_email, get_user_by_id, save_test_result, get_user_results
from auth import hash_password, verify_password, create_token, decode_token
from face_detection import detect_faces
from distance import check_distance_status
from eye_test import create_session, compare_letter, get_next_row, finish_session
from chatbot import analyze_symptoms

# --- App Setup ---
app = FastAPI(title="Eye Gem API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frontend static files
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_path):
    app.mount("/app", StaticFiles(directory=frontend_path, html=True), name="frontend")

# Init database
init_db()


# --- Pydantic Models ---
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class CompareLetterRequest(BaseModel):
    session_id: str
    expected: str
    given: str

class ChatRequest(BaseModel):
    message: str

class SaveResultRequest(BaseModel):
    score: int
    acuity: str
    correct: int
    wrong: int
    details: Optional[str] = None


# --- Auth Helper ---
def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token topilmadi")
    token = authorization.split(" ")[1]
    try:
        payload = decode_token(token)
        user = get_user_by_id(payload["user_id"])
        if not user:
            raise HTTPException(status_code=401, detail="Foydalanuvchi topilmadi")
        return user
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


# --- Endpoints ---

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Eye Gem API ishlayapti!"}


# --- Auth ---
@app.post("/api/register")
def register(req: RegisterRequest):
    if len(req.name) < 2:
        raise HTTPException(400, "Ism kamida 2 ta harf")
    if "@" not in req.email:
        raise HTTPException(400, "Email noto'g'ri")
    if len(req.password) < 6:
        raise HTTPException(400, "Parol kamida 6 ta belgi")

    try:
        pwd_hash = hash_password(req.password)
        user = create_user(req.name, req.email, pwd_hash)
        token = create_token(user["id"], user["email"])
        return {
            "user": {"id": user["id"], "name": user["name"], "email": user["email"], "created_at": user["created_at"]},
            "token": token
        }
    except ValueError as e:
        raise HTTPException(400, str(e))


@app.post("/api/login")
def login(req: LoginRequest):
    user = get_user_by_email(req.email)
    if not user:
        raise HTTPException(401, "Email yoki parol noto'g'ri")

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(401, "Email yoki parol noto'g'ri")

    token = create_token(user["id"], user["email"])
    return {
        "user": {"id": user["id"], "name": user["name"], "email": user["email"], "created_at": user["created_at"]},
        "token": token
    }


# --- Face Detection ---
@app.post("/api/detect-face")
async def detect_face(image: UploadFile = File(...)):
    contents = await image.read()
    result = detect_faces(contents)
    return result


# --- Eye Test ---
@app.post("/api/test/start")
def start_test(user: dict = Depends(get_current_user)):
    return create_session(user["id"])


@app.post("/api/compare-letter")
def compare(req: CompareLetterRequest):
    return compare_letter(req.session_id, req.expected, req.given)


# --- Results ---
@app.post("/api/results/save")
def save_result(req: SaveResultRequest, user: dict = Depends(get_current_user)):
    result = save_test_result(user["id"], req.score, req.acuity, req.correct, req.wrong, req.details)
    return {"saved": True, "result": result}


@app.get("/api/results")
def get_results(user: dict = Depends(get_current_user)):
    results = get_user_results(user["id"])
    return {"results": results}


# --- Chatbot ---
@app.post("/api/chatbot")
def chatbot(req: ChatRequest):
    return analyze_symptoms(req.message)


# --- User Profile ---
@app.get("/api/profile")
def get_profile(user: dict = Depends(get_current_user)):
    results = get_user_results(user["id"])
    return {
        "user": {"id": user["id"], "name": user["name"], "email": user["email"], "created_at": user["created_at"]},
        "total_tests": len(results),
        "results": results[:5]
    }
