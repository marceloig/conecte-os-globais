

from .neo4j import Neo4jRepository
import logging

logger = logging.getLogger(__name__)

class GlobalService:
    neo4j = Neo4jRepository()

    def __init__(self):
        ...

    def get_random_global(self):
        return self.neptune.get_random_atores()
    
    def  get_all_contains_novelas(self, novela: str):
        return self.neptune.get_all_contains_novelas(novela.capitalize())
    
    def  get_all_contains_atores(self, ator: str):
        return self.neptune.get_all_contains_atores(ator.capitalize())
    
    def find_novelas_by_atores(self, nodes: list=[]):
        atores = []
        for node in nodes:
            if node['data']['type'] == 'global':
                ator_name = node['data']['label']
                atores.append(ator_name)
        
        return self.neptune.find_records_by_atores(atores)
    
    def find_atores_by_novelas(self, nodes: list=[]):
        novelas = []
        for node in nodes:
            if node['data']['type'] == 'obra':
                novela_name = node['data']['label']
                novelas.append(novela_name)
        
        return self.neptune.find_records_by_novelas(novelas)

    
class NodeService:

    def new_node(self, id: str, label: str, data_type: str, x: int=0, y: int=0):
        return {
            'id': id,
            'type': 'default',
            'data': {'label': label, 'type': data_type},
            "draggable": True,
            'position': {'x': x, 'y': y},
        }
    
    def filter_records(self, search_value: str, records_atores: list[dict], records_novelas: list[dict]):
        logger.info("Filtering node by search value: %s", search_value)
        logger.info("Atores: %s", records_atores)
        logger.info("Novelas: %s", records_novelas)

        obras = [record for record in records_novelas if search_value.lower() in record["novela"].lower()]
        globais = [record for record in records_atores if search_value.lower() in record["ator"].lower()]

        if obras:
            return obras[0]
        if globais:
            return globais[0]
        
        return None