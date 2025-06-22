

from .neo4j import Neo4jRepository
import logging
import random

logger = logging.getLogger(__name__)

class GlobalService:
    neo4j = Neo4jRepository()

    def __init__(self):
        ...

    def get_random_global(self):
        return self.neo4j.get_random_atores()
    
    def  get_all_contains_novelas(self, novela: str):
        return self.neo4j.get_all_contains_novelas(novela.capitalize())
    
    def  get_all_contains_atores(self, ator: str):
        return self.neo4j.get_all_contains_atores(ator.capitalize())
    
    def find_novelas_by_atores(self, nodes: list=[]):
        atores = []
        for node in nodes:
            if node['data']['type'] == 'ator':
                ator_name = node['data']['label']
                atores.append(ator_name)
        
        return self.neo4j.find_records_by_atores(atores)
    
    def find_atores_by_novelas(self, nodes: list=[]):
        novelas = []
        for node in nodes:
            if node['data']['type'] == 'novela':
                novela_name = node['data']['label']
                novelas.append(novela_name)
        
        return self.neo4j.find_records_by_novelas(novelas)
    
    def find_item(self, search_value: str, records_atores: list[dict], records_novelas: list[dict]):
        logger.info("Filtering node by search value: %s", search_value)
        logger.info("Atores: %s", records_atores)
        logger.info("Novelas: %s", records_novelas)

        novelas = [record for record in records_novelas if search_value.lower() in record["novela"].lower()]
        atores = [record for record in records_atores if search_value.lower() in record["ator"].lower()]

        if novelas:
            item = novelas[0]
            return {
                'source': item["ator"],
                'target': item["novela"],
                'type': 'novela',
            }
        if atores:
            item = atores[0]
            return {
                'source': item["novela"],
                'target': item["ator"],
                'type': 'ator',
            }
        
        
        return None

    
class ReactFlowService:

    def new_node(self, id: str, label: str, data_type: str, x_initial: int, y_initial: int, direction: str):
        x = random.randint(int(x_initial), 200)
        y = random.randint(int(y_initial), 200)
        if direction == 'left':
            x = -x
            y = -y
        
        return {
            'id': id,
            'type': 'default',
            'data': {'label': label, 'type': data_type, 'direction': direction},
            "draggable": True,
            'position': {'x': x, 'y': y},
        }
    
    def new_edge(self, source: str, target: str, animated: bool=False):
        return {
            'id': f"e{source}-{target}",
            'source': source,
            'target': target,
            'animated': animated,
        }


    