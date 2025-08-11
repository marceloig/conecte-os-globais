

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
    
    def find_item(self, search_value: str, records: list[dict]):
        logger.info("Filtering node by search value: %s", search_value)

        item = {'sources': [], 'target': '', 'type': '', 'direction': ''}
        for record in records:
            if "novela" in record and search_value.lower() in record["novela"].lower():
                item['type'] = 'novela'
                item['sources'].append(record['ator'])
                item['target'] = record['novela']
            if "ator" in record and search_value.lower() in record["ator"].lower():
                item['type'] = 'ator'
                item['sources'].append(record['novela'])
                item['target'] = record['ator']
        
        return item
    
    def find_filter_shortest_path(self, initial_atores: list[str], atores: list[str], novelas: list[str]) -> dict:
        logger.info("Finding shortest path with initial atores: %s, atores: %s, novelas: %s", initial_atores, atores, novelas)
        result = self.neo4j.find_filter_shortest_path(initial_atores, atores, novelas)
        if not result:
            return
        
        return {
            'path': result.get('path', []),
            'length': result.get('grau', 0)
        }

    
class ReactFlowService:

    def new_node(self, id: str, label: str, data_type: str, x_initial: int, y_initial: int, direction: str):
        x = random.randint(int(x_initial), int(x_initial) + 200)
        y = random.randint(int(y_initial), int(y_initial) + 200)
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


    