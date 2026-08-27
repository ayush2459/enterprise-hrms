"""
Application entrypoint. Wires up CORS, the v1 API router, and startup
health checks. Run locally with:
    uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import asyncio

from app.api.v1.router import api_router
from app.core.config import settings
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.ws.routes import router as ws_router, redis_listener

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=False,
)

@app.on_event("startup")
async def start_redis_listener():
    asyncio.create_task(redis_listener())

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)
app.include_router(ws_router)


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "env": settings.APP_ENV}
