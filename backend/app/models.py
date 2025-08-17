from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    message: str

class Novela(BaseModel):
    id: str
    name: str

class Ator(BaseModel):
    id: str
    name: str