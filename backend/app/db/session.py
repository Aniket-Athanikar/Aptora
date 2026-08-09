"""
ExamForge AI — PostgreSQL Session & Engine
Multi-port failover connection strategy.
"""
import logging
from sqlalchemy import create_engine, text, event
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

logger = logging.getLogger("backend")

# ─── DATABASE CONNECTION WITH PORT FAILOVER ──────────────────────────
DB_HOST = settings.DB_HOST
DB_PORT = settings.DB_PORT
DB_NAME = settings.DB_NAME
DB_USER = settings.DB_USER
DB_PASSWORD = settings.DB_PASSWORD

# We try the primary port first. If it fails, we fallback to the docker port mapping 5433.
ports_to_try = [DB_PORT]
if DB_PORT != "5433":
    ports_to_try.append("5433")

connected_port = None
engine = None

for port in ports_to_try:
    logger.info(f"Database Initialization: Trying PostgreSQL port {port}...")
    temp_db_url = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{port}/{DB_NAME}"
    url = make_url(temp_db_url)
    default_url = f"postgresql://{url.username}:{url.password}@{url.host}:{url.port}/postgres"
    
    # Try verifying/creating DB
    db_verified = False
    try:
        temp_engine = create_engine(default_url, isolation_level="AUTOCOMMIT", connect_args={"connect_timeout": 2})
        with temp_engine.connect() as conn:
            result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname='{url.database}'"))
            exists = result.scalar()
            if not exists:
                logger.info(f"Database '{url.database}' does not exist on postgres instance. Creating dynamically on port {port}...")
                conn.execute(text(f'CREATE DATABASE "{url.database}"'))
                logger.info(f"Database '{url.database}' created successfully on port {port}!")
            else:
                logger.info(f"Verified: Database '{url.database}' exists on port {port}.")
            db_verified = True
        temp_engine.dispose()
    except Exception:
        logger.info(f"PostgreSQL port {port} is not responding or credentials did not match. Trying next port...")
        
    if db_verified:
        try:
            # Test actual connection to target DB
            test_engine = create_engine(temp_db_url, echo=False, connect_args={"connect_timeout": 2})
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            engine = test_engine
            connected_port = port
            logger.info(f"Successfully established connection to PostgreSQL on port {port}!")
            break
        except Exception:

            logger.info(f"Database exists on port {port} but target connection validation failed. Trying next port...")

if not engine:
    fallback_url = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    engine = create_engine(fallback_url, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
