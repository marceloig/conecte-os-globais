from dotenv import load_dotenv

# Carrega o .env no ambiente antes de qualquer import que leia os.getenv
# (ex.: TMDBService). Antes isto acontecia como efeito colateral do import
# de app.db.neo4j, removido na migração para o grafo no frontend.
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    openapi_url=f"{settings.api_v1_str}/openapi.json"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.api_v1_str)