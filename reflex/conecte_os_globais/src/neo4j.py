from neo4j import GraphDatabase
from neo4j import Driver
from os import getenv
from dotenv import load_dotenv

load_dotenv()

URI = getenv("NEO4J_URI")
NEO4J_AUTH_USER = getenv("NEO4J_AUTH_USER")
NEO4J_AUTH_PASSWORD = getenv("NEO4J_AUTH_PASSWORD")
AUTH = (NEO4J_AUTH_USER, NEO4J_AUTH_PASSWORD)

class Neo4jRepository:

    driver = Driver

    def __init__(self):
        self.driver = GraphDatabase.driver(URI, auth=AUTH)
        self.driver.verify_connectivity()
        print("Connection successful!")

    def get_all_contains_novelas(self, novela: str) -> list[str]:
        query = """
                MATCH (n:Novelas)
                WHERE n.name CONTAINS $novela
                RETURN n.name AS novela
                """
        with self.driver.session() as session:
            result = session.run(
                query,
                novela=novela
            )
            return [record["novela"] for record in result]
    
    def get_all_contains_atores(self, ator: str) -> list[str]:
        query = """
                MATCH (a:Atores)
                WHERE a.name CONTAINS $ator
                RETURN a.name AS ator
                """
        with self.driver.session() as session:
            result = session.run(
                query,
                ator=ator
            )
            return [record["ator"] for record in result]
        
    def get_random_atores(self) -> str:
        query = """
                MATCH (a:Atores)
                RETURN a.name AS nome
                ORDER BY rand()
                LIMIT 1
                """
        with self.driver.session() as session:
            result = session.run(query)
            return result.single()["nome"]
        
    def find_records_by_atores(self, atores: list[str]) -> list[str]:
        query = """
                MATCH (a:Atores)-[:atua_em]->(n:Novelas)
                WHERE a.name IN $atores
                RETURN n.name AS novela, a.name AS ator
                ORDER BY n.name, a.name
                """
        with self.driver.session() as session:
            result = session.run(
                query,
                atores=atores
            )
            return [{"novela": record["novela"], "ator": record["ator"]} for record in result]
    
    def find_records_by_novelas(self, novelas: list[str]) -> list[str]:
        query = """
                MATCH (a:Atores)-[:atua_em]->(n:Novelas)
                WHERE n.name IN $novelas
                RETURN a.name AS ator, n.name AS novela
                ORDER BY a.name, n.name
                """
        with self.driver.session() as session:
            result = session.run(
                query,
                novelas=novelas
            )
            return [{"novela": record["novela"], "ator": record["ator"]} for record in result]
    
    def find_filter_shortest_path(self, initial_atores: list[str], atores: list[str], novelas: list[str]) -> dict:
        query = """
                MATCH path = shortestPath((source:Atores {name: $source_ator})-[*]-(target:Atores {name: $target_ator}))
                WHERE ALL(n in nodes(path) WHERE 
                (('Atores' IN labels(n) AND n.name IN $atores) OR 
                ('Novelas' IN labels(n) AND n.name IN $novelas))
                )
                RETURN path, length(path) as grau
                """
        with self.driver.session() as session:
            result = session.run(
                query,
                source_ator=initial_atores[0],
                target_ator=initial_atores[1],
                atores=atores,
                novelas=novelas
            )
            
            return result.single()