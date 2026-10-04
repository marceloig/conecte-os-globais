from fastapi import APIRouter
from app.models import HealthResponse, Ator, Novela
from ..service import TMDBService

router = APIRouter()
router_health = APIRouter()
tmdb_service = TMDBService()

@router_health.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        message="API is running successfully"
    )


@router.get("/novelas/{name}", response_model=Novela)
async def search_novela(name: str):
    show = await tmdb_service.search_tv_shows(name)
    return Novela(
        id=name,
        name=name,
        img = f'https://image.tmdb.org/t/p/original{show.get("poster_path")}'
    )

@router.get("/atores/{name}", response_model=Ator)
async def search_ator(name: str):
    person = await tmdb_service.search_person(name)
    return Ator(
        id=name,
        name=name,
        img = f'https://image.tmdb.org/t/p/original{person.get("profile_path")}'
    )
