"""
backend/main.py
FastAPI backend for Biblia Kids.

Responsibilities:
- Holds the ANTHROPIC_API_KEY server-side (never exposed to the browser)
- Proxies Claude API requests from the frontend
- Validates request shape and enforces a max-token cap
- Serves the built frontend in production (optional)

Run locally:
    uvicorn main:app --reload --port 8000
"""

import os
from typing import Literal

import anthropic
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from dotenv import load_dotenv
load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_API_KEY:
    raise RuntimeError(
        "ANTHROPIC_API_KEY is not set. "
        "Copy .env.example to .env and add your key, or set the environment variable directly."
    )

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

app = FastAPI(
    title="Biblia Kids API",
    description="Backend proxy for Claude API — keeps the API key server-side.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., max_length=20_000)

class ChatRequest(BaseModel):
    messages: list[Message] = Field(..., min_length=1, max_length=50)
    system: str = Field(..., max_length=30_000)

class ChatResponse(BaseModel):
    text: str

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=3000,
            system=req.system,
            messages=[m.model_dump() for m in req.messages],
        )
        text = response.content[0].text
        if response.stop_reason == "max_tokens":
            text += "\n\n*Want to hear more? Just ask me to continue the story!*"
        return ChatResponse(text=text)

    except anthropic.AuthenticationError:
        raise HTTPException(status_code=401, detail="Invalid Anthropic API key.")
    except anthropic.RateLimitError:
        raise HTTPException(status_code=429, detail="Rate limit reached. Try again shortly.")
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(FRONTEND_DIST):
    from fastapi.responses import FileResponse

    @app.get("/")
    def serve_root():
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="static")
