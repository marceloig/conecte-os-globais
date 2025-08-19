from pydantic import BaseModel, Field
from typing import Optional

class HealthResponse(BaseModel):
    status: str
    message: str

class Novela(BaseModel):
    id: str
    name: str

class Ator(BaseModel):
    id: str
    name: str
    #profile_img: str = None
    profile_img: Optional[str]

class GraphNode(BaseModel):
    type: str
    name: str

class PathRequest(BaseModel):
    initial_nodes: list[GraphNode]  # List of initial actor names
    nodes: list[GraphNode]
class PathResponse(BaseModel):
    path: str = ''  # Default value for path
    grau: int = 0  # Default value for degree of separation
    found: bool = False