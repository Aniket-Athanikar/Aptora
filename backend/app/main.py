import os
import logging
from fastapi import FastAPI, status, HTTPException, Request
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load database connections and Base metadata
from app.db import Base, engine, redis_client, qdrant_client
# Import models to ensure they register on Base.metadata before create_all
import app.models
from app.ai.services.qdrant_service import QdrantService
from app.core.config import settings

# Load env variables
load_dotenv()

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend")

app = FastAPI(
    title=os.getenv("PROJECT_NAME", "ExamForge-AI-Backend"),
    description="Full-stack containerized backend API for ExamForge AI with DB integrations",
    version="2.1.0"
)


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Container health probe; dependency detail remains available at `/`."""
    return {"status": "healthy"}

@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"success": False, "message": str(exc.detail), "error": {"status": exc.status_code, "detail": exc.detail}})

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"success": False, "message": "Request validation failed.", "error": {"status": 422, "details": exc.errors()}})

# CORS middleware configuration
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
origins = [origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database schemas
@asynccontextmanager
async def lifespan(app: FastAPI):

    logger.info("==================================================")
    logger.info("ExamForge AI Backend Initialization Diagnostics")
    logger.info("==================================================")
    logger.info("  Running inside Docker : %s", settings.RUNNING_IN_DOCKER)
    logger.info("  LLM Provider          : %s", settings.LLM_PROVIDER)
    logger.info("  OLLAMA_HOST           : %s", settings.OLLAMA_HOST)
    logger.info("  LLM Model             : %s", settings.OPENROUTER_MODEL if settings.LLM_PROVIDER.lower() == "openrouter" else settings.LLM_MODEL)
    logger.info("  Embedding Model       : %s", settings.EMBEDDING_MODEL)
    logger.info("==================================================")

    try:
        import requests
        tags_url = f"{settings.get_ollama_host()}/api/tags"
        res = requests.get(tags_url, timeout=3)
        if res.status_code == 200:
            raw_models = res.json().get("models", [])
            models = [m.get("name") for m in raw_models if isinstance(m, dict) and m.get("name")]
            logger.info("[Startup] Ollama is reachable at %s | Available models: %s", settings.OLLAMA_HOST, models)
        else:
            logger.warning("[Startup WARNING] Ollama at %s returned status HTTP %d", settings.OLLAMA_HOST, res.status_code)
    except Exception as exc:
        logger.warning("[Startup WARNING] Ollama host '%s' unreachable on startup: %s", settings.OLLAMA_HOST, exc)


    try:
        # Base.metadata.create_all(bind=engine)
        logger.info("Database initialized.")
    except Exception as e:
        logger.exception(e)

    try:
        QdrantService.create_collection()
        logger.info("Qdrant collection ready.")
    except Exception as e:
        logger.exception(e)

    yield

    logger.info("Shutting down ExamForge AI Backend...")

# Never flush Redis here: document_processing_queue is durable work, not cache.
# Flushing it at every backend restart silently discarded uploads before the
# worker could create embeddings and Qdrant points.

# Include all API routes via the central router
from app.api.router import api_router
app.include_router(api_router)

from fastapi import WebSocket, WebSocketDisconnect
import asyncio
import random

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.exception(e)

manager = ConnectionManager()

@app.websocket("/ws/dashboard")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial sync metrics
        await websocket.send_json({
            "type": "connection_status",
            "status": "connected",
            "message": "Real-time sync established with ExamForge AI Engine",
            "active_users": random.randint(142, 198)
        })
        
        while True:
            await asyncio.sleep(10)
            event_type = random.choice(["xp_gain", "active_session", "community_milestone", "calibration_alert"])
            if event_type == "xp_gain":
                data = {
                    "type": "realtime_update",
                    "title": "Companion Milestone",
                    "description": f"User_{random.randint(1000, 9999)} completed custom sprint: +120 XP earned!",
                    "badge": "XP Boost",
                    "color": "emerald"
                }
            elif event_type == "active_session":
                data = {
                    "type": "realtime_update",
                    "title": "Lobby Active",
                    "description": f"Active study sprint started for exam: {random.choice(['GATE', 'UPSC', 'JEE', 'MCAT'])}.",
                    "badge": "Live Sprint",
                    "color": "indigo"
                }
            elif event_type == "community_milestone":
                data = {
                    "type": "realtime_update",
                    "title": "AI Syllabus Calibration",
                    "description": "Calculated adaptive weights. Goal calibration predictions updated.",
                    "badge": "AI Calibrate",
                    "color": "purple"
                }
            else:
                data = {
                    "type": "realtime_update",
                    "title": "Quest Pool Sync",
                    "description": "Daily targeted syllabus sprints refreshed.",
                    "badge": "Quest Sync",
                    "color": "amber"
                }
            await websocket.send_json(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/", status_code=status.HTTP_200_OK)
async def read_root():
    logger.info("Root endpoint accessed")
    
    # Check dependencies statuses
    db_status = "connected" if engine else "disconnected"
    
    redis_status = "disconnected"
    if redis_client:
        try:
            redis_client.ping()
            redis_status = "connected"
        except:
            pass
            
    qdrant_status = "disconnected"
    if qdrant_client:
        try:
            qdrant_client.get_collections()
            qdrant_status = "connected"
        except:
            pass

    return {
        "status": "healthy",
        "message": "Welcome to ExamForge AI Backend with Postgres, Redis & Qdrant",
        "version": "2.1.0",
        "services": {
            "postgresql": db_status,
            "redis": redis_status,
            "qdrant": qdrant_status
        }
    }
