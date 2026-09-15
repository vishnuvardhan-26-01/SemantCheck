"""FastAPI application entry point.

Creates the app, configures CORS, mounts routes, and loads the NLP model
once at startup so the first analysis request is fast.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import config
from .routes import analyze, health

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the NLP model once at startup so the first request is fast."""
    from .services import nlp_service

    try:
        nlp_service.get_model()
    except nlp_service.ModelLoadError:
        # Logged inside nlp_service; the app still starts so /api/health can
        # report the problem instead of the server dying silently.
        pass
    yield


app = FastAPI(
    title=config.API_TITLE,
    description=config.API_DESCRIPTION,
    version=config.API_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
