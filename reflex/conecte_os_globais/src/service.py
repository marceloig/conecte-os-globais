

from .dynamodb import GlobalModel
import random

class GlobalService:

    def __init__(self):
        ...

    def get_random_global(self):
        index = random.randint(0, 20699)
        ators = GlobalModel.query(f'ATOR-INDEX#{index}')
        return ators.next()
    
class NodeService:

    def new_node(self, id: str, label: str, x: int=0, y: int=0):
        return {
            'id': id,
            'type': 'default',
            'data': {'label': label},
            "draggable": True,
            'position': {'x': x, 'y': y},
        }