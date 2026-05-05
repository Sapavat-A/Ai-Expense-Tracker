import logging
import os
import socket

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models
from routes.expenses import router as expenses_router
from routes.insights import router as insights_router
from routes.predict import router as predict_router

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
    ],
    allow_origin_regex=r"http://192\.168\.\d+\.\d+:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure SQLAlchemy models are imported before table creation.
_ = models
Base.metadata.create_all(bind=engine)
logger.info("Database tables initialized")

app.include_router(expenses_router)
app.include_router(insights_router)
app.include_router(predict_router)
logger.info("Routers registered: /expenses, /insights, /predict")


@app.on_event("startup")
def on_startup() -> None:
    logger.info("Expense Tracker API startup complete")


@app.on_event("shutdown")
def on_shutdown() -> None:
    logger.info("Expense Tracker API shutting down")


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
