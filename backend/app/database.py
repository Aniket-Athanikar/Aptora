import os
import time
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import redis
from qdrant_client import QdrantClient

logger = logging.getLogger("backend")

# ─── DATABASE CONFIGURATION ──────────────────────────────────────────
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")  # Default to localhost for local runs
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "Exame_forgeDB")
DB_USER = os.getenv("DB_USER", "aniket")
DB_PASSWORD = os.getenv("DB_PASSWORD", "admin123")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Connect to default 'postgres' database first to ensure target DB exists
def ensure_database_exists(db_url: str):
    url = make_url(db_url)
    default_url = f"postgresql://{url.username}:{url.password}@{url.host}:{url.port}/postgres"
    
    try:
        temp_engine = create_engine(default_url, isolation_level="AUTOCOMMIT")
        with temp_engine.connect() as conn:
            result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname='{url.database}'"))
            exists = result.scalar()
            if not exists:
                logger.info(f"Database '{url.database}' does not exist on postgres instance. Creating database dynamically...")
                conn.execute(text(f'CREATE DATABASE "{url.database}"'))
                logger.info(f"Database '{url.database}' created successfully!")
            else:
                logger.info(f"Verified: Database '{url.database}' exists.")
        temp_engine.dispose()
    except Exception as e:
        logger.warning(f"Could not verify or dynamically create database '{url.database}' on startup: {e}")

# Run database verification check
ensure_database_exists(DATABASE_URL)

logger.info(f"Connecting to database: {DATABASE_URL}")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ─── REDIS CLIENT WITH LOCAL FALLBACK ─────────────────────────────────
REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
redis_client = None

# Attempt to connect to configured REDIS_HOST first
try:
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True, socket_connect_timeout=2, protocol=2)
    redis_client.ping()
    logger.info(f"Connected to Redis successfully at {REDIS_HOST}:{REDIS_PORT}!")
except Exception as e:
    # If it fails and we are not on localhost, retry locally
    if REDIS_HOST != "127.0.0.1":
        logger.warning(f"Could not connect to Redis at {REDIS_HOST}:{REDIS_PORT} ({e}). Retrying locally at 127.0.0.1:6379...")
        try:
            redis_client = redis.Redis(host="127.0.0.1", port=6379, decode_responses=True, socket_connect_timeout=2, protocol=2)
            redis_client.ping()
            logger.info("Connected to local Redis successfully at 127.0.0.1:6379!")
        except Exception as local_err:
            logger.warning(f"Could not connect to Redis locally: {local_err}")
            redis_client = None
    else:
        logger.warning(f"Could not connect to Redis: {e}")
        redis_client = None

# ─── QDRANT VECTOR DB CLIENT WITH LOCAL FALLBACK ─────────────────────
QDRANT_HOST = os.getenv("QDRANT_HOST", "127.0.0.1")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))
qdrant_client = None

try:
    qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT, timeout=2)
    # Check if Qdrant is responsive
    qdrant_client.get_collections()
    logger.info(f"Connected to Qdrant Vector DB successfully at {QDRANT_HOST}:{QDRANT_PORT}!")
except Exception as e:
    # Fallback to local 127.0.0.1 (or check external port mapping 6433)
    fallback_hosts = ["127.0.0.1", "localhost"]
    connected = False
    for host in fallback_hosts:
        if QDRANT_HOST != host:
            # Try standard port 6333
            try:
                logger.info(f"Retrying Qdrant connection locally at {host}:6333...")
                qdrant_client = QdrantClient(host=host, port=6333, timeout=2)
                qdrant_client.get_collections()
                logger.info(f"Connected to local Qdrant Vector DB successfully at {host}:6333!")
                connected = True
                break
            except:
                # Try mapped port 6433
                try:
                    logger.info(f"Retrying Qdrant connection locally at {host}:6433...")
                    qdrant_client = QdrantClient(host=host, port=6433, timeout=2)
                    qdrant_client.get_collections()
                    logger.info(f"Connected to local Qdrant Vector DB successfully at {host}:6433!")
                    connected = True
                    break
                except:
                    pass
    if not connected:
        logger.warning(f"Could not connect to Qdrant Vector DB: {e}")
        qdrant_client = None
