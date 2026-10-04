from pydantic import BaseModel
from typing import Optional

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
