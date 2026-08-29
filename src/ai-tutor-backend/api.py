# chatbot/api.py
# IELTS Beta — FastAPI bridge for LangGraph chatbot
# Run with: uvicorn chatbot.api:app --reload --port 8000

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from engine import IELTSGraphEngine

app = FastAPI(title="IELTS Beta AI Tutor", version="1.0.0")

# Allow requests from your PHP web server (localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://127.0.0.1", "http://localhost:8080", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the engine once at startup (heavy — keeps Groq + SQLite connection alive)
print("Loading IELTS AI engine…")
engine = IELTSGraphEngine()
print("Engine ready ✓")


class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default"


class ChatResponse(BaseModel):
    reply: str
    thread_id: str
    band_scores: dict | None = None  # includes ml_second_opinion when a grading turn ran


@app.get("/health")
def health():
    """Health check — PHP chatbot.php polls this to show online/offline status."""
    return {"status": "ok", "engine": "IELTSGraphEngine", "model": "llama-3.3-70b-versatile"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """
    Main chat endpoint.
    PHP sends: { "message": "...", "thread_id": "user_1_20260426" }
    Returns:   { "reply": "...", "thread_id": "..." }
    """
    if not req.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty.")
    try:
        result = engine.run(req.message, thread_id=req.thread_id)
        return ChatResponse(
            reply=result["reply"],
            thread_id=req.thread_id,
            band_scores=result.get("band_scores"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Engine error: {str(e)}")


@app.delete("/chat/{thread_id}")
def reset_chat(thread_id: str):
    """Reset a conversation thread (clears SQLite checkpoint for that thread_id)."""
    try:
        engine.db_conn.execute(
            "DELETE FROM checkpoints WHERE thread_id=?", (thread_id,)
        )
        engine.db_conn.commit()
        return {"success": True, "thread_id": thread_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
