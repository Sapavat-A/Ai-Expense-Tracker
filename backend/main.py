import logging
import os
import socket

import uvicorn
"""
AI Expense Tracker Backend - Main FastAPI Application
Production-ready, scalable backend with modular architecture
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import logging

from config import settings
from database import db
from routers import (
    auth,
    expenses,
    budgets,
    analytics,
    ai_insights,
    reports,
    settings as user_settings
)


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Expense Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"http://192\.168\.\d+\.\d+:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_info = get_database_info()
logger.info(f"Database initialized: {db_info['type']} - {db_info.get('host', 'N/A')}:{db_info.get('port', 'N/A')}")

app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(budgets.router)
app.include_router(analytics.router)
app.include_router(ai_insights.router)
app.include_router(reports.router)
app.include_router(user_settings.router)
logger.info("Routers registered: /auth, /expenses, /budgets, /analytics, /ai, /reports, /settings")


@app.on_event("startup")
async def on_startup() -> None:
    logger.info("Expense Tracker API startup complete")
    
    # Start email scheduler
    try:
        await email_scheduler.start()
        logger.info("Email scheduler started successfully")
    except Exception as e:
        logger.error(f"Failed to start email scheduler: {str(e)}")


@app.on_event("shutdown")
async def on_shutdown() -> None:
    logger.info("Expense Tracker API shutting down")
    
    # Stop email scheduler
    try:
        await email_scheduler.stop()
        logger.info("Email scheduler stopped successfully")
    except Exception as e:
        logger.error(f"Failed to stop email scheduler: {str(e)}")


@app.get("/")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "expense-tracker-api"}


def _is_port_available(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        return sock.connect_ex((host, port)) != 0


def _resolve_server_port() -> int:
    configured_port = int(os.getenv("PORT", "8000"))
    fallback_port = 8001

    if _is_port_available("127.0.0.1", configured_port):
        return configured_port

    logger.warning(
        "Port %s is already in use; attempting fallback port %s",
        configured_port,
        fallback_port,
    )
    if _is_port_available("127.0.0.1", fallback_port):
        return fallback_port

    raise RuntimeError(
        f"Neither port {configured_port} nor fallback port {fallback_port} is available."
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=_resolve_server_port(),
        reload=False,
        log_level="info",
    )
