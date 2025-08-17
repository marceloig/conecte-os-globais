from fastapi import APIRouter
from app.models import HealthResponse, Ator, Novela, PathRequest, PathResponse
from ...db.neo4j import Neo4jRepository

router = APIRouter()
router_health = APIRouter()
repository = Neo4jRepository()


@router_health.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        message="API is running successfully"
    )


@router.get("/atores/{name}/novelas", response_model=list[Novela])
async def list_novelas_by_ator(name: str):
    novelas = repository.list_novelas_by_ator(name)
    print(novelas)
    return [Novela(
            id=novela,
            name=novela,
            ) for novela in novelas]


@router.get("/novelas/{name}/atores", response_model=list[Ator])
async def list_atores_by_novela(name: str):
    atores = repository.list_atores_by_novela(name)
    return [Ator(
            id=novela,
            name=novela,
            ) for novela in atores]

@router.get("/atores/random", response_model=Ator)
async def get_random_ator():
    nome = repository.get_random_atores()
    return Ator(
        id=nome,
        name=nome
    )
@router.post("/graph/shortest_path", response_model=PathResponse)
async def shortest_path(path_request: PathRequest):
    print(path_request)
    
    # record = repository.find_filter_shortest_path(initial_atores, atores, novelas)
    # if record:
    #     return PathResponse(
    #         path=record["path"],
    #         grau=record["grau"],
    #         found=True
    #     )
    return PathResponse()
