from fastapi import APIRouter
from app.models import HealthResponse, Ator, Novela, PathRequest, PathResponse, GraphNode
from ...db.neo4j import Neo4jRepository
from ..service import TMDBService
from neo4j import graph

router = APIRouter()
router_health = APIRouter()
repository = Neo4jRepository()
tmdb_service = TMDBService()

@router_health.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        message="API is running successfully"
    )

@router.get("/atores/{name}/novelas", response_model=list[Novela])
async def list_novelas_by_ator(name: str):
    novelas = repository.list_novelas_by_ator(name)
    return [Novela(
            id=novela,
            name=novela,
            ) for novela in novelas]


@router.get("/novelas/{name}/atores", response_model=list[Ator])
async def list_atores_by_novela(name: str):
    atores = repository.list_atores_by_novela(name)
    return [Ator(
            id=ator,
            name=ator,
            ) for ator in atores]

@router.get("/atores/random", response_model=Ator)
async def get_random_ator():
    print("[get_random_ator] Fetching a random actor from the database")
    nome = repository.get_random_atores()
    print(f"[get_random_ator] Random actor found: {nome}")
    print(f"[get_random_ator] Fetching actor details from TMDB for: {nome}")
    person = await tmdb_service.search_person(nome)
    print(f"[get_random_ator] Actor details retrieved: {person}")
    return Ator(
        id=nome,
        name=nome,
        img = f'https://image.tmdb.org/t/p/original{person.get("profile_path")}'
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

@router.post("/graph/shortest_path", response_model=PathResponse)
async def shortest_path(path_request: PathRequest):
    initial_atores = [node.name for node in path_request.initial_nodes]
    atores = [node.name for node in path_request.nodes if node.type == 'ator']
    novelas = [node.name for node in path_request.nodes if node.type == 'novela']
    
    record = repository.find_filter_shortest_path(initial_atores, atores, novelas)
    graph_nodes = []
    if record:
        print('[shortest_path] Result shortest path')
        path: graph.Path = record["path"]
        for node in path.nodes:
            graph_nodes.append(GraphNode(type=node.get("~label").lower(), name=node.get("name")))
            print(node)
        return PathResponse(
            nodes=graph_nodes,
            grau=record["grau"],
            found=True
        )
    return PathResponse()
