from pydantic import BaseModel, Field
from typing import Optional
from neo4j import graph

class HealthResponse(BaseModel):
    status: str
    message: str

class Novela(BaseModel):
    id: str
    name: str
    img: Optional[str] = ''

class Ator(BaseModel):
    id: str
    name: str
    img: Optional[str] = ''

class GraphNode(BaseModel):
    type: str
    name: str

class PathRequest(BaseModel):
    initial_nodes: list[GraphNode]  # List of initial actor names
    nodes: list[GraphNode]
class PathResponse(BaseModel):
    nodes: list[GraphNode] = None  # Default value for path
    grau: int = 0  # Default value for degree of separation
    found: bool = False